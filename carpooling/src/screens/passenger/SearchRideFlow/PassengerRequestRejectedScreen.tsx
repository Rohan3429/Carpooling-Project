import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { theme } from '../../../theme';

interface PassengerRequestRejectedScreenProps {
    navigation: any;
}

export const PassengerRequestRejectedScreen: React.FC<PassengerRequestRejectedScreenProps> = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.icon}>❌</Text>
                <Text style={styles.title}>Driver Declined</Text>
                <Text style={styles.subtitle}>Amount ₹49 refunded to your payment method.</Text>

                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>What next?</Text>
                    <Text style={styles.cardText}>Find another ride that matches your schedule.</Text>
                </Card>

                <View style={styles.buttonStack}>
                    <Button title="Find Another Ride" onPress={() => navigation.navigate('PassengerResults')} fullWidth />
                    <Button title="Back" variant="ghost" onPress={() => navigation.popToTop()} fullWidth />
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

export default PassengerRequestRejectedScreen;

