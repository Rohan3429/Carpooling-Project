using Backend.Models;

namespace Backend.Dtos;

public record UserProfileResponse(
    string Id,
    string Name,
    string Email,
    string Phone,
    string UserType,
    string Gender,
    string Preferences,
    string? ProfilePhotoUrl,
    List<VehicleDetails> Vehicles,
    List<PaymentMethod> PaymentMethods,
    UserSettings Settings
);

public record UpdateUserProfileRequest(
    string? Name,
    string? Phone,
    string? Gender,
    string? Preferences,
    string? ProfilePhotoUrl
);

public record UpdateVehiclesRequest(List<VehicleDetails> Vehicles);

public record UpdatePaymentMethodsRequest(List<PaymentMethod> PaymentMethods);

public record UpdateSettingsRequest(UserSettings Settings);

public record DriverProfileResponse(
    string UserId,
    string LicenseNumber,
    string LicenseUploadUrl,
    string BankAccountName,
    string BankName,
    string AccountNumber,
    string Ifsc,
    string VerificationStatus
);

public record UpdateDriverProfileRequest(
    string? LicenseNumber,
    string? LicenseUploadUrl,
    string? BankAccountName,
    string? BankName,
    string? AccountNumber,
    string? Ifsc,
    string? VerificationStatus
);

