"use client"

import { useState } from "react"
import { VetSideMenu, VetBottomMenu, VetProfile, VetRequestsView, VetFarmsView } from "@/components/vet"
import { LoadingSpinner } from "@/components/shared"
import { useAuth } from "@/hooks"
import type { DashboardView } from "@/types"

export default function VetDashboard() {
  const { isChecking } = useAuth("/dashboard/vet")
  const [activeView, setActiveView] = useState<DashboardView>("requests")

  if (isChecking) {
    return <LoadingSpinner />
  }

  return (
    <div className="flex min-h-screen bg-green-50 dark:bg-green-950">
      <VetSideMenu activeView={activeView} setActiveView={setActiveView} />

      <main className="flex-1 pb-20 md:pb-0 md:ml-64">
        <div className="container mx-auto px-4 py-8">
          {activeView === "requests" && <VetRequestsView />}
          {activeView === "farms" && <VetFarmsView />}
          {activeView === "profile" && <VetProfile />}
        </div>
      </main>

      <VetBottomMenu activeView={activeView} setActiveView={setActiveView} />
    </div>
  )
}
