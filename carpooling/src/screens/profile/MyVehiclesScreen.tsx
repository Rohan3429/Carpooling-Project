import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { updateProfile } from '../../store/slices/authSlice';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { OptionChip } from '../../components/common/OptionChip';
import { Card } from '../../components/common/Card';
import { theme } from '../../theme';
import { profileApi } from '../../services/profileApi';
import { VehicleDetails } from '../../types';

const vehicleTypes = ['hatchback', 'sedan', 'suv'];

const MyVehiclesScreen: React.FC = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const [vehicles, setVehicles] = useState<VehicleDetails[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [newVehicle, setNewVehicle] = useState<VehicleDetails>({
        type: 'sedan',
        make: '',
        model: '',
        color: '',
        plateNumber: '',
        year: new Date().getFullYear(),
        hasAC: true,
    });

    useEffect(() => {
        if (user?.vehicles) {
            setVehicles(user.vehicles);
        }
    }, [user?.vehicles]);

    const handleSaveVehicles = async (updatedVehicles: VehicleDetails[]) => {
        if (!user?.id) return;
        setIsSaving(true);
        try {
            const updatedUser = await profileApi.updateVehicles(user.id, updatedVehicles);
            dispatch(updateProfile(updatedUser));
            setVehicles(updatedVehicles);
        } catch (error: any) {
            Alert.alert('Update Failed', error?.message || 'Unable to save vehicles.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddVehicle = () => {
        const updatedVehicles = [...vehicles, newVehicle];
        handleSaveVehicles(updatedVehicles);
        setNewVehicle({
            type: 'sedan',
            make: '',
            model: '',
            color: '',
            plateNumber: '',
            year: new Date().getFullYear(),
            hasAC: true,
        });
    };

    const handleRemoveVehicle = (index: number) => {
        const updatedVehicles = vehicles.filter((_, idx) => idx !== index);
        handleSaveVehicles(updatedVehicles);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>Your Vehicles</Text>
                {vehicles.length === 0 && (
                    <Text style={styles.emptyText}>No vehicles added yet.</Text>
                )}
                {vehicles.map((vehicle, index) => (
                    <Card key={`${vehicle.plateNumber}-${index}`} style={styles.vehicleCard}>
                        <Text style={styles.vehicleTitle}>
                            {vehicle.make} {vehicle.model}
                        </Text>
                        <Text style={styles.vehicleDetail}>Type: {vehicle.type}</Text>
                        <Text style={styles.vehicleDetail}>Plate: {vehicle.plateNumber}</Text>
                        <Text style={styles.vehicleDetail}>Color: {vehicle.color}</Text>
                        <Text style={styles.vehicleDetail}>Year: {vehicle.year}</Text>
                        <Button
                            title="Remove"
                            onPress={() => handleRemoveVehicle(index)}
                            variant="outline"
                            size="small"
                            fullWidth
                            style={styles.removeButton}
                        />
                    </Card>
                ))}

                <Text style={styles.sectionTitle}>Add Vehicle</Text>
                <Text style={styles.label}>Vehicle Type</Text>
                <View style={styles.chipRow}>
                    {vehicleTypes.map((option) => (
                        <OptionChip
                            key={option}
                            label={option.toUpperCase()}
                            selected={newVehicle.type === option}
                            onPress={() => setNewVehicle((prev) => ({ ...prev, type: option }))}
                        />
                    ))}
                </View>
                <Input
                    label="Make"
                    value={newVehicle.make}
                    onChangeText={(value) => setNewVehicle((prev) => ({ ...prev, make: value }))}
                />
                <Input
                    label="Model"
                    value={newVehicle.model}
                    onChangeText={(value) => setNewVehicle((prev) => ({ ...prev, model: value }))}
                />
                <Input
                    label="Color"
                    value={newVehicle.color}
                    onChangeText={(value) => setNewVehicle((prev) => ({ ...prev, color: value }))}
                />
                <Input
                    label="Plate Number"
                    value={newVehicle.plateNumber}
                    onChangeText={(value) => setNewVehicle((prev) => ({ ...prev, plateNumber: value }))}
                    autoCapitalize="characters"
                />
                <Input
                    label="Year"
                    value={String(newVehicle.year)}
                    onChangeText={(value) =>
                        setNewVehicle((prev) => ({ ...prev, year: Number(value) || prev.year }))
                    }
                    keyboardType="numeric"
                />
                <Text style={styles.label}>AC Available?</Text>
                <View style={styles.chipRow}>
                    <OptionChip
                        label="Yes"
                        selected={newVehicle.hasAC}
                        onPress={() => setNewVehicle((prev) => ({ ...prev, hasAC: true }))}
                    />
                    <OptionChip
                        label="No"
                        selected={!newVehicle.hasAC}
                        onPress={() => setNewVehicle((prev) => ({ ...prev, hasAC: false }))}
                    />
                </View>

                <Button
                    title="Save Vehicle"
                    onPress={handleAddVehicle}
                    variant="primary"
                    size="large"
                    fullWidth
                    loading={isSaving}
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
    emptyText: {
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.md,
    },
    vehicleCard: {
        marginBottom: theme.spacing.md,
    },
    vehicleTitle: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.semiBold,
        marginBottom: theme.spacing.xs,
    },
    vehicleDetail: {
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    removeButton: {
        marginTop: theme.spacing.sm,
    },
    label: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: theme.spacing.md,
    },
});

export default MyVehiclesScreen;

