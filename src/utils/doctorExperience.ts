/**
 * Calculate doctor's experience in years from their start year
 * @param startYear - The year when the doctor started their practice
 * @returns Number of years of experience, or undefined if startYear is not provided
 */
export function calculateExperience(startYear?: number): number | undefined {
  if (!startYear || isNaN(startYear)) {
    return undefined;
  }
  
  const currentYear = new Date().getFullYear();
  
  // Validate start year is reasonable (between 1900 and current year)
  if (startYear < 1900 || startYear > currentYear) {
    return undefined;
  }
  
  return currentYear - startYear;
}

/**
 * Extract experience start year from doctor's info text
 * @param info - Doctor's info text that may contain "стаж с YYYY" pattern
 * @returns The start year if found, undefined otherwise
 */
export function extractExperienceStartYearFromInfo(info: string): number | undefined {
  const patterns = [
    /стаж\s+с\s+(\d{4})/i,
    /Врачебный\s+стаж\s+с\s+(\d{4})/i
  ];
  
  for (const pattern of patterns) {
    const match = info.match(pattern);
    if (match && match[1]) {
      const year = Number.parseInt(match[1], 10);
      if (!isNaN(year) && year >= 1900 && year <= new Date().getFullYear()) {
        return year;
      }
    }
  }
  
  return undefined;
}

/**
 * Get doctor's experience from either experienceStartYear field or by parsing info text
 * @param doctor - Doctor object with info field and optionally experienceStartYear
 * @returns Number of years of experience, or undefined if not available
 */
export function getDoctorExperience(doctor: { 
  info?: string; 
  experienceStartYear?: number 
}): number | undefined {
  // First try to use the explicit experienceStartYear field
  if (doctor.experienceStartYear !== undefined) {
    return calculateExperience(doctor.experienceStartYear);
  }
  
  // Fallback to parsing from info text
  if (doctor.info) {
    const startYear = extractExperienceStartYearFromInfo(doctor.info);
    if (startYear !== undefined) {
      return calculateExperience(startYear);
    }
  }
  
  return undefined;
}

/**
 * Format experience text for display
 * @param years - Number of years of experience
 * @returns Formatted string like "15 лет стажа" or "Стаж: 15 лет"
 */
export function formatExperience(years: number, style: 'short' | 'full' = 'short'): string {
  if (style === 'short') {
    return `${years} лет`;
  }
  return `${years} лет стажа`;
}
