import api from './axios'

export const listar = () => api.get('/api/empresas')
export const buscarPorId = (id) => api.get(`/api/empresas/${id}`)
export const criar = (dados) => api.post('/api/empresas', dados)
export const atualizar = (id, dados) => api.put(`/api/empresas/${id}`, dados)
export const deletar = (id) => api.delete(`/api/empresas/${id}`)