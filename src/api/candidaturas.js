import api from './axios'

export const listar = () => api.get('/api/candidaturas')
export const buscarPorId = (id) => api.get(`/api/candidaturas/${id}`)
export const criar = (dados) => api.post('/api/candidaturas', dados)
export const atualizarStatus = (id, dados) => api.patch(`/api/candidaturas/${id}/status`, dados)
export const adicionarNota = (id, dados) => api.patch(`/api/candidaturas/${id}/nota`, dados)
export const arquivar = (id) => api.patch(`/api/candidaturas/${id}/arquivar`)
export const buscarHistorico = (id) => api.get(`/api/candidaturas/${id}/historico`)
export const listarContatos = (id) => api.get(`/api/candidaturas/${id}/contatos`)
export const criarContato = (id, dados) => api.post(`/api/candidaturas/${id}/contatos`, dados)
export const deletarContato = (candidaturaId, contatoId) => api.delete(`/api/candidaturas/${candidaturaId}/contatos/${contatoId}`)