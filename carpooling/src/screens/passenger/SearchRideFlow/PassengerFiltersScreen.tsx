import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Card } from '../../../components/common/Card';
import { OptionChip } from '../../../components/common/OptionChip';
import { theme } from '../../../theme';
import {
    DriverRatingFilter,
    GenderFilter,
    MusicFilter,
    SmokingFilter,
    VehicleTypeFilter,
    usePassengerRideFlow,
} from './PassengerRideFlowContext';

interface PassengerFiltersScreenProps {
    navigation: any;
}

export const PassengerFiltersScreen: React.FC<PassengerFiltersScreenProps> = ({ navigation }) => {
    const { form, updateFilters } = usePassengerRideFlow();
    const { filters } = form;

    const vehicleTypes: VehicleTypeFilter[] = ['Any', 'Hatchback', 'Sedan', 'SUV'];
    const ratingOptions: DriverRatingFilter[] = ['Any', '4.0+', '4.5+', '4.8+'];
    const musicOptions: MusicFilter[] = ['Any', 'Bollywood', 'English', 'Podcasts', 'None'];
    const smokingOptions: SmokingFilter[] = ['Any', 'No', 'Yes'];
    const genderOptions: GenderFilter[] = ['Any', 'Female Only', 'Male Only'];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Optional Filters</Text>
                <Text style={styles.subtitle}>Narrow down rides to your preferences.</Text>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Price Range (₹)</Text>
                    <View style={styles.rangeRow}>
                        <Input
                            placeholder="Min"
                            keyboardType="numeric"
                            value={String(filters.priceMin)}
                            onChangeText={(text) => updateFilters({ priceMin: Number(text) || 0 })}
                            containerStyle={styles.rangeInput}
                        />
                        <Input
                            placeholder="Max"
                            keyboardType="numeric"
                            value={String(filters.priceMax)}
                            onChangeText={(text) => updateFilters({ priceMax: Number(text) || 0 })}
                            containerStyle={styles.rangeInput}
                        />
                    </View>
                </Card>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Vehicle Type</Text>
                    <View style={styles.chipRow}>
                        {vehicleTypes.map((option) => (
                            <OptionChip
                                key={option}
                                label={option}
                                selected={filters.vehicleType === option}
                                onPress={() => updateFilters({ vehicleType: option })}
                            />
                        ))}
                    </View>
                </Card>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Driver Rating</Text>
                    <View style={styles.chipRow}>
                        {ratingOptions.map((option) => (
                            <OptionChip
                                key={option}
                                label={option}
                                selected={filters.driverRating === option}
                                onPress={() => updateFilters({ driverRating: option })}
                            />
                        ))}
                    </View>
                </Card>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <Text style={styles.fieldLabel}>A/C Required?</Text>
                    <View style={styles.chipRow}>
                        <OptionChip
                            label="Any"
                            selected={!filters.hasAC}
                            onPress={() => updateFilters({ hasAC: false })}
                        />
                        <OptionChip
                            label="Yes"
                            selected={filters.hasAC}
                            onPress={() => updateFilters({ hasAC: true })}
                        />
                    </View>

                    <Text style={styles.fieldLabel}>Music Type</Text>
                    <View style={styles.chipRow}>
                        {musicOptions.map((option) => (
                            <OptionChip
                                key={option}
                                label={option}
                                selected={filters.musicType === option}
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
                                selected={filters.smokingPreference === option}
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
                                selected={filters.genderPreference === option}
                                onPress={() => updateFilters({ genderPreference: option })}
                            />
                        ))}
                    </View>
                </Card>

                <View style={styles.buttonRow}>
                    <Button title="Back" variant="outline" onPress={() => navigation.goBack()} style={styles.button} />
                    <Button title="Apply Filters" onPress={() => navigation.navigate('PassengerResults')} style={styles.button} />
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
    buttonRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    button: {
        flex: 1,
    },
});

export default PassengerFiltersScreen;

