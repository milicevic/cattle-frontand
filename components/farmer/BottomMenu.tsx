"use client"

import { useTranslations } from "@/hooks/useTranslations"

type DashboardView = "farm" | "animals" | "vets"

interface BottomMenuProps {
  activeView: DashboardView
  setActiveView: (view: DashboardView) => void
}

export function BottomMenu({ activeView, setActiveView }: BottomMenuProps) {
  const { t } = useTranslations()
  
  const menuItems = [
    { id: "farm" as DashboardView, label: t("menu.farm_information"), icon: "🏡" },
    { id: "animals" as DashboardView, label: t("menu.animals"), icon: "🐄" },
    { id: "vets" as DashboardView, label: t("menu.veterinarians"), icon: "👨‍⚕️" },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-green-900 border-t border-green-200 dark:border-green-800 z-50">
      <div className="flex justify-around items-center h-16">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeView === item.id
                ? "text-green-600 dark:text-green-400"
                : "text-green-400 dark:text-green-600"
            }`}
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
