"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import api from "@/lib/api"

const farmSchema = z.object({
  name: z.string().min(1, "Farm name is required"),
  location: z.string().optional(),
  state: z.string().optional(),
})

type FarmFormValues = z.infer<typeof farmSchema>

export function FarmEdit() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [farm, setFarm] = useState<any>(null)

  const form = useForm<FarmFormValues>({
    resolver: zodResolver(farmSchema),
    defaultValues: {
      name: "",
      location: "",
      state: "",
    },
  })

  useEffect(() => {
    loadFarm()
  }, [])

  const loadFarm = async () => {
    try {
      const response = await api.get("/api/farm")
      if (response.ok) {
        const data = await response.json()
        setFarm(data.farm)
        if (data.farm) {
          form.reset({
            name: data.farm.name || "",
            location: data.farm.location || "",
            state: data.farm.state || "",
          })
        }
      } else if (response.status === 404) {
        setFarm(null)
      }
    } catch (err) {
      console.error("Error loading farm:", err)
      setError("Failed to load farm information")
    }
  }

  async function onSubmit(data: FarmFormValues) {
    setIsLoading(true)
    setError("")

    try {
      const response = farm
        ? await api.put("/api/farm", data)
        : await api.post("/api/farm", data)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to save farm information")
      }

      // Redirect back to farm view
      router.push("/dashboard/farmer")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-green-200 dark:border-green-800 bg-white dark:bg-green-900/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-b border-green-200 dark:border-green-700">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/farmer")}
              className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <CardTitle className="text-2xl text-green-800 dark:text-green-100 font-bold">
                {farm ? "Edit Farm Information" : "Create Farm"}
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300 mt-1">
                {farm ? "Update your farm details below" : "Fill in the form below to add your farm details"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 p-4 flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Farm Name
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your farm name"
                          className="h-12 border-2 border-green-200 dark:border-green-700 focus:border-green-500 dark:focus:border-green-400 rounded-lg text-base transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-600 dark:text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Location
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter farm address or location"
                          className="h-12 border-2 border-green-200 dark:border-green-700 focus:border-green-500 dark:focus:border-green-400 rounded-lg text-base transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-600 dark:text-red-400" />
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Optional: Street address, city, or general location
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        State / Province
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter state or province"
                          className="h-12 border-2 border-green-200 dark:border-green-700 focus:border-green-500 dark:focus:border-green-400 rounded-lg text-base transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-600 dark:text-red-400" />
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Optional: State, province, or region
                      </p>
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4 border-t border-green-200 dark:border-green-700">
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/farmer")}
                    className="flex-1 h-12 text-base border-2 border-green-200 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 text-base bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {farm ? "Update Farm" : "Create Farm"}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
