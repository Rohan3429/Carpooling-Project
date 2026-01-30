import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { theme } from '../../theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    fullWidth = false,
    style,
    textStyle,
    icon,
}) => {
    const getButtonStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            ...styles.button,
            ...styles[`button_${size}`],
        };

        if (fullWidth) {
            baseStyle.width = '100%';
        }

        switch (variant) {
            case 'primary':
                return { ...baseStyle, backgroundColor: theme.colors.primary };
            case 'secondary':
                return { ...baseStyle, backgroundColor: theme.colors.secondary };
            case 'outline':
                return {
                    ...baseStyle,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderColor: theme.colors.primary,
                };
            case 'ghost':
                return { ...baseStyle, backgroundColor: 'transparent' };
            default:
                return baseStyle;
        }
    };

    const getTextStyle = (): TextStyle => {
        const baseStyle: TextStyle = {
            ...styles.text,
            ...styles[`text_${size}`],
        };

        switch (variant) {
            case 'outline':
            case 'ghost':
                return { ...baseStyle, color: theme.colors.primary };
            default:
                return { ...baseStyle, color: theme.colors.white };
        }
    };

    return (
        <TouchableOpacity
            style={[
                getButtonStyle(),
                disabled && styles.disabled,
                style,
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : theme.colors.white}
                />
            ) : (
                <>
                    {icon}
                    <Text style={[getTextStyle(), textStyle]}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.borderRadius.md,
        ...theme.shadows.sm,
    },
    button_small: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },
    button_medium: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
    },
    button_large: {
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.lg,
    },
    text: {
        fontWeight: theme.typography.fontWeight.semiBold,
    },
    text_small: {
        fontSize: theme.typography.fontSize.sm,
    },
    text_medium: {
        fontSize: theme.typography.fontSize.base,
    },
    text_large: {
        fontSize: theme.typography.fontSize.lg,
    },
    disabled: {
        opacity: 0.5,
    },
});

export default Button;
