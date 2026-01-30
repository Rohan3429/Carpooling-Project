using Backend.Models;
using Backend.Settings;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Backend.Services;

public class BookingService
{
    private readonly IMongoCollection<BookingRecord> _bookings;

    public BookingService(IMongoClient client, IOptions<MongoSettings> settings)
    {
        var database = client.GetDatabase(settings.Value.DatabaseName);
        _bookings = database.GetCollection<BookingRecord>(settings.Value.BookingsCollectionName);

        _bookings.Indexes.CreateOne(new CreateIndexModel<BookingRecord>(
            Builders<BookingRecord>.IndexKeys.Ascending(b => b.RideId)));
        _bookings.Indexes.CreateOne(new CreateIndexModel<BookingRecord>(
            Builders<BookingRecord>.IndexKeys.Ascending(b => b.DriverId)));
        _bookings.Indexes.CreateOne(new CreateIndexModel<BookingRecord>(
            Builders<BookingRecord>.IndexKeys.Ascending(b => b.PassengerId)));
        _bookings.Indexes.CreateOne(new CreateIndexModel<BookingRecord>(
            Builders<BookingRecord>.IndexKeys.Ascending(b => b.Status)));
    }

    public async Task<BookingRecord> CreateAsync(BookingRecord booking)
    {
        await _bookings.InsertOneAsync(booking);
        return booking;
    }

    public async Task<BookingRecord?> GetByIdAsync(string id)
    {
        return await _bookings.Find(b => b.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<BookingRecord>> GetByDriverIdAsync(string driverId, string? status = null)
    {
        var filter = Builders<BookingRecord>.Filter.Eq(b => b.DriverId, driverId);
        if (!string.IsNullOrEmpty(status))
        {
            filter &= Builders<BookingRecord>.Filter.Eq(b => b.Status, status);
        }
        return await _bookings.Find(filter).SortByDescending(b => b.CreatedAtUtc).ToListAsync();
    }

    public async Task<List<BookingRecord>> GetByPassengerIdAsync(string passengerId, string? status = null)
    {
        var filter = Builders<BookingRecord>.Filter.Eq(b => b.PassengerId, passengerId);
        if (!string.IsNullOrEmpty(status))
        {
            filter &= Builders<BookingRecord>.Filter.Eq(b => b.Status, status);
        }
        return await _bookings.Find(filter).SortByDescending(b => b.CreatedAtUtc).ToListAsync();
    }

    public async Task<BookingRecord?> UpdateStatusAsync(string id, string status)
    {
        var update = Builders<BookingRecord>.Update
            .Set(b => b.Status, status)
            .Set(b => b.UpdatedAtUtc, DateTime.UtcNow);
        
        var result = await _bookings.FindOneAndUpdateAsync(
            Builders<BookingRecord>.Filter.Eq(b => b.Id, id),
            update,
            new FindOneAndUpdateOptions<BookingRecord> { ReturnDocument = ReturnDocument.After }
        );
        
        return result;
    }
}

