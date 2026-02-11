/**
 * Helper functions for testing geolocation-based translations on localhost
 */

import { setTestCountry, getTestCountryCode } from "./api"

/**
 * Set test country for geolocation testing
 * This will make all API requests include X-Test-Country header
 * 
 * Examples:
 * - setTestCountryForSerbia() - Test Serbian translations
 * - setTestCountryForUSA() - Test US English
 * - clearTestCountry() - Remove test country (use real geolocation)
 */
export function setTestCountryForSerbia() {
  setTestCountry('RS')
  console.log('✅ Test country set to Serbia (RS) - Serbian translations will be used')
}

export function setTestCountryForUSA() {
  setTestCountry('US')
  console.log('✅ Test country set to USA (US) - US English translations will be used')
}

export function setTestCountryForUK() {
  setTestCountry('GB')
  console.log('✅ Test country set to UK (GB) - UK English translations will be used')
}

export function setTestCountryForSpain() {
  setTestCountry('ES')
  console.log('✅ Test country set to Spain (ES) - Spanish translations will be used')
}

export function clearTestCountry() {
  setTestCountry(null)
  console.log('✅ Test country cleared - using real geolocation')
}

export function getCurrentTestCountry(): string | null {
  return getTestCountryCode()
}

/**
 * Available test countries:
 * - RS (Serbia) → Serbian (sr)
 * - BA (Bosnia) → Serbian (sr)
 * - ME (Montenegro) → Serbian (sr)
 * - US (USA) → English US (en_US)
 * - GB (UK) → English UK (en_GB)
 * - ES (Spain) → Spanish (es)
 * - FR (France) → French (fr)
 * - DE (Germany) → German (de)
 */
