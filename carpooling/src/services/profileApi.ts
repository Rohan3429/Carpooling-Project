import { API_BASE_URL } from '../config/api';
import { PaymentMethod, User, UserSettings, VehicleDetails } from '../types';

type UserProfilePayload = {
    id: string;
    name: string;
    email: string;
    phone: string;
    userType: User['userType'];
    gender?: string;
    preferences?: string;
    profilePhotoUrl?: string | null;
    vehicles?: VehicleDetails[];
    paymentMethods?: PaymentMethod[];
    settings?: UserSettings;
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

const fetchWithTimeout = async (
    input: RequestInfo,
    init: RequestInit,
    timeoutMs = 10000,
    retryCount = 1
): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(input, { ...init, signal: controller.signal });
    } catch (error: any) {
        if (retryCount > 0 && (error?.name === 'AbortError' || error instanceof TypeError)) {
            return fetchWithTimeout(input, init, timeoutMs, retryCount - 1);
        }

        if (error?.name === 'AbortError') {
            throw new Error('Request timed out. Check backend connection and try again.');
        }

        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
};

const mapProfileUser = (payload: UserProfilePayload): User => ({
    id: payload.id,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    profilePhoto: payload.profilePhotoUrl || undefined,
    userType: payload.userType || 'passenger',
    gender: payload.gender || '',
    preferences: payload.preferences || '',
    vehicles: payload.vehicles || [],
    paymentMethods: payload.paymentMethods || [],
    settings: payload.settings || {
        notificationsEnabled: true,
        marketingUpdates: false,
        darkMode: false,
    },
    rating: 0,
    totalRides: 0,
    createdAt: new Date().toISOString(),
});

export const profileApi = {
    getProfile: async (userId: string): Promise<User> => {
        const url = `${API_BASE_URL}/api/users/${userId}`;
        const response = await fetchWithTimeout(url, { method: 'GET', headers: { 'ngrok-skip-browser-warning': 'true' } });
        if (!response.ok) {
            throw new Error(await parseErrorMessage(response));
        }
        const payload = (await response.json()) as UserProfilePayload;
        return mapProfileUser(payload);
    },

    updateProfile: async (
        userId: string,
        updates: {
            name?: string;
            phone?: string;
            gender?: string;
            preferences?: string;
            profilePhotoUrl?: string;
        }
    ): Promise<User> => {
        const url = `${API_BASE_URL}/api/users/${userId}`;
        const response = await fetchWithTimeout(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify(updates),
        });
        if (!response.ok) {
            throw new Error(await parseErrorMessage(response));
        }
        const payload = (await response.json()) as UserProfilePayload;
        return mapProfileUser(payload);
    },

    updateVehicles: async (userId: string, vehicles: VehicleDetails[]): Promise<User> => {
        const url = `${API_BASE_URL}/api/users/${userId}/vehicles`;
        const response = await fetchWithTimeout(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify({ vehicles }),
        });
        if (!response.ok) {
            throw new Error(await parseErrorMessage(response));
        }
        const payload = (await response.json()) as UserProfilePayload;
        return mapProfileUser(payload);
    },

    updatePaymentMethods: async (userId: string, paymentMethods: PaymentMethod[]): Promise<User> => {
        const url = `${API_BASE_URL}/api/users/${userId}/payment-methods`;
        const response = await fetchWithTimeout(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify({ paymentMethods }),
        });
        if (!response.ok) {
            throw new Error(await parseErrorMessage(response));
        }
        const payload = (await response.json()) as UserProfilePayload;
        return mapProfileUser(payload);
    },

    updateSettings: async (userId: string, settings: UserSettings): Promise<User> => {
        const url = `${API_BASE_URL}/api/users/${userId}/settings`;
        const response = await fetchWithTimeout(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify({ settings }),
        });
        if (!response.ok) {
            throw new Error(await parseErrorMessage(response));
        }
        const payload = (await response.json()) as UserProfilePayload;
        return mapProfileUser(payload);
    },
};

export default profileApi;

