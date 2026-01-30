namespace Backend.Models;

public class RideLocation
{
    public string Address { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}

public class RidePreferences
{
    public bool HasAC { get; set; }
    public string MusicType { get; set; } = string.Empty;
    public bool SmokingAllowed { get; set; }
    public bool PetsAllowed { get; set; }
    public string GenderPreference { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

