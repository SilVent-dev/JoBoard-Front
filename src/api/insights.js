import api from './axios'

export const gerar = () => api.get('/api/insights')
