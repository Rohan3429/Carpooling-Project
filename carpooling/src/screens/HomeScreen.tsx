import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { theme } from '../theme';

interface HomeScreenProps {
    navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const isDriver = user?.userType === 'driver';

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Welcome Header */}
                <View style={styles.header}>
                    <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]}! 👋</Text>
                    <Text style={styles.subGreeting}>
                        {isDriver ? 'Ready to post your next ride?' : 'Where would you like to go today?'}
                    </Text>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    {isDriver ? (
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('PostRideAllInOne')}
                        >
                            <Card style={styles.card} elevation="lg">
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardIcon}>🚗</Text>
                                    <Text style={styles.cardTitle}>Post a Ride</Text>
                                    <Text style={styles.cardDescription}>
                                        Share your ride and earn money
                                    </Text>
                                </View>
                            </Card>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('PassengerAllInOne')}
                        >
                            <Card style={styles.card} elevation="lg">
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardIcon}>🔍</Text>
                                    <Text style={styles.cardTitle}>Find a Ride</Text>
                                    <Text style={styles.cardDescription}>
                                        Search for available rides
                                    </Text>
                                </View>
                            </Card>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Stats */}
                <Card style={styles.statsCard}>
                    <Text style={styles.statsTitle}>{isDriver ? 'Driver Stats' : 'Passenger Stats'}</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{user?.totalRides || 0}</Text>
                            <Text style={styles.statLabel}>Total Rides</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>⭐ {user?.rating?.toFixed(1) || '0.0'}</Text>
                            <Text style={styles.statLabel}>Rating</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{isDriver ? '₹0' : '₹0'}</Text>
                            <Text style={styles.statLabel}>{isDriver ? 'Earnings' : 'Saved'}</Text>
                        </View>
                    </View>
                </Card>

                {/* Recent Activity */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    <Card>
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>📭</Text>
                            <Text style={styles.emptyText}>No recent activity</Text>
                            <Text style={styles.emptySubtext}>
                                {isDriver ? 'Post a ride to get started' : 'Search rides to get started'}
                            </Text>
                        </View>
                    </Card>
                </View>

                {/* Features */}
                <View style={styles.features}>
                    {isDriver ? (
                        <>
                            <FeatureItem
                                icon="🧾"
                                title="Keep Docs Ready"
                                description="Make sure your license and vehicle details are up to date"
                            />
                            <FeatureItem
                                icon="⏱️"
                                title="Post Early"
                                description="Earlier postings get more passenger requests"
                            />
                            <FeatureItem
                                icon="⭐"
                                title="Great Ratings"
                                description="Be punctual and communicate to boost your rating"
                            />
                        </>
                    ) : (
                        <>
                            <FeatureItem
                                icon="💰"
                                title="Save Money"
                                description="Reduce your commute costs by up to 80%"
                            />
                            <FeatureItem
                                icon="🧭"
                                title="Plan Ahead"
                                description="Set pickup and drop locations before searching"
                            />
                            <FeatureItem
                                icon="⭐"
                                title="Ride Smart"
                                description="Choose drivers with strong ratings and reviews"
                            />
                        </>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
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
        backgroundColor: theme.colors.backgroundDark,
    },
    scrollContent: {
        padding: theme.spacing.md,
    },
    header: {
        marginBottom: theme.spacing.lg,
    },
    greeting: {
        fontSize: theme.typography.fontSize['2xl'],
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    subGreeting: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textSecondary,
    },
    quickActions: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    actionCard: {
        flex: 1,
    },
    card: {
        height: 140,
    },
    cardContent: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    cardIcon: {
        fontSize: 40,
        marginBottom: theme.spacing.sm,
    },
    cardTitle: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.semiBold,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    cardDescription: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    statsCard: {
        marginBottom: theme.spacing.lg,
    },
    statsTitle: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.semiBold,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: theme.typography.fontSize.xl,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.primary,
        marginBottom: theme.spacing.xs,
    },
    statLabel: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    section: {
        marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.semiBold,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: theme.spacing.md,
    },
    emptyText: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.medium,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    emptySubtext: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    features: {
        gap: theme.spacing.md,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        ...theme.shadows.sm,
    },
    featureIcon: {
        fontSize: 32,
        marginRight: theme.spacing.md,
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.semiBold,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    featureDescription: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
    },
});

export default HomeScreen;
