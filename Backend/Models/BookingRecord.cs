using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Backend.Models;

public class BookingRecord
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string RideId { get; set; } = string.Empty;
    public string DriverId { get; set; } = string.Empty;
    public string PassengerId { get; set; } = string.Empty;
    public string PassengerName { get; set; } = string.Empty;

    public int NumberOfPassengers { get; set; }
    public double TotalFare { get; set; }
    public double UpfrontPayment { get; set; }
    public double RemainingPayment { get; set; }

    public RideLocation PickupLocation { get; set; } = new();
    public RideLocation DropoffLocation { get; set; } = new();

    public string Status { get; set; } = "pending"; // pending, accepted, rejected, completed, cancelled
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; set; }
}

