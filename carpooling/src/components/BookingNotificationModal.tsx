import React from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { theme } from '../theme';

interface BookingNotificationModalProps {
    visible: boolean;
    booking: {
        id: string;
        passengerName: string;
        pickupLocation: string;
        dropoffLocation: string;
        numberOfPassengers: number;
        totalFare: number;
        upfrontPayment: number;
    } | null;
    onAccept: () => void;
    onReject: () => void;
    onDismiss: () => void;
}

export const BookingNotificationModal: React.FC<BookingNotificationModalProps> = ({
    visible,
    booking,
    onAccept,
    onReject,
    onDismiss,
}) => {
    if (!booking) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onDismiss}
        >
            <View style={styles.overlay}>
                <Card style={styles.modalCard}>
                    <View style={styles.header}>
                        <Text style={styles.title}>New Booking Request</Text>
                        <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.passengerName}>👤 {booking.passengerName}</Text>
                        
                        <View style={styles.routeSection}>
                            <View style={styles.locationRow}>
                                <View style={styles.locationDot} />
                                <Text style={styles.locationText}>{booking.pickupLocation}</Text>
                            </View>
                            <View style={styles.locationRow}>
                                <View style={[styles.locationDot, styles.dropDot]} />
                                <Text style={styles.locationText}>{booking.dropoffLocation}</Text>
                            </View>
                        </View>

                        <View style={styles.detailsRow}>
                            <Text style={styles.detailLabel}>Passengers:</Text>
                            <Text style={styles.detailValue}>{booking.numberOfPassengers}</Text>
                        </View>
                        <View style={styles.detailsRow}>
                            <Text style={styles.detailLabel}>Total Fare:</Text>
                            <Text style={styles.detailValue}>₹{booking.totalFare}</Text>
                        </View>
                        <View style={styles.detailsRow}>
                            <Text style={styles.detailLabel}>Upfront:</Text>
                            <Text style={styles.detailValue}>₹{booking.upfrontPayment}</Text>
                        </View>
                    </View>

                    <View style={styles.buttonRow}>
                        <Button
                            title="Reject"
                            variant="outline"
                            onPress={onReject}
                            style={[styles.button, styles.rejectButton]}
                        />
                        <Button
                            title="Accept"
                            onPress={onAccept}
                            style={styles.button}
                        />
                    </View>
                </Card>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalCard: {
        margin: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        padding: theme.spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    title: {
        fontSize: theme.typography.fontSize.xl,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text,
        fontWeight: theme.typography.fontWeight.bold,
    },
    content: {
        marginBottom: theme.spacing.lg,
    },
    passengerName: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.semiBold,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    routeSection: {
        marginBottom: theme.spacing.md,
        paddingLeft: theme.spacing.md,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    locationDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: theme.colors.primary,
        marginRight: theme.spacing.sm,
    },
    dropDot: {
        backgroundColor: theme.colors.secondary,
    },
    locationText: {
        flex: 1,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xs,
    },
    detailLabel: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    detailValue: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.semiBold,
        color: theme.colors.text,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    button: {
        flex: 1,
    },
    rejectButton: {
        borderColor: theme.colors.error || '#FF3B30',
    },
});

export default BookingNotificationModal;

