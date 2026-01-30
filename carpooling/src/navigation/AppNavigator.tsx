import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

const Stack = createStackNavigator();

export const AppNavigator: React.FC = () => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    return (
        <NavigationContainer>
            {isAuthenticated ? <MainTabs /> : <AuthStack />}
        </NavigationContainer>
    );
};

export default AppNavigator;
