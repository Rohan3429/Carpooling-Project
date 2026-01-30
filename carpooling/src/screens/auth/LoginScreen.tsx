import React, { useState } from 'react';
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

interface LoginScreenProps {
    navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    const dispatch = useDispatch();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({ email: '', password: '' });
    const [submitError, setSubmitError] = useState('');
    const [isCheckingHealth, setIsCheckingHealth] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const validate = (): boolean => {
        const newErrors = { email: '', password: '' };
        let isValid = true;

        if (!email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
            isValid = false;
        }

        if (!password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleLogin = async () => {
        if (!validate()) return;

        setIsLoading(true);
        dispatch(loginStart());
        setSubmitError('');

        try {
            const user = await authApi.login(email, password);
            dispatch(loginSuccess(user));
            // Navigation will be handled by App.tsx based on auth state
        } catch (error: any) {
            const message = error?.message || 'Login failed';
            dispatch(loginFailure(message));
            setSubmitError(message);
            setErrors({ ...errors, password: 'Invalid credentials' });
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
                        <Text style={styles.title}>Welcome Back!</Text>
                        <Text style={styles.subtitle}>Login to continue your journey</Text>
                    </View>

                    <View style={styles.form}>
                        <Input
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={errors.email}
                            required
                        />

                        <Input
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            error={errors.password}
                            required
                        />

                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <Button
                            title="Login"
                            onPress={handleLogin}
                            variant="primary"
                            size="large"
                            fullWidth
                            loading={isLoading}
                            style={styles.loginButton}
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

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <View style={styles.socialButtons}>
                            <Button
                                title="Google"
                                onPress={() => { }}
                                variant="outline"
                                size="medium"
                                fullWidth
                                icon={<Text style={styles.socialIcon}>🔍</Text>}
                            />
                            <Button
                                title="Facebook"
                                onPress={() => { }}
                                variant="outline"
                                size="medium"
                                fullWidth
                                icon={<Text style={styles.socialIcon}>📘</Text>}
                            />
                        </View>

                        <View style={styles.signup}>
                            <Text style={styles.signupText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                                <Text style={styles.signupLink}>Sign Up</Text>
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
        marginBottom: theme.spacing['2xl'],
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: theme.spacing.lg,
    },
    forgotPasswordText: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.primary,
        fontWeight: theme.typography.fontWeight.medium,
    },
    loginButton: {
        marginBottom: theme.spacing.md,
    },
    healthButton: {
        marginBottom: theme.spacing.md,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: theme.spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.border,
    },
    dividerText: {
        marginHorizontal: theme.spacing.md,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    socialButtons: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.xl,
    },
    socialIcon: {
        fontSize: 20,
        marginRight: theme.spacing.sm,
    },
    signup: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupText: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textSecondary,
    },
    signupLink: {
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

export default LoginScreen;
