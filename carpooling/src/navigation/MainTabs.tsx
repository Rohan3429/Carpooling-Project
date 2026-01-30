import React, { useEffect, useState, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useSelector } from 'react-redux';
import { theme } from '../theme';
import HomeStack from './HomeStack';
import RidesScreen from '../screens/RidesScreen';
import ProfileStack from './ProfileStack';
import BookingNotificationModal from '../components/BookingNotificationModal';
import { bookingsApi } from '../services/bookingsApi';
import { RootState } from '../store';
import { useDispatch } from 'react-redux';
import { updateBooking, setPendingRequests } from '../store/slices/bookingsSlice';
import { Alert } from 'react-native';

const Tab = createBottomTabNavigator();

export const MainTabs: React.FC = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const { pendingRequests } = useSelector((state: RootState) => state.bookings);
    const [showNotification, setShowNotification] = useState(false);
    const [currentBooking, setCurrentBooking] = useState<any>(null);
    const shownBookingIdsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!user?.id || user.userType !== 'driver') return;

        const checkForNewBookings = async () => {
            try {
                const bookings = await bookingsApi.getDriverBookings(user.id, 'pending');
                
                // Find bookings that haven't been shown yet
                const newBookings = bookings.filter(
                    (b) => !shownBookingIdsRef.current.has(b.id)
                );

                if (newBookings.length > 0 && !showNotification) {
                    // Show the most recent new booking
                    const latestBooking = newBookings[0];
                    shownBookingIdsRef.current.add(latestBooking.id);
                    
                    setCurrentBooking({
                        id: latestBooking.id,
                        passengerName: latestBooking.passengerName,
                        pickupLocation: latestBooking.pickupLocation.address,
                        dropoffLocation: latestBooking.dropoffLocation.address,
                        numberOfPassengers: latestBooking.numberOfPassengers,
                        totalFare: latestBooking.totalFare,
                        upfrontPayment: latestBooking.upfrontPayment,
                    });
                    setShowNotification(true);
                }
                
                // Update store
                dispatch(setPendingRequests(bookings.map(convertToBooking)));
            } catch (error) {
                console.error('Failed to check for bookings:', error);
            }
        };

        // Check immediately
        checkForNewBookings();

        // Poll every 5 seconds for new bookings
        const interval = setInterval(checkForNewBookings, 5000);

        return () => clearInterval(interval);
    }, [user?.id, user?.userType, dispatch]);

    const convertToBooking = (apiBooking: any) => {
        return {
            id: apiBooking.id,
            rideId: apiBooking.rideId,
            ride: {} as any,
            passengerId: apiBooking.passengerId,
            passenger: {
                id: apiBooking.passengerId,
                name: apiBooking.passengerName,
            } as any,
            numberOfPassengers: apiBooking.numberOfPassengers,
            totalFare: apiBooking.totalFare,
            upfrontPayment: apiBooking.upfrontPayment,
            remainingPayment: apiBooking.remainingPayment,
            pickupLocation: {
                latitude: apiBooking.pickupLocation.latitude,
                longitude: apiBooking.pickupLocation.longitude,
                address: apiBooking.pickupLocation.address,
            },
            dropoffLocation: {
                latitude: apiBooking.dropoffLocation.latitude,
                longitude: apiBooking.dropoffLocation.longitude,
                address: apiBooking.dropoffLocation.address,
            },
            status: apiBooking.status,
            createdAt: apiBooking.createdAtUtc,
            paymentStatus: 'partial' as any,
            updatedAt: apiBooking.updatedAtUtc || apiBooking.createdAtUtc,
        };
    };

    const handleAccept = async () => {
        if (!currentBooking) return;

        try {
            const updated = await bookingsApi.updateBookingStatus(currentBooking.id, 'accepted');
            dispatch(updateBooking(convertToBooking(updated)));
            setShowNotification(false);
            setCurrentBooking(null);
            Alert.alert('Accepted', 'Booking request has been accepted.');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to accept booking');
        }
    };

    const handleReject = async () => {
        if (!currentBooking) return;

        Alert.alert(
            'Reject Booking',
            'Are you sure you want to reject this booking request?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const updated = await bookingsApi.updateBookingStatus(currentBooking.id, 'rejected');
                            dispatch(updateBooking(convertToBooking(updated)));
                            setShowNotification(false);
                            setCurrentBooking(null);
                            Alert.alert('Rejected', 'Booking request has been rejected.');
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to reject booking');
                        }
                    },
                },
            ]
        );
    };

    const handleDismiss = () => {
        setShowNotification(false);
        // Don't clear currentBooking so we can show it again if needed
    };

    return (
        <>
            <Tab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: theme.colors.primary,
                    tabBarInactiveTintColor: theme.colors.textSecondary,
                    tabBarStyle: {
                        paddingBottom: 8,
                        paddingTop: 8,
                        height: 60,
                    },
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: theme.colors.primary,
                    },
                    headerTintColor: theme.colors.white,
                    headerTitleStyle: {
                        fontWeight: theme.typography.fontWeight.bold,
                    },
                }}
            >
                <Tab.Screen
                    name="Home"
                    component={HomeStack}
                    options={{
                        tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>,
                        headerShown: false,
                        title: 'CarPooling',
                    }}
                />
                <Tab.Screen
                    name="Rides"
                    component={RidesScreen}
                    options={{
                        tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🚗</Text>,
                    }}
                />
                <Tab.Screen
                    name="Profile"
                    component={ProfileStack}
                    options={{
                        tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>,
                    }}
                />
            </Tab.Navigator>
            <BookingNotificationModal
                visible={showNotification}
                booking={currentBooking}
                onAccept={handleAccept}
                onReject={handleReject}
                onDismiss={handleDismiss}
            />
        </>
    );
};

export default MainTabs;
