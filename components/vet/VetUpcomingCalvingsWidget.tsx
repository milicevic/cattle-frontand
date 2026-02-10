"use client"

import { useState, useEffect } from "react"
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
import { Eye, Calendar, AlertCircle, Baby } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import api from "@/lib/api"

interface UpcomingCalving {
  cow_id: number
  animal_id: number
  tag_number: string
  name?: string
  last_insemination_date: string
  expected_calving_date: string
  days_remaining: number
  days_since_insemination: number
  progress?: {
    status: string
    progress_percentage: number
    days_until_calving: number
  }
}

interface VetUpcomingCalvingsWidgetProps {
  farmId: number
}

interface CalfData {
  tag_number: string
  name: string
  type: string
  date_of_birth: string
}

export function VetUpcomingCalvingsWidget({ farmId }: VetUpcomingCalvingsWidgetProps) {
  const [upcomingCalvings, setUpcomingCalvings] = useState<UpcomingCalving[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [totalItems, setTotalItems] = useState(0)
  const [isCalvingDialogOpen, setIsCalvingDialogOpen] = useState(false)
  const [selectedCalving, setSelectedCalving] = useState<UpcomingCalving | null>(null)
  const [isRecordingCalving, setIsRecordingCalving] = useState(false)
  const [calvingFormData, setCalvingFormData] = useState<{
    is_successful: boolean | null
    calving_date: string
    notes: string
    calves: CalfData[]
  }>({
    is_successful: null,
    calving_date: "",
    notes: "",
    calves: [],
  })

  useEffect(() => {
    loadUpcomingCalvings(currentPage, itemsPerPage)
  }, [currentPage, itemsPerPage, farmId])

  const loadUpcomingCalvings = async (page: number = currentPage, perPage: number = itemsPerPage) => {
    try {
      setIsLoading(true)
      setError("")
      const response = await api.get(`/api/animals/upcoming-calvings?page=${page}&per_page=${perPage}&farm_id=${farmId}`)
      if (response.ok) {
        const data = await response.json()
        setUpcomingCalvings(data.upcoming_calvings || [])
        setTotalItems(data.count || 0)
        setCurrentPage(data.current_page || 1)
      } else {
        setError("Failed to load upcoming calvings")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (daysRemaining: number, status?: string) => {
    if (status === "overdue") return "text-red-600 dark:text-red-400"
    if (status === "due_soon" || daysRemaining <= 7) return "text-yellow-600 dark:text-yellow-400"
    return "text-green-600 dark:text-green-400"
  }

  const getStatusBadge = (daysRemaining: number, status?: string) => {
    if (status === "overdue") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          Overdue
        </span>
      )
    }
    if (status === "due_soon" || daysRemaining <= 7) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          Due Soon
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
        <Calendar className="w-3 h-3 mr-1" />
        On Track
      </span>
    )
  }

  const handleRecordCalvingClick = (calving: UpcomingCalving) => {
    setSelectedCalving(calving)
    const today = new Date().toISOString().split('T')[0]
    setCalvingFormData({
      is_successful: null,
      calving_date: today,
      notes: "",
      calves: [{
        tag_number: "",
        name: "",
        type: "Heifer",
        date_of_birth: today,
      }],
    })
    setIsCalvingDialogOpen(true)
  }

  const handleAddCalf = () => {
    setCalvingFormData({
      ...calvingFormData,
      calves: [
        ...calvingFormData.calves,
        {
          tag_number: "",
          name: "",
          type: "Heifer",
          date_of_birth: calvingFormData.calving_date || new Date().toISOString().split('T')[0],
        },
      ],
    })
  }

  const handleRemoveCalf = (index: number) => {
    setCalvingFormData({
      ...calvingFormData,
      calves: calvingFormData.calves.filter((_, i) => i !== index),
    })
  }

  const handleCalfChange = (index: number, field: string, value: string) => {
    const updatedCalves = [...calvingFormData.calves]
    updatedCalves[index] = {
      ...updatedCalves[index],
      [field]: value,
    }
    setCalvingFormData({
      ...calvingFormData,
      calves: updatedCalves,
    })
  }

  const handleRecordCalving = async () => {
    if (!selectedCalving) return

    if (calvingFormData.is_successful === null) {
      setError("Please select whether the calving was successful or not")
      return
    }

    setIsRecordingCalving(true)
    setError("")

    try {
      const payload: any = {
        is_successful: calvingFormData.is_successful,
        calving_date: calvingFormData.calving_date,
        notes: calvingFormData.notes || null,
      }

      if (calvingFormData.is_successful) {
        const validCalves = calvingFormData.calves.filter(
          (calf) => calf.tag_number && calf.type
        )

        if (validCalves.length > 0) {
          payload.calves = validCalves.map((calf) => ({
            tag_number: calf.tag_number,
            name: calf.name || null,
            type: calf.type,
            date_of_birth: calf.date_of_birth || calvingFormData.calving_date,
          }))
        }
      }

      const response = await api.post(`/api/animals/${selectedCalving.animal_id}/calving`, payload)
      if (response.ok) {
        setIsCalvingDialogOpen(false)
        setSelectedCalving(null)
        await loadUpcomingCalvings(currentPage, itemsPerPage)
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to record calving")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsRecordingCalving(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="border-green-200 dark:border-green-800 bg-white dark:bg-green-900/50">
        <CardHeader>
          <CardTitle className="text-green-800 dark:text-green-100">
            Upcoming Calvings
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
            Upcoming Calvings
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
              Upcoming Calvings
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Cows in their final month of pregnancy
            </CardDescription>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {upcomingCalvings.length}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {upcomingCalvings.length === 0 ? (
          <div className="text-center py-8 text-green-600 dark:text-green-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No upcoming calvings in the next 30 days</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tag Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Expected Date</TableHead>
                    <TableHead>Days Remaining</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingCalvings.map((calving) => (
                    <TableRow key={calving.cow_id}>
                      <TableCell className="font-medium">
                        {calving.tag_number}
                      </TableCell>
                      <TableCell>{calving.name || "-"}</TableCell>
                      <TableCell>
                        {new Date(calving.expected_calving_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className={getStatusColor(calving.days_remaining, calving.progress?.status)}>
                          {Math.ceil(calving.days_remaining)} days
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-green-100 dark:bg-green-800 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                calving.progress?.status === "overdue"
                                  ? "bg-red-500"
                                  : calving.progress?.status === "due_soon" || calving.days_remaining <= 7
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{
                                width: `${Math.min(100, Math.max(0, calving.progress?.progress_percentage || 0))}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-green-700 dark:text-green-300">
                            {calving.progress?.progress_percentage.toFixed(0) || 0}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(calving.days_remaining, calving.progress?.status)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRecordCalvingClick(calving)
                          }}
                          className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                          title="Record Calving"
                        >
                          <Baby className="w-4 h-4" />
                        </Button>
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
                    loadUpcomingCalvings(page, itemsPerPage)
                  }}
                  onItemsPerPageChange={(perPage) => {
                    setItemsPerPage(perPage)
                    setCurrentPage(1)
                    loadUpcomingCalvings(1, perPage)
                  }}
                />
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Record Calving Dialog */}
      <Dialog open={isCalvingDialogOpen} onOpenChange={setIsCalvingDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-green-800 dark:text-green-100">
              Record Calving
            </DialogTitle>
            <DialogDescription className="text-green-700 dark:text-green-300">
              Record calving for {selectedCalving?.tag_number} {selectedCalving?.name && `(${selectedCalving.name})`}
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="calving_success" className="text-green-800 dark:text-green-100">
                Was the calving successful? <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="calving_success"
                    checked={calvingFormData.is_successful === true}
                    onChange={() => setCalvingFormData({ ...calvingFormData, is_successful: true })}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="text-green-800 dark:text-green-100">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="calving_success"
                    checked={calvingFormData.is_successful === false}
                    onChange={() => setCalvingFormData({ ...calvingFormData, is_successful: false })}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="text-green-800 dark:text-green-100">No</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="calving_date" className="text-green-800 dark:text-green-100">
                Calving Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="calving_date"
                type="date"
                value={calvingFormData.calving_date}
                onChange={(e) => setCalvingFormData({ ...calvingFormData, calving_date: e.target.value })}
                className="border-green-300 dark:border-green-700"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="calving_notes" className="text-green-800 dark:text-green-100">
                Notes (Optional)
              </Label>
              <textarea
                id="calving_notes"
                value={calvingFormData.notes}
                onChange={(e) => setCalvingFormData({ ...calvingFormData, notes: e.target.value })}
                className="flex min-h-[80px] w-full rounded-md border border-green-300 dark:border-green-700 bg-white dark:bg-green-900 px-3 py-2 text-sm"
                placeholder="Add any notes about this calving..."
              />
            </div>

            {calvingFormData.is_successful && (
              <div className="space-y-4 border-t border-green-200 dark:border-green-700 pt-4">
                <div className="flex justify-between items-center">
                  <Label className="text-green-800 dark:text-green-100">
                    Calves Born
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCalf}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    Add Calf
                  </Button>
                </div>
                {calvingFormData.calves.map((calf, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 p-3 border border-green-200 dark:border-green-700 rounded-lg">
                    <div>
                      <Label className="text-xs text-green-700 dark:text-green-300">Tag Number *</Label>
                      <Input
                        value={calf.tag_number}
                        onChange={(e) => handleCalfChange(index, 'tag_number', e.target.value)}
                        className="mt-1 border-green-300 dark:border-green-700"
                        placeholder="Tag #"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-green-700 dark:text-green-300">Name</Label>
                      <Input
                        value={calf.name}
                        onChange={(e) => handleCalfChange(index, 'name', e.target.value)}
                        className="mt-1 border-green-300 dark:border-green-700"
                        placeholder="Name"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-green-700 dark:text-green-300">Type *</Label>
                      <select
                        value={calf.type}
                        onChange={(e) => handleCalfChange(index, 'type', e.target.value)}
                        className="mt-1 w-full px-2 py-1 text-sm border border-green-300 dark:border-green-700 rounded-md bg-white dark:bg-green-900"
                      >
                        <option value="Bull">Bull</option>
                        <option value="Cow">Cow</option>
                        <option value="Heifer">Heifer</option>
                        <option value="Steer">Steer</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCalf(index)}
                        className="text-red-600 hover:text-red-700"
                        disabled={calvingFormData.calves.length === 1}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsCalvingDialogOpen(false)
                setSelectedCalving(null)
                setCalvingFormData({
                  is_successful: null,
                  calving_date: "",
                  notes: "",
                  calves: [],
                })
                setError("")
              }}
              disabled={isRecordingCalving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRecordCalving}
              disabled={isRecordingCalving || calvingFormData.is_successful === null || !calvingFormData.calving_date}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isRecordingCalving ? "Recording..." : "Record Calving"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
