"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import api from "@/lib/api"
import { VetSideMenu } from "@/components/vet/VetSideMenu"
import { VetBottomMenu } from "@/components/vet/VetBottomMenu"
import { VetProfile } from "@/components/vet/VetProfile"
import { VetAnimalsManagement } from "@/components/vet/VetAnimalsManagement"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Users, FileText, Send, CheckCircle, XCircle, Clock, RefreshCw, Trash2 } from "lucide-react"

type DashboardView = "requests" | "farms" | "profile"

interface VetRequest {
  id: number
  farm_id: number
  status: 'pending' | 'approved' | 'rejected'
  message?: string
  requested_at: string
  responded_at?: string
  farm?: {
    id: number
    name: string
    location?: string
    state?: string
  }
}

interface Farm {
  id: number
  name: string
  location?: string
  state?: string
  is_assigned?: boolean
  has_pending_request?: boolean
  is_active?: boolean
  farmer?: {
    id: number
  }
  assigned_at?: string
}

interface Animal {
  id: number
  tag_number: string
  name?: string
  species: string
  type: string
  gender: string
  date_of_birth?: string
}

export default function VetDashboard() {
  const router = useRouter()
  const [activeView, setActiveView] = useState<DashboardView>("requests")
  const [viewMode, setViewMode] = useState<"browse" | "assigned">("browse")
  const [isChecking, setIsChecking] = useState(true)
  const [requests, setRequests] = useState<VetRequest[]>([])
  const [farms, setFarms] = useState<Farm[]>([])
  const [assignedFarms, setAssignedFarms] = useState<Farm[]>([])
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [hideApproved, setHideApproved] = useState(true)

  const loadRequests = useCallback(async () => {
    try {
      setIsLoading(true)
      setError("")
      const response = await api.get("/api/vet-requests/my-requests")
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests || [])
      } else {
        setError("Failed to load requests")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadFarms = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await api.get("/api/vet-requests/farms")
      if (response.ok) {
        const data = await response.json()
        setFarms(data.farms || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.message || "Failed to load farms")
      }
    } catch (err) {
      console.error("Failed to load farms:", err)
      setError(err instanceof Error ? err.message : "Failed to load farms")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadAssignedFarms = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await api.get("/api/vet-requests/assigned-farms")
      if (response.ok) {
        const data = await response.json()
        setAssignedFarms(data.farms || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.message || "Failed to load assigned farms")
      }
    } catch (err) {
      console.error("Failed to load assigned farms:", err)
      setError(err instanceof Error ? err.message : "Failed to load assigned farms")
    } finally {
      setIsLoading(false)
    }
  }, [])


  useEffect(() => {
    // Check authentication on mount
    if (!isAuthenticated()) {
      router.push("/login?redirect=/dashboard/vet")
      return
    }
    setIsChecking(false)
    loadRequests()
    loadFarms()
    loadAssignedFarms()
  }, [router, loadRequests, loadFarms, loadAssignedFarms])


  const handleSendRequest = async (farmId: number) => {
    try {
      const response = await api.post("/api/vet-requests", {
        farm_id: farmId,
      })

      if (response.ok) {
        await loadFarms()
        await loadRequests()
        await loadAssignedFarms()
      } else {
        const errorData = await response.json()
        alert(errorData.message || "Failed to send request")
      }
    } catch (err) {
      alert("An error occurred while sending request")
    }
  }

  const handleCancelRequest = async (requestId: number) => {
    if (!confirm("Are you sure you want to cancel this request?")) {
      return
    }

    try {
      setIsLoading(true)
      setError("")
      const response = await api.delete(`/api/vet-requests/${requestId}`)
      
      if (response.ok) {
        await loadRequests()
        await loadFarms()
        await loadAssignedFarms()
      } else {
        try {
          const errorData = await response.json()
          setError(errorData.message || "Failed to cancel request")
        } catch {
          setError(`Failed to cancel request: ${response.status} ${response.statusText}`)
        }
      }
    } catch (err) {
      console.error("Error cancelling request:", err)
      setError(err instanceof Error ? err.message : "Failed to cancel request")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        )
    }
  }

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
      <VetSideMenu activeView={activeView} setActiveView={setActiveView} />

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0 md:ml-64">
        <div className="container mx-auto px-4 py-8">

        {/* Requests View */}
        {activeView === "requests" && (
          <div className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            <Card className="border-green-200 dark:border-green-800 bg-white dark:bg-green-900/50">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-green-800 dark:text-green-100">
                      My Farm Requests
                    </CardTitle>
                    <CardDescription className="text-green-700 dark:text-green-300">
                      View the status of your requests to join farms
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadRequests}
                    disabled={isLoading}
                    className="border-green-300 dark:border-green-700"
                  >
                    <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hideApproved}
                      onChange={(e) => setHideApproved(e.target.checked)}
                      className="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500"
                    />
                    Hide approved requests
                  </label>
                </div>
                {isLoading ? (
                  <div className="text-center py-8 text-green-600 dark:text-green-400">
                    Loading...
                  </div>
                ) : (() => {
                  const filteredRequests = hideApproved 
                    ? requests.filter(r => r.status !== 'approved')
                    : requests
                  return filteredRequests.length === 0 ? (
                    <div className="text-center py-8 text-green-600 dark:text-green-400">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{hideApproved ? 'No pending or rejected requests found.' : 'No requests found. Browse farms to send a request.'}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredRequests.map((request) => (
                      <div
                        key={request.id}
                        className="p-4 border border-green-200 dark:border-green-800 rounded-lg bg-white dark:bg-green-900/30"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-green-800 dark:text-green-100">
                              {request.farm?.name || `Farm #${request.farm_id}`}
                            </h3>
                            {request.farm?.location && (
                              <p className="text-sm text-green-600 dark:text-green-400">
                                {request.farm.location}
                                {request.farm.state && `, ${request.farm.state}`}
                              </p>
                            )}
                            {request.message && (
                              <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                                {request.message}
                              </p>
                            )}
                            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                              Requested: {new Date(request.requested_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {getStatusBadge(request.status)}
                            {request.status === 'pending' && (
                              <Button
                                onClick={() => handleCancelRequest(request.id)}
                                variant="outline"
                                size="sm"
                                disabled={isLoading}
                                className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
                                title="Cancel request"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      ))}
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Farms View */}
        {activeView === "farms" && (
          <div className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Tabs */}
            <Card className="border-green-200 dark:border-green-800 bg-white dark:bg-green-900/50">
              <CardHeader>
                <div className="flex gap-2 border-b border-green-200 dark:border-green-700">
                  <button
                    onClick={() => {
                      setViewMode("browse")
                      setSelectedFarm(null)
                    }}
                    className={`px-4 py-2 font-medium transition-colors ${
                      viewMode === "browse"
                        ? "text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400"
                        : "text-green-700 dark:text-green-300 hover:text-green-600 dark:hover:text-green-400"
                    }`}
                  >
                    Browse Farms
                  </button>
                  <button
                    onClick={() => {
                      setViewMode("assigned")
                      setSelectedFarm(null)
                    }}
                    className={`px-4 py-2 font-medium transition-colors ${
                      viewMode === "assigned"
                        ? "text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400"
                        : "text-green-700 dark:text-green-300 hover:text-green-600 dark:hover:text-green-400"
                    }`}
                  >
                    My Assigned Farms
                  </button>
                </div>
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
                              // Find the assigned farm and set it
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
                            onClick={() => setSelectedFarm(selectedFarm?.id === farm.id ? null : farm)}
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

                {/* Selected Farm Animals */}
                {selectedFarm && (
                  <VetAnimalsManagement 
                    farmId={selectedFarm.id} 
                    farmName={selectedFarm.name}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* Profile View */}
        {activeView === "profile" && <VetProfile />}
        </div>
      </main>

      {/* Bottom Menu - Mobile */}
      <VetBottomMenu activeView={activeView} setActiveView={setActiveView} />
    </div>
  )
}
