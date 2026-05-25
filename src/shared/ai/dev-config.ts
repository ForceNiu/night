// Development-only config loader
// In production, users configure via popup settings
// In development, you can use .env file

export function getDevConfig() {
  if (import.meta.env.DEV) {
    return {
      apiKey: import.meta.env.VITE_AI_API_KEY || '',
      baseUrl: import.meta.env.VITE_AI_BASE_URL || 'https://api.deepseek.com',
      model: import.meta.env.VITE_AI_MODEL || 'deepseek-chat',
    }
  }
  return null
}
