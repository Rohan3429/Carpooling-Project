import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { updateProfile } from '../../store/slices/authSlice';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { theme } from '../../theme';
import { profileApi } from '../../services/profileApi';
import { UserSettings } from '../../types';

const SettingsScreen: React.FC = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const [settings, setSettings] = useState<UserSettings>({
        notificationsEnabled: true,
        marketingUpdates: false,
        darkMode: false,
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user?.settings) {
            setSettings(user.settings);
        }
    }, [user?.settings]);

    const handleSave = async () => {
        if (!user?.id) return;
        setIsSaving(true);
        try {
            const updatedUser = await profileApi.updateSettings(user.id, settings);
            dispatch(updateProfile(updatedUser));
            Alert.alert('Settings Saved', 'Your settings have been updated.');
        } catch (error: any) {
            Alert.alert('Update Failed', error?.message || 'Unable to save settings.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Card style={styles.card}>
                <View style={styles.row}>
                    <Text style={styles.label}>Notifications</Text>
                    <Switch
                        value={settings.notificationsEnabled}
                        onValueChange={(value) => setSettings((prev) => ({ ...prev, notificationsEnabled: value }))}
                    />
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Marketing Updates</Text>
                    <Switch
                        value={settings.marketingUpdates}
                        onValueChange={(value) => setSettings((prev) => ({ ...prev, marketingUpdates: value }))}
                    />
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Dark Mode</Text>
                    <Switch
                        value={settings.darkMode}
                        onValueChange={(value) => setSettings((prev) => ({ ...prev, darkMode: value }))}
                    />
                </View>
            </Card>

            <Button
                title="Save Settings"
                onPress={handleSave}
                variant="primary"
                size="large"
                fullWidth
                loading={isSaving}
                style={styles.saveButton}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.lg,
    },
    card: {
        marginBottom: theme.spacing.lg,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
    },
    label: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text,
    },
    saveButton: {
        marginTop: theme.spacing.md,
    },
});

export default SettingsScreen;

