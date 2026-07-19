import api from './axios'

export const listar = () => api.get('/api/curriculos')

export const upload = (arquivo, versao, onProgress) => {
  const form = new FormData()
  form.append('arquivo', arquivo)
  form.append('versao', versao)
  return api.post('/api/curriculos', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }
  })
}

export const marcarPrincipal = (id) => api.patch(`/api/curriculos/${id}/principal`)
export const deletar = (id) => api.delete(`/api/curriculos/${id}`)
