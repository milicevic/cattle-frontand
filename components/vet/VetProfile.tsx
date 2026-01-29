"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Mail, Briefcase, Building2, FileText, LogOut } from "lucide-react"
import { logout } from "@/lib/auth"
import { useRouter } from "next/navigation"
import api from "@/lib/api"

interface VetProfileData {
  id: number
  email: string
  profile_type: string
  profile: {
    id: number
    license_number: string
    specialization: string
    clinic_name: string
  }
}

export function VetProfile() {
  const router = useRouter()
  const [profile, setProfile] = useState<VetProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      setError("")
      const response = await api.get("/api/user")
      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
      } else {
        setError("Failed to load profile")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  if (isLoading) {
    return (
      <Card className="border-green-200 dark:border-green-800 bg-white dark:bg-green-900/50">
        <CardContent className="pt-6">
          <div className="text-center py-8 text-green-600 dark:text-green-400">
            Loading profile...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-green-200 dark:border-green-800 bg-white dark:bg-green-900/50">
        <CardContent className="pt-6">
          <div className="text-center py-8 text-red-600 dark:text-red-400">
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card className="border-green-200 dark:border-green-800 bg-white dark:bg-green-900/50">
        <CardContent className="pt-6">
          <div className="text-center py-8 text-green-600 dark:text-green-400">
            No profile data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-green-200 dark:border-green-800 bg-white dark:bg-green-900/50">
        <CardHeader>
          <CardTitle className="text-green-800 dark:text-green-100 flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300">
            Your veterinarian profile details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Email</p>
                <p className="text-sm text-green-600 dark:text-green-400">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">License Number</p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {profile.profile?.license_number || "Not set"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Specialization</p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {profile.profile?.specialization || "Not set"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Clinic Name</p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {profile.profile?.clinic_name || "Not set"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 dark:border-green-800 bg-white dark:bg-green-900/50">
        <CardHeader>
          <CardTitle className="text-green-800 dark:text-green-100">Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full md:w-auto text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
