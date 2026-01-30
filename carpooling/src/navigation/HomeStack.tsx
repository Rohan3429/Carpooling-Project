import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { theme } from '../theme';
import HomeScreen from '../screens/HomeScreen';
import PostRideAllInOneScreen from '../screens/driver/PostRideFlow/PostRideAllInOneScreen';
import PostRideOriginScreen from '../screens/driver/PostRideFlow/PostRideOriginScreen';
import PostRideDestinationScreen from '../screens/driver/PostRideFlow/PostRideDestinationScreen';
import PostRideDateTimeScreen from '../screens/driver/PostRideFlow/PostRideDateTimeScreen';
import PostRideSeatsScreen from '../screens/driver/PostRideFlow/PostRideSeatsScreen';
import PostRideFareScreen from '../screens/driver/PostRideFlow/PostRideFareScreen';
import PostRidePreferencesScreen from '../screens/driver/PostRideFlow/PostRidePreferencesScreen';
import PostRideRecurringScreen from '../screens/driver/PostRideFlow/PostRideRecurringScreen';
import PostRideReviewScreen from '../screens/driver/PostRideFlow/PostRideReviewScreen';
import PostRideSuccessScreen from '../screens/driver/PostRideFlow/PostRideSuccessScreen';
import { PostRideFlowProvider } from '../screens/driver/PostRideFlow/PostRideFlowContext';
import PassengerAllInOneScreen from '../screens/passenger/SearchRideFlow/PassengerAllInOneScreen';
import PassengerOriginScreen from '../screens/passenger/SearchRideFlow/PassengerOriginScreen';
import PassengerDestinationScreen from '../screens/passenger/SearchRideFlow/PassengerDestinationScreen';
import PassengerDepartureScreen from '../screens/passenger/SearchRideFlow/PassengerDepartureScreen';
import PassengerPassengersScreen from '../screens/passenger/SearchRideFlow/PassengerPassengersScreen';
import PassengerFiltersScreen from '../screens/passenger/SearchRideFlow/PassengerFiltersScreen';
import PassengerResultsScreen from '../screens/passenger/SearchRideFlow/PassengerResultsScreen';
import PassengerConfirmScreen from '../screens/passenger/SearchRideFlow/PassengerConfirmScreen';
import PassengerPaymentScreen from '../screens/passenger/SearchRideFlow/PassengerPaymentScreen';
import PassengerRequestSentScreen from '../screens/passenger/SearchRideFlow/PassengerRequestSentScreen';
import PassengerRequestAcceptedScreen from '../screens/passenger/SearchRideFlow/PassengerRequestAcceptedScreen';
import PassengerRequestRejectedScreen from '../screens/passenger/SearchRideFlow/PassengerRequestRejectedScreen';
import PassengerRequestTimeoutScreen from '../screens/passenger/SearchRideFlow/PassengerRequestTimeoutScreen';
import { PassengerRideFlowProvider } from '../screens/passenger/SearchRideFlow/PassengerRideFlowContext';

const Stack = createStackNavigator();

export const HomeStack: React.FC = () => {
    return (
        <PostRideFlowProvider>
            <PassengerRideFlowProvider>
                <Stack.Navigator
                    screenOptions={{
                        headerStyle: {
                            backgroundColor: theme.colors.primary,
                        },
                        headerTintColor: theme.colors.white,
                        headerTitleStyle: {
                            fontWeight: theme.typography.fontWeight.bold,
                        },
                    }}
                >
                    <Stack.Screen name="HomeRoot" component={HomeScreen} options={{ title: 'CarPooling' }} />
                    <Stack.Screen name="PostRideAllInOne" component={PostRideAllInOneScreen} options={{ title: 'Post a Ride' }} />
                    <Stack.Screen name="PostRideOrigin" component={PostRideOriginScreen} options={{ title: 'Post a Ride' }} />
                    <Stack.Screen name="PostRideDestination" component={PostRideDestinationScreen} options={{ title: 'Destination' }} />
                    <Stack.Screen name="PostRideDateTime" component={PostRideDateTimeScreen} options={{ title: 'Date & Time' }} />
                    <Stack.Screen name="PostRideSeats" component={PostRideSeatsScreen} options={{ title: 'Seats' }} />
                    <Stack.Screen name="PostRideFare" component={PostRideFareScreen} options={{ title: 'Fare' }} />
                    <Stack.Screen name="PostRidePreferences" component={PostRidePreferencesScreen} options={{ title: 'Preferences' }} />
                    <Stack.Screen name="PostRideRecurring" component={PostRideRecurringScreen} options={{ title: 'Recurring' }} />
                    <Stack.Screen name="PostRideReview" component={PostRideReviewScreen} options={{ title: 'Review' }} />
                    <Stack.Screen name="PostRideSuccess" component={PostRideSuccessScreen} options={{ title: 'Success', headerLeft: () => null }} />
                    <Stack.Screen name="PassengerAllInOne" component={PassengerAllInOneScreen} options={{ title: 'Find a Ride' }} />
                    <Stack.Screen name="PassengerOrigin" component={PassengerOriginScreen} options={{ title: 'Find a Ride' }} />
                    <Stack.Screen name="PassengerDestination" component={PassengerDestinationScreen} options={{ title: 'Destination' }} />
                    <Stack.Screen name="PassengerDeparture" component={PassengerDepartureScreen} options={{ title: 'Departure' }} />
                    <Stack.Screen name="PassengerPassengers" component={PassengerPassengersScreen} options={{ title: 'Passengers' }} />
                    <Stack.Screen name="PassengerFilters" component={PassengerFiltersScreen} options={{ title: 'Filters' }} />
                    <Stack.Screen name="PassengerResults" component={PassengerResultsScreen} options={{ title: 'Results' }} />
                    <Stack.Screen name="PassengerConfirm" component={PassengerConfirmScreen} options={{ title: 'Confirm' }} />
                    <Stack.Screen name="PassengerPayment" component={PassengerPaymentScreen} options={{ title: 'Payment' }} />
                    <Stack.Screen name="PassengerRequestSent" component={PassengerRequestSentScreen} options={{ title: 'Request Sent', headerLeft: () => null }} />
                    <Stack.Screen name="PassengerRequestAccepted" component={PassengerRequestAcceptedScreen} options={{ title: 'Accepted', headerLeft: () => null }} />
                    <Stack.Screen name="PassengerRequestRejected" component={PassengerRequestRejectedScreen} options={{ title: 'Rejected', headerLeft: () => null }} />
                    <Stack.Screen name="PassengerRequestTimeout" component={PassengerRequestTimeoutScreen} options={{ title: 'Timeout', headerLeft: () => null }} />
                </Stack.Navigator>
            </PassengerRideFlowProvider>
        </PostRideFlowProvider>
    );
};

export default HomeStack;

