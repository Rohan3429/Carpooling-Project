import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Card } from '../../../components/common/Card';
import { theme } from '../../../theme';
import { OptionChip } from '../../../components/common/OptionChip';
import { usePostRideFlow } from './PostRideFlowContext';
import { DEFAULT_MAP_CENTER } from '../../../config/maps';

interface PostRideOriginScreenProps {
    navigation: any;
}

export const PostRideOriginScreen: React.FC<PostRideOriginScreenProps> = ({ navigation }) => {
    const { form, updateForm } = usePostRideFlow();

    const quickOptions = ['Current Location', 'Home, Gandhinagar', 'Work, Sector 11', 'Saved: Infocity'];

    const canContinue = form.origin.trim().length > 0;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Select Origin Location</Text>
                <Text style={styles.subtitle}>Choose where you will start your ride.</Text>

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
                    label="Search or enter pickup location"
                    placeholder="e.g. Home, Bangalore"
                    value={form.origin}
                    onChangeText={(text) => updateForm({ origin: text })}
                    containerStyle={styles.input}
                />

                <Button
                    title="Next"
                    onPress={() => navigation.navigate('PostRideDestination')}
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

export default PostRideOriginScreen;

