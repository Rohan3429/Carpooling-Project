import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Polyline, Region, UrlTile } from 'react-native-maps';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { theme } from '../../../theme';
import { usePassengerRideFlow } from './PassengerRideFlowContext';
import { DEFAULT_MAP_CENTER, MAPBOX_TILE_SIZE, MAPBOX_TILE_URL } from '../../../config/maps';
import { mapboxApi } from '../../../services/mapboxApi';

interface PassengerConfirmScreenProps {
    navigation: any;
}

export const PassengerConfirmScreen: React.FC<PassengerConfirmScreenProps> = ({ navigation }) => {
    const { form, selectedRide, updateForm } = usePassengerRideFlow();
    const [routeCoords, setRouteCoords] = useState<Array<{ latitude: number; longitude: number }>>([]);
    const [passengerRouteCoords, setPassengerRouteCoords] = useState<Array<{ latitude: number; longitude: number }>>([]);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);
    const [isLoadingPassengerRoute, setIsLoadingPassengerRoute] = useState(false);
    const [isEditingPoints, setIsEditingPoints] = useState(false);
    const [editingMode, setEditingMode] = useState<'pickup' | 'drop' | null>(null);
    const [passengerPickup, setPassengerPickup] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
    const [passengerDrop, setPassengerDrop] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
    const mapRef = useRef<MapView | null>(null);

    useEffect(() => {
        if (selectedRide?.originLocation && selectedRide?.destinationLocation) {
            loadRoute();
            // Initialize passenger points from form
            if (form.originLat && form.originLng) {
                setPassengerPickup({
                    latitude: form.originLat,
                    longitude: form.originLng,
                    address: form.origin,
                });
            }
            if (form.destinationLat && form.destinationLng) {
                setPassengerDrop({
                    latitude: form.destinationLat,
                    longitude: form.destinationLng,
                    address: form.destination,
                });
            }
        }
    }, [selectedRide]);

    // Load passenger route when pickup/drop points change
    useEffect(() => {
        if (passengerPickup && passengerDrop) {
            loadPassengerRoute();
        } else {
            setPassengerRouteCoords([]);
        }
    }, [passengerPickup, passengerDrop]);

    const loadRoute = async () => {
        if (!selectedRide?.originLocation || !selectedRide?.destinationLocation) return;

        setIsLoadingRoute(true);
        try {
            const route = await mapboxApi.getRoute(
                {
                    latitude: selectedRide.originLocation.latitude,
                    longitude: selectedRide.originLocation.longitude,
                },
                {
                    latitude: selectedRide.destinationLocation.latitude,
                    longitude: selectedRide.destinationLocation.longitude,
                }
            );
            if (route && route.coordinates && route.coordinates.length > 0) {
                setRouteCoords(route.coordinates);
            } else {
                // Fallback to straight line if no route coordinates
                setRouteCoords([
                    { latitude: selectedRide.originLocation.latitude, longitude: selectedRide.originLocation.longitude },
                    { latitude: selectedRide.destinationLocation.latitude, longitude: selectedRide.destinationLocation.longitude },
                ]);
            }
        } catch (error) {
            console.error('Failed to load route:', error);
            // Fallback to straight line if route fails
            if (selectedRide.originLocation && selectedRide.destinationLocation) {
                setRouteCoords([
                    { latitude: selectedRide.originLocation.latitude, longitude: selectedRide.originLocation.longitude },
                    { latitude: selectedRide.destinationLocation.latitude, longitude: selectedRide.destinationLocation.longitude },
                ]);
            }
        } finally {
            setIsLoadingRoute(false);
        }
    };

    const loadPassengerRoute = async () => {
        if (!passengerPickup || !passengerDrop) return;

        setIsLoadingPassengerRoute(true);
        try {
            const route = await mapboxApi.getRoute(
                {
                    latitude: passengerPickup.latitude,
                    longitude: passengerPickup.longitude,
                },
                {
                    latitude: passengerDrop.latitude,
                    longitude: passengerDrop.longitude,
                }
            );
            if (route && route.coordinates && route.coordinates.length > 0) {
                setPassengerRouteCoords(route.coordinates);
            } else {
                // Fallback to straight line if no route coordinates
                setPassengerRouteCoords([
                    { latitude: passengerPickup.latitude, longitude: passengerPickup.longitude },
                    { latitude: passengerDrop.latitude, longitude: passengerDrop.longitude },
                ]);
            }
        } catch (error) {
            console.error('Failed to load passenger route:', error);
            // Fallback to straight line if route fails
            setPassengerRouteCoords([
                { latitude: passengerPickup.latitude, longitude: passengerPickup.longitude },
                { latitude: passengerDrop.latitude, longitude: passengerDrop.longitude },
            ]);
        } finally {
            setIsLoadingPassengerRoute(false);
        }
    };

    // Find nearest point on route to a given coordinate
    const findNearestPointOnRoute = (lat: number, lng: number): { latitude: number; longitude: number } => {
        if (routeCoords.length === 0) {
            return { latitude: lat, longitude: lng };
        }

        let minDist = Infinity;
        let nearestPoint = routeCoords[0];

        for (let i = 0; i < routeCoords.length - 1; i++) {
            const p1 = routeCoords[i];
            const p2 = routeCoords[i + 1];
            
            // Calculate distance from point to line segment
            const dist = distanceToLineSegment(lat, lng, p1.latitude, p1.longitude, p2.latitude, p2.longitude);
            
            if (dist < minDist) {
                minDist = dist;
                // Project point onto line segment
                const projected = projectPointOnLine(lat, lng, p1.latitude, p1.longitude, p2.latitude, p2.longitude);
                nearestPoint = projected;
            }
        }

        return nearestPoint;
    };

    // Calculate distance from point to line segment (simplified)
    const distanceToLineSegment = (
        px: number, py: number,
        x1: number, y1: number,
        x2: number, y2: number
    ): number => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSq = dx * dx + dy * dy;
        
        if (lengthSq === 0) {
            const dLat = px - x1;
            const dLng = py - y1;
            return Math.sqrt(dLat * dLat + dLng * dLng);
        }

        const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSq));
        const projX = x1 + t * dx;
        const projY = y1 + t * dy;
        
        const dLat = px - projX;
        const dLng = py - projY;
        return Math.sqrt(dLat * dLat + dLng * dLng);
    };

    // Project point onto line segment
    const projectPointOnLine = (
        px: number, py: number,
        x1: number, y1: number,
        x2: number, y2: number
    ): { latitude: number; longitude: number } => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSq = dx * dx + dy * dy;
        
        if (lengthSq === 0) {
            return { latitude: x1, longitude: y1 };
        }

        const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSq));
        return {
            latitude: x1 + t * dx,
            longitude: y1 + t * dy,
        };
    };

    const handleMapPress = async (event: any) => {
        if (!isEditingPoints || !editingMode) return;

        const { latitude, longitude } = event.nativeEvent.coordinate;
        const nearestPoint = findNearestPointOnRoute(latitude, longitude);

        // Try to get address by searching nearby
        let address = 'Selected location on route';
        try {
            // Use a nearby search to get address
            const searchQuery = `${nearestPoint.latitude.toFixed(4)},${nearestPoint.longitude.toFixed(4)}`;
            const places = await mapboxApi.searchPlaces(searchQuery);
            if (places.length > 0) {
                address = places[0].address;
            }
        } catch (error) {
            // Keep default address
        }
        
        if (editingMode === 'pickup') {
            const updatedPickup = {
                latitude: nearestPoint.latitude,
                longitude: nearestPoint.longitude,
                address,
            };
            setPassengerPickup(updatedPickup);
            updateForm({
                originLat: nearestPoint.latitude,
                originLng: nearestPoint.longitude,
                origin: address,
            });
        } else {
            const updatedDrop = {
                latitude: nearestPoint.latitude,
                longitude: nearestPoint.longitude,
                address,
            };
            setPassengerDrop(updatedDrop);
            updateForm({
                destinationLat: nearestPoint.latitude,
                destinationLng: nearestPoint.longitude,
                destination: address,
            });
        }
        
        setEditingMode(null);
        Alert.alert('Point Set', `${editingMode === 'pickup' ? 'Pickup' : 'Drop'} point updated. Route and fare recalculated.`);
    };

    const handleSavePoints = () => {
        setIsEditingPoints(false);
        setEditingMode(null);
        Alert.alert('Saved', 'Your pickup and drop points have been saved.');
    };

    if (!selectedRide) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No ride selected.</Text>
                    <Button title="Back to Results" onPress={() => navigation.goBack()} />
                </View>
            </SafeAreaView>
        );
    }

    // Calculate distance between passenger pickup and drop
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

    // Calculate passenger's route distance
    const passengerDistanceKm = passengerPickup && passengerDrop
        ? calculateDistance(
              passengerPickup.latitude,
              passengerPickup.longitude,
              passengerDrop.latitude,
              passengerDrop.longitude
          )
        : selectedRide.distanceKm || 0;

    // Calculate fare based on passenger's actual distance
    // Use farePerKm from the ride if available, otherwise calculate from farePerSeat
    const farePerKm = selectedRide.farePerKm ?? (selectedRide.farePerSeat / (selectedRide.distanceKm || 1));
    
    // Calculate new fare based on passenger's actual distance
    const farePerSeat = Math.round(farePerKm * passengerDistanceKm);
    const totalFare = farePerSeat * form.passengers;
    
    const hasRoute =
        !!selectedRide.originLocation &&
        !!selectedRide.destinationLocation &&
        (selectedRide.originLocation.latitude !== 0 || selectedRide.originLocation.longitude !== 0);
    
    // Calculate map region to fit both points
    const mapRegion: Region = hasRoute
        ? {
              latitude: (selectedRide.originLocation.latitude + selectedRide.destinationLocation.latitude) / 2,
              longitude: (selectedRide.originLocation.longitude + selectedRide.destinationLocation.longitude) / 2,
              latitudeDelta: Math.max(
                  Math.abs(selectedRide.originLocation.latitude - selectedRide.destinationLocation.latitude) * 1.5,
                  0.05
              ),
              longitudeDelta: Math.max(
                  Math.abs(selectedRide.originLocation.longitude - selectedRide.destinationLocation.longitude) * 1.5,
                  0.05
              ),
          }
        : {
              latitude: selectedRide.originLocation?.latitude ?? DEFAULT_MAP_CENTER.latitude,
              longitude: selectedRide.originLocation?.longitude ?? DEFAULT_MAP_CENTER.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
          };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Confirm Booking</Text>
                <Text style={styles.subtitle}>Review ride details before confirming.</Text>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Driver</Text>
                    <Text style={styles.valueText}>{selectedRide.driverName} ⭐ {selectedRide.rating.toFixed(1)}</Text>
                    <Text style={styles.helperText}>{selectedRide.reviews} reviews</Text>
                </Card>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Vehicle</Text>
                    <Text style={styles.valueText}>
                        {selectedRide.vehicleColor} {selectedRide.vehicleType} • {selectedRide.vehiclePlate}
                    </Text>
                </Card>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Pickup & Dropoff</Text>
                    <Text style={styles.valueText}>Pickup: {selectedRide.pickupTime}</Text>
                    <Text style={styles.valueText}>Dropoff: {selectedRide.dropoffTime}</Text>
                    <Text style={styles.helperText}>
                        {passengerPickup?.address || form.origin} → {passengerDrop?.address || form.destination}
                    </Text>
                </Card>

                {hasRoute && (
                    <Card style={styles.card}>
                        <View style={styles.routeHeader}>
                            <Text style={styles.sectionTitle}>Route</Text>
                            {!isEditingPoints ? (
                                <TouchableOpacity
                                    onPress={() => setIsEditingPoints(true)}
                                    style={styles.editButton}
                                >
                                    <Text style={styles.editButtonText}>Adjust Points</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.editControls}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setEditingMode('pickup');
                                            Alert.alert('Set Pickup', 'Tap on the route to set your pickup point.');
                                        }}
                                        style={[styles.pointButton, editingMode === 'pickup' && styles.pointButtonActive]}
                                    >
                                        <Text style={styles.pointButtonText}>Set Pickup</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setEditingMode('drop');
                                            Alert.alert('Set Drop', 'Tap on the route to set your drop point.');
                                        }}
                                        style={[styles.pointButton, editingMode === 'drop' && styles.pointButtonActive]}
                                    >
                                        <Text style={styles.pointButtonText}>Set Drop</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handleSavePoints}
                                        style={styles.saveButton}
                                    >
                                        <Text style={styles.saveButtonText}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        {isLoadingRoute && (
                            <Text style={styles.loadingText}>Loading route...</Text>
                        )}
                        {isEditingPoints && editingMode && (
                            <Text style={styles.instructionText}>
                                {editingMode === 'pickup' ? 'Tap on the route to set pickup point' : 'Tap on the route to set drop point'}
                            </Text>
                        )}
                        <MapView
                            ref={mapRef}
                            style={styles.map}
                            region={mapRegion}
                            mapType="none"
                            onPress={handleMapPress}
                        >
                            <UrlTile
                                urlTemplate={MAPBOX_TILE_URL}
                                maximumZ={19}
                                tileSize={MAPBOX_TILE_SIZE}
                                shouldReplaceMapContent
                            />
                            {/* Driver's route - Blue line from start to end */}
                            {routeCoords.length > 1 && (
                                <Polyline
                                    coordinates={routeCoords}
                                    strokeColor="#2196F3"
                                    strokeWidth={4}
                                />
                            )}
                            {/* Driver's origin and destination */}
                            <Marker
                                coordinate={{
                                    latitude: selectedRide.originLocation!.latitude,
                                    longitude: selectedRide.originLocation!.longitude,
                                }}
                                title="Driver Start"
                                pinColor="#888"
                            />
                            <Marker
                                coordinate={{
                                    latitude: selectedRide.destinationLocation!.latitude,
                                    longitude: selectedRide.destinationLocation!.longitude,
                                }}
                                title="Driver End"
                                pinColor="#888"
                            />
                            {/* Passenger's pickup point */}
                            {passengerPickup && (
                                <Marker
                                    coordinate={{
                                        latitude: passengerPickup.latitude,
                                        longitude: passengerPickup.longitude,
                                    }}
                                    title="Your Pickup"
                                    pinColor={theme.colors.primary}
                                    draggable={isEditingPoints}
                                    onDragEnd={(e) => {
                                        const nearest = findNearestPointOnRoute(
                                            e.nativeEvent.coordinate.latitude,
                                            e.nativeEvent.coordinate.longitude
                                        );
                                        const updatedPickup = {
                                            ...passengerPickup,
                                            latitude: nearest.latitude,
                                            longitude: nearest.longitude,
                                        };
                                        setPassengerPickup(updatedPickup);
                                        updateForm({
                                            originLat: nearest.latitude,
                                            originLng: nearest.longitude,
                                        });
                                        // Route will reload automatically via useEffect
                                    }}
                                />
                            )}
                            {/* Passenger's drop point */}
                            {passengerDrop && (
                                <Marker
                                    coordinate={{
                                        latitude: passengerDrop.latitude,
                                        longitude: passengerDrop.longitude,
                                    }}
                                    title="Your Drop"
                                    pinColor={theme.colors.secondary}
                                    draggable={isEditingPoints}
                                    onDragEnd={(e) => {
                                        const nearest = findNearestPointOnRoute(
                                            e.nativeEvent.coordinate.latitude,
                                            e.nativeEvent.coordinate.longitude
                                        );
                                        const updatedDrop = {
                                            ...passengerDrop,
                                            latitude: nearest.latitude,
                                            longitude: nearest.longitude,
                                        };
                                        setPassengerDrop(updatedDrop);
                                        updateForm({
                                            destinationLat: nearest.latitude,
                                            destinationLng: nearest.longitude,
                                        });
                                        // Route will reload automatically via useEffect
                                    }}
                                />
                            )}
                            {/* Passenger's route segment - Green line following actual route from pickup to drop */}
                            {passengerPickup && passengerDrop && passengerRouteCoords.length > 1 && (
                                <Polyline
                                    coordinates={passengerRouteCoords}
                                    strokeColor="#4CAF50"
                                    strokeWidth={5}
                                />
                            )}
                        </MapView>
                        {passengerPickup && (
                            <Text style={styles.pointInfo}>Pickup: {passengerPickup.address}</Text>
                        )}
                        {passengerDrop && (
                            <Text style={styles.pointInfo}>Drop: {passengerDrop.address}</Text>
                        )}
                        {passengerPickup && passengerDrop && (
                            <Text style={styles.distanceInfo}>
                                Your distance: {passengerDistanceKm.toFixed(1)} km
                            </Text>
                        )}
                    </Card>
                )}

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Fare Summary</Text>
                    {passengerPickup && passengerDrop && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Distance</Text>
                            <Text style={styles.valueText}>{passengerDistanceKm.toFixed(1)} km</Text>
                        </View>
                    )}
                    <View style={styles.row}>
                        <Text style={styles.label}>Rate</Text>
                        <Text style={styles.valueText}>₹{farePerKm.toFixed(2)}/km</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Per Seat</Text>
                        <Text style={styles.valueText}>₹{farePerSeat}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Passengers</Text>
                        <Text style={styles.valueText}>{form.passengers}</Text>
                    </View>
                    <View style={[styles.row, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>₹{totalFare}</Text>
                    </View>
                </Card>

                <View style={styles.buttonRow}>
                    <Button title="Cancel" variant="outline" onPress={() => navigation.goBack()} style={styles.button} />
                    <Button title="Confirm Booking" onPress={() => navigation.navigate('PassengerPayment')} style={styles.button} />
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
    map: {
        height: 220,
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
    },
    sectionTitle: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.semiBold,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    valueText: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text,
    },
    helperText: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xs,
    },
    label: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    button: {
        flex: 1,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.backgroundDark,
    },
    emptyText: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.md,
    },
    loadingText: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.xs,
    },
    routeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
    },
    editButton: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.sm,
    },
    editButtonText: {
        color: theme.colors.white,
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.semiBold,
    },
    editControls: {
        flexDirection: 'row',
        gap: theme.spacing.xs,
    },
    pointButton: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        backgroundColor: theme.colors.border,
        borderRadius: theme.borderRadius.sm,
    },
    pointButtonActive: {
        backgroundColor: theme.colors.primary,
    },
    pointButtonText: {
        color: theme.colors.text,
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.medium,
    },
    saveButton: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        backgroundColor: theme.colors.success || '#4CAF50',
        borderRadius: theme.borderRadius.sm,
    },
    saveButtonText: {
        color: theme.colors.white,
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.semiBold,
    },
    instructionText: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.primary,
        textAlign: 'center',
        marginBottom: theme.spacing.xs,
        fontStyle: 'italic',
    },
    pointInfo: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
    distanceInfo: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.primary,
        marginTop: theme.spacing.xs,
        fontWeight: theme.typography.fontWeight.semiBold,
    },
    totalRow: {
        marginTop: theme.spacing.sm,
        paddingTop: theme.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    totalLabel: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text,
    },
    totalValue: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.primary,
    },
});

export default PassengerConfirmScreen;

