import { useState, useCallback } from "react"
import api from "@/lib/api"
import type { Farm } from "@/types"

export function useFarms() {
  const [farms, setFarms] = useState<Farm[]>([])
  const [assignedFarms, setAssignedFarms] = useState<Farm[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")

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

  const sendRequest = useCallback(async (farmId: number, onSuccess?: () => void) => {
    try {
      const response = await api.post("/api/vet-requests", {
        farm_id: farmId,
      })

      if (response.ok) {
        await loadFarms()
        await loadAssignedFarms()
        onSuccess?.()
        return { success: true }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.message || "Failed to send request" }
      }
    } catch (err) {
      return { success: false, error: "An error occurred while sending request" }
    }
  }, [loadFarms, loadAssignedFarms])

  return {
    farms,
    assignedFarms,
    isLoading,
    error,
    loadFarms,
    loadAssignedFarms,
    sendRequest,
  }
}
