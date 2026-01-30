import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { theme } from '../../../theme';
import { OptionChip } from '../../../components/common/OptionChip';
import { usePostRideFlow } from './PostRideFlowContext';

interface PostRideSeatsScreenProps {
    navigation: any;
}

export const PostRideSeatsScreen: React.FC<PostRideSeatsScreenProps> = ({ navigation }) => {
    const { form, updateForm } = usePostRideFlow();
    const seatOptions = [1, 2, 3, 4, 5];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>How many seats available?</Text>
                <Text style={styles.subtitle}>Seats available for passengers (driver excluded).</Text>

                <Card style={styles.card}>
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

                <View style={styles.buttonRow}>
                    <Button title="Back" variant="outline" onPress={() => navigation.goBack()} style={styles.button} />
                    <Button title="Next" onPress={() => navigation.navigate('PostRideFare')} style={styles.button} />
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

export default PostRideSeatsScreen;

