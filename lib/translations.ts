import api from "./api"

export interface Translations {
  [key: string]: any
}

let cachedTranslations: Translations | null = null
let currentLocale: string = 'en'

/**
 * Fetch translations from the backend API
 */
export async function fetchTranslations(): Promise<Translations> {
  try {
    const response = await api.get("/api/translations")
    
    if (response.ok) {
      const data = await response.json()
      cachedTranslations = data.translations || {}
      currentLocale = data.locale || 'en'
      return cachedTranslations
    }
    
    // Fallback to empty object if API fails
    return {}
  } catch (error) {
    console.error("Error fetching translations:", error)
    return {}
  }
}

/**
 * Get translation value by key path (e.g., "common.welcome")
 */
export function t(key: string, translations?: Translations): string {
  const trans = translations || cachedTranslations || {}
  
  const keys = key.split('.')
  let value: any = trans
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return key // Return key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key
}

/**
 * Update user's locale preference
 */
export async function updateLocale(locale: string): Promise<boolean> {
  try {
    const response = await api.put("/api/translations/locale", { locale })
    
    if (response.ok) {
      currentLocale = locale
      // Clear cache to force reload
      cachedTranslations = null
      await fetchTranslations()
      return true
    }
    
    return false
  } catch (error) {
    console.error("Error updating locale:", error)
    return false
  }
}

/**
 * Get current locale
 */
export function getCurrentLocale(): string {
  return currentLocale
}

/**
 * Initialize translations (call this on app startup)
 */
export async function initTranslations(): Promise<void> {
  if (!cachedTranslations) {
    await fetchTranslations()
  }
}
