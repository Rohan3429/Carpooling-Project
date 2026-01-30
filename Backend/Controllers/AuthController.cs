using Backend.Dtos;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserService _userService;
    private readonly DriverProfileService _driverProfileService;
    private readonly VehicleService _vehicleService;
    private readonly PaymentMethodService _paymentMethodService;

    public AuthController(
        UserService userService,
        DriverProfileService driverProfileService,
        VehicleService vehicleService,
        PaymentMethodService paymentMethodService)
    {
        _userService = userService;
        _driverProfileService = driverProfileService;
        _vehicleService = vehicleService;
        _paymentMethodService = paymentMethodService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Phone) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Name, email, phone, and password are required.");
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var normalizedUserType = string.IsNullOrWhiteSpace(request.UserType)
            ? "passenger"
            : request.UserType.Trim().ToLowerInvariant();
        var validUserTypes = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "driver",
            "passenger",
            "both"
        };
        if (!validUserTypes.Contains(normalizedUserType))
        {
            return BadRequest("UserType must be driver, passenger, or both.");
        }
        var existingUser = await _userService.GetByEmailAsync(normalizedEmail);
        if (existingUser != null)
        {
            return Conflict("User already exists.");
        }

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = normalizedEmail,
            Phone = request.Phone.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            UserType = normalizedUserType,
            Gender = request.Gender?.Trim() ?? string.Empty,
            Preferences = request.Preferences?.Trim() ?? string.Empty,
            ProfilePhotoUrl = request.ProfilePhotoUrl?.Trim()
        };

        await _userService.CreateAsync(user);

        if (string.Equals(normalizedUserType, "driver", StringComparison.OrdinalIgnoreCase))
        {
            var driverProfileRequest = request.DriverProfile ?? new RegisterDriverProfileRequest();
            await _driverProfileService.UpsertAsync(
                user.Id ?? string.Empty,
                new UpdateDriverProfileRequest(
                    driverProfileRequest.LicenseNumber,
                    driverProfileRequest.LicenseUploadUrl,
                    driverProfileRequest.BankAccountName,
                    driverProfileRequest.BankName,
                    driverProfileRequest.AccountNumber,
                    driverProfileRequest.Ifsc,
                    driverProfileRequest.VerificationStatus
                )
            );

            var vehicles = (request.Vehicles ?? [])
                .Select(vehicle => new VehicleRecord
                {
                    UserId = user.Id ?? string.Empty,
                    Type = vehicle.Type,
                    Make = vehicle.Make,
                    Model = vehicle.Model,
                    Color = vehicle.Color,
                    PlateNumber = vehicle.PlateNumber,
                    Year = vehicle.Year,
                    HasAC = vehicle.HasAC
                })
                .ToList();
            await _vehicleService.ReplaceForUserAsync(user.Id ?? string.Empty, vehicles);

            var paymentMethods = (request.PaymentMethods ?? [])
                .Select(method => new PaymentMethodRecord
                {
                    UserId = user.Id ?? string.Empty,
                    Type = method.Type,
                    Name = method.Name,
                    Details = method.Details,
                    IsDefault = method.IsDefault
                })
                .ToList();
            await _paymentMethodService.ReplaceForUserAsync(user.Id ?? string.Empty, paymentMethods);
        }

        return CreatedAtAction(
            nameof(Register),
            new AuthResponse(user.Id ?? string.Empty, user.Name, user.Email, user.Phone, user.UserType)
        );
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Email and password are required.");
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _userService.GetByEmailAsync(normalizedEmail);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized("Invalid credentials.");
        }

        return Ok(new AuthResponse(user.Id ?? string.Empty, user.Name, user.Email, user.Phone, user.UserType));
    }
}

