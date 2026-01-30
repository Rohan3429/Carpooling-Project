import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { theme } from '../../../theme';
import { OptionChip } from '../../../components/common/OptionChip';
import { RecurringOption, usePostRideFlow } from './PostRideFlowContext';

interface PostRideRecurringScreenProps {
    navigation: any;
}

export const PostRideRecurringScreen: React.FC<PostRideRecurringScreenProps> = ({ navigation }) => {
    const { form, updateForm } = usePostRideFlow();
    const recurringOptions: RecurringOption[] = ['No', 'Every Weekday', 'Every Monday-Friday'];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Make this recurring?</Text>
                <Text style={styles.subtitle}>Set a recurring schedule if you ride often.</Text>

                <Card style={styles.card}>
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

                <View style={styles.buttonRow}>
                    <Button title="Back" variant="outline" onPress={() => navigation.goBack()} style={styles.button} />
                    <Button title="Next" onPress={() => navigation.navigate('PostRideReview')} style={styles.button} />
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

export default PostRideRecurringScreen;

