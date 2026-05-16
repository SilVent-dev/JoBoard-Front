import api from './axios'

export const login = (dados) => api.post('/auth/login', dados)
export const cadastro = (dados) => api.post('/auth/cadastro', dados)