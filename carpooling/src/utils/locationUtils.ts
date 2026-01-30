/**
 * Location coordinates interface
 */
export interface Coordinates {
    latitude: number;
    longitude: number;
}

/**
 * Location with address
 */
export interface Location extends Coordinates {
    address: string;
    city?: string;
    state?: string;
    country?: string;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export const calculateDistance = (
    coord1: Coordinates,
    coord2: Coordinates
): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(coord2.latitude - coord1.latitude);
    const dLon = toRadians(coord2.longitude - coord1.longitude);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(coord1.latitude)) *
        Math.cos(toRadians(coord2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
};

/**
 * Format distance for display
 */
export const formatDistance = (distanceKm: number): string => {
    if (distanceKm < 1) {
        return `${Math.round(distanceKm * 1000)} m`;
    }
    return `${distanceKm.toFixed(1)} km`;
};

/**
 * Calculate estimated time based on distance
 * Assumes average speed of 40 km/h in city
 */
export const calculateEstimatedTime = (distanceKm: number): number => {
    const averageSpeed = 40; // km/h
    const timeInHours = distanceKm / averageSpeed;
    return Math.round(timeInHours * 60); // Convert to minutes
};

/**
 * Format duration in minutes to readable format
 */
export const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (mins === 0) {
        return `${hours} hr`;
    }

    return `${hours} hr ${mins} min`;
};

/**
 * Get region for map display from coordinates
 */
export const getRegionFromCoordinates = (
    coordinates: Coordinates[],
    padding: number = 0.1
): {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
} => {
    if (coordinates.length === 0) {
        return {
            latitude: 0,
            longitude: 0,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        };
    }

    if (coordinates.length === 1) {
        return {
            latitude: coordinates[0].latitude,
            longitude: coordinates[0].longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        };
    }

    const lats = coordinates.map(c => c.latitude);
    const lons = coordinates.map(c => c.longitude);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    const latDelta = (maxLat - minLat) * (1 + padding);
    const lonDelta = (maxLon - minLon) * (1 + padding);

    return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLon + maxLon) / 2,
        latitudeDelta: Math.max(latDelta, 0.0922),
        longitudeDelta: Math.max(lonDelta, 0.0421),
    };
};

/**
 * Mock geocoding - convert address to coordinates
 * In production, this would use Google Maps Geocoding API
 */
export const geocodeAddress = async (address: string): Promise<Location> => {
    // Mock implementation - returns random coordinates in Gandhinagar
    await new Promise<void>(resolve => setTimeout(() => resolve(), 500));

    return {
        latitude: 23.2156 + (Math.random() - 0.5) * 0.05,
        longitude: 72.6369 + (Math.random() - 0.5) * 0.05,
        address,
        city: 'Gandhinagar',
        state: 'Gujarat',
        country: 'India',
    };
};

/**
 * Mock reverse geocoding - convert coordinates to address
 * In production, this would use Google Maps Reverse Geocoding API
 */
export const reverseGeocode = async (coordinates: Coordinates): Promise<string> => {
    // Mock implementation
    await new Promise<void>(resolve => setTimeout(() => resolve(), 500));

    const streets = ['Sector 11', 'Infocity', 'Sector 21', 'Gift City', 'Sector 16'];
    const randomStreet = streets[Math.floor(Math.random() * streets.length)];

    return `${randomStreet}, Gandhinagar, Gujarat`;
};

export default {
    calculateDistance,
    formatDistance,
    calculateEstimatedTime,
    formatDuration,
    getRegionFromCoordinates,
    geocodeAddress,
    reverseGeocode,
};
