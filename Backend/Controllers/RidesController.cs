using Backend.Dtos;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RidesController : ControllerBase
{
    private readonly RideService _rideService;
    private readonly UserService _userService;
    private readonly VehicleService _vehicleService;

    public RidesController(RideService rideService, UserService userService, VehicleService vehicleService)
    {
        _rideService = rideService;
        _userService = userService;
        _vehicleService = vehicleService;
    }

    [HttpPost]
    public async Task<ActionResult<RideResponse>> CreateRide(RideCreateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.DriverId) ||
            string.IsNullOrWhiteSpace(request.Origin) ||
            string.IsNullOrWhiteSpace(request.Destination) ||
            string.IsNullOrWhiteSpace(request.DepartureTime))
        {
            return BadRequest("DriverId, origin, destination, and departure time are required.");
        }

        var driver = await _userService.GetByIdAsync(request.DriverId);
        if (driver == null)
        {
            return NotFound("Driver not found.");
        }

        var driverVehicle = (await _vehicleService.GetByUserIdAsync(request.DriverId)).FirstOrDefault();

        var preferences = request.Preferences ?? new RidePreferences();

        var ride = new RideRecord
        {
            DriverId = request.DriverId,
            DriverName = driver.Name,
            DriverRating = 0,
            Vehicle = driverVehicle == null
                ? null
                : new VehicleDetails
                {
                    Type = driverVehicle.Type,
                    Make = driverVehicle.Make,
                    Model = driverVehicle.Model,
                    Color = driverVehicle.Color,
                    PlateNumber = driverVehicle.PlateNumber,
                    Year = driverVehicle.Year,
                    HasAC = driverVehicle.HasAC
                },
            Origin = new RideLocation
            {
                Address = request.Origin,
                Latitude = request.OriginLat ?? 0,
                Longitude = request.OriginLng ?? 0
            },
            Destination = new RideLocation
            {
                Address = request.Destination,
                Latitude = request.DestinationLat ?? 0,
                Longitude = request.DestinationLng ?? 0
            },
            DepartureTime = request.DepartureTime,
            AvailableSeats = request.AvailableSeats,
            FarePerKm = request.FarePerKm,
            TotalFare = 0,
            DistanceKm = 0,
            EstimatedDurationMinutes = 0,
            Preferences = preferences,
            IsRecurring = request.IsRecurring,
            RecurringDays = request.RecurringDays
        };

        var savedRide = await _rideService.CreateAsync(ride);
        return Ok(ToRideResponse(savedRide));
    }

    [HttpGet]
    public async Task<ActionResult<List<RideResponse>>> SearchRides(
        [FromQuery] string? origin,
        [FromQuery] string? destination,
        [FromQuery] int passengers = 1,
        [FromQuery] double? originLat = null,
        [FromQuery] double? originLng = null,
        [FromQuery] double? destinationLat = null,
        [FromQuery] double? destinationLng = null,
        [FromQuery] double? maxDistanceKm = null)
    {
        var rides = await _rideService.SearchAsync(
            origin,
            destination,
            passengers,
            originLat,
            originLng,
            destinationLat,
            destinationLng,
            maxDistanceKm);
        return Ok(rides.Select(ToRideResponse).ToList());
    }

    private static RideResponse ToRideResponse(RideRecord ride)
    {
        return new RideResponse(
            ride.Id ?? string.Empty,
            ride.DriverId,
            ride.DriverName,
            ride.DriverRating,
            ride.Vehicle,
            ride.Origin,
            ride.Destination,
            ride.DepartureTime,
            ride.AvailableSeats,
            ride.FarePerKm,
            ride.TotalFare,
            ride.DistanceKm,
            ride.EstimatedDurationMinutes,
            ride.Preferences,
            ride.IsRecurring,
            ride.RecurringDays,
            ride.Status,
            ride.CreatedAtUtc.ToString("O")
        );
    }
}

