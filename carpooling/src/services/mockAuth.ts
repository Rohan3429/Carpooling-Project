import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Driver, VehicleDetails } from '../types';

const STORAGE_KEY = '@carpooling_user';

/**
 * Mock authentication service
 * In production, this will call .NET backend APIs
 */

export const mockAuth = {
    /**
     * Login user
     */
    login: async (email: string, password: string): Promise<User> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock user data
        const user: User = {
            id: 'user_' + Date.now(),
            name: 'John Doe',
            email,
            phone: '+91 98765 43210',
            profilePhoto: undefined,
            userType: 'both',
            rating: 4.8,
            totalRides: 127,
            createdAt: new Date().toISOString(),
        };

        // Store in AsyncStorage
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));

        return user;
    },

    /**
     * Sign up new user
     */
    signup: async (
        name: string,
        email: string,
        phone: string,
        password: string,
        userType: 'driver' | 'passenger' | 'both'
    ): Promise<User> => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const user: User = {
            id: 'user_' + Date.now(),
            name,
            email,
            phone,
            profilePhoto: undefined,
            userType,
            rating: 0,
            totalRides: 0,
            createdAt: new Date().toISOString(),
        };

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));

        return user;
    },

    /**
     * Get current user from storage
     */
    getCurrentUser: async (): Promise<User | null> => {
        const userStr = await AsyncStorage.getItem(STORAGE_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Logout user
     */
    logout: async (): Promise<void> => {
        await AsyncStorage.removeItem(STORAGE_KEY);
    },

    /**
     * Update user profile
     */
    updateProfile: async (updates: Partial<User>): Promise<User> => {
        await new Promise(resolve => setTimeout(resolve, 500));

        const userStr = await AsyncStorage.getItem(STORAGE_KEY);
        if (!userStr) throw new Error('User not found');

        const user = JSON.parse(userStr);
        const updatedUser = { ...user, ...updates };

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

        return updatedUser;
    },

    /**
     * Add vehicle details (for drivers)
     */
    addVehicleDetails: async (vehicleDetails: VehicleDetails, licenseNumber: string): Promise<Driver> => {
        await new Promise(resolve => setTimeout(resolve, 500));

        const userStr = await AsyncStorage.getItem(STORAGE_KEY);
        if (!userStr) throw new Error('User not found');

        const user = JSON.parse(userStr);
        const driver: Driver = {
            ...user,
            vehicleDetails,
            licenseNumber,
            isVerified: false, // Would be verified by admin in production
        };

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(driver));

        return driver;
    },
};

export default mockAuth;
