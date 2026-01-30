import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { theme } from '../../../theme';
import { RootState } from '../../../store';
import { addRide } from '../../../store/slices/ridesSlice';
import { Driver, Ride } from '../../../types';
import { usePostRideFlow } from './PostRideFlowContext';
import { ridesApi } from '../../../services/ridesApi';

interface PostRideReviewScreenProps {
    navigation: any;
}

export const PostRideReviewScreen: React.FC<PostRideReviewScreenProps> = ({ navigation }) => {
    const { form } = usePostRideFlow();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const estimatedDistanceKm = 12.5;
    const estimatedTotal = Math.round(form.farePerKm * estimatedDistanceKm);
    const dateTimeLabel = `${form.time} ${form.date}`;

    const preferenceSummary = useMemo(() => {
        const items = [];
        if (form.preferences.acRequired) items.push('AC');
        if (form.preferences.music !== 'None') items.push(`${form.preferences.music} music`);
        items.push(form.preferences.smoking === 'No' ? 'No smoking' : `Smoking: ${form.preferences.smoking}`);
        if (form.preferences.petsAllowed) items.push('Pets allowed');
        if (form.preferences.genderPreference !== 'Any') items.push(form.preferences.genderPreference);
        if (form.preferences.notes.trim().length > 0) items.push(form.preferences.notes.trim());
        return items;
    }, [form.preferences]);

    const buildDriver = (): Driver => {
        const base = user ?? {
            id: `user_${Date.now()}`,
            name: 'Guest Driver',
            email: 'driver@example.com',
            phone: '+91 90000 00000',
            profilePhoto: undefined,
            userType: 'driver',
            rating: 4.5,
            totalRides: 0,
            createdAt: new Date().toISOString(),
        };

        return {
            ...base,
            vehicleDetails: {
                type: 'sedan',
                make: 'Honda',
                model: 'City',
                color: 'White',
                plateNumber: 'KA01AB1234',
                year: 2022,
                hasAC: form.preferences.acRequired,
            },
            licenseNumber: 'DL-DEFAULT',
            isVerified: true,
        };
    };

    const handlePostRide = async () => {
        if (!user?.id) {
            Alert.alert('Post Ride', 'Please login again to post a ride.');
            navigation.navigate('Login');
            return;
        }

        setIsSubmitting(true);
        const driver = buildDriver();
        try {
            const response = await ridesApi.createRide({
                driverId: user.id,
                origin: form.origin,
                originLat: form.originLat,
                originLng: form.originLng,
                destination: form.destination,
                destinationLat: form.destinationLat,
                destinationLng: form.destinationLng,
                departureTime: `${form.date} ${form.time}`,
                availableSeats: form.seats,
                farePerKm: form.farePerKm,
                preferences: {
                    hasAC: form.preferences.acRequired,
                    musicType: form.preferences.music,
                    smokingAllowed: form.preferences.smoking !== 'No',
                    petsAllowed: form.preferences.petsAllowed,
                    genderPreference: form.preferences.genderPreference,
                    notes: form.preferences.notes.trim() || undefined,
                },
                isRecurring: form.recurring !== 'No',
                recurringDays:
                    form.recurring === 'Every Weekday' || form.recurring === 'Every Monday-Friday'
                        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
                        : undefined,
            });

            const normalizedGenderPreference = (() => {
                const value = response.preferences.genderPreference.toLowerCase();
                if (value.includes('female')) return 'female';
                if (value.includes('male')) return 'male';
                return 'any';
            })();

            const ride: Ride = {
                id: response.id,
                driverId: response.driverId,
                driver: {
                    ...driver,
                    name: response.driverName || driver.name,
                    rating: response.driverRating || driver.rating,
                    vehicleDetails: response.vehicle
                        ? {
                            type: (response.vehicle.type as Driver['vehicleDetails']['type']) || 'sedan',
                            make: response.vehicle.make,
                            model: response.vehicle.model,
                            color: response.vehicle.color,
                            plateNumber: response.vehicle.plateNumber,
                            year: response.vehicle.year,
                            hasAC: response.vehicle.hasAC,
                        }
                        : driver.vehicleDetails,
                },
                origin: {
                    latitude: response.origin.latitude,
                    longitude: response.origin.longitude,
                    address: response.origin.address,
                },
                destination: {
                    latitude: response.destination.latitude,
                    longitude: response.destination.longitude,
                    address: response.destination.address,
                },
                departureTime: response.departureTime,
                availableSeats: response.availableSeats,
                farePerKm: response.farePerKm,
                totalFare: response.totalFare || estimatedTotal,
                distance: response.distanceKm || estimatedDistanceKm,
                estimatedDuration: response.estimatedDurationMinutes || 35,
                preferences: {
                    hasAC: response.preferences.hasAC,
                    musicType: response.preferences.musicType.toLowerCase() as Ride['preferences']['musicType'],
                    smokingAllowed: response.preferences.smokingAllowed,
                    petsAllowed: response.preferences.petsAllowed,
                    genderPreference: normalizedGenderPreference,
                    notes: response.preferences.notes,
                },
                isRecurring: response.isRecurring,
                recurringDays: response.recurringDays,
                status: response.status as Ride['status'],
                createdAt: response.createdAtUtc,
            };

            dispatch(addRide(ride));
            navigation.navigate('PostRideSuccess');
        } catch (error: any) {
            Alert.alert('Post Ride Failed', error?.message || 'Unable to post ride.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Review & Confirm</Text>
                <Text style={styles.subtitle}>Make sure everything looks good before posting.</Text>

                <Card style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.label}>From</Text>
                        <Text style={styles.value}>{form.origin || 'Not set'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>To</Text>
                        <Text style={styles.value}>{form.destination || 'Not set'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Time</Text>
                        <Text style={styles.value}>{dateTimeLabel}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Seats</Text>
                        <Text style={styles.value}>{form.seats}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Fare</Text>
                        <Text style={styles.value}>₹{form.farePerKm}/km</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Est. Total</Text>
                        <Text style={styles.value}>₹{estimatedTotal}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Recurring</Text>
                        <Text style={styles.value}>{form.recurring}</Text>
                    </View>
                </Card>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    {preferenceSummary.length === 0 ? (
                        <Text style={styles.emptyText}>No special preferences</Text>
                    ) : (
                        preferenceSummary.map((item) => (
                            <Text key={item} style={styles.preferenceItem}>
                                • {item}
                            </Text>
                        ))
                    )}
                    <Text style={styles.helperText}>Estimated distance: {estimatedDistanceKm} km</Text>
                </Card>

                <View style={styles.buttonRow}>
                    <Button title="Back" variant="outline" onPress={() => navigation.goBack()} style={styles.button} />
                    <Button title="Post Ride" onPress={handlePostRide} style={styles.button} loading={isSubmitting} />
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm,
    },
    label: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    value: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.semiBold,
        color: theme.colors.text,
        maxWidth: '60%',
        textAlign: 'right',
    },
    sectionTitle: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.semiBold,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    preferenceItem: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    emptyText: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    helperText: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.sm,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    button: {
        flex: 1,
    },
});

export default PostRideReviewScreen;

