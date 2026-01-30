using Backend.Models;

namespace Backend.Dtos;

public record RideLocationDto(
    string Address,
    double Latitude,
    double Longitude
);

public record BookingCreateRequest(
    string RideId,
    string PassengerId,
    string PassengerName,
    int NumberOfPassengers,
    double TotalFare,
    double UpfrontPayment,
    double RemainingPayment,
    RideLocationDto PickupLocation,
    RideLocationDto DropoffLocation
);

public record BookingStatusUpdateRequest(string Status);

public record BookingResponse(
    string Id,
    string RideId,
    string DriverId,
    string PassengerId,
    string PassengerName,
    int NumberOfPassengers,
    double TotalFare,
    double UpfrontPayment,
    double RemainingPayment,
    RideLocationDto PickupLocation,
    RideLocationDto DropoffLocation,
    string Status,
    string CreatedAtUtc,
    string? UpdatedAtUtc
);

