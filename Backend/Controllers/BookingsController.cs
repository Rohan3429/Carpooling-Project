using Backend.Dtos;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly BookingService _bookingService;
    private readonly RideService _rideService;
    private readonly UserService _userService;

    public BookingsController(BookingService bookingService, RideService rideService, UserService userService)
    {
        _bookingService = bookingService;
        _rideService = rideService;
        _userService = userService;
    }

    [HttpPost]
    public async Task<ActionResult<BookingResponse>> CreateBooking(BookingCreateRequest request)
    {
        // Verify ride exists
        var ride = await _rideService.GetByIdAsync(request.RideId);
        if (ride == null)
        {
            return NotFound("Ride not found.");
        }

        // Verify passenger exists
        var passenger = await _userService.GetByIdAsync(request.PassengerId);
        if (passenger == null)
        {
            return NotFound("Passenger not found.");
        }

        var booking = new BookingRecord
        {
            RideId = request.RideId,
            DriverId = ride.DriverId,
            PassengerId = request.PassengerId,
            PassengerName = request.PassengerName,
            NumberOfPassengers = request.NumberOfPassengers,
            TotalFare = request.TotalFare,
            UpfrontPayment = request.UpfrontPayment,
            RemainingPayment = request.RemainingPayment,
            PickupLocation = new RideLocation
            {
                Address = request.PickupLocation.Address,
                Latitude = request.PickupLocation.Latitude,
                Longitude = request.PickupLocation.Longitude
            },
            DropoffLocation = new RideLocation
            {
                Address = request.DropoffLocation.Address,
                Latitude = request.DropoffLocation.Latitude,
                Longitude = request.DropoffLocation.Longitude
            },
            Status = "pending"
        };

        var savedBooking = await _bookingService.CreateAsync(booking);
        return Ok(ToBookingResponse(savedBooking));
    }

    [HttpGet("driver/{driverId}")]
    public async Task<ActionResult<List<BookingResponse>>> GetDriverBookings(string driverId, [FromQuery] string? status = null)
    {
        var bookings = await _bookingService.GetByDriverIdAsync(driverId, status);
        return Ok(bookings.Select(ToBookingResponse).ToList());
    }

    [HttpGet("passenger/{passengerId}")]
    public async Task<ActionResult<List<BookingResponse>>> GetPassengerBookings(string passengerId, [FromQuery] string? status = null)
    {
        var bookings = await _bookingService.GetByPassengerIdAsync(passengerId, status);
        return Ok(bookings.Select(ToBookingResponse).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BookingResponse>> GetBooking(string id)
    {
        var booking = await _bookingService.GetByIdAsync(id);
        if (booking == null)
        {
            return NotFound("Booking not found.");
        }
        return Ok(ToBookingResponse(booking));
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult<BookingResponse>> UpdateBookingStatus(string id, BookingStatusUpdateRequest request)
    {
        if (request.Status != "accepted" && request.Status != "rejected" && request.Status != "cancelled")
        {
            return BadRequest("Invalid status. Must be 'accepted', 'rejected', or 'cancelled'.");
        }

        var booking = await _bookingService.UpdateStatusAsync(id, request.Status);
        if (booking == null)
        {
            return NotFound("Booking not found.");
        }

        return Ok(ToBookingResponse(booking));
    }

    private static BookingResponse ToBookingResponse(BookingRecord booking)
    {
        return new BookingResponse(
            booking.Id ?? string.Empty,
            booking.RideId,
            booking.DriverId,
            booking.PassengerId,
            booking.PassengerName,
            booking.NumberOfPassengers,
            booking.TotalFare,
            booking.UpfrontPayment,
            booking.RemainingPayment,
            new RideLocationDto(
                booking.PickupLocation.Address,
                booking.PickupLocation.Latitude,
                booking.PickupLocation.Longitude
            ),
            new RideLocationDto(
                booking.DropoffLocation.Address,
                booking.DropoffLocation.Latitude,
                booking.DropoffLocation.Longitude
            ),
            booking.Status,
            booking.CreatedAtUtc.ToString("O"),
            booking.UpdatedAtUtc?.ToString("O")
        );
    }
}

