"use client"

import { useEffect } from "react"
import { initTranslations } from "@/lib/translations"

/**
 * Translation Provider - Initializes translations on app startup
 * Add this to your root layout
 */
export function TranslationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize translations when app loads
    initTranslations()
  }, [])

  return <>{children}</>
}
