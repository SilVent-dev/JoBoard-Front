import { defineStore } from 'pinia'
import { login as loginApi, cadastro as cadastroApi } from '@/api/auth'
import api from '@/api/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    usuario: JSON.parse(localStorage.getItem('usuario') || 'null'),
    carregando: false,
    erro: null
  }),

  getters: {
    estaLogado: (state) => !!state.token
  },

  actions: {
    async login(email, senha) {
      this.carregando = true
      this.erro = null
      try {
        const { data } = await loginApi({ email, senha })
        this.token = data.token
        localStorage.setItem('token', data.token)
        await this.carregarPerfil()
        return true
      } catch (error) {
        this.erro = error.response?.data?.mensagem || 'Email ou senha incorretos.'
        return false
      } finally {
        this.carregando = false
      }
    },

    async carregarPerfil() {
      try {
        const { data } = await api.get('/api/perfil')
        this.usuario = { nome: data.nomeCompleto, id: data.usuarioId }
        localStorage.setItem('usuario', JSON.stringify(this.usuario))
      } catch {
        // perfil ainda não preenchido — usa dados básicos
        this.usuario = { nome: 'Candidato', email: '' }
      }
    },

    async cadastrar(nome, email, senha, website = '') {
      this.carregando = true
      this.erro = null
      try {
        await cadastroApi({ nome, email, senha, website })
        return true
      } catch (error) {
        this.erro = error.response?.data?.mensagem || 'Erro ao criar conta.'
        return false
      } finally {
        this.carregando = false
      }
    },

    logout() {
      this.token = null
      this.usuario = null
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
    }
  }
})