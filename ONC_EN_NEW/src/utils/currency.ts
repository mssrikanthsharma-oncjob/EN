/**
 * Utility functions for Indian Rupee currency formatting
 */

/**
 * Formats a number as Indian Rupees with proper locale formatting
 * @param amount - The amount to format
 * @param options - Optional formatting options
 * @returns Formatted currency string
 */
export const formatINR = (
  amount: number,
  options: {
    showSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string => {
  const {
    showSymbol = true,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2
  } = options;

  const formattedAmount = amount.toLocaleString('en-IN', {
    minimumFractionDigits,
    maximumFractionDigits
  });

  return showSymbol ? `₹${formattedAmount}` : formattedAmount;
};

/**
 * Formats currency for display in tables or compact spaces
 * @param amount - The amount to format
 * @returns Compact formatted currency string
 */
export const formatINRCompact = (amount: number): string => {
  if (amount >= 10000000) { // 1 crore
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) { // 1 lakh
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) { // 1 thousand
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return formatINR(amount);
};

/**
 * Parses a currency string and returns the numeric value
 * @param currencyString - String like "₹1,23,456" or "123456"
 * @returns Numeric value
 */
export const parseINR = (currencyString: string): number => {
  // Remove currency symbol and commas, then parse
  const cleanString = currencyString.replace(/[₹,\s]/g, '');
  return parseFloat(cleanString) || 0;
};

/**
 * Validates if a string represents a valid currency amount
 * @param value - String to validate
 * @returns Boolean indicating if valid
 */
export const isValidINRAmount = (value: string): boolean => {
  const cleanValue = value.replace(/[₹,\s]/g, '');
  const numValue = parseFloat(cleanValue);
  return !isNaN(numValue) && numValue >= 0;
};