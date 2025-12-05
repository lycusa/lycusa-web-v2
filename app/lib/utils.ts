/**
 * Utility functions for the application
 */

/**
 * Format price amount - handles both string and number types from API
 * @param price - Price amount as string or number
 * @returns Formatted price string with 2 decimal places
 */
export function formatPrice(price: string | number): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return numPrice.toFixed(2);
}

/**
 * Format currency with amount
 * @param amount - Price amount as string or number
 * @param currency - Currency code (e.g., 'USD', 'EUR')
 * @returns Formatted currency string (e.g., 'USD 99.99')
 */
export function formatCurrency(amount: string | number, currency: string): string {
  return `${currency} ${formatPrice(amount)}`;
}
