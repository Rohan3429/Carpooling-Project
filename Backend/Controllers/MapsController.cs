using System.Text.Json;
using Backend.Settings;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MapsController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly MapboxSettings _settings;

    public MapsController(IHttpClientFactory httpClientFactory, IOptions<MapboxSettings> settings)
    {
        _httpClientFactory = httpClientFactory;
        _settings = settings.Value;
    }

    [HttpGet("places")]
    public async Task<ActionResult<object>> SearchPlaces([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return Ok(new { features = Array.Empty<object>() });
        }

        // Bias results to India (Gandhinagar region) and request richer place types
        var encodedQuery = Uri.EscapeDataString(query);
        const string country = "in";
        const string types = "place,locality,neighborhood,poi,address";
        const string proximity = "72.6369,23.2156"; // lng,lat for Gandhinagar

        var url =
            $"https://api.mapbox.com/geocoding/v5/mapbox.places/{encodedQuery}.json" +
            $"?access_token={_settings.AccessToken}" +
            $"&limit=8" +
            $"&autocomplete=true" +
            $"&country={country}" +
            $"&types={types}" +
            $"&proximity={proximity}";
        var client = _httpClientFactory.CreateClient();
        var response = await client.GetAsync(url);
        if (!response.IsSuccessStatusCode)
        {
            return StatusCode((int)response.StatusCode, "Mapbox request failed.");
        }

        var content = await response.Content.ReadAsStringAsync();
        return Ok(JsonDocument.Parse(content).RootElement);
    }

    public record RouteRequest(double OriginLat, double OriginLng, double DestinationLat, double DestinationLng);

    [HttpPost("route")]
    public async Task<ActionResult<object>> GetRoute(RouteRequest request)
    {
        if (request.OriginLat == 0 || request.OriginLng == 0 || request.DestinationLat == 0 || request.DestinationLng == 0)
        {
            return BadRequest("Origin and destination coordinates are required.");
        }

        var coords = $"{request.OriginLng},{request.OriginLat};{request.DestinationLng},{request.DestinationLat}";
        var url =
            $"https://api.mapbox.com/directions/v5/mapbox/driving/{coords}?access_token={_settings.AccessToken}&geometries=geojson&overview=full";
        var client = _httpClientFactory.CreateClient();
        var response = await client.GetAsync(url);
        if (!response.IsSuccessStatusCode)
        {
            return StatusCode((int)response.StatusCode, "Mapbox request failed.");
        }

        var content = await response.Content.ReadAsStringAsync();
        return Ok(JsonDocument.Parse(content).RootElement);
    }
}

