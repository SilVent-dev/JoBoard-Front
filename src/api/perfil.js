import api from './axios'

export const buscar = () => api.get('/api/perfil')
export const salvar = (dados) => api.put('/api/perfil', dados)
