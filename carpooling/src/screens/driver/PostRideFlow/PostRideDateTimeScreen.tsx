import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Card } from '../../../components/common/Card';
import { theme } from '../../../theme';
import { OptionChip } from '../../../components/common/OptionChip';
import { DateOption, TimeOption, usePostRideFlow } from './PostRideFlowContext';

interface PostRideDateTimeScreenProps {
    navigation: any;
}

export const PostRideDateTimeScreen: React.FC<PostRideDateTimeScreenProps> = ({ navigation }) => {
    const { form, updateForm } = usePostRideFlow();

    const dateOptions: DateOption[] = ['Today', 'Tomorrow', 'Custom'];
    const timeOptions: TimeOption[] = ['8:00 AM', '8:30 AM', '9:00 AM', '6:00 PM', '7:00 PM', 'Custom'];

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

    const canContinue = form.date.trim().length > 0 && form.time.trim().length > 0;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Select Date & Time</Text>
                <Text style={styles.subtitle}>Pick when you want to start the ride.</Text>

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

                <View style={styles.buttonRow}>
                    <Button title="Back" variant="outline" onPress={() => navigation.goBack()} style={styles.button} />
                    <Button
                        title="Next"
                        onPress={() => navigation.navigate('PostRideSeats')}
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
    sectionTitle: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.semiBold,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: theme.spacing.sm,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    button: {
        flex: 1,
    },
});

export default PostRideDateTimeScreen;

