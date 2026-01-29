"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import api from "@/lib/api"

interface Vet {
  id: number
  license_number: string
  specialization?: string
  clinic_name?: string
  user: {
    email: string
  }
}

interface VetRequest {
  id: number
  vet_id: number
  farm_id: number
  status: 'pending' | 'approved' | 'rejected'
  message?: string
  requested_at: string
  responded_at?: string
  vet?: {
    id: number
    license_number: string
    specialization?: string
    clinic_name?: string
  }
}

export function VetManagement() {
  const [vets, setVets] = useState<Vet[]>([])
  const [assignedVets, setAssignedVets] = useState<Vet[]>([])
  const [pendingRequests, setPendingRequests] = useState<VetRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    loadVets()
    loadAssignedVets()
    loadPendingRequests()
  }, [])

  const loadVets = async () => {
    try {
      const response = await api.get("/api/vets")
      if (response.ok) {
        const data = await response.json()
        setVets(data.vets || [])
      }
    } catch (err) {
      console.error("Error loading vets:", err)
    }
  }

  const loadAssignedVets = async () => {
    try {
      const response = await api.get("/api/farm/vets")
      if (response.ok) {
        const data = await response.json()
        setAssignedVets(data.vets || [])
      }
    } catch (err) {
      console.error("Error loading assigned vets:", err)
    }
  }

  const assignVet = async (vetId: number) => {
    setIsLoading(true)
    try {
      const response = await api.post(`/api/farm/vets/${vetId}`)
      if (response.ok) {
        await loadAssignedVets()
      }
    } catch (err) {
      console.error("Error assigning vet:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadPendingRequests = async () => {
    try {
      const response = await api.get("/api/vet-requests/pending")
      if (response.ok) {
        const data = await response.json()
        setPendingRequests(data.requests || [])
      }
    } catch (err) {
      console.error("Error loading pending requests:", err)
    }
  }

  const approveRequest = async (requestId: number) => {
    setIsLoading(true)
    setError("")
    try {
      const response = await api.post(`/api/vet-requests/${requestId}/approve`)
      if (response.ok) {
        await loadPendingRequests()
        await loadAssignedVets()
      } else {
        try {
          const errorData = await response.json()
          setError(errorData.message || `Failed to approve request: ${response.status} ${response.statusText}`)
        } catch {
          setError(`Failed to approve request: ${response.status} ${response.statusText}`)
        }
      }
    } catch (err) {
      console.error("Error approving request:", err)
      setError(err instanceof Error ? err.message : "Failed to approve request")
    } finally {
      setIsLoading(false)
    }
  }

  const rejectRequest = async (requestId: number) => {
    setIsLoading(true)
    setError("")
    try {
      const response = await api.post(`/api/vet-requests/${requestId}/reject`)
      if (response.ok) {
        await loadPendingRequests()
      } else {
        try {
          const errorData = await response.json()
          setError(errorData.message || `Failed to reject request: ${response.status} ${response.statusText}`)
        } catch {
          setError(`Failed to reject request: ${response.status} ${response.statusText}`)
        }
      }
    } catch (err) {
      console.error("Error rejecting request:", err)
      setError(err instanceof Error ? err.message : "Failed to reject request")
    } finally {
      setIsLoading(false)
    }
  }

  const removeVet = async (vetId: number) => {
    setIsLoading(true)
    try {
      const response = await api.delete(`/api/farm/vets/${vetId}`)
      if (response.ok) {
        await loadAssignedVets()
      }
    } catch (err) {
      console.error("Error removing vet:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredVets = vets.filter(
    (vet) =>
      vet.license_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vet.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vet.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const availableVets = filteredVets.filter(
    (vet) => !assignedVets.some((av) => av.id === vet.id)
  )

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Pending Requests */}
      <Card className="border-green-200 dark:border-green-800 bg-white dark:bg-green-900/50">
        <CardHeader>
          <CardTitle className="text-green-800 dark:text-green-100 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Vet Requests
          </CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300">
            Review and approve or reject requests from veterinarians
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 border border-green-200 dark:border-green-700 rounded-lg bg-white dark:bg-green-900/30"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-800 dark:text-green-100">
                        {request.vet?.license_number || `Vet #${request.vet_id}`}
                      </h3>
                      {request.vet?.specialization && (
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Specialization: {request.vet.specialization}
                        </p>
                      )}
                      {request.vet?.clinic_name && (
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Clinic: {request.vet.clinic_name}
                        </p>
                      )}
                      {request.message && (
                        <p className="text-sm text-green-700 dark:text-green-300 mt-2 italic">
                          "{request.message}"
                        </p>
                      )}
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                        Requested: {new Date(request.requested_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => approveRequest(request.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={isLoading}
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => rejectRequest(request.id)}
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-700"
                        disabled={isLoading}
                        size="sm"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-green-600 dark:text-green-400 py-8">
              No pending requests at this time.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Assigned Vets */}
      <Card className="border-green-200 dark:border-green-800 bg-white dark:bg-green-900/50">
        <CardHeader>
          <CardTitle className="text-green-800 dark:text-green-100">
            Assigned Veterinarians
          </CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300">
            Veterinarians currently assigned to your farm
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assignedVets.length > 0 ? (
            <div className="space-y-4">
              {assignedVets.map((vet) => (
                <div
                  key={vet.id}
                  className="flex items-center justify-between p-4 border border-green-200 dark:border-green-700 rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-100">
                      {vet.user.email}
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      License: {vet.license_number}
                    </p>
                    {vet.specialization && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Specialization: {vet.specialization}
                      </p>
                    )}
                    {vet.clinic_name && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Clinic: {vet.clinic_name}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => removeVet(vet.id)}
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    disabled={isLoading}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-green-600 dark:text-green-400 py-8">
              No veterinarians assigned yet. Search and assign vets below.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Available Vets */}
      <Card className="border-green-200 dark:border-green-800 bg-white dark:bg-green-900/50">
        <CardHeader>
          <CardTitle className="text-green-800 dark:text-green-100">
            Available Veterinarians
          </CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300">
            Search and assign veterinarians to your farm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by license, email, or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-green-200 dark:border-green-700"
            />
          </div>

          {availableVets.length > 0 ? (
            <div className="space-y-4">
              {availableVets.map((vet) => (
                <div
                  key={vet.id}
                  className="flex items-center justify-between p-4 border border-green-200 dark:border-green-700 rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-100">
                      {vet.user.email}
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      License: {vet.license_number}
                    </p>
                    {vet.specialization && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Specialization: {vet.specialization}
                      </p>
                    )}
                    {vet.clinic_name && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Clinic: {vet.clinic_name}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => assignVet(vet.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={isLoading}
                  >
                    Assign
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-green-600 dark:text-green-400 py-8">
              {searchTerm
                ? "No veterinarians found matching your search."
                : "No available veterinarians found."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
