import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { theme } from '../theme';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import MyVehiclesScreen from '../screens/profile/MyVehiclesScreen';
import PaymentMethodsScreen from '../screens/profile/PaymentMethodsScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import DriverBookingsScreen from '../screens/driver/DriverBookingsScreen';

const Stack = createStackNavigator();

export const ProfileStack: React.FC = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: theme.colors.primary },
                headerTintColor: theme.colors.white,
                headerTitleStyle: { fontWeight: theme.typography.fontWeight.bold },
            }}
        >
            <Stack.Screen name="ProfileHome" component={ProfileScreen} options={{ title: 'Profile' }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
            <Stack.Screen name="MyVehicles" component={MyVehiclesScreen} options={{ title: 'My Vehicles' }} />
            <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={{ title: 'Payment Methods' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
            <Stack.Screen name="DriverBookings" component={DriverBookingsScreen} options={{ title: 'Booking Requests' }} />
        </Stack.Navigator>
    );
};

export default ProfileStack;

