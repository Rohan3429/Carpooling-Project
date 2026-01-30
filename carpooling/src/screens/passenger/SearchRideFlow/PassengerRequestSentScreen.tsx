import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { theme } from '../../../theme';
import { usePassengerRideFlow } from './PassengerRideFlowContext';
import { bookingsApi } from '../../../services/bookingsApi';

interface PassengerRequestSentScreenProps {
    navigation: any;
    route?: {
        params?: {
            bookingId?: string;
        };
    };
}

export const PassengerRequestSentScreen: React.FC<PassengerRequestSentScreenProps> = ({ navigation, route }) => {
    const { selectedRide } = usePassengerRideFlow();
    const bookingId = route?.params?.bookingId;
    const [bookingStatus, setBookingStatus] = useState<'pending' | 'accepted' | 'rejected' | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!bookingId) return;

        const checkBookingStatus = async () => {
            try {
                setIsLoading(true);
                const booking = await bookingsApi.getBooking(bookingId);
                setBookingStatus(booking.status as any);

                if (booking.status === 'accepted') {
                    navigation.replace('PassengerRequestAccepted', { bookingId });
                } else if (booking.status === 'rejected') {
                    navigation.replace('PassengerRequestRejected', { bookingId });
                }
            } catch (error) {
                console.error('Failed to check booking status:', error);
            } finally {
                setIsLoading(false);
            }
        };

        // Check immediately
        checkBookingStatus();

        // Poll every 3 seconds
        const interval = setInterval(checkBookingStatus, 3000);

        return () => clearInterval(interval);
    }, [bookingId, navigation]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.icon}>📨</Text>
                <Text style={styles.title}>Request Sent</Text>
                <Text style={styles.subtitle}>
                    Sent request to {selectedRide?.driverName || 'driver'}.
                </Text>

                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>
                        {isLoading ? 'Checking status...' : bookingStatus === 'pending' ? 'Waiting for driver to accept...' : 'Request sent'}
                    </Text>
                    <Text style={styles.cardText}>
                        {selectedRide?.driverName ? `Sent to ${selectedRide.driverName}` : 'Your request has been sent to the driver'}
                    </Text>
                </Card>

                <View style={styles.buttonStack}>
                    <Button title="Go to Home" onPress={() => navigation.navigate('Home')} fullWidth />
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

export default PassengerRequestSentScreen;

