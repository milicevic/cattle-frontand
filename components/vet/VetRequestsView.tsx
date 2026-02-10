"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, RefreshCw, Trash2 } from "lucide-react"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ErrorAlert } from "@/components/shared/ErrorAlert"
import { useVetRequests } from "@/hooks/useVetRequests"
import { useFarms } from "@/hooks/useFarms"
import type { VetRequest } from "@/types"

export function VetRequestsView() {
  const { loadFarms, loadAssignedFarms } = useFarms()
  const { requests, isLoading, error, loadRequests, cancelRequest } = useVetRequests({
    onCancelSuccess: () => {
      loadFarms()
      loadAssignedFarms()
    }
  })
  const [hideApproved, setHideApproved] = useState(true)

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  const handleCancel = async (requestId: number) => {
    if (!confirm("Are you sure you want to cancel this request?")) {
      return
    }
    await cancelRequest(requestId)
  }

  const filteredRequests = hideApproved 
    ? requests.filter(r => r.status !== 'approved')
    : requests

  return (
    <div className="space-y-4">
      <ErrorAlert error={error} />
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
          ) : filteredRequests.length === 0 ? (
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
                      <StatusBadge status={request.status} />
                      {request.status === 'pending' && (
                        <Button
                          onClick={() => handleCancel(request.id)}
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
