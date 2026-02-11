"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Edit, MapPin, Building2, CheckCircle2, XCircle } from "lucide-react"
import api from "@/lib/api"
import { useTranslations } from "@/hooks/useTranslations"

export function FarmInfo() {
  const router = useRouter()
  const { t } = useTranslations()
  const [farm, setFarm] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadFarm()
  }, [])

  const loadFarm = async () => {
    try {
      setIsLoading(true)
      const response = await api.get("/api/farm")
      if (response.ok) {
        const data = await response.json()
        setFarm(data.farm)
      } else if (response.status === 404) {
        setFarm(null)
      }
    } catch (err) {
      console.error("Error loading farm:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="border-green-200 dark:border-green-800 bg-white dark:bg-green-900/50 shadow-lg">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-green-600 dark:text-green-400">
              <svg className="animate-spin h-8 w-8 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-lg font-medium">{t("farm.loading_farm")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!farm) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="border-green-200 dark:border-green-800 bg-white dark:bg-green-900/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-b border-green-200 dark:border-green-700">
            <CardTitle className="text-2xl text-green-800 dark:text-green-100 font-bold">
              {t("farm.title")}
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300 mt-1">
              {t("farm.no_farm_found")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-green-400 dark:text-green-600" />
              <p className="text-green-700 dark:text-green-300 mb-6 text-lg">
                Get started by creating your farm profile
              </p>
              <Button
                onClick={() => router.push("/dashboard/farmer/edit")}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all h-12 px-8 text-base"
              >
                <Building2 className="w-5 h-5 mr-2" />
                Create Farm
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-green-200 dark:border-green-800 bg-white dark:bg-green-900/50">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-green-800 dark:text-green-100 flex items-center gap-2">
                <span className="text-3xl">🏡</span>
                {t("farm.title")}
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                {t("farm.manage_details")}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/farmer/edit")}
              className="text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-900"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Farm Name Card */}
            <Card className="border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/30 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">
                    {t("farm.name")}
                  </CardTitle>
                  <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-green-800 dark:text-green-100 text-xl font-bold">
                  {farm.name}
                </p>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card className="border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/30 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">
                    {t("common.status")}
                  </CardTitle>
                  {farm.is_active ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${
                  farm.is_active
                    ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                }`}>
                  {farm.is_active ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      {t("farm.active")}
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      {t("farm.inactive")}
                    </>
                  )}
                </span>
              </CardContent>
            </Card>

            {/* Location Card */}
            {farm.location && (
              <Card className="border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/30 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">
                      Location
                    </CardTitle>
                    <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-green-800 dark:text-green-200 text-base font-medium">
                    {farm.location}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* State Card */}
            {farm.state && (
              <Card className="border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/30 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">
                      {t("farm.state_province")}
                    </CardTitle>
                    <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-green-800 dark:text-green-200 text-base font-medium">
                    {farm.state}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
