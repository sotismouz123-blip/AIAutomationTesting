/**
 * Generate a random string matching pattern [A-Za-z]{5}
 */
export function generateRandomString(length: number = 5): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Clean country name by removing spaces and special symbols
 * @param country - Country name to clean
 * @returns Cleaned country name
 */
export function cleanCountryName(country: string): string {
  // Remove spaces, dots, hyphens, apostrophes and other special characters
  return country
    .replace(/[\s.'()-]/g, '')  // Remove spaces and common symbols
    .replace(/[^A-Za-z0-9]/g, '');  // Remove any remaining non-alphanumeric characters
}

/**
 * Generate email address based on country
 * Pattern: nickchigg+{countryName}Test{randomString}@gmail.com
 *
 * @param country - Country name
 * @returns Generated email address
 *
 * @example
 * generateEmailForCountry("United States") // => "nickchigg+UnitedStatesTestAbCdE@gmail.com"
 * generateEmailForCountry("St. Kitts") // => "nickchigg+StKittsTestXyZaB@gmail.com"
 */
export function generateEmailForCountry(country: string): string {
  const cleanedCountry = cleanCountryName(country);
  const randomString = generateRandomString(5);
  const name = `Test${randomString}`;
  return `nickchigg+${cleanedCountry}${name}@gmail.com`;
}

/**
 * Generate registration data for a specific country
 */
export function generateRegistrationData(country: string, config: {
  phoneNumber?: string;
  password?: string;
  accountType?: string;
  bonusScheme?: string;
  currency?: string;
  leverage?: string;
} = {}) {
  
  const firstName = `Test${country.slice(0, 5)}`;
  const lastName = `User${country.slice(0, 5)}`;

  return {
    country,
    firstName,
    lastName,
    email: generateEmailForCountry(country),
    phoneNumber: config.phoneNumber || '12341234',
    password: config.password || 'Password1!',
    accountType: config.accountType || 'Standard Floating',
    bonusScheme: config.bonusScheme || 'Not applicable',
    currency: config.currency || 'USD',
    leverage: config.leverage || '1:500'
  };
}
