namespace Backend.Settings;

public class MongoSettings
{
    public string ConnectionString { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = string.Empty;
    public string UsersCollectionName { get; set; } = "users";
    public string DriverProfilesCollectionName { get; set; } = "driver_profiles";
    public string VehiclesCollectionName { get; set; } = "vehicles";
    public string PaymentMethodsCollectionName { get; set; } = "payment_methods";
    public string RidesCollectionName { get; set; } = "rides";
    public string BookingsCollectionName { get; set; } = "bookings";
}


