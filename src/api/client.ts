import { config } from '@/lib/config';
import { keysToCamel, keysToSnake } from '@/lib/caseConversion';

/**
 * API Error class for handling backend errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Token provider function - set by AuthContext
 */
let getAccessToken: (() => string | null) | null = null;

/**
 * Set the global token provider
 * Called by AuthContext to provide token access to all API calls
 */
export const setTokenProvider = (provider: () => string | null) => {
  getAccessToken = provider;
};

/**
 * Get the current access token
 * Useful for components that need direct token access
 */
export const getToken = (): string | null => {
  if (!getAccessToken) return null;
  return getAccessToken();
};

/**
 * Base API request handler with error handling and timeout
 * Automatically converts request bodies from camelCase to snake_case
 * and response data from snake_case to camelCase
 */
const baseApiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.apiTimeout);

  // Convert request body from camelCase to snake_case if present
  const processedOptions: RequestInit = { ...options };
  if (options.body && typeof options.body === 'string') {
    try {
      const bodyObj = JSON.parse(options.body);
      const snakeCaseBody = keysToSnake(bodyObj);
      processedOptions.body = JSON.stringify(snakeCaseBody);
    } catch {
      // If body is not JSON, leave it as is
      processedOptions.body = options.body;
    }
  }

  try {
    const response = await fetch(url, {
      ...processedOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return undefined as T;
    }

    // Convert response from snake_case to camelCase
    const responseData = await response.json();
    return keysToCamel(responseData) as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
};

/**
 * Unauthenticated API request
 * Use for public endpoints like login, register, etc.
 */
export const apiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  return baseApiRequest<T>(url, options);
};

/**
 * Authenticated API request
 * Automatically adds Authorization header with access token
 * Defaults to cache: "no-store" to ensure fresh data on every request
 *
 * @param url - The API endpoint URL
 * @param options - Fetch options (method, body, headers, etc.)
 * @param useCache - Set to true to allow browser caching (default: false)
 *
 * Use for all protected endpoints
 */
export const authRequest = async <T>(
  url: string,
  options: RequestInit = {},
  useCache: boolean = false
): Promise<T> => {
  if (!getAccessToken) {
    throw new ApiError(
      'Authentication not initialized. Token provider not set.',
      500
    );
  }

  const token = getAccessToken();
  if (!token) {
    throw new ApiError('Not authenticated. Please log in.', 401);
  }

  return baseApiRequest<T>(url, {
    // Default to no caching unless explicitly requested
    ...(useCache ? {} : { cache: 'no-store' }),
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
};
