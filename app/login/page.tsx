"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
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
} from "@/components/ui/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { login } from "@/lib/auth"
import { useTranslations } from "@/hooks/useTranslations"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { t } = useTranslations()
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  // Check for redirect message from middleware
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const message = searchParams.get('message')
    if (message) {
      setError(message)
    }
  }, [])

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    setError("")

    try {
      const result = await login(data)
      
      // Get redirect URL from query params or use default based on profile type
      const searchParams = new URLSearchParams(window.location.search)
      const redirectTo = searchParams.get('redirect')
      
      // Use window.location.href for full page reload to ensure cookies are available to middleware
      const redirectUrl = redirectTo || (
        (() => {
          const profileType = result?.user?.profile_type?.toLowerCase()
          if (profileType === "farmer" || result?.user?.profile_type === "Farmer") {
            return "/dashboard/farmer"
          } else if (profileType === "vet" || result?.user?.profile_type === "Vet") {
            return "/dashboard/vet"
          }
          return "/"
        })()
      )
      
      // Small delay to ensure cookie is set before redirect
      setTimeout(() => {
        window.location.href = redirectUrl
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.an_error_occurred"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50 dark:bg-green-950 p-4">
      <Card className="w-full max-w-md border-green-200 dark:border-green-800 bg-white dark:bg-green-900/50">
        <CardHeader>
          <CardTitle className="text-green-800 dark:text-green-100">{t("common.login")}</CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300">
            {t("common.enter_credentials")}
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
                    <FormLabel className="text-green-800 dark:text-green-200">{t("common.email")}</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="you@example.com" 
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
                    <FormLabel className="text-green-800 dark:text-green-200">{t("common.password")}</FormLabel>
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
              
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600" 
                disabled={isLoading}
              >
                {isLoading ? t("common.logging_in") : t("common.login")}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-sm text-green-700 dark:text-green-300">
            {t("common.dont_have_account")}{" "}
            <Link href="/register" className="text-green-600 dark:text-green-400 font-medium hover:underline">
              {t("common.register_here")}
            </Link>
          </p>
          <Link href="/" className="text-sm text-green-600 dark:text-green-400 hover:underline">
            {t("common.back_to_home")}
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
