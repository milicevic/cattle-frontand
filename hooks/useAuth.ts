import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"

export function useAuth(redirectPath: string) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push(`/login?redirect=${redirectPath}`)
      return
    }
    setIsChecking(false)
  }, [router, redirectPath])

  return { isChecking }
}
