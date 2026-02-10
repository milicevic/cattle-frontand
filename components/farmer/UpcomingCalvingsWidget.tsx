"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Eye, Calendar, AlertCircle, Edit, Save, X, Plus, Trash2, Baby, ChevronDown, ChevronUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
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

interface Animal {
  id: number
  tag_number: string
  name?: string
  species: string
  type: string
  gender: "male" | "female"
  date_of_birth?: string
  mother?: Animal
  father?: Animal
  animalable?: {
    milk_yield?: number
    last_calving_date?: string
    last_insemination_date?: string
    expected_calving_date?: string
    actual_calving_date?: string
  }
  is_active?: boolean
}

interface PregnancyProgress {
  status: 'pregnant' | 'calved' | 'overdue' | 'due_soon'
  last_insemination_date: string
  expected_calving_date: string
  actual_calving_date?: string
  days_since_insemination: number
  days_until_calving: number
  progress_percentage: number
  total_gestation_days: number
}

interface NextInseminationPeriod {
  last_calving_date: string
  days_since_calving: number
  ideal_start_days: number
  ideal_end_days: number
  days_until_ideal_start: number
  days_until_ideal_end: number
  is_in_window: boolean
  is_past_window: boolean
  is_before_window: boolean
  next_insemination_date: string
  status: 'ready' | 'overdue' | 'approaching'
}

