import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Card } from '../../../components/common/Card';
import { theme } from '../../../theme';
import { OptionChip } from '../../../components/common/OptionChip';
import { usePostRideFlow } from './PostRideFlowContext';

interface PostRideFareScreenProps {
    navigation: any;
}

export const PostRideFareScreen: React.FC<PostRideFareScreenProps> = ({ navigation }) => {
    const { form, updateForm } = usePostRideFlow();
    const fareOptions = [12, 14, 16, 18];

    const fareValue = form.farePerKm > 0 ? String(form.farePerKm) : '';

    const handleFareChange = (text: string) => {
        const numeric = Number(text.replace(/[^0-9.]/g, ''));
        updateForm({ farePerKm: Number.isNaN(numeric) ? 0 : numeric });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Set Fare Per KM</Text>
                <Text style={styles.subtitle}>System suggests ₹12-18 per km. Adjust if needed.</Text>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Suggested fares</Text>
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
                </Card>

                <Input
                    label="Custom fare per km"
                    placeholder="e.g. 14"
                    keyboardType="numeric"
                    value={fareValue}
                    onChangeText={handleFareChange}
                    containerStyle={styles.input}
                />

                <View style={styles.buttonRow}>
                    <Button title="Back" variant="outline" onPress={() => navigation.goBack()} style={styles.button} />
                    <Button
                        title="Next"
                        onPress={() => navigation.navigate('PostRidePreferences')}
                        disabled={form.farePerKm <= 0}
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
    },
    input: {
        marginBottom: theme.spacing.lg,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    button: {
        flex: 1,
    },
});

export default PostRideFareScreen;

