import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';
import { User } from '../types';

const STORAGE_KEY = '@carpooling_user';

type AuthApiUser = {
    id: string;
    name: string;
    email: string;
    phone: string;
    userType: 'driver' | 'passenger' | 'both' | string;
};

type RegisterDriverPayload = {
    name: string;
    email: string;
    phone: string;
    password: string;
    gender?: string;
    preferences?: string;
    profilePhotoUrl?: string;
    driverProfile?: {
        licenseNumber?: string;
        licenseUploadUrl?: string;
        bankAccountName?: string;
        bankName?: string;
        accountNumber?: string;
        ifsc?: string;
        verificationStatus?: string;
    };
    vehicles?: Array<{
        type: string;
        make: string;
        model: string;
        color: string;
        plateNumber: string;
        year: number;
        hasAC: boolean;
    }>;
    paymentMethods?: Array<{
        id?: string;
        type: string;
        name: string;
        details: string;
        isDefault: boolean;
    }>;
};

const mapAuthUser = (apiUser: AuthApiUser, fallbackPhone = ''): User => ({
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    phone: apiUser.phone || fallbackPhone,
    profilePhoto: undefined,
    userType: (apiUser.userType as User['userType']) || 'passenger',
    gender: '',
    preferences: '',
    vehicles: [],
    paymentMethods: [],
    settings: {
        notificationsEnabled: true,
        marketingUpdates: false,
        darkMode: false,
    },
    rating: 0,
    totalRides: 0,
    createdAt: new Date().toISOString(),
});

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

export const authApi = {
    register: async (
        name: string,
        email: string,
        phone: string,
        password: string,
        userType: User['userType']
    ): Promise<User> => {
        const url = `${API_BASE_URL}/api/auth/register`;
        console.log('[authApi] register ->', url, { name, email, phone, userType });
        const response = await fetchWithTimeout(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify({ name, email, phone, password, userType }),
        });

        if (!response.ok) {
            throw new Error(await parseErrorMessage(response));
        }

        const apiUser = (await response.json()) as AuthApiUser;
        console.log('[authApi] register <-', apiUser);
        const user = mapAuthUser(apiUser, phone);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        return user;
    },

    registerDriver: async (payload: RegisterDriverPayload): Promise<User> => {
        const url = `${API_BASE_URL}/api/auth/register`;
        const response = await fetchWithTimeout(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify({ ...payload, userType: 'driver' }),
        });

        if (!response.ok) {
            throw new Error(await parseErrorMessage(response));
        }

        const apiUser = (await response.json()) as AuthApiUser;
        const user = mapAuthUser(apiUser, payload.phone);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        return user;
    },

    login: async (email: string, password: string): Promise<User> => {
        const url = `${API_BASE_URL}/api/auth/login`;
        console.log('[authApi] login ->', url, { email });
        const response = await fetchWithTimeout(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error(await parseErrorMessage(response));
        }

        const apiUser = (await response.json()) as AuthApiUser;
        console.log('[authApi] login <-', apiUser);
        const user = mapAuthUser(apiUser);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        return user;
    },

    healthCheck: async (): Promise<{ status: string; timeUtc: string }> => {
        const url = `${API_BASE_URL}/api/health`;
        console.log('[authApi] health ->', url);
        const response = await fetchWithTimeout(
            url,
            { method: 'GET', headers: { 'ngrok-skip-browser-warning': 'true' } },
            8000,
            0
        );
        if (!response.ok) {
            throw new Error(await parseErrorMessage(response));
        }
        const payload = (await response.json()) as { status: string; timeUtc: string };
        console.log('[authApi] health <-', payload);
        return payload;
    },
};

export default authApi;

