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

// Helper function to get test country code for geolocation testing
function getTestCountry(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  // Check URL parameter first (e.g., ?test_country=RS)
  const urlParams = new URLSearchParams(window.location.search);
  const urlCountry = urlParams.get('test_country');
  if (urlCountry) {
    return urlCountry.toUpperCase();
  }

  // Check localStorage for persistent test country
  const storedCountry = localStorage.getItem('test_country');
  if (storedCountry) {
    return storedCountry.toUpperCase();
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

  // Build headers object
  const headersObj: Record<string, string> = {};
  
  // Copy existing headers from options
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headersObj[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headersObj[key] = value;
      });
    } else {
      Object.assign(headersObj, options.headers);
    }
  }
  
  // Set default headers if not already set
  if (!headersObj['Content-Type']) {
    headersObj['Content-Type'] = 'application/json';
  }
  if (!headersObj['Accept']) {
    headersObj['Accept'] = 'application/json';
  }

  // Add Sanctum token to headers if available
  if (token) {
    headersObj['Authorization'] = `Bearer ${token}`;
  }

  // Add test country header for geolocation testing (localhost)
  const testCountry = getTestCountry();
  if (testCountry) {
    headersObj['X-Test-Country'] = testCountry;
    // Debug logging (can be removed in production)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log(`[API] Sending test country header: X-Test-Country: ${testCountry}`);
      console.log(`[API] All headers:`, headersObj);
    }
  }

  // Construct full URL
  let fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`;
  
  // Add test_country as query parameter (more reliable than header for CORS)
  // Backend supports both query param and header, but query param is more reliable
  if (testCountry) {
    const separator = fullUrl.includes('?') ? '&' : '?';
    fullUrl = `${fullUrl}${separator}test_country=${testCountry}`;
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log(`[API] Added test_country query param: ${fullUrl}`);
    }
  }

  try {
    // Make the request with credentials
    // Important: Put headers AFTER spreading options to ensure they're not overwritten
    // Also ensure we don't have headers in options that would overwrite ours
    const { headers: optionsHeaders, ...restOptions } = options || {};
    
    const fetchOptions: RequestInit = {
      ...restOptions,
      method: options?.method || 'GET',
      credentials: 'include', // Important for Sanctum cookies
      mode: 'cors', // Explicitly set CORS mode
      headers: headersObj, // Set headers last to ensure they're not overwritten
    };

    // Also add header (in case backend supports it better)
    if (testCountry) {
      headersObj['X-Test-Country'] = testCountry;
    }

    const response = await fetch(fullUrl, fetchOptions);

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
  get: (url: string, options?: RequestInit) => {
    // Remove headers from options to prevent overwriting
    const { headers, ...restOptions } = options || {};
    return apiFetch(url, { ...restOptions, method: 'GET' });
  },
  
  post: (url: string, data?: any, options?: RequestInit) => {
    // Remove headers from options to prevent overwriting
    const { headers, ...restOptions } = options || {};
    return apiFetch(url, {
      ...restOptions,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  put: (url: string, data?: any, options?: RequestInit) => {
    // Remove headers from options to prevent overwriting
    const { headers, ...restOptions } = options || {};
    return apiFetch(url, {
      ...restOptions,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  patch: (url: string, data?: any, options?: RequestInit) => {
    // Remove headers from options to prevent overwriting
    const { headers, ...restOptions } = options || {};
    return apiFetch(url, {
      ...restOptions,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  delete: (url: string, options?: RequestInit) => {
    // Remove headers from options to prevent overwriting
    const { headers, ...restOptions } = options || {};
    return apiFetch(url, { ...restOptions, method: 'DELETE' });
  },
  
  // Raw fetch method if you need more control
  fetch: apiFetch,
};

/**
 * Set test country for geolocation testing (useful for localhost)
 * @param countryCode - Country code (e.g., 'RS' for Serbia, 'US' for USA)
 */
export function setTestCountry(countryCode: string | null): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  if (countryCode) {
    localStorage.setItem('test_country', countryCode.toUpperCase());
  } else {
    localStorage.removeItem('test_country');
  }
}

/**
 * Get current test country
 */
export function getTestCountryCode(): string | null {
  return getTestCountry();
}

export default api;
