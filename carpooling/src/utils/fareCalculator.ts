/**
 * Calculate fare based on distance and rate per km
 */
export const calculateFare = (distanceKm: number, ratePerKm: number): number => {
    return Math.round(distanceKm * ratePerKm);
};

/**
 * Calculate total fare for multiple passengers
 */
export const calculateTotalFare = (
    farePerSeat: number,
    numberOfPassengers: number
): number => {
    return farePerSeat * numberOfPassengers;
};

/**
 * Calculate upfront payment (20% of total)
 */
export const calculateUpfrontPayment = (totalFare: number): number => {
    return Math.round(totalFare * 0.2);
};

/**
 * Calculate remaining payment after upfront
 */
export const calculateRemainingPayment = (totalFare: number): number => {
    const upfront = calculateUpfrontPayment(totalFare);
    return totalFare - upfront;
};

/**
 * Get suggested fare range based on distance
 */
export const getSuggestedFareRange = (distanceKm: number): {
    min: number;
    max: number;
    suggested: number;
} => {
    const minRate = 12;
    const maxRate = 18;
    const suggestedRate = 15;

    return {
        min: calculateFare(distanceKm, minRate),
        max: calculateFare(distanceKm, maxRate),
        suggested: calculateFare(distanceKm, suggestedRate),
    };
};

/**
 * Calculate driver earnings after commission
 */
export const calculateDriverEarnings = (
    totalFare: number,
    commissionPercent: number = 15
): {
    totalFare: number;
    commission: number;
    earnings: number;
} => {
    const commission = Math.round(totalFare * (commissionPercent / 100));
    const earnings = totalFare - commission;

    return {
        totalFare,
        commission,
        earnings,
    };
};

/**
 * Format currency for display (Indian Rupees)
 */
export const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN')}`;
};

/**
 * Calculate fare per kilometer from total fare and distance
 */
export const calculateRatePerKm = (totalFare: number, distanceKm: number): number => {
    if (distanceKm === 0) return 0;
    return Math.round((totalFare / distanceKm) * 10) / 10;
};

export default {
    calculateFare,
    calculateTotalFare,
    calculateUpfrontPayment,
    calculateRemainingPayment,
    getSuggestedFareRange,
    calculateDriverEarnings,
    formatCurrency,
    calculateRatePerKm,
};
