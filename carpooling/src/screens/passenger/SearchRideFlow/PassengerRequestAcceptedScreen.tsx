import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { theme } from '../../../theme';
import { usePassengerRideFlow } from './PassengerRideFlowContext';

interface PassengerRequestAcceptedScreenProps {
    navigation: any;
}

export const PassengerRequestAcceptedScreen: React.FC<PassengerRequestAcceptedScreenProps> = ({ navigation }) => {
    const { resetFlow } = usePassengerRideFlow();

    const handleBackToDashboard = () => {
        resetFlow();
        navigation.popToTop();
    };

    const handleViewRides = () => {
        resetFlow();
        navigation.popToTop();
        navigation.getParent()?.navigate('Rides');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.icon}>✅</Text>
                <Text style={styles.title}>Ride Accepted</Text>
                <Text style={styles.subtitle}>Your driver accepted the request. Get ready!</Text>

                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>Next Step</Text>
                    <Text style={styles.cardText}>We will notify you when the ride starts.</Text>
                </Card>

                <View style={styles.buttonStack}>
                    <Button title="View My Rides" onPress={handleViewRides} fullWidth />
                    <Button title="Back to Dashboard" variant="ghost" onPress={handleBackToDashboard} fullWidth />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundDark,
    },
    content: {
        flex: 1,
        padding: theme.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 56,
        marginBottom: theme.spacing.md,
    },
    title: {
        fontSize: theme.typography.fontSize['2xl'],
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.lg,
    },
    card: {
        width: '100%',
        marginBottom: theme.spacing.lg,
    },
    cardTitle: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.semiBold,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    cardText: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    buttonStack: {
        width: '100%',
        gap: theme.spacing.sm,
    },
});

export default PassengerRequestAcceptedScreen;

