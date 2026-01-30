import React, { useEffect, useMemo, useState } from 'react';
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
import { PaymentMethod } from '../../types';

const paymentTypes: Array<PaymentMethod['type']> = ['wallet', 'card', 'upi'];

const PaymentMethodsScreen: React.FC = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [selectedType, setSelectedType] = useState<PaymentMethod['type']>('card');
    const [setAsDefault, setSetAsDefault] = useState(true);
    const [cardForm, setCardForm] = useState({
        holderName: '',
        cardNumber: '',
        expiry: '',
        cvv: '',
    });
    const [upiForm, setUpiForm] = useState({
        upiId: '',
        label: '',
    });
    const [walletForm, setWalletForm] = useState({
        provider: '',
        mobile: '',
    });

    useEffect(() => {
        if (user?.paymentMethods) {
            setMethods(user.paymentMethods);
        }
    }, [user?.paymentMethods]);

    const handleSaveMethods = async (updatedMethods: PaymentMethod[]) => {
        if (!user?.id) return;
        setIsSaving(true);
        try {
            const updatedUser = await profileApi.updatePaymentMethods(user.id, updatedMethods);
            dispatch(updateProfile(updatedUser));
            setMethods(updatedMethods);
        } catch (error: any) {
            Alert.alert('Update Failed', error?.message || 'Unable to save payment methods.');
        } finally {
            setIsSaving(false);
        }
    };

    const buildNewMethod = (): PaymentMethod | null => {
        if (selectedType === 'card') {
            if (!cardForm.cardNumber || !cardForm.expiry || !cardForm.holderName) {
                Alert.alert('Missing Details', 'Please fill card holder, number, and expiry.');
                return null;
            }
            const masked = cardForm.cardNumber.replace(/\s+/g, '').slice(-4);
            return {
                id: `pm_${Date.now()}`,
                type: 'card',
                name: `Card •••• ${masked}`,
                details: `${cardForm.holderName} • Exp ${cardForm.expiry}`,
                isDefault: setAsDefault,
            };
        }

        if (selectedType === 'upi') {
            if (!upiForm.upiId) {
                Alert.alert('Missing Details', 'Please enter a UPI ID.');
                return null;
            }
            return {
                id: `pm_${Date.now()}`,
                type: 'upi',
                name: upiForm.label ? `${upiForm.label} (UPI)` : 'UPI',
                details: upiForm.upiId,
                isDefault: setAsDefault,
            };
        }

        if (!walletForm.provider || !walletForm.mobile) {
            Alert.alert('Missing Details', 'Please enter wallet provider and mobile number.');
            return null;
        }

        return {
            id: `pm_${Date.now()}`,
            type: 'wallet',
            name: walletForm.provider,
            details: walletForm.mobile,
            isDefault: setAsDefault,
        };
    };

    const handleAddMethod = () => {
        const method = buildNewMethod();
        if (!method) return;

        const updatedMethods = [
            ...methods.map((item) => ({
                ...item,
                isDefault: method.isDefault ? false : item.isDefault,
            })),
            method,
        ];
        handleSaveMethods(updatedMethods);
        setIsAdding(false);
        setSelectedType('card');
        setSetAsDefault(true);
        setCardForm({ holderName: '', cardNumber: '', expiry: '', cvv: '' });
        setUpiForm({ upiId: '', label: '' });
        setWalletForm({ provider: '', mobile: '' });
    };

    const handleRemoveMethod = (index: number) => {
        const updatedMethods = methods.filter((_, idx) => idx !== index);
        handleSaveMethods(updatedMethods);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>Payment Methods</Text>
                {methods.length === 0 && (
                    <Text style={styles.emptyText}>No payment methods yet.</Text>
                )}
                {methods.map((method, index) => (
                    <Card key={`${method.id}-${index}`} style={styles.methodCard}>
                        <View style={styles.methodHeader}>
                            <View>
                                <Text style={styles.methodTitle}>{method.name}</Text>
                                <Text style={styles.methodDetail}>{method.details}</Text>
                            </View>
                            <View style={styles.methodMeta}>
                                <Text style={styles.methodType}>{method.type.toUpperCase()}</Text>
                                {method.isDefault && <Text style={styles.methodDefault}>Default</Text>}
                            </View>
                        </View>
                        <Button
                            title="Remove"
                            onPress={() => handleRemoveMethod(index)}
                            variant="outline"
                            size="small"
                            fullWidth
                            style={styles.removeButton}
                        />
                    </Card>
                ))}

                {isAdding ? (
                    <Card style={styles.addCard}>
                        <Text style={styles.addTitle}>Add Payment Method</Text>
                        <Text style={styles.label}>Select Type</Text>
                        <View style={styles.chipRow}>
                            {paymentTypes.map((option) => (
                                <OptionChip
                                    key={option}
                                    label={option.toUpperCase()}
                                    selected={selectedType === option}
                                    onPress={() => setSelectedType(option)}
                                />
                            ))}
                        </View>

                        {selectedType === 'card' && (
                            <>
                                <Input
                                    label="Card Holder Name"
                                    value={cardForm.holderName}
                                    onChangeText={(value) => setCardForm((prev) => ({ ...prev, holderName: value }))}
                                />
                                <Input
                                    label="Card Number"
                                    value={cardForm.cardNumber}
                                    onChangeText={(value) => setCardForm((prev) => ({ ...prev, cardNumber: value }))}
                                    keyboardType="numeric"
                                />
                                <View style={styles.inlineInputs}>
                                    <View style={styles.inlineInput}>
                                        <Input
                                            label="Expiry (MM/YY)"
                                            value={cardForm.expiry}
                                            onChangeText={(value) => setCardForm((prev) => ({ ...prev, expiry: value }))}
                                        />
                                    </View>
                                    <View style={styles.inlineInput}>
                                        <Input
                                            label="CVV"
                                            value={cardForm.cvv}
                                            onChangeText={(value) => setCardForm((prev) => ({ ...prev, cvv: value }))}
                                            keyboardType="numeric"
                                            secureTextEntry
                                        />
                                    </View>
                                </View>
                            </>
                        )}

                        {selectedType === 'upi' && (
                            <>
                                <Input
                                    label="UPI ID"
                                    value={upiForm.upiId}
                                    onChangeText={(value) => setUpiForm((prev) => ({ ...prev, upiId: value }))}
                                    autoCapitalize="none"
                                />
                                <Input
                                    label="Label (Optional)"
                                    value={upiForm.label}
                                    onChangeText={(value) => setUpiForm((prev) => ({ ...prev, label: value }))}
                                />
                            </>
                        )}

                        {selectedType === 'wallet' && (
                            <>
                                <Input
                                    label="Wallet Provider"
                                    value={walletForm.provider}
                                    onChangeText={(value) => setWalletForm((prev) => ({ ...prev, provider: value }))}
                                />
                                <Input
                                    label="Mobile Number"
                                    value={walletForm.mobile}
                                    onChangeText={(value) => setWalletForm((prev) => ({ ...prev, mobile: value }))}
                                    keyboardType="phone-pad"
                                />
                            </>
                        )}

                        <Text style={styles.label}>Set as default?</Text>
                        <View style={styles.chipRow}>
                            <OptionChip
                                label="Yes"
                                selected={setAsDefault}
                                onPress={() => setSetAsDefault(true)}
                            />
                            <OptionChip
                                label="No"
                                selected={!setAsDefault}
                                onPress={() => setSetAsDefault(false)}
                            />
                        </View>

                        <Button
                            title="Save Method"
                            onPress={handleAddMethod}
                            variant="primary"
                            size="large"
                            fullWidth
                            loading={isSaving}
                            style={styles.saveButton}
                        />
                        <Button
                            title="Cancel"
                            onPress={() => setIsAdding(false)}
                            variant="outline"
                            size="medium"
                            fullWidth
                        />
                    </Card>
                ) : (
                    <Button
                        title="Add Payment Method"
                        onPress={() => setIsAdding(true)}
                        variant="primary"
                        size="large"
                        fullWidth
                        loading={isSaving}
                        style={styles.addButton}
                    />
                )}
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
    methodCard: {
        marginBottom: theme.spacing.md,
    },
    methodHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.sm,
    },
    methodMeta: {
        alignItems: 'flex-end',
    },
    methodType: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textSecondary,
        backgroundColor: theme.colors.backgroundDark,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.full,
        marginBottom: theme.spacing.xs,
    },
    methodDefault: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.primary,
        fontWeight: theme.typography.fontWeight.semiBold,
    },
    methodTitle: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.semiBold,
        marginBottom: theme.spacing.xs,
    },
    methodDetail: {
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    removeButton: {
        marginTop: theme.spacing.sm,
    },
    addCard: {
        marginTop: theme.spacing.lg,
    },
    addTitle: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.semiBold,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
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
    inlineInputs: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    inlineInput: {
        flex: 1,
    },
    saveButton: {
        marginBottom: theme.spacing.sm,
    },
    addButton: {
        marginTop: theme.spacing.lg,
    },
});

export default PaymentMethodsScreen;

