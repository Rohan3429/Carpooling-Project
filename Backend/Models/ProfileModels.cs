namespace Backend.Models;

public class VehicleDetails
{
    public string Type { get; set; } = string.Empty;
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string PlateNumber { get; set; } = string.Empty;
    public int Year { get; set; }
    public bool HasAC { get; set; }
}

public class PaymentMethod
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
}

public class UserSettings
{
    public bool NotificationsEnabled { get; set; } = true;
    public bool MarketingUpdates { get; set; } = false;
    public bool DarkMode { get; set; }
}

