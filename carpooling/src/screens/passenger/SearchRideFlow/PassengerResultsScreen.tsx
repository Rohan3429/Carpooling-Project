import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { theme } from '../../../theme';
import { PassengerRideResult, usePassengerRideFlow } from './PassengerRideFlowContext';
import { ridesApi } from '../../../services/ridesApi';

interface PassengerResultsScreenProps {
    navigation: any;
}

const buildMockResults = (): PassengerRideResult[] => [];

export const PassengerResultsScreen: React.FC<PassengerResultsScreenProps> = ({ navigation }) => {
    const { form, results, setResults, setSelectedRide } = usePassengerRideFlow();
    const [isLoading, setIsLoading] = useState(false);

    const filteredResults = useMemo(() => {
        const base = results;

        return base.filter((ride) => {
            if (ride.farePerSeat < form.filters.priceMin || ride.farePerSeat > form.filters.priceMax) {
                return false;
            }
            if (form.filters.vehicleType !== 'Any' && ride.vehicleType !== form.filters.vehicleType) {
                return false;
            }
            if (form.filters.driverRating !== 'Any') {
                const required = Number(form.filters.driverRating.replace('+', ''));
                if (ride.rating < required) return false;
            }
            if (form.filters.hasAC && !ride.preferences.hasAC) return false;
            if (form.filters.musicType !== 'Any' && ride.preferences.musicType !== form.filters.musicType) return false;
            if (form.filters.smokingPreference !== 'Any' && ride.preferences.smokingPreference !== form.filters.smokingPreference) {
                return false;
            }
            if (form.filters.genderPreference !== 'Any' && ride.preferences.genderPreference !== form.filters.genderPreference) {
                return false;
            }
            if (ride.seatsAvailable < form.passengers) return false;
            return true;
        });
    }, [form.filters, form.passengers, results]);

    useEffect(() => {
        let isMounted = true;
        const loadResults = async () => {
            setIsLoading(true);
            try {
                const rides = await ridesApi.searchRides({
                    origin: form.origin,
                    destination: form.destination,
                    passengers: form.passengers,
                    originLat: form.originLat,
                    originLng: form.originLng,
                    destinationLat: form.destinationLat,
                    destinationLng: form.destinationLng,
                    // Use a more generous search radius: 10km default, or 50% of route distance (whichever is larger)
                    maxDistanceKm: form.routeDistanceKm ? Math.max(10, form.routeDistanceKm * 0.5) : 10,
                });
                const mapped: PassengerRideResult[] = rides.map((ride) => {
                    const fallbackDistance = form.routeDistanceKm ?? 0;
                    const distance = ride.distanceKm > 0 ? ride.distanceKm : fallbackDistance;
                    const farePerSeat = Math.round(ride.farePerKm * Math.max(1, distance || 1));
                    return {
                        id: ride.id,
                        driverName: ride.driverName,
                        rating: ride.driverRating || 0,
                        reviews: 0,
                        vehicleType: (ride.vehicle?.type as PassengerRideResult['vehicleType']) || 'Sedan',
                        vehicleColor: ride.vehicle?.color || 'Unknown',
                        vehiclePlate: ride.vehicle?.plateNumber || 'N/A',
                        pickupTime: ride.departureTime,
                        dropoffTime: ride.departureTime,
                        distanceKm: distance,
                        etaMinutes: ride.estimatedDurationMinutes || 0,
                        farePerSeat,
                        farePerKm: ride.farePerKm, // Store farePerKm for dynamic pricing
                        seatsAvailable: ride.availableSeats,
                        originLocation: {
                            latitude: ride.origin.latitude,
                            longitude: ride.origin.longitude,
                            address: ride.origin.address,
                        },
                        destinationLocation: {
                            latitude: ride.destination.latitude,
                            longitude: ride.destination.longitude,
                            address: ride.destination.address,
                        },
                        preferences: {
                            hasAC: ride.preferences.hasAC,
                            musicType: ride.preferences.musicType as PassengerRideResult['preferences']['musicType'],
                            smokingPreference: ride.preferences.smokingAllowed ? 'Yes' : 'No',
                            genderPreference: ride.preferences.genderPreference as PassengerRideResult['preferences']['genderPreference'],
                        },
                    };
                });

                if (isMounted) {
                    setResults(mapped);
                }
            } catch (error) {
                if (isMounted) {
                    setResults([]);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadResults();
        return () => {
            isMounted = false;
        };
    }, [form.destination, form.origin, form.passengers, form.routeDistanceKm, setResults]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Matching Rides</Text>
                <Text style={styles.subtitle}>
                    {form.origin || 'Pickup'} → {form.destination || 'Destination'}
                </Text>

                {isLoading ? (
                    <Card>
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>Loading rides...</Text>
                        </View>
                    </Card>
                ) : filteredResults.length === 0 ? (
                    <Card>
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>🔍</Text>
                            <Text style={styles.emptyText}>No rides found</Text>
                            <Text style={styles.emptySubtext}>Try adjusting your filters.</Text>
                        </View>
                    </Card>
                ) : (
                    filteredResults.map((ride) => (
                        <Card key={ride.id} style={styles.rideCard}>
                            <View style={styles.rideHeader}>
                                <Text style={styles.driverName}>{ride.driverName}</Text>
                                <Text style={styles.rating}>⭐ {ride.rating.toFixed(1)} ({ride.reviews})</Text>
                            </View>
                            <Text style={styles.vehicleText}>
                                {ride.vehicleColor} {ride.vehicleType}, {ride.vehiclePlate}
                            </Text>
                            <Text style={styles.timeText}>
                                Pickup: {ride.pickupTime} • {ride.distanceKm} km away ({ride.etaMinutes} min ETA)
                            </Text>
                            <Text style={styles.timeText}>Dropoff: {ride.dropoffTime}</Text>
                            <View style={styles.metaRow}>
                                <Text style={styles.metaText}>₹{ride.farePerSeat} / seat</Text>
                                <Text style={styles.metaText}>{ride.seatsAvailable} seats</Text>
                            </View>
                            <Text style={styles.preferenceText}>
                                Preferences: {ride.preferences.hasAC ? 'AC ✓' : 'No AC'}, {ride.preferences.musicType},{' '}
                                {ride.preferences.smokingPreference === 'No' ? 'No smoking' : 'Smoking'}, {ride.preferences.genderPreference}
                            </Text>
                            <View style={styles.buttonRow}>
                                <Button
                                    title="View Details"
                                    variant="outline"
                                    onPress={() => {
                                        setSelectedRide(ride);
                                        navigation.navigate('PassengerConfirm');
                                    }}
                                    style={styles.button}
                                />
                                <Button
                                    title="Book Ride"
                                    onPress={() => {
                                        setSelectedRide(ride);
                                        navigation.navigate('PassengerConfirm');
                                    }}
                                    style={styles.button}
                                />
                            </View>
                        </Card>
                    ))
                )}

                {filteredResults.length > 0 && (
                    <Button title="Load More Rides" variant="ghost" onPress={() => {}} fullWidth />
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
    rideCard: {
        marginBottom: theme.spacing.md,
    },
    rideHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xs,
    },
    driverName: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.semiBold,
        color: theme.colors.text,
    },
    rating: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    vehicleText: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    timeText: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing.sm,
    },
    metaText: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text,
        fontWeight: theme.typography.fontWeight.semiBold,
    },
    preferenceText: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.sm,
        marginBottom: theme.spacing.md,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    button: {
        flex: 1,
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

export default PassengerResultsScreen;

