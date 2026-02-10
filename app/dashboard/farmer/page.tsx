"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SideMenu } from "@/components/farmer/SideMenu"
import { BottomMenu } from "@/components/farmer/BottomMenu"
import { FarmInfo } from "@/components/farmer/FarmInfo"
import { AnimalsManagement } from "@/components/farmer/AnimalsManagement"
import { VetManagement } from "@/components/farmer/VetManagement"
import { UpcomingCalvingsWidget } from "@/components/farmer/UpcomingCalvingsWidget"
import { InseminationWidget } from "@/components/farmer/InseminationWidget"
import { NotificationsWidget } from "@/components/farmer/NotificationsWidget"
import { isAuthenticated } from "@/lib/auth"

type DashboardView = "farm" | "animals" | "vets"

export default function FarmerDashboard() {
  const router = useRouter()
  const [activeView, setActiveView] = useState<DashboardView>("farm")
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Middleware handles authentication check, but we can verify token exists
    // If no token in localStorage, redirect (middleware should have caught this, but double-check)
    if (!isAuthenticated()) {
      // Use window.location to ensure full redirect (middleware will handle it)
      window.location.href = "/login?redirect=/dashboard/farmer"
      return
    }
    setIsChecking(false)
  }, [router])

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-green-50 dark:bg-green-950">
        <div className="text-green-800 dark:text-green-200">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-green-50 dark:bg-green-950">
      {/* Side Menu - Desktop */}
      <SideMenu activeView={activeView} setActiveView={setActiveView} />

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0 md:ml-64">
        <div className="container mx-auto px-4 py-8">
          {activeView === "farm" && (
            <div className="space-y-6">
              <NotificationsWidget />
              <FarmInfo />
              <UpcomingCalvingsWidget />
              <InseminationWidget />
            </div>
          )}
          {activeView === "animals" && <AnimalsManagement />}
          {activeView === "vets" && <VetManagement />}
        </div>
      </main>

      {/* Bottom Menu - Mobile */}
      <BottomMenu activeView={activeView} setActiveView={setActiveView} />
    </div>
  )
}
