import React, { createContext, useContext, useMemo, useState } from 'react';

export type DepartureOption = 'Leave Now' | 'Tomorrow at Time' | 'Custom Date & Time';
export type VehicleTypeFilter = 'Any' | 'Hatchback' | 'Sedan' | 'SUV';
export type DriverRatingFilter = 'Any' | '4.0+' | '4.5+' | '4.8+';
export type MusicFilter = 'Any' | 'Bollywood' | 'English' | 'Podcasts' | 'None';
export type SmokingFilter = 'Any' | 'No' | 'Yes';
export type GenderFilter = 'Any' | 'Female Only' | 'Male Only';

export interface PassengerFilters {
    priceMin: number;
    priceMax: number;
    vehicleType: VehicleTypeFilter;
    driverRating: DriverRatingFilter;
    hasAC: boolean;
    musicType: MusicFilter;
    smokingPreference: SmokingFilter;
    genderPreference: GenderFilter;
}

export interface PassengerSearchForm {
    origin: string;
    destination: string;
    routeDistanceKm: number | null;
    originLat: number | null;
    originLng: number | null;
    destinationLat: number | null;
    destinationLng: number | null;
    departureOption: DepartureOption;
    date: string;
    time: string;
    passengers: number;
    filters: PassengerFilters;
}

export interface PassengerRidePreferences {
    hasAC: boolean;
    musicType: MusicFilter;
    smokingPreference: SmokingFilter;
    genderPreference: GenderFilter;
}

export interface PassengerRideResult {
    id: string;
    driverName: string;
    rating: number;
    reviews: number;
    vehicleType: VehicleTypeFilter;
    vehicleColor: string;
    vehiclePlate: string;
    pickupTime: string;
    dropoffTime: string;
    distanceKm: number;
    etaMinutes: number;
    farePerSeat: number;
    farePerKm?: number; // Store farePerKm for dynamic pricing
    seatsAvailable: number;
    originLocation?: { latitude: number; longitude: number; address: string };
    destinationLocation?: { latitude: number; longitude: number; address: string };
    preferences: PassengerRidePreferences;
}

interface PassengerRideFlowContextValue {
    form: PassengerSearchForm;
    updateForm: (updates: Partial<PassengerSearchForm>) => void;
    updateFilters: (updates: Partial<PassengerFilters>) => void;
    results: PassengerRideResult[];
    setResults: (rides: PassengerRideResult[]) => void;
    selectedRide: PassengerRideResult | null;
    setSelectedRide: (ride: PassengerRideResult | null) => void;
    resetFlow: () => void;
}

const defaultFormState: PassengerSearchForm = {
    origin: '',
    destination: '',
    routeDistanceKm: null,
    originLat: null,
    originLng: null,
    destinationLat: null,
    destinationLng: null,
    departureOption: 'Leave Now',
    date: 'Today',
    time: 'Now',
    passengers: 1,
    filters: {
        priceMin: 0,
        priceMax: 500,
        vehicleType: 'Any',
        driverRating: 'Any',
        hasAC: false,
        musicType: 'Any',
        smokingPreference: 'Any',
        genderPreference: 'Any',
    },
};

const PassengerRideFlowContext = createContext<PassengerRideFlowContextValue | undefined>(undefined);

export const PassengerRideFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [form, setForm] = useState<PassengerSearchForm>(defaultFormState);
    const [results, setResults] = useState<PassengerRideResult[]>([]);
    const [selectedRide, setSelectedRide] = useState<PassengerRideResult | null>(null);

    const updateForm = (updates: Partial<PassengerSearchForm>) => {
        setForm((prev) => ({ ...prev, ...updates }));
    };

    const updateFilters = (updates: Partial<PassengerFilters>) => {
        setForm((prev) => ({
            ...prev,
            filters: {
                ...prev.filters,
                ...updates,
            },
        }));
    };

    const resetFlow = () => {
        setForm(defaultFormState);
        setResults([]);
        setSelectedRide(null);
    };

    const value = useMemo(
        () => ({
            form,
            updateForm,
            updateFilters,
            results,
            setResults,
            selectedRide,
            setSelectedRide,
            resetFlow,
        }),
        [form, results, selectedRide],
    );

    return (
        <PassengerRideFlowContext.Provider value={value}>
            {children}
        </PassengerRideFlowContext.Provider>
    );
};

export const usePassengerRideFlow = () => {
    const context = useContext(PassengerRideFlowContext);
    if (!context) {
        throw new Error('usePassengerRideFlow must be used within a PassengerRideFlowProvider');
    }
    return context;
};

export default PassengerRideFlowContext;

