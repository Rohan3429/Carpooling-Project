import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/common/Button';
import { theme } from '../../theme';

interface WelcomeScreenProps {
    navigation: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.gradient}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.content}>
                        {/* Logo and Title */}
                        <View style={styles.header}>
                            <Text style={styles.logo}>🚗</Text>
                            <Text style={styles.title}>CarPooling</Text>
                            <Text style={styles.subtitle}>
                                Share rides, Save money
                            </Text>
                        </View>

                        {/* Features */}
                        <View style={styles.features}>
                            <FeatureItem
                                icon="💰"
                                title="Save Up to 80%"
                                description="on your daily commute"
                            />
                            {/* <FeatureItem
                                icon="🌱"
                                title="Eco-Friendly"
                                description="Reduce carbon footprint"
                            /> */}
                        </View>

                        {/* CTA Buttons */}
                        <View style={styles.actions}>
                            <Text style={styles.actionsTitle}>Continue as</Text>
                            <Button
                                title="Passenger"
                                onPress={() => navigation.navigate('Signup')}
                                variant="secondary"
                                size="large"
                                fullWidth
                            />
                            <Button
                                title="Driver"
                                onPress={() => navigation.navigate('DriverSignup')}
                                variant="secondary"
                                size="large"
                                fullWidth
                                style={styles.driverButton}
                            />
                            <Button
                                title="Login"
                                onPress={() => navigation.navigate('Login')}
                                variant="outline"
                                size="large"
                                fullWidth
                                style={styles.loginButton}
                                textStyle={styles.loginButtonText}
                            />
                        </View>
                    </View>
                </SafeAreaView>
            </View>
        </View>
    );
};

interface FeatureItemProps {
    icon: string;
    title: string;
    description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => (
    <View style={styles.featureItem}>
        <Text style={styles.featureIcon}>{icon}</Text>
        <View style={styles.featureText}>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureDescription}>{description}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        backgroundColor: theme.colors.primary,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.lg,
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginTop: theme.spacing['2xl'],
    },
    logo: {
        fontSize: 80,
        marginBottom: theme.spacing.md,
    },
    title: {
        fontSize: theme.typography.fontSize['4xl'],
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.white,
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.white,
        opacity: 0.9,
        textAlign: 'center',
    },
    features: {
        gap: theme.spacing.lg,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.xl,
    },
    featureIcon: {
        fontSize: 40,
        marginRight: theme.spacing.md,
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.semiBold,
        color: theme.colors.white,
        marginBottom: theme.spacing.xs,
    },
    featureDescription: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.white,
        opacity: 0.8,
    },
    actions: {
        gap: theme.spacing.md,
    },
    actionsTitle: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.white,
        opacity: 0.9,
        textAlign: 'center',
    },
    driverButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    loginButton: {
        backgroundColor: 'transparent',
        borderColor: theme.colors.white,
        borderWidth: 2,
    },
    loginButtonText: {
        color: theme.colors.white,
    },
});

export default WelcomeScreen;
