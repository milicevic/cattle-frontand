import { useState, useCallback } from "react"
import api from "@/lib/api"
import type { VetRequest } from "@/types"

interface UseVetRequestsOptions {
  onCancelSuccess?: () => void
}

export function useVetRequests(options?: UseVetRequestsOptions) {
  const [requests, setRequests] = useState<VetRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")

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

  const cancelRequest = useCallback(async (requestId: number) => {
    try {
      setIsLoading(true)
      setError("")
      const response = await api.delete(`/api/vet-requests/${requestId}`)
      
      if (response.ok) {
        await loadRequests()
        options?.onCancelSuccess?.()
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
  }, [loadRequests, options])

  return {
    requests,
    isLoading,
    error,
    loadRequests,
    cancelRequest,
  }
}
