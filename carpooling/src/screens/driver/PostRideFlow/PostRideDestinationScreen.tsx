import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Card } from '../../../components/common/Card';
import { theme } from '../../../theme';
import { OptionChip } from '../../../components/common/OptionChip';
import { usePostRideFlow } from './PostRideFlowContext';

interface PostRideDestinationScreenProps {
    navigation: any;
}

export const PostRideDestinationScreen: React.FC<PostRideDestinationScreenProps> = ({ navigation }) => {
    const { form, updateForm } = usePostRideFlow();

    const quickOptions = ['Tech Park, Whitefield', 'Office, Koramangala', 'Airport, Bangalore', 'Recent: HSR Layout'];

    const canContinue = form.destination.trim().length > 0;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Select Destination</Text>
                <Text style={styles.subtitle}>Where are you heading?</Text>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Quick Picks</Text>
                    <View style={styles.chipRow}>
                        {quickOptions.map((option) => (
                            <OptionChip
                                key={option}
                                label={option}
                                selected={form.destination === option}
                                onPress={() => updateForm({ destination: option })}
                            />
                        ))}
                    </View>
                </Card>

                <Input
                    label="Search or enter drop location"
                    placeholder="e.g. Tech Park, Whitefield"
                    value={form.destination}
                    onChangeText={(text) => updateForm({ destination: text })}
                    containerStyle={styles.input}
                />

                <View style={styles.buttonRow}>
                    <Button title="Back" variant="outline" onPress={() => navigation.goBack()} style={styles.button} />
                    <Button
                        title="Next"
                        onPress={() => navigation.navigate('PostRideDateTime')}
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

export default PostRideDestinationScreen;

