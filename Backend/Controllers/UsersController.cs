using Backend.Dtos;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;
    private readonly DriverProfileService _driverProfileService;
    private readonly VehicleService _vehicleService;
    private readonly PaymentMethodService _paymentMethodService;

    public UsersController(
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

    [HttpGet("{id}")]
    public async Task<ActionResult<UserProfileResponse>> GetProfile(string id)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user == null)
        {
            return NotFound("User not found.");
        }

        var vehicles = await _vehicleService.GetByUserIdAsync(id);
        var paymentMethods = await _paymentMethodService.GetByUserIdAsync(id);

        return Ok(ToProfileResponse(user, vehicles, paymentMethods));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserProfileResponse>> UpdateProfile(string id, UpdateUserProfileRequest request)
    {
        var user = await _userService.UpdateProfileAsync(id, request);
        if (user == null)
        {
            return NotFound("User not found.");
        }

        var vehicles = await _vehicleService.GetByUserIdAsync(id);
        var paymentMethods = await _paymentMethodService.GetByUserIdAsync(id);

        return Ok(ToProfileResponse(user, vehicles, paymentMethods));
    }

    [HttpPut("{id}/vehicles")]
    public async Task<ActionResult<UserProfileResponse>> UpdateVehicles(string id, UpdateVehiclesRequest request)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user == null)
        {
            return NotFound("User not found.");
        }

        var vehicles = (request.Vehicles ?? [])
            .Select(vehicle => new VehicleRecord
            {
                UserId = id,
                Type = vehicle.Type,
                Make = vehicle.Make,
                Model = vehicle.Model,
                Color = vehicle.Color,
                PlateNumber = vehicle.PlateNumber,
                Year = vehicle.Year,
                HasAC = vehicle.HasAC
            })
            .ToList();

        var savedVehicles = await _vehicleService.ReplaceForUserAsync(id, vehicles);
        var paymentMethods = await _paymentMethodService.GetByUserIdAsync(id);

        return Ok(ToProfileResponse(user, savedVehicles, paymentMethods));
    }

    [HttpPut("{id}/payment-methods")]
    public async Task<ActionResult<UserProfileResponse>> UpdatePaymentMethods(string id, UpdatePaymentMethodsRequest request)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user == null)
        {
            return NotFound("User not found.");
        }

        var paymentMethods = (request.PaymentMethods ?? [])
            .Select(method => new PaymentMethodRecord
            {
                UserId = id,
                Type = method.Type,
                Name = method.Name,
                Details = method.Details,
                IsDefault = method.IsDefault
            })
            .ToList();

        var savedPaymentMethods = await _paymentMethodService.ReplaceForUserAsync(id, paymentMethods);
        var vehicles = await _vehicleService.GetByUserIdAsync(id);

        return Ok(ToProfileResponse(user, vehicles, savedPaymentMethods));
    }

    [HttpPut("{id}/settings")]
    public async Task<ActionResult<UserProfileResponse>> UpdateSettings(string id, UpdateSettingsRequest request)
    {
        var user = await _userService.UpdateSettingsAsync(id, request.Settings ?? new UserSettings());
        if (user == null)
        {
            return NotFound("User not found.");
        }

        var vehicles = await _vehicleService.GetByUserIdAsync(id);
        var paymentMethods = await _paymentMethodService.GetByUserIdAsync(id);

        return Ok(ToProfileResponse(user, vehicles, paymentMethods));
    }

    [HttpGet("{id}/driver-profile")]
    public async Task<ActionResult<DriverProfileResponse>> GetDriverProfile(string id)
    {
        var profile = await _driverProfileService.GetByUserIdAsync(id);
        if (profile == null)
        {
            return NotFound("Driver profile not found.");
        }

        return Ok(ToDriverProfileResponse(profile));
    }

    [HttpPut("{id}/driver-profile")]
    public async Task<ActionResult<DriverProfileResponse>> UpdateDriverProfile(string id, UpdateDriverProfileRequest request)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user == null)
        {
            return NotFound("User not found.");
        }

        var profile = await _driverProfileService.UpsertAsync(id, request);
        return Ok(ToDriverProfileResponse(profile));
    }

    private static UserProfileResponse ToProfileResponse(
        User user,
        List<VehicleRecord> vehicles,
        List<PaymentMethodRecord> paymentMethods)
    {
        var vehicleDtos = vehicles.Select(vehicle => new VehicleDetails
        {
            Type = vehicle.Type,
            Make = vehicle.Make,
            Model = vehicle.Model,
            Color = vehicle.Color,
            PlateNumber = vehicle.PlateNumber,
            Year = vehicle.Year,
            HasAC = vehicle.HasAC
        }).ToList();

        var paymentMethodDtos = paymentMethods.Select(method => new PaymentMethod
        {
            Id = method.Id ?? string.Empty,
            Type = method.Type,
            Name = method.Name,
            Details = method.Details,
            IsDefault = method.IsDefault
        }).ToList();

        return new UserProfileResponse(
            user.Id ?? string.Empty,
            user.Name,
            user.Email,
            user.Phone,
            user.UserType,
            user.Gender,
            user.Preferences,
            user.ProfilePhotoUrl,
            vehicleDtos,
            paymentMethodDtos,
            user.Settings
        );
    }

    private static DriverProfileResponse ToDriverProfileResponse(DriverProfile profile)
    {
        return new DriverProfileResponse(
            profile.UserId,
            profile.LicenseNumber,
            profile.LicenseUploadUrl,
            profile.BankAccountName,
            profile.BankName,
            profile.AccountNumber,
            profile.Ifsc,
            profile.VerificationStatus
        );
    }
}

