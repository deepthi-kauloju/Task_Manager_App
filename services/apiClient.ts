/**
 * Centralized API Client for all backend communications
 * This ensures all requests go to the correct backend URL
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5001';

/**
 * Makes an API call with proper error handling
 * @param url - Endpoint path (e.g., '/api/auth/login')
 * @param options - Fetch options
 * @returns Parsed JSON response
 */
export const callApi = async (url: string, options: RequestInit = {}) => {
  const fullUrl = `${API_BASE_URL}${url}`;
  
  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }
  
  return data;
};

/**
 * Makes an authorized API call (includes JWT token)
 * @param url - Endpoint path
 * @param token - JWT token
 * @param options - Fetch options
 * @returns Parsed JSON response
 */
export const callAuthenticatedApi = async (
  url: string,
  token: string,
  options: RequestInit = {}
) => {
  return callApi(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
};

/**
 * Helper for debugging - logs the full URL being called
 */
export const getFullUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

export { API_BASE_URL };
