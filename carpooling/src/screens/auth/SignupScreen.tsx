import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { theme } from '../../theme';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import { authApi } from '../../services/authApi';

interface SignupScreenProps {
    navigation: any;
    route?: { params?: { userType?: 'driver' | 'passenger' } };
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [submitError, setSubmitError] = useState('');
    const [isCheckingHealth, setIsCheckingHealth] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (route?.params?.userType === 'driver') {
            navigation.replace('DriverSignup');
        }
    }, [route?.params?.userType]);

    const updateField = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
        setErrors({ ...errors, [field]: '' });
        setSubmitError('');
    };

    const validate = (): boolean => {
        const newErrors = {
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
        };
        let isValid = true;

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
            isValid = false;
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
            isValid = false;
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
            isValid = false;
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            isValid = false;
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSignup = async () => {
        // if (!validate()) return;

        setIsLoading(true);
        dispatch(loginStart());
        setSubmitError('');

        try {
            const user = await authApi.register(
                formData.name,
                formData.email,
                formData.phone,
                formData.password,
                'passenger'
            );
            dispatch(loginSuccess(user));
        } catch (error: any) {
            const message = error?.message || 'Signup failed';
            dispatch(loginFailure(message));
            setSubmitError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHealthCheck = async () => {
        setIsCheckingHealth(true);
        try {
            const result = await authApi.healthCheck();
            Alert.alert('Backend OK', `Status: ${result.status}\nTime: ${result.timeUtc}`);
        } catch (error: any) {
            const message = error?.message || 'Health check failed';
            setSubmitError(message);
            Alert.alert('Backend Error', message);
        } finally {
            setIsCheckingHealth(false);
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
                    <View style={styles.header}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Sign up to get started</Text>
                    </View>

                    <View style={styles.form}>
                        <Input
                            label="Full Name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChangeText={(value) => updateField('name', value)}
                            error={errors.name}
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
                            label="Phone Number"
                            placeholder="Enter your phone number"
                            value={formData.phone}
                            onChangeText={(value) => updateField('phone', value)}
                            keyboardType="phone-pad"
                            error={errors.phone}
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

                        <Button
                            title="Sign Up"
                            onPress={handleSignup}
                            variant="primary"
                            size="large"
                            fullWidth
                            loading={isLoading}
                            style={styles.signupButton}
                        />
                        <Button
                            title="Check Backend Connection"
                            onPress={handleHealthCheck}
                            variant="outline"
                            size="small"
                            fullWidth
                            loading={isCheckingHealth}
                            style={styles.healthButton}
                        />
                        {!!submitError && <Text style={styles.submitError}>{submitError}</Text>}

                        <View style={styles.login}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginLink}>Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
    header: {
        marginBottom: theme.spacing.xl,
    },
    title: {
        fontSize: theme.typography.fontSize['3xl'],
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textSecondary,
    },
    form: {
        flex: 1,
    },
    signupButton: {
        marginTop: theme.spacing.lg,
        marginBottom: theme.spacing.md,
    },
    healthButton: {
        marginBottom: theme.spacing.md,
    },
    login: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textSecondary,
    },
    loginLink: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.primary,
        fontWeight: theme.typography.fontWeight.semiBold,
    },
    submitError: {
        marginTop: theme.spacing.md,
        color: theme.colors.error,
        textAlign: 'center',
    },
});

export default SignupScreen;
