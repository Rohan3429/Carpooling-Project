using Backend.Dtos;
using Backend.Models;
using Backend.Settings;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Backend.Services;

public class DriverProfileService
{
    private readonly IMongoCollection<DriverProfile> _profiles;

    public DriverProfileService(IMongoClient client, IOptions<MongoSettings> settings)
    {
        var database = client.GetDatabase(settings.Value.DatabaseName);
        _profiles = database.GetCollection<DriverProfile>(settings.Value.DriverProfilesCollectionName);

        var indexKeys = Builders<DriverProfile>.IndexKeys.Ascending(p => p.UserId);
        _profiles.Indexes.CreateOne(new CreateIndexModel<DriverProfile>(indexKeys, new CreateIndexOptions
        {
            Unique = true
        }));
    }

    public Task<DriverProfile?> GetByUserIdAsync(string userId)
    {
        var filter = Builders<DriverProfile>.Filter.Eq(p => p.UserId, userId);
        return _profiles.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<DriverProfile> UpsertAsync(string userId, UpdateDriverProfileRequest request)
    {
        var filter = Builders<DriverProfile>.Filter.Eq(p => p.UserId, userId);
        var update = Builders<DriverProfile>.Update
            .SetOnInsert(p => p.UserId, userId);

        if (!string.IsNullOrWhiteSpace(request.LicenseNumber))
        {
            update = update.Set(p => p.LicenseNumber, request.LicenseNumber.Trim());
        }

        if (!string.IsNullOrWhiteSpace(request.LicenseUploadUrl))
        {
            update = update.Set(p => p.LicenseUploadUrl, request.LicenseUploadUrl.Trim());
        }

        if (!string.IsNullOrWhiteSpace(request.BankAccountName))
        {
            update = update.Set(p => p.BankAccountName, request.BankAccountName.Trim());
        }

        if (!string.IsNullOrWhiteSpace(request.BankName))
        {
            update = update.Set(p => p.BankName, request.BankName.Trim());
        }

        if (!string.IsNullOrWhiteSpace(request.AccountNumber))
        {
            update = update.Set(p => p.AccountNumber, request.AccountNumber.Trim());
        }

        if (!string.IsNullOrWhiteSpace(request.Ifsc))
        {
            update = update.Set(p => p.Ifsc, request.Ifsc.Trim());
        }

        if (!string.IsNullOrWhiteSpace(request.VerificationStatus))
        {
            update = update.Set(p => p.VerificationStatus, request.VerificationStatus.Trim());
        }

        return await _profiles.FindOneAndUpdateAsync(
            filter,
            update,
            new FindOneAndUpdateOptions<DriverProfile>
            {
                IsUpsert = true,
                ReturnDocument = ReturnDocument.After
            }
        );
    }
}

