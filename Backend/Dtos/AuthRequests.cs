using Backend.Models;

namespace Backend.Dtos;

public class RegisterRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string UserType { get; set; } = string.Empty;
    public string? Gender { get; set; }
    public string? Preferences { get; set; }
    public string? ProfilePhotoUrl { get; set; }
    public RegisterDriverProfileRequest? DriverProfile { get; set; }
    public List<VehicleDetails>? Vehicles { get; set; }
    public List<PaymentMethod>? PaymentMethods { get; set; }
}

public class RegisterDriverProfileRequest
{
    public string? LicenseNumber { get; set; }
    public string? LicenseUploadUrl { get; set; }
    public string? BankAccountName { get; set; }
    public string? BankName { get; set; }
    public string? AccountNumber { get; set; }
    public string? Ifsc { get; set; }
    public string? VerificationStatus { get; set; }
}

public record LoginRequest(string Email, string Password);

