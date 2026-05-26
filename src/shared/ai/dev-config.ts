// Development-only config loader
// In production, users configure via popup settings
// In development, you can use .env file

export function getDevConfig() {
  // 开发模式或测试模式都返回配置
  if (import.meta.env.DEV || import.meta.env.VITE_TEST_MODE === 'true') {
    return {
      apiKey: import.meta.env.VITE_AI_API_KEY || '',
      baseUrl: import.meta.env.VITE_AI_BASE_URL || 'https://api.deepseek.com',
      model: import.meta.env.VITE_AI_MODEL || 'deepseek-chat',
    }
  }
  return null
}
