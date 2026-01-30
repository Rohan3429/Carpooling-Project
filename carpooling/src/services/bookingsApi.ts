import { API_BASE_URL } from '../config/api';
import { Booking } from '../types';

export type BookingCreatePayload = {
    rideId: string;
    passengerId: string;
    passengerName: string;
    numberOfPassengers: number;
    totalFare: number;
    upfrontPayment: number;
    remainingPayment: number;
    pickupLocation: {
        address: string;
        latitude: number;
        longitude: number;
    };
    dropoffLocation: {
        address: string;
        latitude: number;
        longitude: number;
    };
};

export type BookingApiResponse = {
    id: string;
    rideId: string;
    driverId: string;
    passengerId: string;
    passengerName: string;
    numberOfPassengers: number;
    totalFare: number;
    upfrontPayment: number;
    remainingPayment: number;
    pickupLocation: {
        address: string;
        latitude: number;
        longitude: number;
    };
    dropoffLocation: {
        address: string;
        latitude: number;
        longitude: number;
    };
    status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
    createdAtUtc: string;
    updatedAtUtc?: string;
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

export const bookingsApi = {
    createBooking: async (payload: BookingCreatePayload): Promise<BookingApiResponse> => {
        const url = `${API_BASE_URL}/api/bookings`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error(await parseErrorMessage(response));
        }
        return (await response.json()) as BookingApiResponse;
    },

    getDriverBookings: async (driverId: string, status?: string): Promise<BookingApiResponse[]> => {
        const query = status ? `?status=${status}` : '';
        const url = `${API_BASE_URL}/api/bookings/driver/${driverId}${query}`;
        const response = await fetch(url, { method: 'GET', headers: { 'ngrok-skip-browser-warning': 'true' } });
        if (!response.ok) {
            throw new Error(await parseErrorMessage(response));
        }
        return (await response.json()) as BookingApiResponse[];
    },

    getPassengerBookings: async (passengerId: string, status?: string): Promise<BookingApiResponse[]> => {
        const query = status ? `?status=${status}` : '';
        const url = `${API_BASE_URL}/api/bookings/passenger/${passengerId}${query}`;
        const response = await fetch(url, { method: 'GET', headers: { 'ngrok-skip-browser-warning': 'true' } });
        if (!response.ok) {
            throw new Error(await parseErrorMessage(response));
        }
        return (await response.json()) as BookingApiResponse[];
    },

    getBooking: async (id: string): Promise<BookingApiResponse> => {
        const url = `${API_BASE_URL}/api/bookings/${id}`;
        const response = await fetch(url, { method: 'GET', headers: { 'ngrok-skip-browser-warning': 'true' } });
        if (!response.ok) {
            throw new Error(await parseErrorMessage(response));
        }
        return (await response.json()) as BookingApiResponse;
    },

    updateBookingStatus: async (id: string, status: 'accepted' | 'rejected' | 'cancelled'): Promise<BookingApiResponse> => {
        const url = `${API_BASE_URL}/api/bookings/${id}/status`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) {
            throw new Error(await parseErrorMessage(response));
        }
        return (await response.json()) as BookingApiResponse;
    },
};

export default bookingsApi;

