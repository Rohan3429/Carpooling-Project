import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Card } from '../../../components/common/Card';
import { OptionChip } from '../../../components/common/OptionChip';
import { theme } from '../../../theme';
import { usePassengerRideFlow } from './PassengerRideFlowContext';
import { DEFAULT_MAP_CENTER } from '../../../config/maps';

interface PassengerOriginScreenProps {
    navigation: any;
}

export const PassengerOriginScreen: React.FC<PassengerOriginScreenProps> = ({ navigation }) => {
    const { form, updateForm } = usePassengerRideFlow();
    const quickOptions = ['Current Location', 'Home, Gandhinagar', 'Saved: Infocity', 'Work, Sector 11'];

    const canContinue = form.origin.trim().length > 0;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Where are you going?</Text>
                <Text style={styles.subtitle}>Start by selecting your pickup location.</Text>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Quick Picks</Text>
                    <View style={styles.chipRow}>
                        {quickOptions.map((option) => (
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
                </Card>

                <Input
                    label="Enter origin"
                    placeholder="e.g. Home, Bangalore"
                    value={form.origin}
                    onChangeText={(text) => updateForm({ origin: text })}
                    containerStyle={styles.input}
                />

                <Button
                    title="Next"
                    onPress={() => navigation.navigate('PassengerDestination')}
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
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    input: {
        marginBottom: theme.spacing.lg,
    },
});

export default PassengerOriginScreen;

