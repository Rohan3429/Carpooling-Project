using Backend.Models;
using Backend.Settings;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Backend.Dtos;

namespace Backend.Services;

public class UserService
{
    private readonly IMongoCollection<User> _users;

    public UserService(IMongoClient client, IOptions<MongoSettings> settings)
    {
        var database = client.GetDatabase(settings.Value.DatabaseName);
        _users = database.GetCollection<User>(settings.Value.UsersCollectionName);
    }

    public Task<User?> GetByEmailAsync(string email)
    {
        var filter = Builders<User>.Filter.Eq(u => u.Email, email);
        return _users.Find(filter).FirstOrDefaultAsync();
    }

    public Task<User?> GetByIdAsync(string id)
    {
        var filter = Builders<User>.Filter.Eq(u => u.Id, id);
        return _users.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<User> CreateAsync(User user)
    {
        await _users.InsertOneAsync(user);
        return user;
    }

    public async Task<User?> UpdateProfileAsync(string id, UpdateUserProfileRequest request)
    {
        var updates = new List<UpdateDefinition<User>>();

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            updates.Add(Builders<User>.Update.Set(u => u.Name, request.Name.Trim()));
        }

        if (!string.IsNullOrWhiteSpace(request.Phone))
        {
            updates.Add(Builders<User>.Update.Set(u => u.Phone, request.Phone.Trim()));
        }

        if (!string.IsNullOrWhiteSpace(request.Gender))
        {
            updates.Add(Builders<User>.Update.Set(u => u.Gender, request.Gender.Trim()));
        }

        if (request.Preferences != null)
        {
            updates.Add(Builders<User>.Update.Set(u => u.Preferences, request.Preferences.Trim()));
        }

        if (request.ProfilePhotoUrl != null)
        {
            updates.Add(Builders<User>.Update.Set(u => u.ProfilePhotoUrl, request.ProfilePhotoUrl.Trim()));
        }

        if (updates.Count == 0)
        {
            return await GetByIdAsync(id);
        }

        var filter = Builders<User>.Filter.Eq(u => u.Id, id);
        var update = Builders<User>.Update.Combine(updates);

        return await _users.FindOneAndUpdateAsync(
            filter,
            update,
            new FindOneAndUpdateOptions<User> { ReturnDocument = ReturnDocument.After }
        );
    }

    public async Task<User?> UpdateSettingsAsync(string id, UserSettings settings)
    {
        var filter = Builders<User>.Filter.Eq(u => u.Id, id);
        var update = Builders<User>.Update.Set(u => u.Settings, settings);
        return await _users.FindOneAndUpdateAsync(
            filter,
            update,
            new FindOneAndUpdateOptions<User> { ReturnDocument = ReturnDocument.After }
        );
    }
}


