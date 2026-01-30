import React, { createContext, useContext, useMemo, useState } from 'react';

export type DateOption = 'Today' | 'Tomorrow' | 'Custom';
export type TimeOption = '8:00 AM' | '8:30 AM' | '9:00 AM' | '6:00 PM' | '7:00 PM' | 'Custom';
export type MusicPreference = 'Bollywood' | 'English' | 'Podcasts' | 'None';
export type SmokingPreference = 'Yes' | 'No' | 'Only Outside';
export type GenderPreference = 'Any' | 'Female Only' | 'Male Only';
export type RecurringOption = 'No' | 'Every Weekday' | 'Every Monday-Friday';

export interface PostRidePreferences {
    acRequired: boolean;
    music: MusicPreference;
    smoking: SmokingPreference;
    petsAllowed: boolean;
    genderPreference: GenderPreference;
    notes: string;
}

export interface PostRideFormState {
    origin: string;
    destination: string;
    originLat: number | null;
    originLng: number | null;
    destinationLat: number | null;
    destinationLng: number | null;
    dateOption: DateOption;
    date: string;
    timeOption: TimeOption;
    time: string;
    seats: number;
    farePerKm: number;
    preferences: PostRidePreferences;
    recurring: RecurringOption;
}

interface PostRideFlowContextValue {
    form: PostRideFormState;
    updateForm: (updates: Partial<PostRideFormState>) => void;
    updatePreferences: (updates: Partial<PostRidePreferences>) => void;
    resetForm: () => void;
}

const defaultFormState: PostRideFormState = {
    origin: '',
    destination: '',
    originLat: null,
    originLng: null,
    destinationLat: null,
    destinationLng: null,
    dateOption: 'Tomorrow',
    date: 'Tomorrow',
    timeOption: '8:00 AM',
    time: '8:00 AM',
    seats: 3,
    farePerKm: 14,
    preferences: {
        acRequired: true,
        music: 'Bollywood',
        smoking: 'No',
        petsAllowed: false,
        genderPreference: 'Any',
        notes: '',
    },
    recurring: 'No',
};

const PostRideFlowContext = createContext<PostRideFlowContextValue | undefined>(undefined);

export const PostRideFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [form, setForm] = useState<PostRideFormState>(defaultFormState);

    const updateForm = (updates: Partial<PostRideFormState>) => {
        setForm((prev) => ({ ...prev, ...updates }));
    };

    const updatePreferences = (updates: Partial<PostRidePreferences>) => {
        setForm((prev) => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                ...updates,
            },
        }));
    };

    const resetForm = () => {
        setForm(defaultFormState);
    };

    const value = useMemo(
        () => ({
            form,
            updateForm,
            updatePreferences,
            resetForm,
        }),
        [form],
    );

    return (
        <PostRideFlowContext.Provider value={value}>
            {children}
        </PostRideFlowContext.Provider>
    );
};

export const usePostRideFlow = () => {
    const context = useContext(PostRideFlowContext);
    if (!context) {
        throw new Error('usePostRideFlow must be used within a PostRideFlowProvider');
    }
    return context;
};

export default PostRideFlowContext;

