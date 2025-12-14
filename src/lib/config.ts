function getApiBaseUrl(): string {
  // Environment-specific base URLs
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_API_URL || 'https://api.spotlux.app';
  }

  // Development default
  // return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return process.env.NEXT_PUBLIC_API_URL || 'http://10.0.1.20:8000';
}

export const config = {
  apiBaseUrl: getApiBaseUrl(),
  apiTimeout: 10000, // 10 seconds
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

export default config;
