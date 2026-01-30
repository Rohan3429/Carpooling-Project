import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Card } from '../components/common/Card';
import { theme } from '../theme';
import { RootState } from '../store';

export const RidesScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const { myRides } = useSelector((state: RootState) => state.rides);

    const filteredRides = useMemo(() => {
        if (activeTab === 'upcoming') {
            return myRides.filter((ride) => ride.status === 'active');
        }
        return myRides.filter((ride) => ride.status !== 'active');
    }, [activeTab, myRides]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
                    onPress={() => setActiveTab('upcoming')}
                >
                    <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
                        Upcoming
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'past' && styles.activeTab]}
                    onPress={() => setActiveTab('past')}
                >
                    <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
                        Past
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {filteredRides.length === 0 ? (
                    <Card>
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>🚗</Text>
                            <Text style={styles.emptyText}>No {activeTab} rides</Text>
                            <Text style={styles.emptySubtext}>
                                {activeTab === 'upcoming'
                                    ? 'Book or post a ride to get started'
                                    : 'Your completed rides will appear here'}
                            </Text>
                        </View>
                    </Card>
                ) : (
                    filteredRides.map((ride) => (
                        <Card key={ride.id} style={styles.rideCard}>
                            <View style={styles.rideRow}>
                                <Text style={styles.rideTitle}>{ride.origin.address}</Text>
                                <Text style={styles.rideArrow}>→</Text>
                                <Text style={styles.rideTitle}>{ride.destination.address}</Text>
                            </View>
                            <Text style={styles.rideTime}>{ride.departureTime}</Text>
                            <View style={styles.rideMeta}>
                                <Text style={styles.rideMetaText}>Seats: {ride.availableSeats}</Text>
                                <Text style={styles.rideMetaText}>₹{ride.farePerKm}/km</Text>
                                <Text style={styles.rideMetaText}>₹{ride.totalFare} est.</Text>
                            </View>
                        </Card>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundDark,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    tab: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: theme.colors.primary,
    },
    tabText: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.medium,
        color: theme.colors.textSecondary,
    },
    activeTabText: {
        color: theme.colors.primary,
        fontWeight: theme.typography.fontWeight.semiBold,
    },
    scrollContent: {
        padding: theme.spacing.md,
    },
    rideCard: {
        marginBottom: theme.spacing.md,
    },
    rideRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm,
    },
    rideTitle: {
        flex: 1,
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.semiBold,
        color: theme.colors.text,
    },
    rideArrow: {
        marginHorizontal: theme.spacing.sm,
        color: theme.colors.textSecondary,
    },
    rideTime: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.sm,
    },
    rideMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    rideMetaText: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textSecondary,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: theme.spacing['3xl'],
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: theme.spacing.md,
    },
    emptyText: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.medium,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    emptySubtext: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: theme.spacing.xl,
    },
});

export default RidesScreen;
