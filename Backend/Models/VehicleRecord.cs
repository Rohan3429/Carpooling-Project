using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Backend.Models;

public class VehicleRecord
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;

    public string Make { get; set; } = string.Empty;

    public string Model { get; set; } = string.Empty;

    public string Color { get; set; } = string.Empty;

    public string PlateNumber { get; set; } = string.Empty;

    public int Year { get; set; }

    public bool HasAC { get; set; }
}

