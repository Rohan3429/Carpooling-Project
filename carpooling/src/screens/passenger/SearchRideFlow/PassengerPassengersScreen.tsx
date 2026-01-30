import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { OptionChip } from '../../../components/common/OptionChip';
import { theme } from '../../../theme';
import { usePassengerRideFlow } from './PassengerRideFlowContext';

interface PassengerPassengersScreenProps {
    navigation: any;
}

export const PassengerPassengersScreen: React.FC<PassengerPassengersScreenProps> = ({ navigation }) => {
    const { form, updateForm } = usePassengerRideFlow();
    const passengerOptions = [1, 2, 3, 4, 5];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Number of Passengers</Text>
                <Text style={styles.subtitle}>How many seats do you need?</Text>

                <Card style={styles.card}>
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

                <View style={styles.buttonRow}>
                    <Button title="Back" variant="outline" onPress={() => navigation.goBack()} style={styles.button} />
                    <Button title="Next" onPress={() => navigation.navigate('PassengerFilters')} style={styles.button} />
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
        marginBottom: theme.spacing.lg,
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
});

export default PassengerPassengersScreen;

