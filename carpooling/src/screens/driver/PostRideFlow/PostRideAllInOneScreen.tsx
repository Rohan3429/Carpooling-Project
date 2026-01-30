import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, Region, UrlTile } from 'react-native-maps';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Card } from '../../../components/common/Card';
import { OptionChip } from '../../../components/common/OptionChip';
import { theme } from '../../../theme';
import { DEFAULT_MAP_CENTER, MAPBOX_TILE_SIZE, MAPBOX_TILE_URL } from '../../../config/maps';
import { mapboxApi, PlaceSuggestion } from '../../../services/mapboxApi';
import {
    DateOption,
    GenderPreference,
    MusicPreference,
    RecurringOption,
    SmokingPreference,
    TimeOption,
    usePostRideFlow,
} from './PostRideFlowContext';

interface PostRideAllInOneScreenProps {
    navigation: any;
}

export const PostRideAllInOneScreen: React.FC<PostRideAllInOneScreenProps> = ({ navigation }) => {
    const { form, updateForm, updatePreferences } = usePostRideFlow();
    const mapRef = useRef<MapView | null>(null);
    const [activeField, setActiveField] = useState<'origin' | 'destination' | null>(null);
    const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
    const [routeCoords, setRouteCoords] = useState<Array<{ latitude: number; longitude: number }>>([]);
    const [routeDistanceKm, setRouteDistanceKm] = useState<number | null>(null);

    const originQuickOptions = ['Current Location', 'Home, Gandhinagar', 'Work, Sector 11', 'Saved: Infocity'];
    const destinationQuickOptions = ['Sector 21', 'Sector 11', 'Ahmedabad Airport', 'Infocity'];
    const seatOptions = [1, 2, 3, 4, 5];
    const fareOptions = [12, 14, 16, 18];
    const dateOptions: DateOption[] = ['Today', 'Tomorrow', 'Custom'];
    const timeOptions: TimeOption[] = ['8:00 AM', '8:30 AM', '9:00 AM', '6:00 PM', '7:00 PM', 'Custom'];
    const musicOptions: MusicPreference[] = ['Bollywood', 'English', 'Podcasts', 'None'];
    const smokingOptions: SmokingPreference[] = ['Yes', 'No', 'Only Outside'];
    const genderOptions: GenderPreference[] = ['Any', 'Female Only', 'Male Only'];
    const recurringOptions: RecurringOption[] = ['No', 'Every Weekday', 'Every Monday-Friday'];

    const handleDateSelect = (option: DateOption) => {
        updateForm({
            dateOption: option,
            date: option === 'Custom' ? '' : option,
        });
    };

    const handleTimeSelect = (option: TimeOption) => {
        updateForm({
            timeOption: option,
            time: option === 'Custom' ? '' : option,
        });
    };

    const handleFareChange = (text: string) => {
        const numeric = Number(text.replace(/[^0-9.]/g, ''));
        updateForm({ farePerKm: Number.isNaN(numeric) ? 0 : numeric });
    };

    const handleMapPress = (event: any) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;

        if (form.originLat == null || form.destinationLat != null) {
            updateForm({
                originLat: latitude,
                originLng: longitude,
                destinationLat: null,
                destinationLng: null,
                origin: form.origin.trim() || 'Pinned pickup',
                destination: form.destination.trim(),
            });
            return;
        }

        updateForm({
            destinationLat: latitude,
            destinationLng: longitude,
            destination: form.destination.trim() || 'Pinned drop',
        });
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
        const hasOrigin = form.originLat != null && form.originLng != null;
        const hasDestination = form.destinationLat != null && form.destinationLng != null;
        if (!hasOrigin || !hasDestination) {
            setRouteCoords([]);
            setRouteDistanceKm(null);
            return;
        }

        const loadRoute = async () => {
            try {
                const route = await mapboxApi.getRoute(
                    { latitude: form.originLat!, longitude: form.originLng! },
                    { latitude: form.destinationLat!, longitude: form.destinationLng! }
                );
                setRouteCoords(route.coordinates);
                setRouteDistanceKm(route.distanceKm);
                if (route.coordinates.length > 1) {
                    mapRef.current?.fitToCoordinates(route.coordinates, {
                        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
                        animated: true,
                    });
                }
            } catch {
                setRouteCoords([]);
                setRouteDistanceKm(null);
            }
        };

        loadRoute();
    }, [form.originLat, form.originLng, form.destinationLat, form.destinationLng]);

    const mapRegion: Region = {
        latitude: form.originLat ?? DEFAULT_MAP_CENTER.latitude,
        longitude: form.originLng ?? DEFAULT_MAP_CENTER.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    const canContinue =
        form.origin.trim().length > 0 &&
        form.destination.trim().length > 0 &&
        form.date.trim().length > 0 &&
        form.time.trim().length > 0 &&
        form.farePerKm > 0;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Post a Ride</Text>
                <Text style={styles.subtitle}>Fill all ride details in one go.</Text>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Route</Text>
                    <Text style={styles.helperLabel}>Tap once for pickup, tap again for drop.</Text>
                    <MapView
                        style={styles.map}
                        initialRegion={mapRegion}
                        onPress={handleMapPress}
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
                    </MapView>
                    {routeDistanceKm != null && (
                        <Text style={styles.distanceText}>Distance: {routeDistanceKm.toFixed(1)} km</Text>
                    )}
                </Card>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Origin</Text>
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
                        label="Pickup location"
                        placeholder="e.g. Home, Bangalore"
                        value={form.origin}
                        onFocus={() => setActiveField('origin')}
                        onChangeText={(text) => updateForm({ origin: text })}
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
                        label="Drop location"
                        placeholder="e.g. Tech Park, Whitefield"
                        value={form.destination}
                        onFocus={() => setActiveField('destination')}
                        onChangeText={(text) => updateForm({ destination: text })}
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
                    <Text style={styles.sectionTitle}>Date</Text>
                    <View style={styles.chipRow}>
                        {dateOptions.map((option) => (
                            <OptionChip
                                key={option}
                                label={option}
                                selected={form.dateOption === option}
                                onPress={() => handleDateSelect(option)}
                            />
                        ))}
                    </View>
                    {form.dateOption === 'Custom' && (
                        <Input
                            label="Custom date"
                            placeholder="e.g. 2026-01-24"
                            value={form.date}
                            onChangeText={(text) => updateForm({ date: text })}
                        />
                    )}
                </Card>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Time</Text>
                    <View style={styles.chipRow}>
                        {timeOptions.map((option) => (
                            <OptionChip
                                key={option}
                                label={option}
                                selected={form.timeOption === option}
                                onPress={() => handleTimeSelect(option)}
                            />
                        ))}
                    </View>
                    {form.timeOption === 'Custom' && (
                        <Input
                            label="Custom time"
                            placeholder="e.g. 8:15 AM"
                            value={form.time}
                            onChangeText={(text) => updateForm({ time: text })}
                        />
                    )}
                </Card>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Seats Available</Text>
                    <View style={styles.chipRow}>
                        {seatOptions.map((seat) => (
                            <OptionChip
                                key={seat}
                                label={`${seat}`}
                                selected={form.seats === seat}
                                onPress={() => updateForm({ seats: seat })}
                            />
                        ))}
                    </View>
                </Card>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Fare per KM</Text>
                    <View style={styles.chipRow}>
                        {fareOptions.map((fare) => (
                            <OptionChip
                                key={fare}
                                label={`₹${fare}`}
                                selected={form.farePerKm === fare}
                                onPress={() => updateForm({ farePerKm: fare })}
                            />
                        ))}
                    </View>
                    <Input
                        label="Custom fare"
                        placeholder="e.g. 14"
                        keyboardType="numeric"
                        value={form.farePerKm > 0 ? String(form.farePerKm) : ''}
                        onChangeText={handleFareChange}
                    />
                </Card>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <Text style={styles.helperLabel}>A/C Required?</Text>
                    <View style={styles.chipRow}>
                        <OptionChip
                            label="Yes"
                            selected={form.preferences.acRequired}
                            onPress={() => updatePreferences({ acRequired: true })}
                        />
                        <OptionChip
                            label="No"
                            selected={!form.preferences.acRequired}
                            onPress={() => updatePreferences({ acRequired: false })}
                        />
                    </View>

                    <Text style={styles.helperLabel}>Music</Text>
                    <View style={styles.chipRow}>
                        {musicOptions.map((option) => (
                            <OptionChip
                                key={option}
                                label={option}
                                selected={form.preferences.music === option}
                                onPress={() => updatePreferences({ music: option })}
                            />
                        ))}
                    </View>

                    <Text style={styles.helperLabel}>Smoking</Text>
                    <View style={styles.chipRow}>
                        {smokingOptions.map((option) => (
                            <OptionChip
                                key={option}
                                label={option}
                                selected={form.preferences.smoking === option}
                                onPress={() => updatePreferences({ smoking: option })}
                            />
                        ))}
                    </View>

                    <Text style={styles.helperLabel}>Pets Allowed</Text>
                    <View style={styles.chipRow}>
                        <OptionChip
                            label="Yes"
                            selected={form.preferences.petsAllowed}
                            onPress={() => updatePreferences({ petsAllowed: true })}
                        />
                        <OptionChip
                            label="No"
                            selected={!form.preferences.petsAllowed}
                            onPress={() => updatePreferences({ petsAllowed: false })}
                        />
                    </View>

                    <Text style={styles.helperLabel}>Gender Preference</Text>
                    <View style={styles.chipRow}>
                        {genderOptions.map((option) => (
                            <OptionChip
                                key={option}
                                label={option}
                                selected={form.preferences.genderPreference === option}
                                onPress={() => updatePreferences({ genderPreference: option })}
                            />
                        ))}
                    </View>

                    <Input
                        label="Notes"
                        placeholder="e.g. Non-smokers only, Professional vibe"
                        value={form.preferences.notes}
                        onChangeText={(text) => updatePreferences({ notes: text })}
                    />
                </Card>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Recurring Ride</Text>
                    <View style={styles.chipRow}>
                        {recurringOptions.map((option) => (
                            <OptionChip
                                key={option}
                                label={option}
                                selected={form.recurring === option}
                                onPress={() => updateForm({ recurring: option })}
                            />
                        ))}
                    </View>
                </Card>

                <Button
                    title="Review & Post"
                    onPress={() => navigation.navigate('PostRideReview')}
                    disabled={!canContinue}
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
    helperLabel: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: theme.spacing.sm,
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

export default PostRideAllInOneScreen;

