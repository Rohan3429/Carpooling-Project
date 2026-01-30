import { format, formatDistance, formatRelative, isToday, isTomorrow, parseISO } from 'date-fns';

/**
 * Format date for display
 */
export const formatDate = (date: Date | string, formatStr: string = 'MMM dd, yyyy'): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
};

/**
 * Format time for display
 */
export const formatTime = (date: Date | string, formatStr: string = 'hh:mm a'): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
};

/**
 * Format date and time together
 */
export const formatDateTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (isToday(dateObj)) {
        return `Today at ${formatTime(dateObj)}`;
    }

    if (isTomorrow(dateObj)) {
        return `Tomorrow at ${formatTime(dateObj)}`;
    }

    return `${formatDate(dateObj, 'MMM dd')} at ${formatTime(dateObj)}`;
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(dateObj, new Date(), { addSuffix: true });
};

/**
 * Get day name (Today, Tomorrow, or day name)
 */
export const getDayName = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (isToday(dateObj)) {
        return 'Today';
    }

    if (isTomorrow(dateObj)) {
        return 'Tomorrow';
    }

    return format(dateObj, 'EEEE');
};

/**
 * Generate time slots for a day (e.g., 8:00 AM, 8:15 AM, etc.)
 */
export const generateTimeSlots = (intervalMinutes: number = 15): string[] => {
    const slots: string[] = [];
    const startHour = 0;
    const endHour = 24;

    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += intervalMinutes) {
            const date = new Date();
            date.setHours(hour, minute, 0, 0);
            slots.push(formatTime(date));
        }
    }

    return slots;
};

/**
 * Check if a date is in the past
 */
export const isPastDate = (date: Date | string): boolean => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return dateObj < new Date();
};

/**
 * Add minutes to a date
 */
export const addMinutes = (date: Date, minutes: number): Date => {
    return new Date(date.getTime() + minutes * 60000);
};

/**
 * Calculate duration between two dates in minutes
 */
export const getDurationInMinutes = (start: Date | string, end: Date | string): number => {
    const startDate = typeof start === 'string' ? parseISO(start) : start;
    const endDate = typeof end === 'string' ? parseISO(end) : end;
    return Math.round((endDate.getTime() - startDate.getTime()) / 60000);
};

export default {
    formatDate,
    formatTime,
    formatDateTime,
    getRelativeTime,
    getDayName,
    generateTimeSlots,
    isPastDate,
    addMinutes,
    getDurationInMinutes,
};
