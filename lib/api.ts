// Helper function to get Sanctum token from cookies
function getSanctumToken(): string | null {
  if (typeof window === 'undefined') {
    return null; // Server-side, token should be in cookies automatically
  }

  // Try to get token from cookies
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => 
    cookie.trim().startsWith('XSRF-TOKEN=')
  );
  
  if (tokenCookie) {
    return decodeURIComponent(tokenCookie.split('=')[1]);
  }

  // Fallback: try localStorage (if you're storing it there)
  const token = localStorage.getItem('sanctum_token');
  if (token) {
    return token;
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
    headers.set('X-XSRF-TOKEN', token);
  }

  // Construct full URL
  const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`;

  // Make the request with credentials
  const response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: 'include', // Important for Sanctum cookies
  });

  // Handle 401 unauthorized - token expired or invalid
  if (response.status === 401) {
    // Optionally redirect to login or clear token
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sanctum_token');
    }
  }

  return response;
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
