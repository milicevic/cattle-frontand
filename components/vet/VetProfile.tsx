"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Briefcase, Building2, FileText, LogOut, Edit2, Save, X } from "lucide-react"
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
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    license_number: "",
    specialization: "",
    clinic_name: "",
  })

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    if (profile?.profile) {
      setFormData({
        license_number: profile.profile.license_number || "",
        specialization: profile.profile.specialization || "",
        clinic_name: profile.profile.clinic_name || "",
      })
    }
  }, [profile])

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

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError("")
      const response = await api.put("/api/vet/profile", formData)
      if (response.ok) {
        const data = await response.json()
        setProfile({
          ...profile!,
          profile: {
            ...profile!.profile,
            ...data.vet,
          },
        })
        setIsEditing(false)
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to update profile")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile?.profile) {
      setFormData({
        license_number: profile.profile.license_number || "",
        specialization: profile.profile.specialization || "",
        clinic_name: profile.profile.clinic_name || "",
      })
    }
    setIsEditing(false)
    setError("")
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-green-800 dark:text-green-100 flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                Your veterinarian profile details
              </CardDescription>
            </div>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-700"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Email</p>
                <p className="text-sm text-green-600 dark:text-green-400">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-1">
                    <Label htmlFor="license_number" className="text-sm font-medium text-green-800 dark:text-green-200">
                      License Number
                    </Label>
                    <Input
                      id="license_number"
                      value={formData.license_number}
                      onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                      placeholder="Enter license number"
                      className="bg-white dark:bg-green-800/50"
                    />
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">License Number</p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {profile.profile?.license_number || "Not set"}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-1">
                    <Label htmlFor="specialization" className="text-sm font-medium text-green-800 dark:text-green-200">
                      Specialization
                    </Label>
                    <Input
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      placeholder="Enter specialization"
                      className="bg-white dark:bg-green-800/50"
                    />
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Specialization</p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {profile.profile?.specialization || "Not set"}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-1">
                    <Label htmlFor="clinic_name" className="text-sm font-medium text-green-800 dark:text-green-200">
                      Clinic Name
                    </Label>
                    <Input
                      id="clinic_name"
                      value={formData.clinic_name}
                      onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
                      placeholder="Enter clinic name"
                      className="bg-white dark:bg-green-800/50"
                    />
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Clinic Name</p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {profile.profile?.clinic_name || "Not set"}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          {isEditing && (
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                onClick={handleCancel}
                disabled={isSaving}
                variant="outline"
                className="text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-700"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
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
