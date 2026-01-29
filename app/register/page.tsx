"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function RegisterSelectPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50 dark:bg-green-950 p-4">
      <div className="w-full max-w-4xl">
        <Card className="border-green-200 dark:border-green-800 bg-white dark:bg-green-900/50">
          <CardHeader className="text-center">
            <CardTitle className="text-green-800 dark:text-green-100 text-2xl">
              Choose Your Profile Type
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Select the type of account you want to create
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Farmer Card */}
              <Card 
                className="cursor-pointer transition-all hover:shadow-lg hover:border-green-400 dark:hover:border-green-600 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/30"
                onClick={() => router.push("/register/farmer")}
              >
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className="rounded-full bg-green-100 dark:bg-green-800 p-4">
                      <svg
                        className="h-12 w-12 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                    </div>
                  </div>
                  <CardTitle className="text-center text-green-800 dark:text-green-100">
                    Farmer
                  </CardTitle>
                  <CardDescription className="text-center text-green-700 dark:text-green-300">
                    Manage your farm, cattle inventory, and livestock tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
                    <li className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Track cattle inventory
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Manage farm details
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Connect with veterinarians
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600"
                    onClick={() => router.push("/register/farmer")}
                  >
                    Register as Farmer
                  </Button>
                </CardFooter>
              </Card>

              {/* Vet Card */}
              <Card 
                className="cursor-pointer transition-all hover:shadow-lg hover:border-green-400 dark:hover:border-green-600 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/30"
                onClick={() => router.push("/register/vet")}
              >
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className="rounded-full bg-green-100 dark:bg-green-800 p-4">
                      <svg
                        className="h-12 w-12 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <CardTitle className="text-center text-green-800 dark:text-green-100">
                    Veterinarian
                  </CardTitle>
                  <CardDescription className="text-center text-green-700 dark:text-green-300">
                    Provide veterinary services and manage farm assignments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
                    <li className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Manage farm assignments
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Track veterinary records
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Provide professional services
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600"
                    onClick={() => router.push("/register/vet")}
                  >
                    Register as Veterinarian
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <p className="text-sm text-green-700 dark:text-green-300">
              Already have an account?{" "}
              <Link href="/login" className="text-green-600 dark:text-green-400 font-medium hover:underline">
                Login here
              </Link>
            </p>
            <Link href="/" className="text-sm text-green-600 dark:text-green-400 hover:underline">
              ← Back to home
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
