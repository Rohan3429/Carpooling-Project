import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Card } from '../../../components/common/Card';
import { OptionChip } from '../../../components/common/OptionChip';
import { theme } from '../../../theme';
import { DepartureOption, usePassengerRideFlow } from './PassengerRideFlowContext';

interface PassengerDepartureScreenProps {
    navigation: any;
}

export const PassengerDepartureScreen: React.FC<PassengerDepartureScreenProps> = ({ navigation }) => {
    const { form, updateForm } = usePassengerRideFlow();
    const options: DepartureOption[] = ['Leave Now', 'Tomorrow at Time', 'Custom Date & Time'];

    const handleSelect = (option: DepartureOption) => {
        if (option === 'Leave Now') {
            updateForm({ departureOption: option, date: 'Today', time: 'Now' });
        } else if (option === 'Tomorrow at Time') {
            updateForm({ departureOption: option, date: 'Tomorrow', time: '8:00 AM' });
        } else {
            updateForm({ departureOption: option, date: '', time: '' });
        }
    };

    const canContinue = form.date.trim().length > 0 && form.time.trim().length > 0;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Select Departure Time</Text>
                <Text style={styles.subtitle}>Choose when you want to leave.</Text>

                <Card style={styles.card}>
                    <View style={styles.chipRow}>
                        {options.map((option) => (
                            <OptionChip
                                key={option}
                                label={option}
                                selected={form.departureOption === option}
                                onPress={() => handleSelect(option)}
                            />
                        ))}
                    </View>
                </Card>

                {form.departureOption !== 'Leave Now' && (
                    <Card style={styles.card}>
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
                    </Card>
                )}

                <View style={styles.buttonRow}>
                    <Button title="Back" variant="outline" onPress={() => navigation.goBack()} style={styles.button} />
                    <Button
                        title="Next"
                        onPress={() => navigation.navigate('PassengerPassengers')}
                        disabled={!canContinue}
                        style={styles.button}
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

export default PassengerDepartureScreen;

