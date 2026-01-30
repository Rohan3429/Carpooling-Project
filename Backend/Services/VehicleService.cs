using Backend.Models;
using Backend.Settings;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Backend.Services;

public class VehicleService
{
    private readonly IMongoCollection<VehicleRecord> _vehicles;

    public VehicleService(IMongoClient client, IOptions<MongoSettings> settings)
    {
        var database = client.GetDatabase(settings.Value.DatabaseName);
        _vehicles = database.GetCollection<VehicleRecord>(settings.Value.VehiclesCollectionName);

        var indexKeys = Builders<VehicleRecord>.IndexKeys.Ascending(v => v.UserId);
        _vehicles.Indexes.CreateOne(new CreateIndexModel<VehicleRecord>(indexKeys));
    }

    public Task<List<VehicleRecord>> GetByUserIdAsync(string userId)
    {
        var filter = Builders<VehicleRecord>.Filter.Eq(v => v.UserId, userId);
        return _vehicles.Find(filter).ToListAsync();
    }

    public async Task<List<VehicleRecord>> ReplaceForUserAsync(string userId, List<VehicleRecord> vehicles)
    {
        var filter = Builders<VehicleRecord>.Filter.Eq(v => v.UserId, userId);
        await _vehicles.DeleteManyAsync(filter);

        if (vehicles.Count > 0)
        {
            await _vehicles.InsertManyAsync(vehicles);
        }

        return vehicles;
    }
}

