import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { OptionChip } from '../../../components/common/OptionChip';
import { theme } from '../../../theme';
import { usePassengerRideFlow } from './PassengerRideFlowContext';
import { bookingsApi } from '../../../services/bookingsApi';
import { RootState } from '../../../store';
import { addBooking } from '../../../store/slices/bookingsSlice';
import { Booking } from '../../../types';

interface PassengerPaymentScreenProps {
    navigation: any;
}

export const PassengerPaymentScreen: React.FC<PassengerPaymentScreenProps> = ({ navigation }) => {
    const { form, selectedRide } = usePassengerRideFlow();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const [method, setMethod] = useState('Wallet');
    const [isProcessing, setIsProcessing] = useState(false);

    // Calculate fare based on passenger's actual distance
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Earth's radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const passengerDistanceKm = form.originLat && form.originLng && form.destinationLat && form.destinationLng
        ? calculateDistance(form.originLat, form.originLng, form.destinationLat, form.destinationLng)
        : selectedRide?.distanceKm || 0;

    const farePerKm = selectedRide?.farePerKm ?? (selectedRide?.farePerSeat || 0) / (selectedRide?.distanceKm || 1);
    const farePerSeat = Math.round(farePerKm * passengerDistanceKm);
    const totalFare = farePerSeat * form.passengers;
    const upfrontAmount = useMemo(() => Math.round(totalFare * 0.2), [totalFare]);
    const remainingAmount = totalFare - upfrontAmount;

    const methods = ['Wallet', 'Debit Card', 'Credit Card', 'PhonePe', 'Google Pay', 'PayTm'];

    const handleMakePayment = async () => {
        if (!selectedRide || !user?.id) {
            Alert.alert('Error', 'Please login again to make payment.');
            return;
        }

        if (!form.originLat || !form.originLng || !form.destinationLat || !form.destinationLng) {
            Alert.alert('Error', 'Please select pickup and drop locations.');
            return;
        }

        setIsProcessing(true);
        try {
            const booking = await bookingsApi.createBooking({
                rideId: selectedRide.id,
                passengerId: user.id,
                passengerName: user.name,
                numberOfPassengers: form.passengers,
                totalFare,
                upfrontPayment: upfrontAmount,
                remainingPayment: remainingAmount,
                pickupLocation: {
                    address: form.origin,
                    latitude: form.originLat,
                    longitude: form.originLng,
                },
                dropoffLocation: {
                    address: form.destination,
                    latitude: form.destinationLat,
                    longitude: form.destinationLng,
                },
            });

            // Convert to Booking type and add to store
            const bookingData: Booking = {
                id: booking.id,
                rideId: booking.rideId,
                ride: {
                    id: selectedRide.id,
                    driverId: '',
                    driver: {
                        id: '',
                        name: selectedRide.driverName,
                        rating: selectedRide.rating,
                        vehicle: {
                            type: selectedRide.vehicleType,
                            make: '',
                            model: '',
                            color: selectedRide.vehicleColor,
                            plateNumber: selectedRide.vehiclePlate,
                            year: 0,
                            hasAC: selectedRide.preferences.hasAC,
                        },
                    },
                    origin: {
                        latitude: form.originLat!,
                        longitude: form.originLng!,
                        address: form.origin,
                    },
                    destination: {
                        latitude: form.destinationLat!,
                        longitude: form.destinationLng!,
                        address: form.destination,
                    },
                    departureTime: selectedRide.pickupTime,
                    availableSeats: selectedRide.seatsAvailable,
                    farePerKm,
                    totalFare,
                    distance: passengerDistanceKm,
                    estimatedDuration: selectedRide.etaMinutes,
                    preferences: {
                        hasAC: selectedRide.preferences.hasAC,
                        musicType: selectedRide.preferences.musicType.toLowerCase() as any,
                        smokingAllowed: selectedRide.preferences.smokingPreference === 'Yes',
                        petsAllowed: false,
                        genderPreference: selectedRide.preferences.genderPreference.toLowerCase() as any,
                    },
                    isRecurring: false,
                    status: 'active',
                    createdAt: new Date().toISOString(),
                },
                passengerId: booking.passengerId,
                passenger: user,
                numberOfPassengers: booking.numberOfPassengers,
                totalFare: booking.totalFare,
                upfrontPayment: booking.upfrontPayment,
                remainingPayment: booking.remainingPayment,
                pickupLocation: {
                    latitude: booking.pickupLocation.latitude,
                    longitude: booking.pickupLocation.longitude,
                    address: booking.pickupLocation.address,
                },
                dropoffLocation: {
                    latitude: booking.dropoffLocation.latitude,
                    longitude: booking.dropoffLocation.longitude,
                    address: booking.dropoffLocation.address,
                },
                status: booking.status as any,
                paymentStatus: booking.upfrontPayment > 0 ? 'partial' : 'pending',
                createdAt: booking.createdAtUtc,
                updatedAt: booking.updatedAtUtc || booking.createdAtUtc,
            };

            dispatch(addBooking(bookingData));
            navigation.navigate('PassengerRequestSent', { bookingId: booking.id });
        } catch (error: any) {
            Alert.alert('Payment Failed', error.message || 'Failed to create booking. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Pay 20% Upfront</Text>
                <Text style={styles.subtitle}>Secure your booking with a small upfront payment.</Text>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Payment Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.label}>Total Fare</Text>
                        <Text style={styles.value}>₹{totalFare}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.label}>Upfront (20%)</Text>
                        <Text style={styles.amount}>₹{upfrontAmount}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.label}>Remaining</Text>
                        <Text style={styles.value}>₹{remainingAmount}</Text>
                    </View>
                </Card>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Payment Methods</Text>
                    <View style={styles.chipRow}>
                        {methods.map((item) => (
                            <OptionChip
                                key={item}
                                label={item}
                                selected={method === item}
                                onPress={() => setMethod(item)}
                            />
                        ))}
                    </View>
                </Card>

                <View style={styles.buttonRow}>
                    <Button title="Cancel" variant="outline" onPress={() => navigation.goBack()} style={styles.button} />
                    <Button 
                        title={isProcessing ? "Processing..." : "Make Payment"} 
                        onPress={handleMakePayment} 
                        style={styles.button}
                        disabled={isProcessing}
                    />
                </View>
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
    card: {
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.semiBold,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    amount: {
        fontSize: theme.typography.fontSize['2xl'],
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.primary,
    },
    helperText: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    button: {
        flex: 1,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xs,
    },
    label: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    value: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text,
        fontWeight: theme.typography.fontWeight.medium,
    },
});

export default PassengerPaymentScreen;

