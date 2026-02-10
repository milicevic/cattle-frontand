"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Send, CheckCircle, Clock } from "lucide-react"
import { ErrorAlert } from "@/components/shared/ErrorAlert"
import { Tabs } from "@/components/shared/Tabs"
import { useFarms } from "@/hooks/useFarms"
import { VetFarmDetails } from "./VetFarmDetails"
import type { Farm } from "@/types"

export function VetFarmsView() {
  const { farms, assignedFarms, isLoading, error, loadFarms, loadAssignedFarms, sendRequest } = useFarms()
  const [viewMode, setViewMode] = useState<"browse" | "assigned">("browse")
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null)

  useEffect(() => {
    loadFarms()
    loadAssignedFarms()
  }, [loadFarms, loadAssignedFarms])

  const handleSendRequest = async (farmId: number) => {
    const result = await sendRequest(farmId)
    if (!result.success) {
      alert(result.error || "Failed to send request")
    }
  }

  const handleFarmSelect = (farm: Farm) => {
    setSelectedFarm(selectedFarm?.id === farm.id ? null : farm)
  }

  return (
    <div className="space-y-4">
      <ErrorAlert error={error} />

      {/* Tabs */}
      <Card className="border-green-200 dark:border-green-800 bg-white dark:bg-green-900/50">
        <CardHeader>
          <Tabs
            tabs={[
              { id: "browse", label: "Browse Farms" },
              { id: "assigned", label: "My Assigned Farms" },
            ]}
            activeTab={viewMode}
            onTabChange={(tabId) => {
              setViewMode(tabId as "browse" | "assigned")
              setSelectedFarm(null)
            }}
          />
        </CardHeader>
      </Card>

      {/* Browse Farms */}
      {viewMode === "browse" && (
        <Card className="border-green-200 dark:border-green-800 bg-white dark:bg-green-900/50">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-100">
              Available Farms
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Browse farms and send requests to join, or click on assigned farms to view details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-green-600 dark:text-green-400">
                Loading farms...
              </div>
            ) : farms.length === 0 ? (
              <div className="text-center py-8 text-green-600 dark:text-green-400">
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No farms available</p>
                <p className="text-sm mt-2">
                  Farms will appear here once farmers create them. Ask farmers to register and create their farms first.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {farms.map((farm) => (
                  <div
                    key={farm.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      farm.is_assigned
                        ? "border-green-200 dark:border-green-800 bg-white dark:bg-green-900/30 cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/40"
                        : "border-green-200 dark:border-green-800 bg-white dark:bg-green-900/30"
                    }`}
                    onClick={() => {
                      if (farm.is_assigned) {
                        const assignedFarm = assignedFarms.find(f => f.id === farm.id)
                        if (assignedFarm) {
                          setSelectedFarm(assignedFarm)
                          setViewMode("assigned")
                        }
                      }
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-800 dark:text-green-100">
                          {farm.name}
                          {farm.is_assigned && (
                            <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                              (Click to view)
                            </span>
                          )}
                        </h3>
                        {farm.location && (
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {farm.location}
                            {farm.state && `, ${farm.state}`}
                          </p>
                        )}
                      </div>
                      <div>
                        {farm.is_assigned ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Assigned
                          </span>
                        ) : farm.has_pending_request ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
                            <Clock className="w-3 h-3 mr-1" />
                            Request Pending
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSendRequest(farm.id)
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Send Request
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* My Assigned Farms */}
      {viewMode === "assigned" && (
        <>
          <Card className="border-green-200 dark:border-green-800 bg-white dark:bg-green-900/50">
            <CardHeader>
              <CardTitle className="text-green-800 dark:text-green-100">
                My Assigned Farms
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                Select a farm to view its details and animals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-green-600 dark:text-green-400">
                  Loading farms...
                </div>
              ) : assignedFarms.length === 0 ? (
                <div className="text-center py-8 text-green-600 dark:text-green-400">
                  <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No assigned farms yet.</p>
                  <p className="text-sm mt-2">
                    Browse farms and send requests to get assigned to farms.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {assignedFarms.map((farm) => (
                      <button
                            key={farm.id}
                            onClick={() => handleFarmSelect(farm)}
                            className={`w-full p-4 border rounded-lg text-left transition-colors ${
                              selectedFarm?.id === farm.id
                                ? "border-green-500 bg-green-50 dark:bg-green-900/50"
                                : "border-green-200 dark:border-green-800 bg-white dark:bg-green-900/30 hover:bg-green-50 dark:hover:bg-green-900/40"
                            }`}
                          >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-green-800 dark:text-green-100">
                            {farm.name}
                          </h3>
                          {farm.location && (
                            <p className="text-sm text-green-600 dark:text-green-400">
                              {farm.location}
                              {farm.state && `, ${farm.state}`}
                            </p>
                          )}
                          {farm.assigned_at && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                              Assigned: {new Date(farm.assigned_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <CheckCircle className={`w-5 h-5 text-green-600 ${selectedFarm?.id === farm.id ? '' : 'opacity-50'}`} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Farm Details */}
          {selectedFarm && (
            <VetFarmDetails farm={selectedFarm} />
          )}
        </>
      )}
    </div>
  )
}
