"use client"

import { useRouter } from "next/navigation"
import { logout } from "@/lib/auth"

type DashboardView = "requests" | "farms" | "profile"

interface VetSideMenuProps {
  activeView: DashboardView
  setActiveView: (view: DashboardView) => void
}

export function VetSideMenu({ activeView, setActiveView }: VetSideMenuProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const menuItems = [
    { id: "requests" as DashboardView, label: "My Requests", icon: "📋" },
    { id: "farms" as DashboardView, label: "Browse Farms", icon: "🏡" },
    { id: "profile" as DashboardView, label: "Profile", icon: "👤" },
  ]

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white dark:bg-green-900 border-r border-green-200 dark:border-green-800">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-8">
          <h1 className="text-xl font-bold text-green-800 dark:text-green-100">
            Vet Dashboard
          </h1>
        </div>
        <nav className="flex-1 px-2 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeView === item.id
                  ? "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100"
                  : "text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-800/50"
              }`}
            >
              <span className="mr-3 text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-2 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <span className="mr-3">🚪</span>
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}
