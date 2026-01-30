import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Booking } from '../../types';

interface BookingsState {
    myBookings: Booking[];
    pendingRequests: Booking[];
    activeBooking: Booking | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: BookingsState = {
    myBookings: [],
    pendingRequests: [],
    activeBooking: null,
    isLoading: false,
    error: null,
};

const bookingsSlice = createSlice({
    name: 'bookings',
    initialState,
    reducers: {
        setMyBookings: (state, action: PayloadAction<Booking[]>) => {
            state.myBookings = action.payload;
        },
        addBooking: (state, action: PayloadAction<Booking>) => {
            state.myBookings.unshift(action.payload);
        },
        updateBooking: (state, action: PayloadAction<Booking>) => {
            const index = state.myBookings.findIndex(b => b.id === action.payload.id);
            if (index !== -1) {
                state.myBookings[index] = action.payload;
            }

            const reqIndex = state.pendingRequests.findIndex(b => b.id === action.payload.id);
            if (reqIndex !== -1) {
                state.pendingRequests[reqIndex] = action.payload;
            }
        },
        setPendingRequests: (state, action: PayloadAction<Booking[]>) => {
            state.pendingRequests = action.payload;
        },
        removePendingRequest: (state, action: PayloadAction<string>) => {
            state.pendingRequests = state.pendingRequests.filter(b => b.id !== action.payload);
        },
        setActiveBooking: (state, action: PayloadAction<Booking | null>) => {
            state.activeBooking = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const {
    setMyBookings,
    addBooking,
    updateBooking,
    setPendingRequests,
    removePendingRequest,
    setActiveBooking,
    setLoading,
    setError,
} = bookingsSlice.actions;

export default bookingsSlice.reducer;
