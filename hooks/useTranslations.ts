"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchTranslations, t as translate, updateLocale as updateLocaleAPI, getCurrentLocale, Translations } from "@/lib/translations"

export function useTranslations() {
  const [translations, setTranslations] = useState<Translations | null>(null)
  const [locale, setLocale] = useState<string>(getCurrentLocale())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTranslations()
  }, [])

  const loadTranslations = async () => {
    setIsLoading(true)
    try {
      const trans = await fetchTranslations()
      setTranslations(trans)
      setLocale(getCurrentLocale())
    } catch (error) {
      console.error("Failed to load translations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const t = useCallback((key: string): string => {
    return translate(key, translations || undefined)
  }, [translations])

  const updateLocale = useCallback(async (newLocale: string) => {
    const success = await updateLocaleAPI(newLocale)
    if (success) {
      await loadTranslations()
    }
    return success
  }, [])

  return {
    t,
    locale,
    updateLocale,
    isLoading,
    reload: loadTranslations,
  }
}
