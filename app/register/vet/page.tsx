"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import api from "@/lib/api"

const vetRegisterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  password_confirmation: z.string().min(8, "Password confirmation is required"),
  license_number: z.string().min(1, "License number is required"),
  specialization: z.string().optional(),
  clinic_name: z.string().optional(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
})

type VetRegisterFormValues = z.infer<typeof vetRegisterSchema>

export default function VetRegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<VetRegisterFormValues>({
    resolver: zodResolver(vetRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      password_confirmation: "",
      license_number: "",
      specialization: "",
      clinic_name: "",
    },
  })

  async function onSubmit(data: VetRegisterFormValues) {
    setIsLoading(true)
    setError("")

    try {
      const response = await api.post("/api/register/vet", {
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        license_number: data.license_number,
        specialization: data.specialization || null,
        clinic_name: data.clinic_name || null,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Registration failed")
      }

      const result = await response.json()
      
      // Store token in localStorage and cookie (for middleware access)
      if (typeof window !== 'undefined' && result.token) {
        localStorage.setItem('sanctum_token', result.token)
        // Set cookie for middleware to check (same as login function)
        document.cookie = `sanctum_token=${result.token}; path=/; max-age=86400; SameSite=Lax`
        
        // Small delay to ensure cookie is set before redirect
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Redirect to dashboard - middleware will allow it since we have the token
      // For vets, redirect to farmer dashboard (or create a vet dashboard later)
      // Use window.location.href for full page reload to ensure cookie is recognized
      window.location.href = "/dashboard/farmer"
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50 dark:bg-green-950 p-4">
      <Card className="w-full max-w-md border-green-200 dark:border-green-800 bg-white dark:bg-green-900/50">
        <CardHeader>
          <CardTitle className="text-green-800 dark:text-green-100">Register as Veterinarian</CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300">
            Create your veterinarian account to provide services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-green-800 dark:text-green-200">Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="vet@example.com" 
                        className="border-green-200 dark:border-green-700 focus:border-green-500 dark:focus:border-green-400"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-green-800 dark:text-green-200">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="border-green-200 dark:border-green-700 focus:border-green-500 dark:focus:border-green-400"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="text-green-600 dark:text-green-400">
                      Must be at least 8 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password_confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-green-800 dark:text-green-200">Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="border-green-200 dark:border-green-700 focus:border-green-500 dark:focus:border-green-400"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="license_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-green-800 dark:text-green-200">License Number *</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="VET12345" 
                        className="border-green-200 dark:border-green-700 focus:border-green-500 dark:focus:border-green-400"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-green-800 dark:text-green-200">Specialization (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="e.g., Large Animals, Small Animals" 
                        className="border-green-200 dark:border-green-700 focus:border-green-500 dark:focus:border-green-400"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clinic_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-green-800 dark:text-green-200">Clinic Name (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="Animal Care Clinic" 
                        className="border-green-200 dark:border-green-700 focus:border-green-500 dark:focus:border-green-400"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600" 
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Register"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-sm text-green-700 dark:text-green-300">
            Already have an account?{" "}
            <Link href="/login" className="text-green-600 dark:text-green-400 font-medium hover:underline">
              Login here
            </Link>
          </p>
          <Link href="/register" className="text-sm text-green-600 dark:text-green-400 hover:underline">
            ← Choose different profile type
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
