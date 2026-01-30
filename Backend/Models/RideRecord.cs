using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Backend.Models;

public class RideRecord
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string DriverId { get; set; } = string.Empty;
    public string DriverName { get; set; } = string.Empty;
    public double DriverRating { get; set; }

    public VehicleDetails? Vehicle { get; set; }

    public RideLocation Origin { get; set; } = new();
    public RideLocation Destination { get; set; } = new();

    public string DepartureTime { get; set; } = string.Empty;
    public int AvailableSeats { get; set; }
    public double FarePerKm { get; set; }
    public double TotalFare { get; set; }
    public double DistanceKm { get; set; }
    public int EstimatedDurationMinutes { get; set; }

    public RidePreferences Preferences { get; set; } = new();

    public bool IsRecurring { get; set; }
    public List<string>? RecurringDays { get; set; }
    public string Status { get; set; } = "active";
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

