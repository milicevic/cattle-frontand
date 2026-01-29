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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Eye, Grid, List, ChevronDown, ChevronUp, Edit, Save, X } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
import api from "@/lib/api"

type Species = "cattle" | "horse" | "sheep"

interface Animal {
  id: number
  tag_number: string
  name?: string
  species: Species
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
    semen_quality?: string
    aggression_level?: string
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

interface Farm {
  id: number
  name: string
  location?: string
  state?: string
}

const speciesConfig: Record<Species, { label: string; icon: string; types: string[] }> = {
  cattle: {
    label: "Cattle",
    icon: "🐄",
    types: ["Bull", "Cow", "Steer", "Heifer"],
  },
  horse: {
    label: "Horse",
    icon: "🐴",
    types: ["Stallion", "Gelding", "Mare", "Filly"],
  },
  sheep: {
    label: "Sheep",
    icon: "🐑",
    types: ["ram", "wether", "ewe", "ewe_lamb"],
  },
}

type ViewMode = "table" | "cards"

interface VetAnimalsManagementProps {
  farmId: number
  farmName: string
}

export function VetAnimalsManagement({ farmId, farmName }: VetAnimalsManagementProps) {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [allAnimals, setAllAnimals] = useState<Animal[]>([])
  const [selectedSpecies, setSelectedSpecies] = useState<Species>("cattle")
  const [selectedType, setSelectedType] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null)
  const [selectedPregnancyProgress, setSelectedPregnancyProgress] = useState<PregnancyProgress | null>(null)
  const [nextInseminationPeriod, setNextInseminationPeriod] = useState<NextInseminationPeriod | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isCattleInfoCollapsed, setIsCattleInfoCollapsed] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState<any>({})
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    loadAnimals(currentPage, itemsPerPage)
  }, [currentPage, itemsPerPage, farmId])

  const loadAnimals = async (page: number = currentPage, perPage: number = itemsPerPage) => {
    try {
      setIsLoading(true)
      let url = `/api/animals?page=${page}&per_page=${perPage}&farm_id=${farmId}`
      if (selectedSpecies) {
        url += `&species=${selectedSpecies}`
      }
      if (selectedType) {
        url += `&type=${selectedType}`
      }
      const response = await api.get(url)
      if (response.ok) {
        const data = await response.json()
        setAllAnimals(data.animals || [])
        setTotalItems(data.total || 0)
        setCurrentPage(data.current_page || 1)
      }
    } catch (err) {
      console.error("Error loading animals:", err)
    } finally {
      setIsLoading(false)
    }
  }

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
        setIsCattleInfoCollapsed(true)
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
        // Name is NOT included - vets cannot change names
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
          // expected_calving_date is auto-calculated, don't send it
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
        await loadAnimals(currentPage, itemsPerPage) // Refresh the list
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

  const handleEditAnimal = async (animal: Animal) => {
    await loadAnimalDetails(animal.id)
    setIsEditing(true)
  }

  const handleAnimalClick = (animal: Animal) => {
    loadAnimalDetails(animal.id)
  }

  useEffect(() => {
    setCurrentPage(1)
    loadAnimals(1, itemsPerPage)
  }, [selectedSpecies, selectedType, farmId])

  useEffect(() => {
    setAnimals(allAnimals)
  }, [allAnimals])

  const filteredAnimals = animals
  const currentSpecies = speciesConfig[selectedSpecies]
  
  const typeCounts = allAnimals
    .filter((a) => a.species === selectedSpecies)
    .reduce((acc, animal) => {
      acc[animal.type] = (acc[animal.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <Card className="border-green-200 dark:border-green-800 bg-white dark:bg-green-900/50">
        <CardHeader>
          <CardTitle className="text-green-800 dark:text-green-100">
            Animals - {farmName}
          </CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300">
            View animals on this farm
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Species Tabs */}
          <div className="border-b border-green-200 dark:border-green-700 mb-6">
            <nav className="-mb-px flex space-x-12" aria-label="Tabs">
              {(Object.keys(speciesConfig) as Species[]).map((species) => {
                const config = speciesConfig[species]
                const count = allAnimals.filter((a) => a.species === species).length
                const isActive = selectedSpecies === species
                return (
                  <button
                    key={species}
                    onClick={() => {
                      setSelectedSpecies(species)
                      setSelectedType("")
                    }}
                    className={`
                      whitespace-nowrap py-5 px-4 border-b-4 font-semibold text-base transition-colors
                      ${
                        isActive
                          ? "border-green-500 text-green-600 dark:text-green-400"
                          : "border-transparent text-green-500 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:border-green-300 dark:hover:border-green-600"
                      }
                    `}
                  >
                    <span className="mr-3 text-2xl">{config.icon}</span>
                    {config.label}
                    <span className="ml-3 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 py-1 px-3 rounded-full text-sm font-medium">
                      {count}
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Type Filter */}
          {currentSpecies.types.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedType("")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedType === ""
                      ? "bg-green-600 text-white"
                      : "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-700"
                  }`}
                >
                  All Types ({filteredAnimals.length})
                </button>
                {currentSpecies.types.map((type) => {
                  const count = typeCounts[type] || 0
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedType === type
                          ? "bg-green-600 text-white"
                          : "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-700"
                      }`}
                    >
                      {type} ({count})
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* View Mode Toggle */}
          {filteredAnimals.length > 0 && (
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-green-700 dark:text-green-300">
                {filteredAnimals.length} {filteredAnimals.length === 1 ? 'animal' : 'animals'}
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <List className="w-4 h-4 mr-2" />
                  Table
                </Button>
                <Button
                  variant={viewMode === "cards" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("cards")}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Grid className="w-4 h-4 mr-2" />
                  Cards
                </Button>
              </div>
            </div>
          )}

          {/* Animals List */}
          {isLoading ? (
            <div className="text-center py-8 text-green-600 dark:text-green-400">
              Loading animals...
            </div>
          ) : filteredAnimals.length > 0 ? (
            viewMode === "table" ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tag Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Date of Birth</TableHead>
                      <TableHead>Mother</TableHead>
                      <TableHead>Father</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAnimals.map((animal) => (
                      <TableRow 
                        key={animal.id}
                        className="cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/30"
                        onClick={() => handleAnimalClick(animal)}
                      >
                        <TableCell className="font-medium">
                          {animal.tag_number}
                        </TableCell>
                        <TableCell>{animal.name || "-"}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 capitalize">
                            {animal.type}
                          </span>
                        </TableCell>
                        <TableCell className="capitalize">{animal.gender}</TableCell>
                        <TableCell>
                          {animal.date_of_birth
                            ? new Date(animal.date_of_birth).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>{animal.mother?.tag_number || "-"}</TableCell>
                        <TableCell>{animal.father?.tag_number || "-"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAnimalClick(animal)
                              }}
                              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditAnimal(animal)
                              }}
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
                      loadAnimals(page, itemsPerPage)
                    }}
                    onItemsPerPageChange={(perPage) => {
                      setItemsPerPage(perPage)
                      setCurrentPage(1)
                      loadAnimals(1, perPage)
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAnimals.map((animal) => (
                  <Card
                    key={animal.id}
                    className="border-green-200 dark:border-green-700 cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-green-900/50"
                    onClick={() => handleAnimalClick(animal)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-green-800 dark:text-green-100">
                            {animal.name || animal.tag_number}
                          </CardTitle>
                          <CardDescription className="text-green-700 dark:text-green-300">
                            {animal.tag_number}
                          </CardDescription>
                        </div>
                        <span className="text-3xl">{currentSpecies.icon}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-green-700 dark:text-green-300">Type:</span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 capitalize">
                            {animal.type}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-green-700 dark:text-green-300">Gender:</span>
                          <span className="text-sm font-medium capitalize text-green-800 dark:text-green-200">
                            {animal.gender}
                          </span>
                        </div>
                        {animal.date_of_birth && (
                          <div className="flex justify-between">
                            <span className="text-sm text-green-700 dark:text-green-300">Date of Birth:</span>
                            <span className="text-sm text-green-800 dark:text-green-200">
                              {new Date(animal.date_of_birth).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {animal.mother && (
                          <div className="flex justify-between">
                            <span className="text-sm text-green-700 dark:text-green-300">Mother:</span>
                            <span className="text-sm text-green-800 dark:text-green-200">
                              {animal.mother.tag_number}
                            </span>
                          </div>
                        )}
                        {animal.father && (
                          <div className="flex justify-between">
                            <span className="text-sm text-green-700 dark:text-green-300">Father:</span>
                            <span className="text-sm text-green-800 dark:text-green-200">
                              {animal.father.tag_number}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-700 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-900"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAnimalClick(animal)
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-blue-600 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditAnimal(animal)
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <p className="text-center text-green-600 dark:text-green-400 py-8">
              No {currentSpecies.label.toLowerCase()} found on this farm.
            </p>
          )}

          {/* Animal Detail Dialog - Same as farmer's but read-only */}
          <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              {selectedAnimal && (
                <>
                  <DialogHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <DialogTitle className="text-green-800 dark:text-green-100 flex items-center gap-2">
                          <span className="text-2xl">{currentSpecies.icon}</span>
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
                            className="text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-900"
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
                              className="text-gray-600 border-gray-300 hover:bg-gray-50 dark:text-gray-400 dark:border-gray-700"
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
                          <label className="text-sm font-medium text-green-700 dark:text-green-300">Species</label>
                          <p className="text-green-800 dark:text-green-200 capitalize">{selectedAnimal.species}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-green-700 dark:text-green-300">Type</label>
                          <p className="text-green-800 dark:text-green-200 capitalize">{selectedAnimal.type}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-green-700 dark:text-green-300">Gender</label>
                          <p className="text-green-800 dark:text-green-200 capitalize">{selectedAnimal.gender}</p>
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
                          <label className="text-sm font-medium text-green-700 dark:text-green-300">Name</label>
                          {/* Vets cannot edit names - always read-only */}
                          <p className="text-green-800 dark:text-green-200">{selectedAnimal.name || "-"}</p>
                          {isEditing && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Name cannot be changed
                            </p>
                          )}
                        </div>
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

                    {/* Family Information */}
                    {(selectedAnimal.mother || selectedAnimal.father) && (
                      <div>
                        <h3 className="text-lg font-semibold text-green-800 dark:text-green-100 mb-3">
                          Family Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {selectedAnimal.mother && (
                            <div>
                              <label className="text-sm font-medium text-green-700 dark:text-green-300">Mother</label>
                              <p className="text-green-800 dark:text-green-200">
                                {selectedAnimal.mother.name || selectedAnimal.mother.tag_number}
                                {selectedAnimal.mother.name && (
                                  <span className="text-green-600 dark:text-green-400 ml-2">
                                    ({selectedAnimal.mother.tag_number})
                                  </span>
                                )}
                              </p>
                            </div>
                          )}
                          {selectedAnimal.father && (
                            <div>
                              <label className="text-sm font-medium text-green-700 dark:text-green-300">Father</label>
                              <p className="text-green-800 dark:text-green-200">
                                {selectedAnimal.father.name || selectedAnimal.father.tag_number}
                                {selectedAnimal.father.name && (
                                  <span className="text-green-600 dark:text-green-400 ml-2">
                                    ({selectedAnimal.father.tag_number})
                                  </span>
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

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
                          {selectedAnimal.type === "Bull" ? (
                            <>
                              <div>
                                <label className="text-sm font-medium text-green-700 dark:text-green-300">Semen Quality</label>
                                {isEditing ? (
                                  <Input
                                    value={editFormData.semen_quality}
                                    onChange={(e) => setEditFormData({ ...editFormData, semen_quality: e.target.value })}
                                    className="mt-1 border-green-200 dark:border-green-700"
                                    placeholder="e.g., Excellent, Good, Fair"
                                  />
                                ) : (
                                  <p className="text-green-800 dark:text-green-200">
                                    {selectedAnimal.animalable.semen_quality || "-"}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="text-sm font-medium text-green-700 dark:text-green-300">Aggression Level</label>
                                {isEditing ? (
                                  <Input
                                    value={editFormData.aggression_level}
                                    onChange={(e) => setEditFormData({ ...editFormData, aggression_level: e.target.value })}
                                    className="mt-1 border-green-200 dark:border-green-700"
                                    placeholder="e.g., Low, Medium, High"
                                  />
                                ) : (
                                  <p className="text-green-800 dark:text-green-200">
                                    {selectedAnimal.animalable.aggression_level || "-"}
                                  </p>
                                )}
                              </div>
                            </>
                          ) : (
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
                                    placeholder="Liters per day"
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
                              {(selectedAnimal.type === "Cow" || selectedAnimal.type === "Heifer") && (
                                <>
                                  <div>
                                    <label className="text-sm font-medium text-green-700 dark:text-green-300">Last Insemination Date</label>
                                    {isEditing ? (
                                      <Input
                                        type="date"
                                        value={editFormData.last_insemination_date}
                                        onChange={(e) => {
                                          const inseminationDate = e.target.value
                                          // Auto-calculate expected calving date (283 days after insemination)
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
                                        title="Expected calving date is automatically calculated from insemination date"
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
                            </>
                          )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Pregnancy Progress Visualization - Same as farmer's */}
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
                          <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-green-300 dark:bg-green-700"></div>
                            <div className="space-y-4 pl-8">
                              <div className="relative">
                                <div className="absolute -left-9 top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-green-900"></div>
                                <div>
                                  <p className="text-sm font-semibold text-green-800 dark:text-green-100">
                                    Last Insemination
                                  </p>
                                  <p className="text-sm text-green-700 dark:text-green-300">
                                    {new Date(selectedPregnancyProgress.last_insemination_date).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                    {selectedPregnancyProgress.days_since_insemination} days ago
                                  </p>
                                </div>
                              </div>
                              <div className="relative">
                                <div className={`absolute -left-9 top-1 w-3 h-3 rounded-full border-2 border-white dark:border-green-900 ${
                                  selectedPregnancyProgress.status === 'calved'
                                    ? 'bg-green-500'
                                    : selectedPregnancyProgress.status === 'overdue'
                                    ? 'bg-red-500'
                                    : selectedPregnancyProgress.status === 'due_soon'
                                    ? 'bg-yellow-500'
                                    : 'bg-green-400'
                                }`}></div>
                                <div>
                                  <p className="text-sm font-semibold text-green-800 dark:text-green-100">
                                    Expected Calving Date
                                  </p>
                                  <p className="text-sm text-green-700 dark:text-green-300">
                                    {new Date(selectedPregnancyProgress.expected_calving_date).toLocaleDateString()}
                                  </p>
                                  {selectedPregnancyProgress.status !== 'calved' && (
                                    <p className={`text-xs mt-1 ${
                                      selectedPregnancyProgress.days_until_calving < 0
                                        ? 'text-red-600 dark:text-red-400'
                                        : selectedPregnancyProgress.days_until_calving <= 14
                                        ? 'text-yellow-600 dark:text-yellow-400'
                                        : 'text-green-600 dark:text-green-400'
                                    }`}>
                                      {selectedPregnancyProgress.days_until_calving < 0
                                        ? `${Math.abs(selectedPregnancyProgress.days_until_calving)} days overdue`
                                        : `${selectedPregnancyProgress.days_until_calving} days remaining`
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>
                              {selectedPregnancyProgress.actual_calving_date && (
                                <div className="relative">
                                  <div className="absolute -left-9 top-1 w-3 h-3 rounded-full bg-green-600 border-2 border-white dark:border-green-900"></div>
                                  <div>
                                    <p className="text-sm font-semibold text-green-800 dark:text-green-100">
                                      Actual Calving Date
                                    </p>
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                      {new Date(selectedPregnancyProgress.actual_calving_date).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="pt-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              selectedPregnancyProgress.status === 'calved'
                                ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200'
                                : selectedPregnancyProgress.status === 'overdue'
                                ? 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
                                : selectedPregnancyProgress.status === 'due_soon'
                                ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
                                : 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                            }`}>
                              {selectedPregnancyProgress.status === 'calved'
                                ? '✓ Calved'
                                : selectedPregnancyProgress.status === 'overdue'
                                ? '⚠ Overdue'
                                : selectedPregnancyProgress.status === 'due_soon'
                                ? '⚠ Due Soon'
                                : '🤰 Pregnant'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Next Insemination Period */}
                    {nextInseminationPeriod && (selectedAnimal.type === "Cow" || selectedAnimal.type === "Heifer") && (
                      <div>
                        <h3 className="text-lg font-semibold text-green-800 dark:text-green-100 mb-3">
                          Next Insemination Period
                        </h3>
                        <div className="space-y-4">
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
                          <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-green-300 dark:bg-green-700"></div>
                            <div className="space-y-4 pl-8">
                              <div className="relative">
                                <div className="absolute -left-9 top-1 w-3 h-3 rounded-full bg-green-600 border-2 border-white dark:border-green-900"></div>
                                <div>
                                  <p className="text-sm font-semibold text-green-800 dark:text-green-100">
                                    Last Calving Date
                                  </p>
                                  <p className="text-sm text-green-700 dark:text-green-300">
                                    {new Date(nextInseminationPeriod.last_calving_date).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                    {nextInseminationPeriod.days_since_calving} days ago
                                  </p>
                                </div>
                              </div>
                              <div className="relative">
                                <div className={`absolute -left-9 top-1 w-3 h-3 rounded-full border-2 border-white dark:border-green-900 ${
                                  nextInseminationPeriod.is_in_window || nextInseminationPeriod.is_past_window
                                    ? 'bg-green-500'
                                    : 'bg-yellow-400'
                                }`}></div>
                                <div>
                                  <p className="text-sm font-semibold text-green-800 dark:text-green-100">
                                    Ideal Window Start
                                  </p>
                                  <p className="text-sm text-green-700 dark:text-green-300">
                                    {nextInseminationPeriod.ideal_start_days} days after calving
                                  </p>
                                </div>
                              </div>
                              <div className="relative">
                                <div className={`absolute -left-9 top-1 w-3 h-3 rounded-full border-2 border-white dark:border-green-900 ${
                                  nextInseminationPeriod.is_in_window
                                    ? 'bg-green-500'
                                    : nextInseminationPeriod.is_past_window
                                    ? 'bg-red-500'
                                    : 'bg-blue-400'
                                }`}></div>
                                <div>
                                  <p className="text-sm font-semibold text-green-800 dark:text-green-100">
                                    Recommended Insemination Date
                                  </p>
                                  <p className="text-sm text-green-700 dark:text-green-300">
                                    {new Date(nextInseminationPeriod.next_insemination_date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
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
        </CardContent>
      </Card>
    </div>
  )
}
