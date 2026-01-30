import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Card } from '../../../components/common/Card';
import { OptionChip } from '../../../components/common/OptionChip';
import { theme } from '../../../theme';
import MapView, { Marker, Polyline, Region, UrlTile } from 'react-native-maps';
import {
    DepartureOption,
    DriverRatingFilter,
    GenderFilter,
    MusicFilter,
    SmokingFilter,
    VehicleTypeFilter,
    usePassengerRideFlow,
} from './PassengerRideFlowContext';
import { DEFAULT_MAP_CENTER, MAPBOX_TILE_SIZE, MAPBOX_TILE_URL } from '../../../config/maps';
import { mapboxApi, PlaceSuggestion } from '../../../services/mapboxApi';

interface PassengerAllInOneScreenProps {
    navigation: any;
}

export const PassengerAllInOneScreen: React.FC<PassengerAllInOneScreenProps> = ({ navigation }) => {
    const { form, updateForm, updateFilters } = usePassengerRideFlow();
    const mapRef = useRef<MapView | null>(null);
    const [activeField, setActiveField] = useState<'origin' | 'destination' | null>(null);
    const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
    const [routeCoords, setRouteCoords] = useState<Array<{ latitude: number; longitude: number }>>([]);
    const [routeDistanceKm, setRouteDistanceKm] = useState<number | null>(null);
    const [mapPickMode, setMapPickMode] = useState<'origin' | 'destination' | null>(null);
    const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number }>({
        latitude: DEFAULT_MAP_CENTER.latitude,
        longitude: DEFAULT_MAP_CENTER.longitude,
    });

    const originQuickOptions = ['Current Location', 'Home, Gandhinagar', 'Saved: Infocity', 'Work, Sector 11'];
    const destinationQuickOptions = ['Sector 21', 'Ahmedabad Airport', 'Infocity', 'Sector 11 Bus Stand'];
    const departureOptions: DepartureOption[] = ['Leave Now', 'Tomorrow at Time', 'Custom Date & Time'];
    const passengerOptions = [1, 2, 3, 4, 5];

    const vehicleTypes: VehicleTypeFilter[] = ['Any', 'Hatchback', 'Sedan', 'SUV'];
    const ratingOptions: DriverRatingFilter[] = ['Any', '4.0+', '4.5+', '4.8+'];
    const musicOptions: MusicFilter[] = ['Any', 'Bollywood', 'English', 'Podcasts', 'None'];
    const smokingOptions: SmokingFilter[] = ['Any', 'No', 'Yes'];
    const genderOptions: GenderFilter[] = ['Any', 'Female Only', 'Male Only'];

    const handleDepartureSelect = (option: DepartureOption) => {
        if (option === 'Leave Now') {
            updateForm({ departureOption: option, date: 'Today', time: 'Now' });
        } else if (option === 'Tomorrow at Time') {
            updateForm({ departureOption: option, date: 'Tomorrow', time: '8:00 AM' });
        } else {
            updateForm({ departureOption: option, date: '', time: '' });
        }
    };

    useEffect(() => {
        const query = activeField === 'origin' ? form.origin : activeField === 'destination' ? form.destination : '';
        if (!activeField) {
            setSuggestions([]);
            return;
        }
        const handle = setTimeout(async () => {
            try {
                const results = await mapboxApi.searchPlaces(query);
                setSuggestions(results);
            } catch {
                setSuggestions([]);
            }
        }, 350);

        return () => clearTimeout(handle);
    }, [activeField, form.origin, form.destination]);

    useEffect(() => {
        const loadRoute = async () => {
            const hasOrigin = form.originLat != null && form.originLng != null;
            const hasDestination = form.destinationLat != null && form.destinationLng != null;
            if (!hasOrigin || !hasDestination) {
                setRouteCoords([]);
                setRouteDistanceKm(null);
                updateForm({
                    routeDistanceKm: null,
                    originLat: hasOrigin ? form.originLat : null,
                    originLng: hasOrigin ? form.originLng : null,
                    destinationLat: hasDestination ? form.destinationLat : null,
                    destinationLng: hasDestination ? form.destinationLng : null,
                });
                return;
            }
            try {
                const route = await mapboxApi.getRoute(
                    { latitude: form.originLat!, longitude: form.originLng! },
                    { latitude: form.destinationLat!, longitude: form.destinationLng! }
                );
                setRouteCoords(route.coordinates);
                setRouteDistanceKm(route.distanceKm);
                updateForm({
                    routeDistanceKm: route.distanceKm,
                    originLat: form.originLat,
                    originLng: form.originLng,
                    destinationLat: form.destinationLat,
                    destinationLng: form.destinationLng,
                });
                if (route.coordinates.length > 1) {
                    mapRef.current?.fitToCoordinates(route.coordinates, {
                        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
                        animated: true,
                    });
                }
            } catch {
                setRouteCoords([]);
                setRouteDistanceKm(null);
                updateForm({
                    routeDistanceKm: null,
                    originLat: form.originLat,
                    originLng: form.originLng,
                    destinationLat: form.destinationLat,
                    destinationLng: form.destinationLng,
                });
            }
        };

        loadRoute();
    }, [form.originLat, form.originLng, form.destinationLat, form.destinationLng]);

    const handleConfirmMapSelection = () => {
        if (!mapPickMode) return;

        if (mapPickMode === 'origin') {
            updateForm({
                origin: 'Pinned pickup on map',
                originLat: mapCenter.latitude,
                originLng: mapCenter.longitude,
            });
        } else {
            updateForm({
                destination: 'Pinned drop on map',
                destinationLat: mapCenter.latitude,
                destinationLng: mapCenter.longitude,
            });
        }

        setMapPickMode(null);
        setActiveField(null);
        setSuggestions([]);
    };

    const canSearch =
        form.origin.trim().length > 0 &&
        form.destination.trim().length > 0 &&
        routeCoords.length > 1 &&
        routeDistanceKm != null;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Find a Ride</Text>
                <Text style={styles.subtitle}>Enter all details and search in one step.</Text>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Route</Text>
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: DEFAULT_MAP_CENTER.latitude,
                            longitude: DEFAULT_MAP_CENTER.longitude,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        }}
                        onRegionChangeComplete={(region) => {
                            setMapCenter({ latitude: region.latitude, longitude: region.longitude });
                        }}
                        mapType="none"
                        ref={mapRef}
                    >
                        <UrlTile
                            urlTemplate={MAPBOX_TILE_URL}
                            maximumZ={19}
                            tileSize={MAPBOX_TILE_SIZE}
                            shouldReplaceMapContent
                        />
                        {form.originLat != null && form.originLng != null && (
                            <Marker
                                coordinate={{ latitude: form.originLat, longitude: form.originLng }}
                                title="Pickup"
                                pinColor={theme.colors.primary}
                            />
                        )}
                        {form.destinationLat != null && form.destinationLng != null && (
                            <Marker
                                coordinate={{ latitude: form.destinationLat, longitude: form.destinationLng }}
                                title="Drop"
                                pinColor={theme.colors.secondary}
                            />
                        )}
                        {routeCoords.length > 1 && (
                            <Polyline
                                coordinates={routeCoords}
                                strokeColor={theme.colors.primary}
                                strokeWidth={4}
                            />
                        )}
                        {mapPickMode && (
                            <Marker
                                coordinate={mapCenter}
                                title={mapPickMode === 'origin' ? 'Move map to set pickup' : 'Move map to set drop'}
                                pinColor={mapPickMode === 'origin' ? theme.colors.primary : theme.colors.secondary}
                            />
                        )}
                    </MapView>
                    {mapPickMode && (
                        <View style={styles.mapActionBar}>
                            <Text style={styles.mapHint}>
                                Move the map to position the {mapPickMode === 'origin' ? 'pickup' : 'drop'} point, then
                                tap Select Place.
                            </Text>
                            <Button
                                title="Select Place"
                                onPress={handleConfirmMapSelection}
                                fullWidth
                            />
                        </View>
                    )}
                    {routeDistanceKm != null && (
                        <Text style={styles.distanceText}>Distance: {routeDistanceKm.toFixed(1)} km</Text>
                    )}
                </Card>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Pickup Location</Text>
                    <View style={styles.chipRow}>
                        {originQuickOptions.map((option) => (
                            <OptionChip
                                key={option}
                                label={option}
                                selected={form.origin === option}
                                onPress={() => {
                                    if (option === 'Current Location') {
                                        updateForm({
                                            origin: 'Current Location, Gandhinagar',
                                            originLat: DEFAULT_MAP_CENTER.latitude,
                                            originLng: DEFAULT_MAP_CENTER.longitude,
                                        });
                                    } else {
                                        updateForm({ origin: option });
                                    }
                                }}
                            />
                        ))}
                    </View>
                    <Input
                        label="Enter origin"
                        placeholder="e.g. Home, Bangalore"
                        value={form.origin}
                        onFocus={() => setActiveField('origin')}
                        onChangeText={(text) => updateForm({ origin: text })}
                        rightIcon={
                            <Text
                                style={{ fontSize: 18 }}
                                onPress={() => setMapPickMode('origin')}
                            >
                                📍
                            </Text>
                        }
                    />
                    {activeField === 'origin' && suggestions.length > 0 && (
                        <View style={styles.suggestions}>
                            {suggestions.map((place) => (
                                <TouchableOpacity
                                    key={place.id}
                                    style={styles.suggestionItem}
                                    onPress={() => {
                                        updateForm({
                                            origin: place.address,
                                            originLat: place.latitude,
                                            originLng: place.longitude,
                                        });
                                        setActiveField(null);
                                        setSuggestions([]);
                                    }}
                                >
                                    <Text style={styles.suggestionTitle}>{place.name}</Text>
                                    <Text style={styles.suggestionSubtitle}>{place.address}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </Card>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Destination</Text>
                    <View style={styles.chipRow}>
                        {destinationQuickOptions.map((option) => (
                            <OptionChip
                                key={option}
                                label={option}
                                selected={form.destination === option}
                                onPress={() => updateForm({ destination: option })}
                            />
                        ))}
                    </View>
                    <Input
                        label="Enter destination"
                        placeholder="e.g. Tech Park, Whitefield"
                        value={form.destination}
                        onFocus={() => setActiveField('destination')}
                        onChangeText={(text) => updateForm({ destination: text })}
                        rightIcon={
                            <Text
                                style={{ fontSize: 18 }}
                                onPress={() => setMapPickMode('destination')}
                            >
                                📍
                            </Text>
                        }
                    />
                    {activeField === 'destination' && suggestions.length > 0 && (
                        <View style={styles.suggestions}>
                            {suggestions.map((place) => (
                                <TouchableOpacity
                                    key={place.id}
                                    style={styles.suggestionItem}
                                    onPress={() => {
                                        updateForm({
                                            destination: place.address,
                                            destinationLat: place.latitude,
                                            destinationLng: place.longitude,
                                        });
                                        setActiveField(null);
                                        setSuggestions([]);
                                    }}
                                >
                                    <Text style={styles.suggestionTitle}>{place.name}</Text>
                                    <Text style={styles.suggestionSubtitle}>{place.address}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </Card>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Departure</Text>
                    <View style={styles.chipRow}>
                        {departureOptions.map((option) => (
                            <OptionChip
                                key={option}
                                label={option}
                                selected={form.departureOption === option}
                                onPress={() => handleDepartureSelect(option)}
                            />
                        ))}
                    </View>
                    {form.departureOption !== 'Leave Now' && (
                        <View>
                            <Input
                                label="Date"
                                placeholder="e.g. Tomorrow"
                                value={form.date}
                                onChangeText={(text) => updateForm({ date: text })}
                            />
                            <Input
                                label="Time"
                                placeholder="e.g. 8:30 AM"
                                value={form.time}
                                onChangeText={(text) => updateForm({ time: text })}
                            />
                        </View>
                    )}
                </Card>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Passengers</Text>
                    <View style={styles.chipRow}>
                        {passengerOptions.map((count) => (
                            <OptionChip
                                key={count}
                                label={`${count}`}
                                selected={form.passengers === count}
                                onPress={() => updateForm({ passengers: count })}
                            />
                        ))}
                    </View>
                </Card>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Filters</Text>
                    <Text style={styles.fieldLabel}>Price Range (₹)</Text>
                    <View style={styles.rangeRow}>
                        <Input
                            placeholder="Min"
                            keyboardType="numeric"
                            value={String(form.filters.priceMin)}
                            onChangeText={(text) => updateFilters({ priceMin: Number(text) || 0 })}
                            containerStyle={styles.rangeInput}
                        />
                        <Input
                            placeholder="Max"
                            keyboardType="numeric"
                            value={String(form.filters.priceMax)}
                            onChangeText={(text) => updateFilters({ priceMax: Number(text) || 0 })}
                            containerStyle={styles.rangeInput}
                        />
                    </View>

                    <Text style={styles.fieldLabel}>Vehicle Type</Text>
                    <View style={styles.chipRow}>
                        {vehicleTypes.map((option) => (
                            <OptionChip
                                key={option}
                                label={option}
                                selected={form.filters.vehicleType === option}
                                onPress={() => updateFilters({ vehicleType: option })}
                            />
                        ))}
                    </View>

                    <Text style={styles.fieldLabel}>Driver Rating</Text>
                    <View style={styles.chipRow}>
                        {ratingOptions.map((option) => (
                            <OptionChip
                                key={option}
                                label={option}
                                selected={form.filters.driverRating === option}
                                onPress={() => updateFilters({ driverRating: option })}
                            />
                        ))}
                    </View>

                    <Text style={styles.fieldLabel}>A/C Required?</Text>
                    <View style={styles.chipRow}>
                        <OptionChip
                            label="Any"
                            selected={!form.filters.hasAC}
                            onPress={() => updateFilters({ hasAC: false })}
                        />
                        <OptionChip
                            label="Yes"
                            selected={form.filters.hasAC}
                            onPress={() => updateFilters({ hasAC: true })}
                        />
                    </View>

                    <Text style={styles.fieldLabel}>Music Type</Text>
                    <View style={styles.chipRow}>
                        {musicOptions.map((option) => (
                            <OptionChip
                                key={option}
                                label={option}
                                selected={form.filters.musicType === option}
                                onPress={() => updateFilters({ musicType: option })}
                            />
                        ))}
                    </View>

                    <Text style={styles.fieldLabel}>Smoking Preference</Text>
                    <View style={styles.chipRow}>
                        {smokingOptions.map((option) => (
                            <OptionChip
                                key={option}
                                label={option}
                                selected={form.filters.smokingPreference === option}
                                onPress={() => updateFilters({ smokingPreference: option })}
                            />
                        ))}
                    </View>

                    <Text style={styles.fieldLabel}>Gender Preference</Text>
                    <View style={styles.chipRow}>
                        {genderOptions.map((option) => (
                            <OptionChip
                                key={option}
                                label={option}
                                selected={form.filters.genderPreference === option}
                                onPress={() => updateFilters({ genderPreference: option })}
                            />
                        ))}
                    </View>
                </Card>

                <Button
                    title="Search Rides"
                    onPress={() => navigation.navigate('PassengerResults')}
                    disabled={!canSearch}
                    fullWidth
                />
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
    fieldLabel: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
        marginTop: theme.spacing.sm,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    rangeRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    rangeInput: {
        flex: 1,
    },
    map: {
        height: 220,
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
    },
    distanceText: {
        marginTop: theme.spacing.sm,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    mapActionBar: {
        marginTop: theme.spacing.sm,
        gap: theme.spacing.xs,
    },
    mapHint: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textSecondary,
    },
    suggestions: {
        marginTop: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.white,
        overflow: 'hidden',
    },
    suggestionItem: {
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    suggestionTitle: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.semiBold,
        color: theme.colors.text,
    },
    suggestionSubtitle: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
});

export default PassengerAllInOneScreen;

