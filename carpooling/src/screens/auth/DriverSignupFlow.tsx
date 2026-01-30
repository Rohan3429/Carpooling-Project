import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { OptionChip } from '../../components/common/OptionChip';
import { theme } from '../../theme';
import { authApi } from '../../services/authApi';
import { loginFailure, loginSuccess } from '../../store/slices/authSlice';
import { User } from '../../types';

type VerificationMode = 'auto' | 'manual';

const DriverSignupFlow: React.FC<{ navigation: any }> = ({ navigation }) => {
    const dispatch = useDispatch();
    const [step, setStep] = useState(0);
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [verificationMode, setVerificationMode] = useState<VerificationMode>('auto');
    const [registeredUser, setRegisteredUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        photoNote: '',
        gender: 'Male',
        preferences: '',
        licenseNumber: '',
        licenseUploadName: '',
        vehicleType: 'sedan',
        vehicleMake: '',
        vehicleModel: '',
        vehicleColor: '',
        plateNumber: '',
        vehicleYear: '',
        bankAccountName: '',
        bankName: '',
        accountNumber: '',
        ifsc: '',
    });
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    const steps = useMemo(
        () => [
            'Account details',
            'Profile details',
            'Driving license',
            'Vehicle details',
            'Bank account',
            'Profile review',
        ],
        []
    );

    const updateField = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setSubmitError('');
    };

    const validateAccount = () => {
        const nextErrors = {
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
        };
        let isValid = true;

        if (!formData.name.trim()) {
            nextErrors.name = 'Name is required';
            isValid = false;
        }

        if (!formData.email.trim()) {
            nextErrors.email = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            nextErrors.email = 'Email is invalid';
            isValid = false;
        }

        if (!formData.phone.trim()) {
            nextErrors.phone = 'Phone number is required';
            isValid = false;
        }

        if (!formData.password) {
            nextErrors.password = 'Password is required';
            isValid = false;
        } else if (formData.password.length < 6) {
            nextErrors.password = 'Password must be at least 6 characters';
            isValid = false;
        }

        if (formData.password !== formData.confirmPassword) {
            nextErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setErrors(nextErrors);
        return isValid;
    };

    const handleNext = () => {
        if (step === 0 && !validateAccount()) {
            return;
        }
        if (step < steps.length - 1) {
            setStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep((prev) => prev - 1);
        }
    };

    const handleUploadStub = (field: 'licenseUploadName' | 'photoNote') => {
        updateField(field, 'Uploaded');
        Alert.alert('Upload', 'Document upload will be added later.');
    };

    const handleSubmitProfile = async () => {
        setIsSubmitting(true);
        setSubmitError('');
        try {
            const verificationStatus = verificationMode === 'auto' ? 'active' : 'pending';
            const user = await authApi.registerDriver({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                gender: formData.gender,
                preferences: formData.preferences,
                profilePhotoUrl: formData.photoNote,
                driverProfile: {
                    licenseNumber: formData.licenseNumber,
                    licenseUploadUrl: formData.licenseUploadName,
                    bankAccountName: formData.bankAccountName,
                    bankName: formData.bankName,
                    accountNumber: formData.accountNumber,
                    ifsc: formData.ifsc,
                    verificationStatus,
                },
                vehicles: [
                    {
                        type: formData.vehicleType,
                        make: formData.vehicleMake,
                        model: formData.vehicleModel,
                        color: formData.vehicleColor,
                        plateNumber: formData.plateNumber,
                        year: Number(formData.vehicleYear) || new Date().getFullYear(),
                        hasAC: true,
                    },
                ],
                paymentMethods: [],
            });
            setRegisteredUser(user);
            setStep(steps.length);
        } catch (error: any) {
            const message = error?.message || 'Driver signup failed';
            setSubmitError(message);
            dispatch(loginFailure(message));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoToDashboard = () => {
        if (registeredUser) {
            dispatch(loginSuccess(registeredUser));
        } else {
            navigation.navigate('Login');
        }
    };

    const renderStepHeader = () => (
        <View style={styles.stepHeader}>
            <Text style={styles.stepIndicator}>
                Step {Math.min(step + 1, steps.length)} of {steps.length}
            </Text>
            <Text style={styles.stepTitle}>
                {step < steps.length ? steps[step] : 'Verification status'}
            </Text>
        </View>
    );

    const renderAccountStep = () => (
        <>
            <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
                error={errors.name}
                required
            />
            <Input
                label="Phone Number"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChangeText={(value) => updateField('phone', value)}
                keyboardType="phone-pad"
                error={errors.phone}
                required
            />
            <Input
                label="Email"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(value) => updateField('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                required
            />
            <Input
                label="Password"
                placeholder="Create a password"
                value={formData.password}
                onChangeText={(value) => updateField('password', value)}
                secureTextEntry
                error={errors.password}
                required
            />
            <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(value) => updateField('confirmPassword', value)}
                secureTextEntry
                error={errors.confirmPassword}
                required
            />
        </>
    );

    const renderProfileStep = () => (
        <>
            <Input
                label="Photo"
                placeholder="Upload your profile photo"
                value={formData.photoNote}
                onChangeText={(value) => updateField('photoNote', value)}
            />
            <Button
                title="Upload Photo"
                onPress={() => handleUploadStub('photoNote')}
                variant="outline"
                size="small"
                fullWidth
                style={styles.inlineButton}
            />
            <Text style={styles.sectionLabel}>Gender</Text>
            <View style={styles.chipRow}>
                {['Male', 'Female', 'Other'].map((option) => (
                    <OptionChip
                        key={option}
                        label={option}
                        selected={formData.gender === option}
                        onPress={() => updateField('gender', option)}
                    />
                ))}
            </View>
            <Input
                label="Preferences"
                placeholder="Any ride preferences"
                value={formData.preferences}
                onChangeText={(value) => updateField('preferences', value)}
                multiline
            />
        </>
    );

    const renderLicenseStep = () => (
        <>
            <Input
                label="License Number"
                placeholder="Enter license number"
                value={formData.licenseNumber}
                onChangeText={(value) => updateField('licenseNumber', value)}
            />
            <Input
                label="License Upload"
                placeholder="Upload license document"
                value={formData.licenseUploadName}
                onChangeText={(value) => updateField('licenseUploadName', value)}
            />
            <Button
                title="Upload License"
                onPress={() => handleUploadStub('licenseUploadName')}
                variant="outline"
                size="small"
                fullWidth
                style={styles.inlineButton}
            />
        </>
    );

    const renderVehicleStep = () => (
        <>
            <Text style={styles.sectionLabel}>Vehicle Type</Text>
            <View style={styles.chipRow}>
                {['hatchback', 'sedan', 'suv'].map((option) => (
                    <OptionChip
                        key={option}
                        label={option.toUpperCase()}
                        selected={formData.vehicleType === option}
                        onPress={() => updateField('vehicleType', option)}
                    />
                ))}
            </View>
            <Input
                label="Make"
                placeholder="e.g. Toyota"
                value={formData.vehicleMake}
                onChangeText={(value) => updateField('vehicleMake', value)}
            />
            <Input
                label="Model"
                placeholder="e.g. Corolla"
                value={formData.vehicleModel}
                onChangeText={(value) => updateField('vehicleModel', value)}
            />
            <Input
                label="Color"
                placeholder="e.g. White"
                value={formData.vehicleColor}
                onChangeText={(value) => updateField('vehicleColor', value)}
            />
            <Input
                label="Plate Number"
                placeholder="e.g. MH01AB1234"
                value={formData.plateNumber}
                onChangeText={(value) => updateField('plateNumber', value)}
                autoCapitalize="characters"
            />
            <Input
                label="Year"
                placeholder="e.g. 2020"
                value={formData.vehicleYear}
                onChangeText={(value) => updateField('vehicleYear', value)}
                keyboardType="numeric"
            />
        </>
    );

    const renderBankStep = () => (
        <>
            <Input
                label="Account Holder Name"
                placeholder="Enter account holder name"
                value={formData.bankAccountName}
                onChangeText={(value) => updateField('bankAccountName', value)}
            />
            <Input
                label="Bank Name"
                placeholder="Enter bank name"
                value={formData.bankName}
                onChangeText={(value) => updateField('bankName', value)}
            />
            <Input
                label="Account Number"
                placeholder="Enter account number"
                value={formData.accountNumber}
                onChangeText={(value) => updateField('accountNumber', value)}
                keyboardType="numeric"
            />
            <Input
                label="IFSC Code"
                placeholder="Enter IFSC code"
                value={formData.ifsc}
                onChangeText={(value) => updateField('ifsc', value)}
                autoCapitalize="characters"
            />
        </>
    );

    const renderReviewStep = () => (
        <>
            <View style={styles.reviewCard}>
                <Text style={styles.reviewTitle}>Profile Summary</Text>
                <Text style={styles.reviewItem}>Name: {formData.name || '-'}</Text>
                <Text style={styles.reviewItem}>Email: {formData.email || '-'}</Text>
                <Text style={styles.reviewItem}>Phone: {formData.phone || '-'}</Text>
                <Text style={styles.reviewItem}>Gender: {formData.gender || '-'}</Text>
                <Text style={styles.reviewItem}>
                    License: {formData.licenseNumber || '-'}
                </Text>
                <Text style={styles.reviewItem}>
                    Vehicle: {formData.vehicleMake || '-'} {formData.vehicleModel || ''}
                </Text>
                <Text style={styles.reviewItem}>
                    Bank: {formData.bankName || '-'}
                </Text>
            </View>
            <Text style={styles.sectionLabel}>Verification</Text>
            <View style={styles.chipRow}>
                <OptionChip
                    label="Auto-verify"
                    selected={verificationMode === 'auto'}
                    onPress={() => setVerificationMode('auto')}
                />
                <OptionChip
                    label="Manual review"
                    selected={verificationMode === 'manual'}
                    onPress={() => setVerificationMode('manual')}
                />
            </View>
            {!!submitError && <Text style={styles.submitError}>{submitError}</Text>}
            <Button
                title="Submit Profile"
                onPress={handleSubmitProfile}
                variant="primary"
                size="large"
                fullWidth
                loading={isSubmitting}
                style={styles.primaryButton}
            />
        </>
    );

    const renderStatusStep = () => (
        <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>
                {verificationMode === 'auto'
                    ? 'Profile Active - Ready to Drive'
                    : 'Pending - Under Review'}
            </Text>
            <Text style={styles.statusSubtitle}>
                {verificationMode === 'auto'
                    ? 'All documents passed. You can start posting rides.'
                    : 'We are verifying your documents. We will notify you soon.'}
            </Text>
            <Button
                title="Go to Dashboard"
                onPress={handleGoToDashboard}
                variant="primary"
                size="large"
                fullWidth
                style={styles.primaryButton}
            />
        </View>
    );

    const renderStepContent = () => {
        if (step === steps.length) {
            return renderStatusStep();
        }

        switch (step) {
            case 0:
                return renderAccountStep();
            case 1:
                return renderProfileStep();
            case 2:
                return renderLicenseStep();
            case 3:
                return renderVehicleStep();
            case 4:
                return renderBankStep();
            case 5:
                return renderReviewStep();
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {renderStepHeader()}
                    <View style={styles.form}>{renderStepContent()}</View>
                    {step < steps.length && (
                        <View style={styles.actions}>
                            {step > 0 && (
                                <Button
                                    title="Back"
                                    onPress={handleBack}
                                    variant="outline"
                                    size="small"
                                    fullWidth
                                />
                            )}
                            {step < steps.length - 1 && (
                                <Button
                                    title="Continue"
                                    onPress={handleNext}
                                    variant="primary"
                                    size="large"
                                    fullWidth
                                    style={styles.primaryButton}
                                />
                            )}
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.xl,
    },
    stepHeader: {
        marginBottom: theme.spacing.lg,
    },
    stepIndicator: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    stepTitle: {
        fontSize: theme.typography.fontSize['2xl'],
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text,
        marginTop: theme.spacing.xs,
    },
    form: {
        flex: 1,
        gap: theme.spacing.md,
    },
    actions: {
        marginTop: theme.spacing.lg,
        gap: theme.spacing.md,
    },
    sectionLabel: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text,
        fontWeight: theme.typography.fontWeight.semiBold,
        marginTop: theme.spacing.sm,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: theme.spacing.sm,
    },
    inlineButton: {
        marginBottom: theme.spacing.md,
    },
    reviewCard: {
        backgroundColor: theme.colors.backgroundDark,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    reviewTitle: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.semiBold,
        marginBottom: theme.spacing.sm,
    },
    reviewItem: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    submitError: {
        color: theme.colors.error,
        textAlign: 'center',
        marginVertical: theme.spacing.sm,
    },
    statusCard: {
        backgroundColor: theme.colors.backgroundDark,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    statusTitle: {
        fontSize: theme.typography.fontSize.xl,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text,
        textAlign: 'center',
    },
    statusSubtitle: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    primaryButton: {
        marginTop: theme.spacing.sm,
    },
});

export default DriverSignupFlow;

