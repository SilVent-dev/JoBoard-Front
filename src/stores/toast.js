import { defineStore } from 'pinia'

let contador = 0

// Toasts efêmeros — feedback de ações concluídas ou falhas.
// tipo: 'sucesso' | 'erro' | 'info'
export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: []
  }),
  actions: {
    mostrar(mensagem, tipo = 'sucesso', duracao = 3500) {
      const id = ++contador
      this.toasts.push({ id, mensagem, tipo })
      if (duracao > 0) {
        setTimeout(() => this.remover(id), duracao)
      }
      return id
    },
    sucesso(mensagem, duracao) { return this.mostrar(mensagem, 'sucesso', duracao) },
    erro(mensagem, duracao) { return this.mostrar(mensagem, 'erro', duracao) },
    info(mensagem, duracao) { return this.mostrar(mensagem, 'info', duracao) },
    remover(id) {
      this.toasts = this.toasts.filter(t => t.id !== id)
    }
  }
})
