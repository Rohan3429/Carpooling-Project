using Backend.Models;

namespace Backend.Dtos;

public class RideCreateRequest
{
    public string DriverId { get; set; } = string.Empty;
    public string Origin { get; set; } = string.Empty;
    public double? OriginLat { get; set; }
    public double? OriginLng { get; set; }
    public string Destination { get; set; } = string.Empty;
    public double? DestinationLat { get; set; }
    public double? DestinationLng { get; set; }
    public string DepartureTime { get; set; } = string.Empty;
    public int AvailableSeats { get; set; }
    public double FarePerKm { get; set; }
    public RidePreferences? Preferences { get; set; }
    public bool IsRecurring { get; set; }
    public List<string>? RecurringDays { get; set; }
}

public record RideResponse(
    string Id,
    string DriverId,
    string DriverName,
    double DriverRating,
    VehicleDetails? Vehicle,
    RideLocation Origin,
    RideLocation Destination,
    string DepartureTime,
    int AvailableSeats,
    double FarePerKm,
    double TotalFare,
    double DistanceKm,
    int EstimatedDurationMinutes,
    RidePreferences Preferences,
    bool IsRecurring,
    List<string>? RecurringDays,
    string Status,
    string CreatedAtUtc
);

