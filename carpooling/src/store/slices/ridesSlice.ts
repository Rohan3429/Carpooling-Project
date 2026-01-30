import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Ride, SearchFilters } from '../../types';

interface RidesState {
    myRides: Ride[];
    searchResults: Ride[];
    activeRide: Ride | null;
    filters: SearchFilters;
    isLoading: boolean;
    error: string | null;
}

const initialState: RidesState = {
    myRides: [],
    searchResults: [],
    activeRide: null,
    filters: {},
    isLoading: false,
    error: null,
};

const ridesSlice = createSlice({
    name: 'rides',
    initialState,
    reducers: {
        setMyRides: (state, action: PayloadAction<Ride[]>) => {
            state.myRides = action.payload;
        },
        addRide: (state, action: PayloadAction<Ride>) => {
            state.myRides.unshift(action.payload);
        },
        updateRide: (state, action: PayloadAction<Ride>) => {
            const index = state.myRides.findIndex(r => r.id === action.payload.id);
            if (index !== -1) {
                state.myRides[index] = action.payload;
            }
        },
        deleteRide: (state, action: PayloadAction<string>) => {
            state.myRides = state.myRides.filter(r => r.id !== action.payload);
        },
        setSearchResults: (state, action: PayloadAction<Ride[]>) => {
            state.searchResults = action.payload;
        },
        setFilters: (state, action: PayloadAction<SearchFilters>) => {
            state.filters = action.payload;
        },
        setActiveRide: (state, action: PayloadAction<Ride | null>) => {
            state.activeRide = action.payload;
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
    setMyRides,
    addRide,
    updateRide,
    deleteRide,
    setSearchResults,
    setFilters,
    setActiveRide,
    setLoading,
    setError,
} = ridesSlice.actions;

export default ridesSlice.reducer;
