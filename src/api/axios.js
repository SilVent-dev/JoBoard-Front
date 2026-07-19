import axios from 'axios'

// Dev: baseURL vazia — o proxy do Vite redireciona /auth e /api para localhost:8080.
// Producao (Vercel): VITE_API_URL aponta para o backend publicado.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || ''
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    // 403 em /auth/* é resposta de negócio (ex.: conta pendente) — não é sessão expirada
    const url = error.config?.url || ''
    if (error.response?.status === 403 && !url.startsWith('/auth')) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api