import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert feet and inches to total inches
 * @param feet - Number of feet
 * @param inches - Number of inches
 * @returns Total inches, or null if both inputs are empty/zero
 */
export function feetInchesToInches(
  feet: string | number,
  inches: string | number
): number | null {
  const feetNum = typeof feet === 'string' ? parseInt(feet) : feet;
  const inchesNum = typeof inches === 'string' ? parseInt(inches) : inches;

  const feetValue = feetNum || 0;
  const inchesValue = inchesNum || 0;

  // Return null if both are zero (no height provided)
  if (feetValue === 0 && inchesValue === 0) {
    return null;
  }

  return feetValue * 12 + inchesValue;
}

/**
 * Convert total inches to feet and inches
 * @param totalInches - Total height in inches
 * @returns Object with feet and inches as strings, or empty strings if null/undefined
 */
export function inchesToFeetInches(totalInches: number | null | undefined): {
  feet: string;
  inches: string;
} {
  if (!totalInches) {
    return { feet: '', inches: '' };
  }

  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;

  return {
    feet: feet.toString(),
    inches: inches.toString(),
  };
}

/**
 * Build URLSearchParams from an object, only including defined values
 *
 * Handles proper type conversion:
 * - Numbers: Converted to strings (including 0)
 * - Strings: Only added if truthy (non-empty)
 * - Null/undefined: Skipped
 *
 * @param params - Object with query parameter key-value pairs
 * @returns URLSearchParams with only defined values
 *
 * @example
 * const params = buildQueryParams({
 *   sport: 'basketball',
 *   offset: 0,        // Included (0 is valid)
 *   limit: 10,
 *   searchText: '',   // Excluded (empty string)
 *   country: undefined // Excluded
 * });
 * // Result: sport=basketball&offset=0&limit=10
 */
export function buildQueryParams(
  params: Record<string, string | number | boolean | null | undefined>
): URLSearchParams {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    // For numbers: include if defined (0 is valid)
    if (typeof value === 'number') {
      queryParams.append(key, value.toString());
    }
    // For booleans: include if defined
    else if (typeof value === 'boolean') {
      queryParams.append(key, value.toString());
    }
    // For strings: include if truthy (non-empty)
    else if (typeof value === 'string' && value) {
      queryParams.append(key, value);
    }
    // Skip null/undefined
  });

  return queryParams;
}
