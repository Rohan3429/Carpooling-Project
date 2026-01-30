import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout, updateProfile } from '../store/slices/authSlice';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { theme } from '../theme';
import { profileApi } from '../services/profileApi';

export const ProfileScreen: React.FC = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation<any>();
    const { user } = useSelector((state: RootState) => state.auth);
    const [isLoading, setIsLoading] = useState(false);
    const isDriver = user?.userType === 'driver';

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => dispatch(logout()),
                },
            ]
        );
    };

    const refreshProfile = useCallback(async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const profile = await profileApi.getProfile(user.id);
            dispatch(updateProfile(profile));
        } catch (error: any) {
            Alert.alert('Profile Error', error?.message || 'Failed to load profile.');
        } finally {
            setIsLoading(false);
        }
    }, [dispatch, user?.id]);

    useEffect(() => {
        refreshProfile();
    }, [refreshProfile]);

    useFocusEffect(
        useCallback(() => {
            refreshProfile();
        }, [refreshProfile])
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Profile Header */}
                <Card style={styles.profileCard}>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {(user?.name?.charAt(0) || '?').toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.name}>{user?.name}</Text>
                            <Text style={styles.email}>{user?.email}</Text>
                            <View style={styles.rating}>
                                <Text style={styles.ratingText}>⭐ {user?.rating?.toFixed(1) || '0.0'}</Text>
                                <Text style={styles.ridesText}>• {user?.totalRides || 0} rides</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>{isDriver ? 'Driver' : 'Passenger'}</Text>
                    </View>
                    {isLoading && (
                        <View style={styles.loadingRow}>
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                            <Text style={styles.loadingText}>Refreshing profile...</Text>
                        </View>
                    )}
                </Card>

                <Card style={styles.tipCard}>
                    <Text style={styles.tipTitle}>{isDriver ? 'Driver Tools' : 'Passenger Tips'}</Text>
                    <Text style={styles.tipText}>
                        {isDriver
                            ? 'Keep your vehicle details and payouts updated for faster approvals.'
                            : 'Save pickup locations and check driver ratings before booking.'}
                    </Text>
                </Card>

                {/* Menu Items */}
                <View style={styles.menu}>
                    <MenuItem icon="👤" title="Edit Profile" onPress={() => navigation.navigate('EditProfile')} />
                    {isDriver && (
                        <>
                            <MenuItem icon="🚗" title="My Vehicles" onPress={() => navigation.navigate('MyVehicles')} />
                            <MenuItem icon="📋" title="Booking Requests" onPress={() => navigation.navigate('DriverBookings')} />
                        </>
                    )}
                    <MenuItem icon="💳" title="Payment Methods" onPress={() => navigation.navigate('PaymentMethods')} />
                    <MenuItem icon="📜" title="Ride History" onPress={() => { }} />
                    <MenuItem icon="⭐" title="My Reviews" onPress={() => { }} />
                    <MenuItem icon="❓" title="Help & Support" onPress={() => { }} />
                    <MenuItem icon="⚙️" title="Settings" onPress={() => navigation.navigate('Settings')} />
                </View>

                {/* Logout Button */}
                <Button
                    title="Logout"
                    onPress={handleLogout}
                    variant="outline"
                    size="large"
                    fullWidth
                    style={styles.logoutButton}
                />

                {/* App Version */}
                <Text style={styles.version}>Version 1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

interface MenuItemProps {
    icon: string;
    title: string;
    onPress: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuLeft}>
            <Text style={styles.menuIcon}>{icon}</Text>
            <Text style={styles.menuTitle}>{title}</Text>
        </View>
        <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundDark,
    },
    scrollContent: {
        padding: theme.spacing.md,
    },
    profileCard: {
        marginBottom: theme.spacing.lg,
    },
    tipCard: {
        marginBottom: theme.spacing.lg,
    },
    tipTitle: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.semiBold,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    tipText: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    avatarText: {
        fontSize: theme.typography.fontSize['3xl'],
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.white,
    },
    profileInfo: {
        flex: 1,
    },
    name: {
        fontSize: theme.typography.fontSize.xl,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    email: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.medium,
        color: theme.colors.text,
    },
    ridesText: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        marginLeft: theme.spacing.xs,
    },
    menu: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.lg,
        overflow: 'hidden',
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing.sm,
    },
    loadingText: {
        marginLeft: theme.spacing.sm,
        color: theme.colors.textSecondary,
        fontSize: theme.typography.fontSize.sm,
    },
    roleBadge: {
        alignSelf: 'flex-start',
        marginTop: theme.spacing.sm,
        backgroundColor: theme.colors.backgroundDark,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.full,
    },
    roleBadgeText: {
        color: theme.colors.textSecondary,
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.semiBold,
        textTransform: 'uppercase',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        fontSize: 24,
        marginRight: theme.spacing.md,
    },
    menuTitle: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.text,
    },
    menuArrow: {
        fontSize: 24,
        color: theme.colors.textLight,
    },
    logoutButton: {
        marginBottom: theme.spacing.lg,
    },
    version: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textLight,
        textAlign: 'center',
    },
});

export default ProfileScreen;
