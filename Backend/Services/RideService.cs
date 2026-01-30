using Backend.Models;
using Backend.Settings;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System.Linq;

namespace Backend.Services;

public class RideService
{
    private readonly IMongoCollection<RideRecord> _rides;

    public RideService(IMongoClient client, IOptions<MongoSettings> settings)
    {
        var database = client.GetDatabase(settings.Value.DatabaseName);
        _rides = database.GetCollection<RideRecord>(settings.Value.RidesCollectionName);

        _rides.Indexes.CreateOne(new CreateIndexModel<RideRecord>(
            Builders<RideRecord>.IndexKeys.Ascending(r => r.DriverId)));
        _rides.Indexes.CreateOne(new CreateIndexModel<RideRecord>(
            Builders<RideRecord>.IndexKeys.Ascending(r => r.CreatedAtUtc)));
    }

    public async Task<RideRecord> CreateAsync(RideRecord ride)
    {
        await _rides.InsertOneAsync(ride);
        return ride;
    }

    public async Task<RideRecord?> GetByIdAsync(string id)
    {
        return await _rides.Find(r => r.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<RideRecord>> SearchAsync(
        string? origin,
        string? destination,
        int passengers,
        double? originLat,
        double? originLng,
        double? destinationLat,
        double? destinationLng,
        double? maxDistanceKm)
    {
        // Base filter: available seats and active status
        var filter = Builders<RideRecord>.Filter.Gte(r => r.AvailableSeats, passengers)
                     & Builders<RideRecord>.Filter.Eq(r => r.Status, "active");

        // Check if we have valid coordinates (not null and not zero)
        bool hasValidCoords = originLat.HasValue && originLng.HasValue && 
                              destinationLat.HasValue && destinationLng.HasValue &&
                              Math.Abs(originLat.Value) > 0.001 && Math.Abs(originLng.Value) > 0.001 &&
                              Math.Abs(destinationLat.Value) > 0.001 && Math.Abs(destinationLng.Value) > 0.001;

        // Apply text filters if provided (case-insensitive partial match)
        // Escape special regex characters to treat search text as literal substring
        if (!string.IsNullOrWhiteSpace(origin))
        {
            var originText = origin.Trim();
            // Escape special regex characters but allow substring matching
            var escapedOrigin = System.Text.RegularExpressions.Regex.Escape(originText);
            filter &= Builders<RideRecord>.Filter.Regex(
                r => r.Origin.Address,
                new MongoDB.Bson.BsonRegularExpression(escapedOrigin, "i"));
        }

        if (!string.IsNullOrWhiteSpace(destination))
        {
            var destText = destination.Trim();
            var escapedDest = System.Text.RegularExpressions.Regex.Escape(destText);
            filter &= Builders<RideRecord>.Filter.Regex(
                r => r.Destination.Address,
                new MongoDB.Bson.BsonRegularExpression(escapedDest, "i"));
        }

        // Fetch rides matching text filters (or all if no text filters)
        var rides = await _rides.Find(filter).SortByDescending(r => r.CreatedAtUtc).ToListAsync();

        // If we have valid coordinates AND text search found results, prioritize text matches
        // Text matches should be included even if coordinates are slightly off
        bool hasTextSearch = !string.IsNullOrWhiteSpace(origin) || !string.IsNullOrWhiteSpace(destination);
        
        if (hasValidCoords && rides.Count > 0 && hasTextSearch)
        {
            // Text matched - prioritize text matches, be lenient with coordinates
            var maxDistance = maxDistanceKm ?? 50; // Very generous for text matches
            
            rides = rides
                .Select(ride =>
                {
                    bool rideHasCoords = Math.Abs(ride.Origin.Latitude) > 0.001 && 
                                        Math.Abs(ride.Origin.Longitude) > 0.001 &&
                                        Math.Abs(ride.Destination.Latitude) > 0.001 && 
                                        Math.Abs(ride.Destination.Longitude) > 0.001;
                    
                    if (!rideHasCoords)
                    {
                        // No coords but text matched - definitely include
                        return new { Ride = ride, OriginDist = 0.0, DestDist = 0.0, TotalDist = 0.0, HasCoords = false };
                    }
                    
                    var originDist = DistanceKm(originLat!.Value, originLng!.Value, ride.Origin.Latitude, ride.Origin.Longitude);
                    var destDist = DistanceKm(destinationLat!.Value, destinationLng!.Value, ride.Destination.Latitude, ride.Destination.Longitude);
                    return new { Ride = ride, OriginDist = originDist, DestDist = destDist, TotalDist = originDist + destDist, HasCoords = true };
                })
                .Where(x => 
                {
                    // If text matched, include it (text search already filtered)
                    // Only filter by distance if coordinates are way off (more than 50km)
                    if (!x.HasCoords) return true; // Text matched, no coords - include
                    // Text matched, so be lenient - include if within 50km of either point
                    return x.OriginDist <= maxDistance || x.DestDist <= maxDistance;
                })
                .OrderBy(x => x.HasCoords ? x.TotalDist : double.MaxValue)
                .ThenByDescending(x => x.Ride.CreatedAtUtc)
                .Select(x => x.Ride)
                .ToList();
        }
        else if (hasValidCoords)
        {
            // Coordinate-based search with route matching
            // Fetch all active rides with enough seats
            var coordFilter = Builders<RideRecord>.Filter.Gte(r => r.AvailableSeats, passengers)
                             & Builders<RideRecord>.Filter.Eq(r => r.Status, "active");
            var allRides = await _rides.Find(coordFilter).SortByDescending(r => r.CreatedAtUtc).ToListAsync();
            
            if (allRides.Count > 0)
            {
                var maxDistance = maxDistanceKm ?? 5; // Distance threshold for exact matching (5km)
                var maxRouteDeviation = 5.0; // Maximum distance from route line - STRICT (5km instead of 10km)
                
                rides = allRides
                    .Select(ride =>
                    {
                        bool rideHasCoords = Math.Abs(ride.Origin.Latitude) > 0.001 && 
                                            Math.Abs(ride.Origin.Longitude) > 0.001 &&
                                            Math.Abs(ride.Destination.Latitude) > 0.001 && 
                                            Math.Abs(ride.Destination.Longitude) > 0.001;
                        
                        if (!rideHasCoords)
                        {
                            // No coordinates - can't do route matching, skip
                            return new { Ride = ride, IsMatch = false, MatchType = "", Score = 0.0 };
                        }
                        
                        // Check route matching: passenger points along driver's route
                        bool originOnRoute = IsPointOnRoute(
                            originLat!.Value, originLng!.Value,
                            ride.Origin.Latitude, ride.Origin.Longitude,
                            ride.Destination.Latitude, ride.Destination.Longitude,
                            maxRouteDeviation);
                        
                        bool destOnRoute = IsPointOnRoute(
                            destinationLat!.Value, destinationLng!.Value,
                            ride.Origin.Latitude, ride.Origin.Longitude,
                            ride.Destination.Latitude, ride.Destination.Longitude,
                            maxRouteDeviation);
                        
                        // Check if passenger origin comes before destination along driver's route
                        bool originBeforeDest = IsPointBeforeOnRoute(
                            originLat!.Value, originLng!.Value,
                            destinationLat!.Value, destinationLng!.Value,
                            ride.Origin.Latitude, ride.Origin.Longitude,
                            ride.Destination.Latitude, ride.Destination.Longitude);
                        
                        // Calculate distances for exact matches
                        var originDist = DistanceKm(originLat!.Value, originLng!.Value, ride.Origin.Latitude, ride.Origin.Longitude);
                        var destDist = DistanceKm(destinationLat!.Value, destinationLng!.Value, ride.Destination.Latitude, ride.Destination.Longitude);
                        
                        // STRICT matching: Only show rides where passenger's route matches driver's route
                        // Match ONLY if:
                        // 1. Exact match (both points within maxDistance of driver's origin/destination)
                        // 2. Route match (BOTH points on route AND origin before destination)
                        bool isMatch = false;
                        string matchType = "";
                        double score = 0.0;
                        
                        if (originDist <= maxDistance && destDist <= maxDistance)
                        {
                            // Exact match - passenger points match driver's origin/destination exactly
                            isMatch = true;
                            matchType = "exact";
                            score = 1000.0 - (originDist + destDist);
                        }
                        else if (originOnRoute && destOnRoute && originBeforeDest)
                        {
                            // STRICT route match: Both points must be on route AND origin before destination
                            // This ensures passenger's route aligns with driver's route
                            isMatch = true;
                            matchType = "route";
                            var originDistToRoute = DistanceToRouteSegment(originLat!.Value, originLng!.Value,
                                ride.Origin.Latitude, ride.Origin.Longitude,
                                ride.Destination.Latitude, ride.Destination.Longitude);
                            var destDistToRoute = DistanceToRouteSegment(destinationLat!.Value, destinationLng!.Value,
                                ride.Origin.Latitude, ride.Origin.Longitude,
                                ride.Destination.Latitude, ride.Destination.Longitude);
                            score = 500.0 - (originDistToRoute + destDistToRoute);
                        }
                        // Removed lenient matching - only show rides where passenger's route actually matches driver's route
                        
                        return new { Ride = ride, IsMatch = isMatch, MatchType = matchType, Score = score };
                    })
                    .Where(x => x.IsMatch)
                    .OrderByDescending(x => x.Score) // Best matches first
                    .ThenByDescending(x => x.Ride.CreatedAtUtc)
                    .Select(x => x.Ride)
                    .ToList();
            }
        }

        return rides;
    }

    private static double DistanceKm(double lat1, double lon1, double lat2, double lon2)
    {
        var dLat = DegreesToRadians(lat2 - lat1);
        var dLon = DegreesToRadians(lon2 - lon1);
        var a =
            Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
            Math.Cos(DegreesToRadians(lat1)) * Math.Cos(DegreesToRadians(lat2)) *
            Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return 6371 * c;
    }

    private static double DegreesToRadians(double degrees)
    {
        return degrees * (Math.PI / 180);
    }

    /// <summary>
    /// Check if a point is on or near a route segment (driver's origin to destination)
    /// </summary>
    private static bool IsPointOnRoute(double pointLat, double pointLng,
        double routeStartLat, double routeStartLng,
        double routeEndLat, double routeEndLng,
        double maxDeviationKm)
    {
        var distanceToRoute = DistanceToRouteSegment(pointLat, pointLng, routeStartLat, routeStartLng, routeEndLat, routeEndLng);
        return distanceToRoute <= maxDeviationKm;
    }

    /// <summary>
    /// Calculate distance from a point to a route segment (line between two points)
    /// Uses simplified perpendicular distance calculation
    /// </summary>
    private static double DistanceToRouteSegment(double pointLat, double pointLng,
        double segmentStartLat, double segmentStartLng,
        double segmentEndLat, double segmentEndLng)
    {
        // Calculate distances
        var d13 = DistanceKm(pointLat, pointLng, segmentStartLat, segmentStartLng);
        var d23 = DistanceKm(pointLat, pointLng, segmentEndLat, segmentEndLng);
        var d12 = DistanceKm(segmentStartLat, segmentStartLng, segmentEndLat, segmentEndLng);

        // If segment is very short, just use distance to nearest endpoint
        if (d12 < 0.1) return Math.Min(d13, d23);

        // Calculate angles using law of cosines
        var angle1 = Math.Acos((d13 * d13 + d12 * d12 - d23 * d23) / (2 * d13 * d12));
        var angle2 = Math.Acos((d23 * d23 + d12 * d12 - d13 * d13) / (2 * d23 * d12));

        // If both angles are acute, point is between endpoints - calculate perpendicular distance
        if (angle1 < Math.PI / 2 && angle2 < Math.PI / 2)
        {
            // Perpendicular distance using area of triangle
            var s = (d12 + d13 + d23) / 2;
            var area = Math.Sqrt(s * (s - d12) * (s - d13) * (s - d23));
            var perpendicularDist = (2 * area) / d12;
            return perpendicularDist;
        }

        // Point is beyond segment endpoints, return distance to nearest endpoint
        return Math.Min(d13, d23);
    }

    /// <summary>
    /// Check if point1 comes before point2 along the route from start to end
    /// </summary>
    private static bool IsPointBeforeOnRoute(double point1Lat, double point1Lng,
        double point2Lat, double point2Lng,
        double routeStartLat, double routeStartLng,
        double routeEndLat, double routeEndLng)
    {
        // Calculate distances along route from start
        var dist1FromStart = DistanceAlongRoute(point1Lat, point1Lng, routeStartLat, routeStartLng, routeEndLat, routeEndLng);
        var dist2FromStart = DistanceAlongRoute(point2Lat, point2Lng, routeStartLat, routeStartLng, routeEndLat, routeEndLng);
        
        return dist1FromStart < dist2FromStart;
    }

    /// <summary>
    /// Calculate distance along route from start to a point
    /// Uses projection onto route segment
    /// </summary>
    private static double DistanceAlongRoute(double pointLat, double pointLng,
        double routeStartLat, double routeStartLng,
        double routeEndLat, double routeEndLng)
    {
        var d13 = DistanceKm(pointLat, pointLng, routeStartLat, routeStartLng);
        var d23 = DistanceKm(pointLat, pointLng, routeEndLat, routeEndLng);
        var d12 = DistanceKm(routeStartLat, routeStartLng, routeEndLat, routeEndLng);
        
        if (d12 < 0.1) return d13; // Very short segment
        
        // Calculate projection using law of cosines
        var angle1 = Math.Acos((d13 * d13 + d12 * d12 - d23 * d23) / (2 * d13 * d12));
        
        // Distance along route from start to projection point
        var alongTrack = d13 * Math.Cos(angle1);
        
        // Clamp to segment bounds
        return Math.Max(0, Math.Min(alongTrack, d12));
    }

    /// <summary>
    /// Calculate bearing (direction) from point1 to point2 in degrees
    /// </summary>
    private static double Bearing(double lat1, double lon1, double lat2, double lon2)
    {
        var dLon = DegreesToRadians(lon2 - lon1);
        var lat1Rad = DegreesToRadians(lat1);
        var lat2Rad = DegreesToRadians(lat2);

        var y = Math.Sin(dLon) * Math.Cos(lat2Rad);
        var x = Math.Cos(lat1Rad) * Math.Sin(lat2Rad) - 
                Math.Sin(lat1Rad) * Math.Cos(lat2Rad) * Math.Cos(dLon);

        var bearing = Math.Atan2(y, x);
        return RadiansToDegrees(bearing);
    }

    private static double RadiansToDegrees(double radians)
    {
        return radians * (180.0 / Math.PI);
    }
}

