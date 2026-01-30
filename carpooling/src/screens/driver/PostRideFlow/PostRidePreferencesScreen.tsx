import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Card } from '../../../components/common/Card';
import { theme } from '../../../theme';
import { OptionChip } from '../../../components/common/OptionChip';
import { GenderPreference, MusicPreference, SmokingPreference, usePostRideFlow } from './PostRideFlowContext';

interface PostRidePreferencesScreenProps {
    navigation: any;
}

export const PostRidePreferencesScreen: React.FC<PostRidePreferencesScreenProps> = ({ navigation }) => {
    const { form, updatePreferences } = usePostRideFlow();
    const { preferences } = form;

    const musicOptions: MusicPreference[] = ['Bollywood', 'English', 'Podcasts', 'None'];
    const smokingOptions: SmokingPreference[] = ['Yes', 'No', 'Only Outside'];
    const genderOptions: GenderPreference[] = ['Any', 'Female Only', 'Male Only'];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Add Preferences</Text>
                <Text style={styles.subtitle}>Help passengers know your ride preferences.</Text>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>A/C Required?</Text>
                    <View style={styles.chipRow}>
                        <OptionChip
                            label="Yes"
                            selected={preferences.acRequired}
                            onPress={() => updatePreferences({ acRequired: true })}
                        />
                        <OptionChip
                            label="No"
                            selected={!preferences.acRequired}
                            onPress={() => updatePreferences({ acRequired: false })}
                        />
                    </View>
                </Card>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Music</Text>
                    <View style={styles.chipRow}>
                        {musicOptions.map((option) => (
                            <OptionChip
                                key={option}
                                label={option}
                                selected={preferences.music === option}
                                onPress={() => updatePreferences({ music: option })}
                            />
                        ))}
                    </View>
                </Card>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Smoking?</Text>
                    <View style={styles.chipRow}>
                        {smokingOptions.map((option) => (
                            <OptionChip
                                key={option}
                                label={option}
                                selected={preferences.smoking === option}
                                onPress={() => updatePreferences({ smoking: option })}
                            />
                        ))}
                    </View>
                </Card>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Pets Allowed?</Text>
                    <View style={styles.chipRow}>
                        <OptionChip
                            label="Yes"
                            selected={preferences.petsAllowed}
                            onPress={() => updatePreferences({ petsAllowed: true })}
                        />
                        <OptionChip
                            label="No"
                            selected={!preferences.petsAllowed}
                            onPress={() => updatePreferences({ petsAllowed: false })}
                        />
                    </View>
                </Card>

                <Card style={styles.card}>
                    <Text style={styles.sectionTitle}>Gender Preference?</Text>
                    <View style={styles.chipRow}>
                        {genderOptions.map((option) => (
                            <OptionChip
                                key={option}
                                label={option}
                                selected={preferences.genderPreference === option}
                                onPress={() => updatePreferences({ genderPreference: option })}
                            />
                        ))}
                    </View>
                </Card>

                <Input
                    label="Notes"
                    placeholder="e.g. Non-smokers only, Professional vibe"
                    value={preferences.notes}
                    onChangeText={(text) => updatePreferences({ notes: text })}
                    containerStyle={styles.input}
                />

                <View style={styles.buttonRow}>
                    <Button title="Back" variant="outline" onPress={() => navigation.goBack()} style={styles.button} />
                    <Button title="Next" onPress={() => navigation.navigate('PostRideRecurring')} style={styles.button} />
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

export default PostRidePreferencesScreen;

