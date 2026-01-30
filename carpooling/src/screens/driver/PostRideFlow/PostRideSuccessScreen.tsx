import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { theme } from '../../../theme';
import { usePostRideFlow } from './PostRideFlowContext';

interface PostRideSuccessScreenProps {
    navigation: any;
}

export const PostRideSuccessScreen: React.FC<PostRideSuccessScreenProps> = ({ navigation }) => {
    const { resetForm } = usePostRideFlow();

    const handleShare = () => {
        Alert.alert('Share Ride', 'Sharing will be available soon.');
    };

    const handleViewRides = () => {
        resetForm();
        navigation.popToTop();
        navigation.getParent()?.navigate('Rides');
    };

    const handleBackToDashboard = () => {
        resetForm();
        navigation.popToTop();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.icon}>✅</Text>
                <Text style={styles.title}>Ride Posted Successfully!</Text>
                <Text style={styles.subtitle}>You'll get notified when passengers request.</Text>

                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>Share this ride with friends</Text>
                    <Button title="Share Ride" variant="outline" onPress={handleShare} fullWidth />
                </Card>

                <View style={styles.buttonStack}>
                    <Button title="View My Rides" onPress={handleViewRides} fullWidth />
                    <Button
                        title="Back to Dashboard"
                        variant="ghost"
                        onPress={handleBackToDashboard}
                        fullWidth
                    />
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontSize: 56,
        marginBottom: theme.spacing.md,
    },
    title: {
        fontSize: theme.typography.fontSize['2xl'],
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text,
        textAlign: 'center',
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
        marginBottom: theme.spacing.sm,
    },
    buttonStack: {
        width: '100%',
        gap: theme.spacing.sm,
    },
});

export default PostRideSuccessScreen;

