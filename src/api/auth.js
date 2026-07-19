import api from './axios'

export const login = (dados) => api.post('/auth/login', dados)
export const cadastro = (dados) => api.post('/auth/cadastro', dados)
export const esqueciSenha = (dados) => api.post('/auth/esqueci-senha', dados)
export const redefinirSenha = (dados) => api.post('/auth/redefinir-senha', dados)
export const verificarEmail = (token) => api.get('/auth/verificar-email', { params: { token } })