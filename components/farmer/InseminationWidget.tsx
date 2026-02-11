"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Eye, AlertCircle, Calendar, Droplets, History, CheckCircle, XCircle, RefreshCw, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pagination } from "@/components/ui/pagination"
import api from "@/lib/api"
import { useTranslations } from "@/hooks/useTranslations"

interface CowNeedingInsemination {
  cow_id: number
  animal_id: number
  tag_number: string
  name?: string
  last_calving_date: string
  days_since_calving: number
  days_until_ideal: number
  is_overdue: boolean
  status: 'overdue' | 'ready' | 'approaching'
  latest_insemination?: {
    id: number
    insemination_date: string
    status: 'pending' | 'confirmed' | 'failed' | 'needs_repeat'
    notes?: string
    bull_id?: number | null
    bull?: { id: number; tag_number: string; name?: string } | null
  }
}

interface InseminationRecord {
  id: number
  insemination_date: string
  status: 'pending' | 'confirmed' | 'failed' | 'needs_repeat'
  notes?: string
  bull_id?: number | null
  bull?: { id: number; tag_number: string; name?: string } | null
  created_at: string
  updated_at: string
}

interface BullOption {
  id: number
  animalable_id: number
  tag_number: string
  name?: string
}

export function InseminationWidget() {
  const { t } = useTranslations()
  const [cows, setCows] = useState<CowNeedingInsemination[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [totalItems, setTotalItems] = useState(0)
  const [isInseminationDialogOpen, setIsInseminationDialogOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [selectedCow, setSelectedCow] = useState<CowNeedingInsemination | null>(null)
  const [selectedInsemination, setSelectedInsemination] = useState<InseminationRecord | null>(null)
  const [inseminationDate, setInseminationDate] = useState("")
  const [inseminationNotes, setInseminationNotes] = useState("")
  const [selectedBullId, setSelectedBullId] = useState<string>("")
  const [bulls, setBulls] = useState<BullOption[]>([])
  const [isLoadingBulls, setIsLoadingBulls] = useState(false)
  const [inseminationStatus, setInseminationStatus] = useState<'pending' | 'confirmed' | 'failed' | 'needs_repeat'>('pending')
  const [statusNotes, setStatusNotes] = useState("")
  const [inseminationHistory, setInseminationHistory] = useState<InseminationRecord[]>([])
  const [isRecordingInsemination, setIsRecordingInsemination] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [dialogError, setDialogError] = useState<string>("")

  const loadCows = useCallback(async (page: number, perPage: number) => {
    try {
      setIsLoading(true)
      setError("")
      const response = await api.get(`/api/animals/needing-insemination?page=${page}&per_page=${perPage}`)
      if (response.ok) {
        const data = await response.json()
        setCows(data.cows || [])
        setTotalItems(data.count || 0)
        setCurrentPage(data.current_page || 1)
      } else {
        setError("Failed to load cows needing insemination")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCows(currentPage, itemsPerPage)
  }, [currentPage, itemsPerPage, loadCows])

  const getStatusColor = (status: string, isOverdue: boolean) => {
    if (isOverdue) return "text-red-600 dark:text-red-400"
    if (status === 'ready') return "text-yellow-600 dark:text-yellow-400"
    return "text-green-600 dark:text-green-400"
  }

  const getStatusBadge = (status: string, isOverdue: boolean) => {
    if (isOverdue) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          {t("insemination.overdue")}
        </span>
      )
    }
    if (status === 'ready') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          Ready
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
        <Calendar className="w-3 h-3 mr-1" />
        {t("insemination.approaching")}
      </span>
    )
  }

  const loadBulls = useCallback(async () => {
    try {
      setIsLoadingBulls(true)
      const response = await api.get("/api/animals?type=Bull&per_page=100")
      if (response.ok) {
        const data = await response.json()
        const list: BullOption[] = (data.animals || []).map((a: { id: number; animalable_id: number; tag_number: string; name?: string }) => ({
          id: a.id,
          animalable_id: a.animalable_id,
          tag_number: a.tag_number,
          name: a.name,
        }))
        setBulls(list)
      }
    } catch {
      setBulls([])
    } finally {
      setIsLoadingBulls(false)
    }
  }, [])

  const handleInseminateClick = (cow: CowNeedingInsemination) => {
    setSelectedCow(cow)
    setInseminationDate(new Date().toISOString().split("T")[0])
    setInseminationNotes("")
    setSelectedBullId("")
    setDialogError("")
    loadBulls()
    setIsInseminationDialogOpen(true)
  }

  const handleViewHistory = async (cow: CowNeedingInsemination) => {
    setSelectedCow(cow)
    setIsLoadingHistory(true)
    setDialogError("")
    setIsHistoryDialogOpen(true)

    try {
      const response = await api.get(`/api/animals/${cow.animal_id}/insemination-history`)
      if (response.ok) {
        const data = await response.json()
        setInseminationHistory(data.inseminations || [])
      } else {
        setDialogError("Failed to load insemination history")
      }
    } catch (err) {
      setDialogError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleUpdateStatusClick = (insemination: InseminationRecord) => {
    setSelectedInsemination(insemination)
    setInseminationStatus(insemination.status)
    setStatusNotes(insemination.notes || "")
    setDialogError("")
    setIsStatusDialogOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!selectedCow || !selectedInsemination) {
      setDialogError("Missing required information")
      return
    }

    setIsUpdatingStatus(true)
    setDialogError("")

    try {
      const response = await api.put(
        `/api/animals/${selectedCow.animal_id}/insemination/${selectedInsemination.id}/status`,
        {
          status: inseminationStatus,
          notes: statusNotes,
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update status")
      }

      // Refresh history and close dialog
      await handleViewHistory(selectedCow)
      setIsStatusDialogOpen(false)
      setSelectedInsemination(null)
      
      // Reload the cows list
      await loadCows(currentPage, itemsPerPage)
    } catch (err) {
      setDialogError(err instanceof Error ? err.message : "An error occurred while updating status")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const getInseminationStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t("insemination.status_confirmed")}
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            {t("insemination.status_failed")}
          </span>
        )
      case 'needs_repeat':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
            <RefreshCw className="w-3 h-3 mr-1" />
            {t("insemination.status_needs_repeat")}
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
            <Clock className="w-3 h-3 mr-1" />
            {t("insemination.status_pending")}
          </span>
        )
    }
  }

  const handleRecordInsemination = async () => {
    if (!selectedCow || !inseminationDate) {
      setDialogError("Please select a date for insemination")
      return
    }

    setIsRecordingInsemination(true)
    setDialogError("")

    try {
      const payload: { insemination_date: string; notes: string | null; bull_id?: number } = {
        insemination_date: inseminationDate,
        notes: inseminationNotes || null,
      }
      if (selectedBullId) {
        payload.bull_id = parseInt(selectedBullId, 10)
      }
      const response = await api.post(`/api/animals/${selectedCow.animal_id}/insemination`, payload)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to record insemination")
      }

      // Close dialog and refresh the list
      setIsInseminationDialogOpen(false)
      setSelectedCow(null)
      setInseminationDate("")
      setInseminationNotes("")
      setSelectedBullId("")
      setDialogError("")
      
      // Reload the cows list
      await loadCows(currentPage, itemsPerPage)
    } catch (err) {
      setDialogError(err instanceof Error ? err.message : "An error occurred while recording insemination")
    } finally {
      setIsRecordingInsemination(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="border-green-200 dark:border-green-800 bg-white dark:bg-green-900/50">
        <CardHeader>
          <CardTitle className="text-green-800 dark:text-green-100">
            {t("insemination.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-green-600 dark:text-green-400">
            Loading...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-green-200 dark:border-green-800 bg-white dark:bg-green-900/50">
        <CardHeader>
          <CardTitle className="text-green-800 dark:text-green-100">
            {t("insemination.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600 dark:text-red-400">
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-green-200 dark:border-green-800 bg-white dark:bg-green-900/50">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-green-800 dark:text-green-100 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {t("insemination.title")}
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              {t("insemination.description")}
            </CardDescription>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {cows.length}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {cows.length === 0 ? (
          <div className="text-center py-8 text-green-600 dark:text-green-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{t("insemination.no_cows")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("animals.tag_number")}</TableHead>
                    <TableHead>{t("common.name")}</TableHead>
                    <TableHead>{t("insemination.days_since_calving")}</TableHead>
                    <TableHead>{t("insemination.days_until_ideal")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead>{t("insemination.status")}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cows.map((cow) => (
                    <TableRow key={cow.cow_id}>
                      <TableCell className="font-medium">
                        {cow.tag_number}
                      </TableCell>
                      <TableCell>{cow.name || "-"}</TableCell>
                      <TableCell>
                        <span className={getStatusColor(cow.status, cow.is_overdue)}>
                          {Math.ceil(cow.days_since_calving)} days
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={getStatusColor(cow.status, cow.is_overdue)}>
                          {cow.is_overdue ? t("insemination.overdue") : `${Math.ceil(cow.days_until_ideal)} ${t("calvings.days_remaining").toLowerCase()}`}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(cow.status, cow.is_overdue)}
                      </TableCell>
                      <TableCell>
                        {cow.latest_insemination ? (
                          getInseminationStatusBadge(cow.latest_insemination.status)
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleInseminateClick(cow)}
                            className="text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-700"
                          >
                            <Droplets className="w-4 h-4 mr-1" />
                            Inseminate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewHistory(cow)}
                            className="text-blue-600 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700"
                          >
                            <History className="w-4 h-4 mr-1" />
                            {t("insemination.manage_insemination")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalItems > itemsPerPage && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(totalItems / itemsPerPage)}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={(page) => {
                    setCurrentPage(page)
                    loadCows(page, itemsPerPage)
                  }}
                  onItemsPerPageChange={(perPage) => {
                    setItemsPerPage(perPage)
                    setCurrentPage(1)
                    loadCows(1, perPage)
                  }}
                />
              )}
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = "/dashboard/farmer"}
                className="text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-700"
              >
                <Eye className="w-4 h-4 mr-2" />
                View All Animals
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Insemination Dialog */}
      <Dialog open={isInseminationDialogOpen} onOpenChange={setIsInseminationDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-green-800 dark:text-green-100">
              {t("insemination.record_insemination")}
            </DialogTitle>
            <DialogDescription className="text-green-700 dark:text-green-300">
              {t("insemination.record_for")} {selectedCow?.tag_number} {selectedCow?.name && `(${selectedCow.name})`}
            </DialogDescription>
          </DialogHeader>
          
          {dialogError && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
              {dialogError}
            </div>
          )}

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="insemination_date" className="text-green-800 dark:text-green-100">
                {t("insemination.record_insemination")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="insemination_date"
                type="date"
                value={inseminationDate}
                onChange={(e) => setInseminationDate(e.target.value)}
                className="border-green-300 dark:border-green-700"
                max={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-green-600 dark:text-green-400">
                Select the date when insemination was performed
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bull_id" className="text-green-800 dark:text-green-100">
                {t("insemination.bull_optional")}
              </Label>
              <select
                id="bull_id"
                value={selectedBullId}
                onChange={(e) => setSelectedBullId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-green-300 dark:border-green-700 bg-white dark:bg-green-900 px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
              >
                <option value="">{t("insemination.no_bull_selected")}</option>
                {isLoadingBulls ? (
                  <option disabled>{t("common.loading")}</option>
                ) : (
                  bulls.map((b) => (
                    <option key={b.id} value={b.animalable_id}>
                      {b.tag_number} {b.name ? `(${b.name})` : ""}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="insemination_notes" className="text-green-800 dark:text-green-100">
                {t("insemination.notes_optional")}
              </Label>
              <textarea
                id="insemination_notes"
                value={inseminationNotes}
                onChange={(e) => setInseminationNotes(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-green-300 dark:border-green-700 bg-white dark:bg-green-900 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={t("insemination.notes_placeholder")}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsInseminationDialogOpen(false)
                setSelectedCow(null)
                setInseminationDate("")
                setInseminationNotes("")
                setSelectedBullId("")
                setDialogError("")
              }}
              disabled={isRecordingInsemination}
              className="border-green-300 dark:border-green-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRecordInsemination}
              disabled={isRecordingInsemination || !inseminationDate}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isRecordingInsemination ? t("common.loading") : t("insemination.record_insemination")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Insemination History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-green-800 dark:text-green-100">
              {t("insemination.title")}
            </DialogTitle>
            <DialogDescription className="text-green-700 dark:text-green-300">
                            {t("insemination.history")} for {selectedCow?.tag_number} {selectedCow?.name && `(${selectedCow.name})`}
            </DialogDescription>
          </DialogHeader>
          
          {dialogError && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
              {dialogError}
            </div>
          )}

          {isLoadingHistory ? (
            <div className="text-center py-8 text-green-600 dark:text-green-400">
              {t("common.loading")}
            </div>
          ) : inseminationHistory.length === 0 ? (
            <div className="text-center py-8 text-green-600 dark:text-green-400">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t("insemination.no_records")}</p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("calvings.expected_date")}</TableHead>
                      <TableHead>{t("animals.bull")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead>{t("insemination.status")}</TableHead>
                      <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inseminationHistory.map((insemination) => (
                      <TableRow key={insemination.id}>
                        <TableCell>
                          {new Date(insemination.insemination_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {insemination.bull ? `${insemination.bull.tag_number}${insemination.bull.name ? ` (${insemination.bull.name})` : ""}` : "—"}
                        </TableCell>
                        <TableCell>
                          {getInseminationStatusBadge(insemination.status)}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {insemination.notes || "-"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatusClick(insemination)}
                            className="text-blue-600 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700"
                          >
                            {t("insemination.update_status")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsHistoryDialogOpen(false)
                setSelectedCow(null)
                setInseminationHistory([])
                setDialogError("")
              }}
              className="border-green-300 dark:border-green-700"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-green-800 dark:text-green-100">
              {t("insemination.update_status")}
            </DialogTitle>
            <DialogDescription className="text-green-700 dark:text-green-300">
              {t("insemination.update_status_for")} {selectedInsemination && new Date(selectedInsemination.insemination_date).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          {dialogError && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
              {dialogError}
            </div>
          )}

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-green-800 dark:text-green-100">
                {t("common.status")} <span className="text-red-500">*</span>
              </Label>
              <select
                id="status"
                value={inseminationStatus}
                onChange={(e) => setInseminationStatus(e.target.value as 'pending' | 'confirmed' | 'failed' | 'needs_repeat')}
                className="flex h-10 w-full rounded-md border border-green-300 dark:border-green-700 bg-white dark:bg-green-900 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="failed">Failed</option>
                <option value="needs_repeat">Needs Repeat</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status_notes" className="text-green-800 dark:text-green-100">
                {t("insemination.notes_optional")}
              </Label>
              <textarea
                id="status_notes"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-green-300 dark:border-green-700 bg-white dark:bg-green-900 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={t("insemination.status_notes_placeholder")}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsStatusDialogOpen(false)
                setSelectedInsemination(null)
                setStatusNotes("")
                setDialogError("")
              }}
              disabled={isUpdatingStatus}
              className="border-green-300 dark:border-green-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={isUpdatingStatus}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isUpdatingStatus ? t("common.loading") : t("insemination.status")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
