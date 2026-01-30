using Backend.Models;
using Backend.Settings;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Backend.Services;

public class PaymentMethodService
{
    private readonly IMongoCollection<PaymentMethodRecord> _paymentMethods;

    public PaymentMethodService(IMongoClient client, IOptions<MongoSettings> settings)
    {
        var database = client.GetDatabase(settings.Value.DatabaseName);
        _paymentMethods = database.GetCollection<PaymentMethodRecord>(settings.Value.PaymentMethodsCollectionName);

        var indexKeys = Builders<PaymentMethodRecord>.IndexKeys.Ascending(p => p.UserId);
        _paymentMethods.Indexes.CreateOne(new CreateIndexModel<PaymentMethodRecord>(indexKeys));
    }

    public Task<List<PaymentMethodRecord>> GetByUserIdAsync(string userId)
    {
        var filter = Builders<PaymentMethodRecord>.Filter.Eq(p => p.UserId, userId);
        return _paymentMethods.Find(filter).ToListAsync();
    }

    public async Task<List<PaymentMethodRecord>> ReplaceForUserAsync(string userId, List<PaymentMethodRecord> paymentMethods)
    {
        var filter = Builders<PaymentMethodRecord>.Filter.Eq(p => p.UserId, userId);
        await _paymentMethods.DeleteManyAsync(filter);

        if (paymentMethods.Count > 0)
        {
            await _paymentMethods.InsertManyAsync(paymentMethods);
        }

        return paymentMethods;
    }
}

