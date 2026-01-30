import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { updateProfile } from '../../store/slices/authSlice';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { OptionChip } from '../../components/common/OptionChip';
import { theme } from '../../theme';
import { profileApi } from '../../services/profileApi';

const genders = ['Male', 'Female', 'Other'];

const EditProfileScreen: React.FC = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        gender: '',
        preferences: '',
        profilePhotoUrl: '',
    });

    useEffect(() => {
        if (!user) return;
        setFormData({
            name: user.name || '',
            phone: user.phone || '',
            gender: user.gender || '',
            preferences: user.preferences || '',
            profilePhotoUrl: user.profilePhoto || '',
        });
    }, [user]);

    const handleSave = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const updatedUser = await profileApi.updateProfile(user.id, {
                name: formData.name,
                phone: formData.phone,
                gender: formData.gender,
                preferences: formData.preferences,
                profilePhotoUrl: formData.profilePhotoUrl,
            });
            dispatch(updateProfile(updatedUser));
            Alert.alert('Profile Updated', 'Your profile details are saved.');
        } catch (error: any) {
            Alert.alert('Update Failed', error?.message || 'Unable to update profile.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>Personal Details</Text>
                <Input
                    label="Full Name"
                    value={formData.name}
                    onChangeText={(value) => setFormData((prev) => ({ ...prev, name: value }))}
                />
                <Input
                    label="Phone"
                    value={formData.phone}
                    onChangeText={(value) => setFormData((prev) => ({ ...prev, phone: value }))}
                    keyboardType="phone-pad"
                />
                <Input
                    label="Profile Photo URL"
                    value={formData.profilePhotoUrl}
                    onChangeText={(value) => setFormData((prev) => ({ ...prev, profilePhotoUrl: value }))}
                />

                <Text style={styles.sectionTitle}>Gender</Text>
                <View style={styles.chipRow}>
                    {genders.map((option) => (
                        <OptionChip
                            key={option}
                            label={option}
                            selected={formData.gender === option}
                            onPress={() => setFormData((prev) => ({ ...prev, gender: option }))}
                        />
                    ))}
                </View>

                <Input
                    label="Preferences"
                    value={formData.preferences}
                    onChangeText={(value) => setFormData((prev) => ({ ...prev, preferences: value }))}
                    multiline
                />

                <Button
                    title="Save Changes"
                    onPress={handleSave}
                    variant="primary"
                    size="large"
                    fullWidth
                    loading={isLoading}
                    style={styles.saveButton}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        padding: theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.semiBold,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: theme.spacing.md,
    },
    saveButton: {
        marginTop: theme.spacing.md,
    },
});

export default EditProfileScreen;

