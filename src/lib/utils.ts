import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert feet and inches to total inches
 * @param feet - Number of feet
 * @param inches - Number of inches
 * @returns Total inches, or null if both inputs are empty/zero
 */
export function feetInchesToInches(feet: string | number, inches: string | number): number | null {
  const feetNum = typeof feet === "string" ? parseInt(feet) : feet;
  const inchesNum = typeof inches === "string" ? parseInt(inches) : inches;
  
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
export function inchesToFeetInches(totalInches: number | null | undefined): { feet: string; inches: string } {
  if (!totalInches) {
    return { feet: "", inches: "" };
  }
  
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  
  return {
    feet: feet.toString(),
    inches: inches.toString(),
  };
}
