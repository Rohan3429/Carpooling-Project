using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Backend.Models;

public class DriverProfile
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public string LicenseNumber { get; set; } = string.Empty;

    public string LicenseUploadUrl { get; set; } = string.Empty;

    public string BankAccountName { get; set; } = string.Empty;

    public string BankName { get; set; } = string.Empty;

    public string AccountNumber { get; set; } = string.Empty;

    public string Ifsc { get; set; } = string.Empty;

    public string VerificationStatus { get; set; } = "pending";
}

