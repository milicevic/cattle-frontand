"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SideMenu } from "@/components/farmer/SideMenu"
import { BottomMenu } from "@/components/farmer/BottomMenu"
import { FarmEdit } from "@/components/farmer/FarmEdit"
import { isAuthenticated } from "@/lib/auth"

export default function FarmEditPage() {
  const router = useRouter()

  useEffect(() => {
    // Check authentication on mount
    if (!isAuthenticated()) {
      router.push("/login?redirect=/dashboard/farmer/edit")
      return
    }
  }, [router])

  return (
    <div className="flex min-h-screen bg-green-50 dark:bg-green-950">
      {/* Side Menu - Desktop */}
      <SideMenu activeView="farm" setActiveView={() => {}} />

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0 md:ml-64">
        <div className="container mx-auto px-4 py-8">
          <FarmEdit />
        </div>
      </main>

      {/* Bottom Menu - Mobile */}
      <BottomMenu activeView="farm" setActiveView={() => {}} />
    </div>
  )
}