export function UpcomingCalvingsWidget() {
  const router = useRouter()
  const [upcomingCalvings, setUpcomingCalvings] = useState<UpcomingCalving[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [totalItems, setTotalItems] = useState(0)
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null)
  const [selectedPregnancyProgress, setSelectedPregnancyProgress] = useState<PregnancyProgress | null>(null)
  const [nextInseminationPeriod, setNextInseminationPeriod] = useState<NextInseminationPeriod | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isCattleInfoCollapsed, setIsCattleInfoCollapsed] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState<any>({})
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCalvingDialogOpen, setIsCalvingDialogOpen] = useState(false)
  const [selectedCalving, setSelectedCalving] = useState<UpcomingCalving | null>(null)
  const [calvingFormData, setCalvingFormData] = useState({
    is_successful: true as boolean | null,
    calving_date: "",
    notes: "",
    calves: [] as Array<{
      tag_number: string
      name: string
      type: string
      date_of_birth: string
    }>,
  })
  const [isRecordingCalving, setIsRecordingCalving] = useState(false)

  useEffect(() => {
    loadUpcomingCalvings(currentPage, itemsPerPage)
  }, [currentPage, itemsPerPage])

  // Helper function to format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ""
      return date.toISOString().split('T')[0]
    } catch {
      return ""
    }
  }

  const loadAnimalDetails = async (animalId: number) => {
    try {
      const response = await api.get(`/api/animals/${animalId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedAnimal(data.animal)
        setSelectedPregnancyProgress(data.pregnancy_progress || null)
        setNextInseminationPeriod(data.next_insemination_period || null)
        setIsCattleInfoCollapsed(true) // Reset to collapsed when loading new animal
        // Initialize edit form data with properly formatted dates
        setEditFormData({
          tag_number: data.animal.tag_number,
          name: data.animal.name || "",
          date_of_birth: formatDateForInput(data.animal.date_of_birth),
          mother_id: data.animal.mother_id || "",
          father_id: data.animal.father_id || "",
          is_active: data.animal.is_active !== false,
          milk_yield: data.animal.animalable?.milk_yield || "",
          last_calving_date: formatDateForInput(data.animal.animalable?.last_calving_date),
          last_insemination_date: formatDateForInput(data.animal.animalable?.last_insemination_date),
          expected_calving_date: formatDateForInput(data.animal.animalable?.expected_calving_date),
          actual_calving_date: formatDateForInput(data.animal.animalable?.actual_calving_date),
          semen_quality: data.animal.animalable?.semen_quality || "",
          aggression_level: data.animal.animalable?.aggression_level || "",
        })
        setIsDetailDialogOpen(true)
        setIsEditing(false)
      }
    } catch (err) {
      console.error("Error loading animal details:", err)
    }
  }

  const handleUpdateAnimal = async () => {
    if (!selectedAnimal) return

    setIsUpdating(true)
    setError("")

    try {
      const payload: any = {
        tag_number: editFormData.tag_number,
        name: editFormData.name || null,
        date_of_birth: editFormData.date_of_birth || null,
        mother_id: editFormData.mother_id || null,
        father_id: editFormData.father_id || null,
        is_active: editFormData.is_active,
      }

      // Add cattle-specific fields
      if (selectedAnimal.species === "cattle" && selectedAnimal.animalable) {
        if (selectedAnimal.type === "Bull") {
          payload.semen_quality = editFormData.semen_quality || null
          payload.aggression_level = editFormData.aggression_level || null
        } else {
          payload.milk_yield = editFormData.milk_yield ? parseFloat(editFormData.milk_yield) : null
          payload.last_calving_date = editFormData.last_calving_date || null
          payload.last_insemination_date = editFormData.last_insemination_date || null
          payload.actual_calving_date = editFormData.actual_calving_date || null
        }
      }

      const response = await api.put(`/api/animals/${selectedAnimal.id}`, payload)
      if (response.ok) {
        const data = await response.json()
        setSelectedAnimal(data.animal)
        setSelectedPregnancyProgress(data.pregnancy_progress || null)
        setNextInseminationPeriod(data.next_insemination_period || null)
        setIsEditing(false)
        await loadUpcomingCalvings() // Refresh the list
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to update animal")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRowClick = (calving: UpcomingCalving) => {
    loadAnimalDetails(calving.animal_id)
  }

  const handleEditClick = (e: React.MouseEvent, calving: UpcomingCalving) => {
    e.stopPropagation()
    loadAnimalDetails(calving.animal_id)
    setIsEditing(true)
  }

  const handleRecordCalvingClick = (e: React.MouseEvent, calving: UpcomingCalving) => {
    e.stopPropagation()
    setSelectedCalving(calving)
    const today = new Date().toISOString().split('T')[0]
    setCalvingFormData({
      is_successful: null, // Start with null, user must choose
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

    // Validate that success status is selected
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

      // Only include calves if calving was successful and calves have tag_number and type
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
        await loadUpcomingCalvings() // Refresh the list
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

  const loadUpcomingCalvings = async (page: number = currentPage, perPage: number = itemsPerPage) => {
    try {
      setIsLoading(true)
      setError("")
      const response = await api.get(`/api/animals/upcoming-calvings?page=${page}&per_page=${perPage}`)
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
                    <TableRow 
                      key={calving.cow_id}
                      className="cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/30"
                      onClick={() => handleRowClick(calving)}
                    >
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
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleRecordCalvingClick(e, calving)}
                            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                            title="Record Calving"
                          >
                            <Baby className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleEditClick(e, calving)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Edit Animal"
                          >
                            <Edit className="w-4 h-4" />
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
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/farmer")}
                className="text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-700"
              >
                <Eye className="w-4 h-4 mr-2" />
                View All Animals
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Animal Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedAnimal && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="text-green-800 dark:text-green-100 flex items-center gap-2">
                      <span className="text-2xl">🐄</span>
                      {selectedAnimal.name || selectedAnimal.tag_number}
                    </DialogTitle>
                    <DialogDescription className="text-green-700 dark:text-green-300">
                      Tag Number: {selectedAnimal.tag_number}
                    </DialogDescription>
                  </div>
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-700"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(false)}
                          className="text-gray-600 border-gray-300 hover:bg-gray-50 dark:text-gray-400"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleUpdateAnimal}
                          disabled={isUpdating}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {isUpdating ? "Saving..." : "Save"}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </DialogHeader>
              {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}
              <div className="space-y-6 mt-4">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-100 mb-3">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-green-700 dark:text-green-300">Tag Number</label>
                      {isEditing ? (
                        <Input
                          value={editFormData.tag_number}
                          onChange={(e) => setEditFormData({ ...editFormData, tag_number: e.target.value })}
                          className="mt-1 border-green-200 dark:border-green-700"
                          required
                        />
                      ) : (
                        <p className="text-green-800 dark:text-green-200">{selectedAnimal.tag_number}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-green-700 dark:text-green-300">Name</label>
                      {isEditing ? (
                        <Input
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          className="mt-1 border-green-200 dark:border-green-700"
                        />
                      ) : (
                        <p className="text-green-800 dark:text-green-200">{selectedAnimal.name || "-"}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-green-700 dark:text-green-300">Date of Birth</label>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editFormData.date_of_birth}
                          onChange={(e) => setEditFormData({ ...editFormData, date_of_birth: e.target.value })}
                          className="mt-1 border-green-200 dark:border-green-700"
                        />
                      ) : (
                        <p className="text-green-800 dark:text-green-200">
                          {selectedAnimal.date_of_birth
                            ? new Date(selectedAnimal.date_of_birth).toLocaleDateString()
                            : "-"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-green-700 dark:text-green-300">Status</label>
                      {isEditing ? (
                        <select
                          value={editFormData.is_active ? "active" : "inactive"}
                          onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.value === "active" })}
                          className="mt-1 w-full px-3 py-2 border border-green-200 dark:border-green-700 rounded-md bg-white dark:bg-green-900"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      ) : (
                        <p className="text-green-800 dark:text-green-200">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedAnimal.is_active !== false
                              ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                          }`}>
                            {selectedAnimal.is_active !== false ? 'Active' : 'Inactive'}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cattle-specific Information - Collapsible */}
                {selectedAnimal.species === "cattle" && selectedAnimal.animalable && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsCattleInfoCollapsed(!isCattleInfoCollapsed)}
                      className="flex items-center justify-between w-full mb-3 text-left"
                    >
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-100">
                        Cattle-Specific Information
                      </h3>
                      {isCattleInfoCollapsed ? (
                        <ChevronDown className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <ChevronUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                      )}
                    </button>
                    {!isCattleInfoCollapsed && (
                      <div className="grid grid-cols-2 gap-4">
                        {(selectedAnimal.type === "Cow" || selectedAnimal.type === "Heifer") && (
                          <>
                            <div>
                              <label className="text-sm font-medium text-green-700 dark:text-green-300">Milk Yield (L/day)</label>
                              {isEditing ? (
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={editFormData.milk_yield}
                                  onChange={(e) => setEditFormData({ ...editFormData, milk_yield: e.target.value })}
                                  className="mt-1 border-green-200 dark:border-green-700"
                                />
                              ) : (
                                <p className="text-green-800 dark:text-green-200">
                                  {selectedAnimal.animalable.milk_yield ? `${selectedAnimal.animalable.milk_yield} L/day` : "-"}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="text-sm font-medium text-green-700 dark:text-green-300">Last Calving Date</label>
                              {isEditing ? (
                                <Input
                                  type="date"
                                  value={editFormData.last_calving_date}
                                  onChange={(e) => setEditFormData({ ...editFormData, last_calving_date: e.target.value })}
                                  className="mt-1 border-green-200 dark:border-green-700"
                                />
                              ) : (
                                <p className="text-green-800 dark:text-green-200">
                                  {selectedAnimal.animalable.last_calving_date
                                    ? new Date(selectedAnimal.animalable.last_calving_date).toLocaleDateString()
                                    : "-"}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="text-sm font-medium text-green-700 dark:text-green-300">Last Insemination Date</label>
                              {isEditing ? (
                                <Input
                                  type="date"
                                  value={editFormData.last_insemination_date}
                                  onChange={(e) => {
                                    const inseminationDate = e.target.value
                                    let expectedDate = ""
                                    if (inseminationDate) {
                                      const date = new Date(inseminationDate)
                                      date.setDate(date.getDate() + 283)
                                      expectedDate = date.toISOString().split('T')[0]
                                    }
                                    setEditFormData({ 
                                      ...editFormData, 
                                      last_insemination_date: inseminationDate,
                                      expected_calving_date: expectedDate
                                    })
                                  }}
                                  className="mt-1 border-green-200 dark:border-green-700"
                                />
                              ) : (
                                <p className="text-green-800 dark:text-green-200">
                                  {selectedAnimal.animalable.last_insemination_date
                                    ? new Date(selectedAnimal.animalable.last_insemination_date).toLocaleDateString()
                                    : "-"}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="text-sm font-medium text-green-700 dark:text-green-300">
                                Expected Calving Date
                                {isEditing && (
                                  <span className="text-xs text-green-600 dark:text-green-400 ml-2">
                                    (Auto-calculated)
                                  </span>
                                )}
                              </label>
                              {isEditing ? (
                                <Input
                                  type="date"
                                  value={editFormData.expected_calving_date}
                                  disabled
                                  className="mt-1 border-green-200 dark:border-green-700 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                                />
                              ) : (
                                <p className="text-green-800 dark:text-green-200">
                                  {selectedAnimal.animalable.expected_calving_date
                                    ? new Date(selectedAnimal.animalable.expected_calving_date).toLocaleDateString()
                                    : "-"}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="text-sm font-medium text-green-700 dark:text-green-300">Actual Calving Date</label>
                              {isEditing ? (
                                <Input
                                  type="date"
                                  value={editFormData.actual_calving_date}
                                  onChange={(e) => setEditFormData({ ...editFormData, actual_calving_date: e.target.value })}
                                  className="mt-1 border-green-200 dark:border-green-700"
                                />
                              ) : (
                                <p className="text-green-800 dark:text-green-200">
                                  {selectedAnimal.animalable.actual_calving_date
                                    ? new Date(selectedAnimal.animalable.actual_calving_date).toLocaleDateString()
                                    : "-"}
                                </p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Pregnancy Progress Visualization */}
                {selectedPregnancyProgress && (selectedAnimal.type === "Cow" || selectedAnimal.type === "Heifer") && (
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-100 mb-3">
                      Pregnancy Progress
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-green-700 dark:text-green-300">
                            Gestation Progress
                          </span>
                          <span className="text-sm font-semibold text-green-800 dark:text-green-200">
                            {selectedPregnancyProgress.progress_percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-green-100 dark:bg-green-800 rounded-full h-4 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              selectedPregnancyProgress.status === 'calved'
                                ? 'bg-green-600'
                                : selectedPregnancyProgress.status === 'overdue'
                                ? 'bg-red-500'
                                : selectedPregnancyProgress.status === 'due_soon'
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, selectedPregnancyProgress.progress_percentage))}%` }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-green-700 dark:text-green-300">Last Insemination:</span>
                          <p className="text-green-800 dark:text-green-200 font-medium">
                            {new Date(selectedPregnancyProgress.last_insemination_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-green-700 dark:text-green-300">Expected Calving:</span>
                          <p className="text-green-800 dark:text-green-200 font-medium">
                            {new Date(selectedPregnancyProgress.expected_calving_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-green-700 dark:text-green-300">Days Remaining:</span>
                          <p className={`font-medium ${
                            selectedPregnancyProgress.days_until_calving < 0
                              ? 'text-red-600 dark:text-red-400'
                              : selectedPregnancyProgress.days_until_calving <= 7
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            {selectedPregnancyProgress.days_until_calving < 0
                              ? `${Math.ceil(Math.abs(selectedPregnancyProgress.days_until_calving))} days overdue`
                              : `${Math.ceil(selectedPregnancyProgress.days_until_calving)} days`
                            }
                          </p>
                        </div>
                        {selectedPregnancyProgress.actual_calving_date && (
                          <div>
                            <span className="text-green-700 dark:text-green-300">Actual Calving:</span>
                            <p className="text-green-800 dark:text-green-200 font-medium">
                              {new Date(selectedPregnancyProgress.actual_calving_date).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Next Insemination Period - Show when cow has calved */}
                {nextInseminationPeriod && (selectedAnimal.type === "Cow" || selectedAnimal.type === "Heifer") && (
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-100 mb-3">
                      Next Insemination Period
                    </h3>
                    <div className="space-y-4">
                      {/* Status Badge */}
                      <div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          nextInseminationPeriod.status === 'ready'
                            ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200'
                            : nextInseminationPeriod.status === 'overdue'
                            ? 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
                            : 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
                        }`}>
                          {nextInseminationPeriod.status === 'ready'
                            ? '✓ Ready for Insemination'
                            : nextInseminationPeriod.status === 'overdue'
                            ? '⚠ Overdue for Insemination'
                            : '⏳ Approaching Insemination Window'
                          }
                        </span>
                      </div>

                      {/* Summary */}
                      <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 border border-green-200 dark:border-green-700">
                        <div className="space-y-2">
                          <p className="text-sm text-green-800 dark:text-green-200">
                            <strong>Last Calving:</strong> {new Date(nextInseminationPeriod.last_calving_date).toLocaleDateString()} 
                            <span className="text-green-600 dark:text-green-400 ml-2">({nextInseminationPeriod.days_since_calving} days ago)</span>
                          </p>
                          <p className="text-sm text-green-800 dark:text-green-200">
                            <strong>Recommended Insemination Date:</strong> {new Date(nextInseminationPeriod.next_insemination_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-green-800 dark:text-green-200">
                            <strong>Ideal Window:</strong> {nextInseminationPeriod.ideal_start_days}-{nextInseminationPeriod.ideal_end_days} days after calving
                            {nextInseminationPeriod.is_in_window && (
                              <span className="text-green-600 dark:text-green-400 ml-2">(Currently in window)</span>
                            )}
                            {nextInseminationPeriod.is_past_window && (
                              <span className="text-red-600 dark:text-red-400 ml-2">(Past window - inseminate soon)</span>
                            )}
                            {nextInseminationPeriod.is_before_window && (
                              <span className="text-yellow-600 dark:text-yellow-400 ml-2">({Math.ceil(nextInseminationPeriod.days_until_ideal_start)} days until window)</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Record Calving Dialog */}
      <Dialog open={isCalvingDialogOpen} onOpenChange={setIsCalvingDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-green-800 dark:text-green-100 flex items-center gap-2">
              <Baby className="w-5 h-5" />
              Record Calving
            </DialogTitle>
            <DialogDescription className="text-green-700 dark:text-green-300">
              {selectedCalving && (
                <>Record calving for {selectedCalving.name || selectedCalving.tag_number}</>
              )}
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          <div className="space-y-6 mt-4">
            {/* Success/Failure Toggle - First Question */}
            <div>
              <label className="text-sm font-medium text-green-700 dark:text-green-300 mb-3 block">
                Was the calving successful? *
              </label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={calvingFormData.is_successful === true ? "default" : "outline"}
                  onClick={() => {
                    setCalvingFormData({
                      ...calvingFormData,
                      is_successful: true,
                      // Initialize with one calf if switching to successful
                      calves: calvingFormData.calves.length === 0 ? [{
                        tag_number: "",
                        name: "",
                        type: "Heifer",
                        date_of_birth: calvingFormData.calving_date || new Date().toISOString().split('T')[0],
                      }] : calvingFormData.calves,
                    })
                  }}
                  className={`flex-1 ${
                    calvingFormData.is_successful === true
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "border-green-300 text-green-700 dark:text-green-300"
                  }`}
                >
                  ✓ Successful
                </Button>
                <Button
                  type="button"
                  variant={calvingFormData.is_successful === false ? "default" : "outline"}
                  onClick={() => {
                    setCalvingFormData({
                      ...calvingFormData,
                      is_successful: false,
                      calves: [], // Clear calves if unsuccessful
                    })
                  }}
                  className={`flex-1 ${
                    calvingFormData.is_successful === false
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "border-red-300 text-red-700 dark:text-red-300"
                  }`}
                >
                  ✗ Unsuccessful
                </Button>
              </div>
            </div>

            {/* Calving Date and Notes */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-green-700 dark:text-green-300">
                  Calving Date *
                </label>
                <Input
                  type="date"
                  value={calvingFormData.calving_date}
                  onChange={(e) =>
                    setCalvingFormData({
                      ...calvingFormData,
                      calving_date: e.target.value,
                      calves: calvingFormData.calves.map((calf) => ({
                        ...calf,
                        date_of_birth: e.target.value,
                      })),
                    })
                  }
                  className="mt-1 border-green-200 dark:border-green-700"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-green-700 dark:text-green-300">
                  Calving Notes / Outcome
                </label>
                <textarea
                  value={calvingFormData.notes}
                  onChange={(e) =>
                    setCalvingFormData({ ...calvingFormData, notes: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 border border-green-200 dark:border-green-700 rounded-md bg-white dark:bg-green-900 text-green-800 dark:text-green-200"
                  rows={3}
                  placeholder={
                    calvingFormData.is_successful === false
                      ? "Enter details about what went wrong, complications, or outcome..."
                      : "Enter any notes about the calving process, complications, or outcome..."
                  }
                />
              </div>
            </div>

            {/* Calves Section - Only show if successful */}
            {calvingFormData.is_successful === true && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-100">
                  Calves Born
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCalf}
                  className="text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Calf
                </Button>
              </div>

              {calvingFormData.calves.length === 0 ? (
                <div className="text-center py-8 text-green-600 dark:text-green-400 border border-dashed border-green-300 dark:border-green-700 rounded-lg">
                  <Baby className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No calves added. Click "Add Calf" to record calves born.</p>
                  <p className="text-sm mt-1">You can leave this empty if recording a stillbirth or no calves.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {calvingFormData.calves.map((calf, index) => (
                    <Card
                      key={index}
                      className="border-green-200 dark:border-green-700 bg-green-50/50 dark:bg-green-900/30"
                    >
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-semibold text-green-800 dark:text-green-100">
                            Calf {index + 1}
                          </h4>
                          {calvingFormData.calves.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveCalf(index)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-green-700 dark:text-green-300">
                              Tag Number *
                            </label>
                            <Input
                              value={calf.tag_number}
                              onChange={(e) =>
                                handleCalfChange(index, "tag_number", e.target.value)
                              }
                              className="mt-1 border-green-200 dark:border-green-700"
                              placeholder="Calf tag number"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-green-700 dark:text-green-300">
                              Name
                            </label>
                            <Input
                              value={calf.name}
                              onChange={(e) =>
                                handleCalfChange(index, "name", e.target.value)
                              }
                              className="mt-1 border-green-200 dark:border-green-700"
                              placeholder="Calf name (optional)"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-green-700 dark:text-green-300">
                              Type *
                            </label>
                            <select
                              value={calf.type}
                              onChange={(e) =>
                                handleCalfChange(index, "type", e.target.value)
                              }
                              className="mt-1 w-full px-3 py-2 border border-green-200 dark:border-green-700 rounded-md bg-white dark:bg-green-900 text-green-800 dark:text-green-200"
                              required
                            >
                              <option value="Heifer">Heifer</option>
                              <option value="Bull">Bull</option>
                              <option value="Cow">Cow</option>
                              <option value="Steer">Steer</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-green-700 dark:text-green-300">
                              Date of Birth
                            </label>
                            <Input
                              type="date"
                              value={calf.date_of_birth}
                              onChange={(e) =>
                                handleCalfChange(index, "date_of_birth", e.target.value)
                              }
                              className="mt-1 border-green-200 dark:border-green-700"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t border-green-200 dark:border-green-700">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCalvingDialogOpen(false)
                  setSelectedCalving(null)
                  setError("")
                }}
                disabled={isRecordingCalving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRecordCalving}
                disabled={isRecordingCalving || !calvingFormData.calving_date || calvingFormData.is_successful === null}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isRecordingCalving ? "Recording..." : "Record Calving"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
