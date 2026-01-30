// Common types used throughout the app

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    profilePhoto?: string;
    userType: 'driver' | 'passenger' | 'both';
    gender?: string;
    preferences?: string;
    vehicles: VehicleDetails[];
    paymentMethods: PaymentMethod[];
    settings: UserSettings;
    rating: number;
    totalRides: number;
    createdAt: string;
}

export interface Driver extends User {
    vehicleDetails: VehicleDetails;
    licenseNumber: string;
    isVerified: boolean;
}

export interface VehicleDetails {
    type: 'hatchback' | 'sedan' | 'suv';
    make: string;
    model: string;
    color: string;
    plateNumber: string;
    year: number;
    hasAC: boolean;
}

export interface Location {
    latitude: number;
    longitude: number;
    address: string;
    city?: string;
    state?: string;
}

export interface RidePreferences {
    hasAC: boolean;
    musicType: 'bollywood' | 'english' | 'podcasts' | 'none';
    smokingAllowed: boolean;
    petsAllowed: boolean;
    genderPreference: 'any' | 'female' | 'male';
    notes?: string;
}

export interface Ride {
    id: string;
    driverId: string;
    driver: Driver;
    origin: Location;
    destination: Location;
    departureTime: string;
    availableSeats: number;
    farePerKm: number;
    totalFare: number;
    distance: number;
    estimatedDuration: number;
    preferences: RidePreferences;
    isRecurring: boolean;
    recurringDays?: string[];
    status: 'active' | 'completed' | 'cancelled';
    createdAt: string;
}

export interface Booking {
    id: string;
    rideId: string;
    ride: Ride;
    passengerId: string;
    passenger: User;
    numberOfPassengers: number;
    totalFare: number;
    upfrontPayment: number;
    remainingPayment: number;
    pickupLocation: Location;
    dropoffLocation: Location;
    status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
    paymentStatus: 'pending' | 'partial' | 'completed';
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    text: string;
    timestamp: string;
    read: boolean;
}

export interface Conversation {
    id: string;
    participants: User[];
    lastMessage: Message;
    unreadCount: number;
}

export interface Notification {
    id: string;
    userId: string;
    type: 'booking_request' | 'booking_accepted' | 'booking_rejected' | 'ride_started' | 'ride_completed' | 'payment_received' | 'rating_received';
    title: string;
    message: string;
    data?: any;
    read: boolean;
    createdAt: string;
}

export interface Review {
    id: string;
    rideId: string;
    reviewerId: string;
    revieweeId: string;
    rating: number;
    tags: string[];
    comment?: string;
    createdAt: string;
}

export interface PaymentMethod {
    id: string;
    type: 'wallet' | 'card' | 'upi';
    name: string;
    details: string;
    isDefault: boolean;
}

export interface UserSettings {
    notificationsEnabled: boolean;
    marketingUpdates: boolean;
    darkMode: boolean;
}

export interface SearchFilters {
    priceRange?: { min: number; max: number };
    vehicleType?: 'hatchback' | 'sedan' | 'suv';
    minRating?: number;
    hasAC?: boolean;
    musicType?: string;
    smokingAllowed?: boolean;
    genderPreference?: string;
}
