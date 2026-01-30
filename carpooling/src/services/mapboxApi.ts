import { API_BASE_URL } from '../config/api';

export type PlaceSuggestion = {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
};

export type RouteResult = {
    coordinates: Array<{ latitude: number; longitude: number }>;
    distanceKm: number;
};

const fetchJson = async (url: string, init?: RequestInit) => {
    const response = await fetch(url, init);
    if (!response.ok) {
        throw new Error('Map request failed');
    }
    return response.json();
};

export const mapboxApi = {
    searchPlaces: async (query: string): Promise<PlaceSuggestion[]> => {
        const trimmed = query.trim();
        if (!trimmed) return [];
        const url = `${API_BASE_URL}/api/maps/places?query=${encodeURIComponent(trimmed)}`;
        const payload = await fetchJson(url, { headers: { 'ngrok-skip-browser-warning': 'true' } });
        const features = (payload?.features ?? []) as Array<{
            id: string;
            place_name: string;
            text: string;
            center: [number, number];
        }>;

        return features.map((item) => ({
            id: item.id,
            name: item.text,
            address: item.place_name,
            longitude: item.center[0],
            latitude: item.center[1],
        }));
    },

    getRoute: async (
        origin: { latitude: number; longitude: number },
        destination: { latitude: number; longitude: number }
    ): Promise<RouteResult> => {
        const url = `${API_BASE_URL}/api/maps/route`;
        const payload = await fetchJson(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify({
                originLat: origin.latitude,
                originLng: origin.longitude,
                destinationLat: destination.latitude,
                destinationLng: destination.longitude,
            }),
        });
        const route = payload?.routes?.[0];
        const coordinates = (route?.geometry?.coordinates ?? []).map(
            ([lng, lat]: [number, number]) => ({ latitude: lat, longitude: lng })
        );
        const distanceKm = route?.distance ? route.distance / 1000 : 0;
        return { coordinates, distanceKm };
    },
};

export default mapboxApi;

