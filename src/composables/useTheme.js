import { ref, onMounted, onUnmounted } from 'vue'

const STORAGE_KEY = 'joboard-theme'

// Shared state — singleton across all composable instances
const theme = ref('light')
const isDark = ref(false)

function applyTheme(value) {
  theme.value = value
  isDark.value = value === 'dark'
  document.documentElement.setAttribute('data-theme', value)
  localStorage.setItem(STORAGE_KEY, value)
}

function toggleTheme() {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark')
}

function initTheme() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    applyTheme(stored)
    return
  }
  // Fall back to system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  applyTheme(prefersDark ? 'dark' : 'light')
}

// Listen to system preference changes (only if user hasn't overridden)
let mediaQuery = null

function setupMediaListener() {
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light')
    }
  }
  mediaQuery.addEventListener('change', handler)
  return () => mediaQuery.removeEventListener('change', handler)
}

// Initialize immediately on module load (before Vue mounts)
if (typeof window !== 'undefined') {
  initTheme()
}

export function useTheme() {
  let cleanup = null

  onMounted(() => {
    cleanup = setupMediaListener()
  })

  onUnmounted(() => {
    if (cleanup) cleanup()
  })

  return { theme, isDark, toggleTheme }
}