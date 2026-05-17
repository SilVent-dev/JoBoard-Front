import api from './axios'

export const listar = (filtros = {}) => {
  const params = new URLSearchParams()
  if (filtros.modeloTrabalho) params.append('modeloTrabalho', filtros.modeloTrabalho)
  if (filtros.tipoContrato) params.append('tipoContrato', filtros.tipoContrato)
  if (filtros.nivelExperiencia) params.append('nivelExperiencia', filtros.nivelExperiencia)
  if (filtros.vagaAindaAberta !== undefined) params.append('vagaAindaAberta', filtros.vagaAindaAberta)
  return api.get(`/api/vagas?${params.toString()}`)
}

export const buscarPorId = (id) => api.get(`/api/vagas/${id}`)
export const criar = (dados) => api.post('/api/vagas', dados)
export const atualizar = (id, dados) => api.put(`/api/vagas/${id}`, dados)
export const fechar = (id) => api.patch(`/api/vagas/${id}/fechar`)
export const deletar = (id) => api.delete(`/api/vagas/${id}`)