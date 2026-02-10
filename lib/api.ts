// Helper function to get Sanctum token from cookies or localStorage
function getSanctumToken(): string | null {
  if (typeof window === 'undefined') {
    return null; // Server-side, token should be in cookies automatically
  }

  // First, try to get token from localStorage (most reliable for client-side)
  const token = localStorage.getItem('sanctum_token');
  if (token) {
    return token;
  }

  // Fallback: try to get token from cookies
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => 
    cookie.trim().startsWith('sanctum_token=')
  );
  
  if (tokenCookie) {
    return decodeURIComponent(tokenCookie.split('=')[1].trim());
  }

  return null;
}

// Base URL configuration
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Custom fetch wrapper that adds Sanctum token to every request
async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get the Sanctum token
  const token = getSanctumToken();

  // Build headers
  const headers = new Headers(options.headers || {});
  
  // Set default headers if not already set
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  // Add Sanctum token to headers if available
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Construct full URL
  const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`;

  try {
    // Make the request with credentials
    const response = await fetch(fullUrl, {
      ...options,
      headers,
      credentials: 'include', // Important for Sanctum cookies
      mode: 'cors', // Explicitly set CORS mode
    });

    // Handle 401 unauthorized - token expired or invalid
    if (response.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sanctum_token');
        // Remove cookie
        document.cookie = 'sanctum_token=; path=/; max-age=0; SameSite=Lax';
        // Redirect to login page, preserving the current path for redirect after login
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    }

    return response;
  } catch (error) {
    // Handle network errors (CORS, connection refused, etc.)
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      const errorDetails = {
        url: fullUrl,
        baseURL,
        frontendOrigin: typeof window !== 'undefined' ? window.location.origin : 'unknown',
        error: error.message,
      };
      
      console.error('Network error: Unable to connect to API server', errorDetails);
      
      // Check if it's a CORS issue
      const isCorsIssue = typeof window !== 'undefined' && 
        !fullUrl.startsWith(window.location.origin) &&
        error.message === 'Failed to fetch';
      
      if (isCorsIssue) {
        throw new Error(
          `CORS error: Unable to connect to API server at ${baseURL} from ${errorDetails.frontendOrigin}. ` +
          `Please check CORS configuration in the backend.`
        );
      }
      
      // Throw a more descriptive error
      throw new Error(
        `Unable to connect to API server at ${baseURL}. ` +
        `Please ensure the backend is running and accessible. ` +
        `Frontend origin: ${errorDetails.frontendOrigin}`
      );
    }
    throw error;
  }

}

// Convenience methods for common HTTP verbs
export const api = {
  get: (url: string, options?: RequestInit) => 
    apiFetch(url, { ...options, method: 'GET' }),
  
  post: (url: string, data?: any, options?: RequestInit) => 
    apiFetch(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: (url: string, data?: any, options?: RequestInit) => 
    apiFetch(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  patch: (url: string, data?: any, options?: RequestInit) => 
    apiFetch(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: (url: string, options?: RequestInit) => 
    apiFetch(url, { ...options, method: 'DELETE' }),
  
  // Raw fetch method if you need more control
  fetch: apiFetch,
};

export default api;
