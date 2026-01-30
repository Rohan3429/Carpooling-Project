import { API_BASE_URL } from '../config/api';

export type RidePreferencesPayload = {
    hasAC: boolean;
    musicType: string;
    smokingAllowed: boolean;
    petsAllowed: boolean;
    genderPreference: string;
    notes?: string;
};

export type RideCreatePayload = {
    driverId: string;
    origin: string;
    originLat?: number | null;
    originLng?: number | null;
    destination: string;
    destinationLat?: number | null;
    destinationLng?: number | null;
    departureTime: string;
    availableSeats: number;
    farePerKm: number;
    preferences: RidePreferencesPayload;
    isRecurring: boolean;
    recurringDays?: string[];
};

export type RideApiResponse = {
    id: string;
    driverId: string;
    driverName: string;
    driverRating: number;
    vehicle?: {
        type: string;
        make: string;
        model: string;
        color: string;
        plateNumber: string;
        year: number;
        hasAC: boolean;
    } | null;
    origin: { address: string; latitude: number; longitude: number };
    destination: { address: string; latitude: number; longitude: number };
    departureTime: string;
    availableSeats: number;
    farePerKm: number;
    totalFare: number;
    distanceKm: number;
    estimatedDurationMinutes: number;
    preferences: RidePreferencesPayload;
    isRecurring: boolean;
    recurringDays?: string[];
    status: string;
    createdAtUtc: string;
};

const parseErrorMessage = async (response: Response): Promise<string> => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        const payload = (await response.json()) as { message?: string } | null;
        return payload?.message || 'Request failed';
    }
    const text = (await response.text()) || 'Request failed';
    if (text.includes('<!DOCTYPE html') || text.includes('<html')) {
        return 'Request failed. Please check the backend connection.';
    }
    return text;
};

export const ridesApi = {
    createRide: async (payload: RideCreatePayload): Promise<RideApiResponse> => {
        const url = `${API_BASE_URL}/api/rides`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error(await parseErrorMessage(response));
        }
        return (await response.json()) as RideApiResponse;
    },

    searchRides: async (params: {
        origin?: string;
        destination?: string;
        passengers?: number;
        originLat?: number | null;
        originLng?: number | null;
        destinationLat?: number | null;
        destinationLng?: number | null;
        maxDistanceKm?: number;
    }): Promise<RideApiResponse[]> => {
        const query = new URLSearchParams();
        if (params.origin) query.append('origin', params.origin);
        if (params.destination) query.append('destination', params.destination);
        if (params.passengers) query.append('passengers', String(params.passengers));
        if (params.originLat != null) query.append('originLat', String(params.originLat));
        if (params.originLng != null) query.append('originLng', String(params.originLng));
        if (params.destinationLat != null) query.append('destinationLat', String(params.destinationLat));
        if (params.destinationLng != null) query.append('destinationLng', String(params.destinationLng));
        if (params.maxDistanceKm != null) query.append('maxDistanceKm', String(params.maxDistanceKm));
        const url = `${API_BASE_URL}/api/rides?${query.toString()}`;

        const response = await fetch(url, { method: 'GET', headers: { 'ngrok-skip-browser-warning': 'true' } });
        if (!response.ok) {
            throw new Error(await parseErrorMessage(response));
        }
        return (await response.json()) as RideApiResponse[];
    },
};

export default ridesApi;

