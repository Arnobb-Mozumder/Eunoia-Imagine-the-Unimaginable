// ==========================================
// API Configuration
// ==========================================

export function getAPIUrl() {
  // Development (localhost or 127.0.0.1)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001'
  }

  // Production - Automatically use the current domain
  // This works perfectly for unified Vercel deployments where frontend and API share the same domain.
  return window.location.origin
}
