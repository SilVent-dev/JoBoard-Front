import api from './axios'

export const exportarDados = () => api.get('/api/conta/exportacao', { responseType: 'blob' })
export const excluirConta = (senha) => api.delete('/api/conta', { data: { senha } })
