import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    padding?: number;
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    elevation = 'md',
    padding = theme.spacing.md,
}) => {
    return (
        <View
            style={[
                styles.card,
                theme.shadows[elevation],
                { padding },
                style,
            ]}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
});

export default Card;
