// Main theme configuration
import colors from './colors';
import typography from './typography';
import spacing from './spacing';
import shadows from './shadows';

export const theme = {
    colors,
    typography,
    spacing,
    shadows,

    // Border radius
    borderRadius: {
        none: 0,
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        '2xl': 24,
        full: 9999,
    },

    // Screen padding
    screenPadding: spacing.md,

    // Animation durations
    animation: {
        fast: 150,
        normal: 300,
        slow: 500,
    },
};

export type Theme = typeof theme;

export default theme;
