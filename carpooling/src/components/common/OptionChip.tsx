import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface OptionChipProps {
    label: string;
    selected?: boolean;
    onPress: () => void;
    style?: ViewStyle;
}

export const OptionChip: React.FC<OptionChipProps> = ({ label, selected = false, onPress, style }) => {
    return (
        <TouchableOpacity
            style={[styles.chip, selected && styles.chipSelected, style]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    chip: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.full,
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.md,
        backgroundColor: theme.colors.white,
        marginRight: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
    },
    chipSelected: {
        backgroundColor: theme.colors.primaryLight,
        borderColor: theme.colors.primary,
    },
    label: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        fontWeight: theme.typography.fontWeight.medium,
    },
    labelSelected: {
        color: theme.colors.primaryDark,
    },
});

export default OptionChip;

