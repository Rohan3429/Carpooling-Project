/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate phone number (Indian format)
 */
export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): {
    isValid: boolean;
    errors: string[];
} => {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

/**
 * Validate name (no numbers or special characters)
 */
export const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(name) && name.trim().length >= 2;
};

/**
 * Validate vehicle number (Indian format)
 */
export const validateVehicleNumber = (vehicleNumber: string): boolean => {
    // Format: KA 01 AB 1234
    const vehicleRegex = /^[A-Z]{2}\s?\d{2}\s?[A-Z]{1,2}\s?\d{4}$/;
    return vehicleRegex.test(vehicleNumber.toUpperCase());
};

/**
 * Validate required field
 */
export const validateRequired = (value: string): boolean => {
    return value.trim().length > 0;
};

/**
 * Validate number range
 */
export const validateNumberRange = (
    value: number,
    min: number,
    max: number
): boolean => {
    return value >= min && value <= max;
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 10) {
        return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }

    return phone;
};

/**
 * Format vehicle number for display
 */
export const formatVehicleNumber = (vehicleNumber: string): string => {
    const cleaned = vehicleNumber.replace(/\s/g, '').toUpperCase();

    if (cleaned.length >= 10) {
        return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6)}`;
    }

    return vehicleNumber.toUpperCase();
};

export default {
    validateEmail,
    validatePhone,
    validatePassword,
    validateName,
    validateVehicleNumber,
    validateRequired,
    validateNumberRange,
    formatPhoneNumber,
    formatVehicleNumber,
};
