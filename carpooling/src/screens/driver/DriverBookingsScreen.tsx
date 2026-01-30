import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View, Alert, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { theme } from '../../theme';
import { bookingsApi } from '../../services/bookingsApi';
import { RootState } from '../../store';
import { setPendingRequests, updateBooking } from '../../store/slices/bookingsSlice';

interface DriverBookingsScreenProps {
    navigation: any;
}

export const DriverBookingsScreen: React.FC<DriverBookingsScreenProps> = ({ navigation }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const { pendingRequests } = useSelector((state: RootState) => state.bookings);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (user?.id) {
            loadBookings();
        }
    }, [user?.id]);

    const loadBookings = async () => {
        if (!user?.id) return;

        setIsLoading(true);
        try {
            const bookings = await bookingsApi.getDriverBookings(user.id, 'pending');
            dispatch(setPendingRequests(bookings.map(convertToBooking)));
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to load bookings');
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadBookings();
        setRefreshing(false);
    };

    const handleAccept = async (bookingId: string) => {
        try {
            const updated = await bookingsApi.updateBookingStatus(bookingId, 'accepted');
            dispatch(updateBooking(convertToBooking(updated)));
            Alert.alert('Accepted', 'Booking request has been accepted.');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to accept booking');
        }
    };

    const handleReject = async (bookingId: string) => {
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
                            const updated = await bookingsApi.updateBookingStatus(bookingId, 'rejected');
                            dispatch(updateBooking(convertToBooking(updated)));
                            Alert.alert('Rejected', 'Booking request has been rejected.');
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to reject booking');
                        }
                    },
                },
            ]
        );
    };

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
        };
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <Text style={styles.title}>Booking Requests</Text>
                <Text style={styles.subtitle}>Manage incoming ride requests</Text>

                {isLoading && pendingRequests.length === 0 ? (
                    <Card>
                        <Text style={styles.emptyText}>Loading requests...</Text>
                    </Card>
                ) : pendingRequests.length === 0 ? (
                    <Card>
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>📭</Text>
                            <Text style={styles.emptyText}>No pending requests</Text>
                            <Text style={styles.emptySubtext}>You'll see booking requests here when passengers book your rides.</Text>
                        </View>
                    </Card>
                ) : (
                    pendingRequests.map((booking) => (
                        <Card key={booking.id} style={styles.bookingCard}>
                            <View style={styles.bookingHeader}>
                                <Text style={styles.passengerName}>{booking.passenger.name}</Text>
                                <Text style={styles.statusBadge}>{booking.status.toUpperCase()}</Text>
                            </View>
                            <Text style={styles.routeText}>
                                {booking.pickupLocation.address} → {booking.dropoffLocation.address}
                            </Text>
                            <View style={styles.bookingDetails}>
                                <Text style={styles.detailText}>Passengers: {booking.numberOfPassengers}</Text>
                                <Text style={styles.detailText}>Total Fare: ₹{booking.totalFare}</Text>
                                <Text style={styles.detailText}>Upfront: ₹{booking.upfrontPayment}</Text>
                            </View>
                            {booking.status === 'pending' && (
                                <View style={styles.buttonRow}>
                                    <Button
                                        title="Reject"
                                        variant="outline"
                                        onPress={() => handleReject(booking.id)}
                                        style={[styles.button, styles.rejectButton]}
                                    />
                                    <Button
                                        title="Accept"
                                        onPress={() => handleAccept(booking.id)}
                                        style={styles.button}
                                    />
                                </View>
                            )}
                        </Card>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundDark,
    },
    content: {
        padding: theme.spacing.md,
        paddingBottom: theme.spacing.xl,
    },
    title: {
        fontSize: theme.typography.fontSize['2xl'],
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.lg,
    },
    bookingCard: {
        marginBottom: theme.spacing.md,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
    },
    passengerName: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.semiBold,
        color: theme.colors.text,
    },
    statusBadge: {
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.semiBold,
        color: theme.colors.primary,
        backgroundColor: theme.colors.primary + '20',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.sm,
    },
    routeText: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.sm,
    },
    bookingDetails: {
        marginBottom: theme.spacing.sm,
    },
    detailText: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.sm,
    },
    button: {
        flex: 1,
    },
    rejectButton: {
        borderColor: theme.colors.error || '#FF3B30',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: theme.spacing.md,
    },
    emptyText: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.medium,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    emptySubtext: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
});

export default DriverBookingsScreen;

