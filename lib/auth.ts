import api from "./api"

export interface LoginCredentials {
  email: string
  password: string
}

export async function login(credentials: LoginCredentials): Promise<any> {
  const response = await api.post("/api/login", credentials)

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Login failed")
  }

  const result = await response.json()
  
  // Store token in localStorage and cookie (for middleware access)
  if (typeof window !== 'undefined' && result.token) {
    localStorage.setItem('sanctum_token', result.token)
    // Also set cookie for middleware to check
    document.cookie = `sanctum_token=${result.token}; path=/; max-age=86400; SameSite=Lax`
  }

  return result
}

export async function logout(): Promise<void> {
  try {
    await api.post("/api/logout")
  } catch (error) {
    // Ignore errors on logout
    console.error("Logout error:", error)
  } finally {
    // Always remove token from localStorage and cookie
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sanctum_token')
      // Remove cookie
      document.cookie = 'sanctum_token=; path=/; max-age=0; SameSite=Lax'
    }
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return localStorage.getItem('sanctum_token')
}

export function isAuthenticated(): boolean {
  return getToken() !== null
}
