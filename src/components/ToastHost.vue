<template>
  <Teleport to="body">
    <div class="toast-host">
      <TransitionGroup name="toast">
        <div
          v-for="t in toast.toasts"
          :key="t.id"
          class="toast"
          :class="`toast--${t.tipo}`"
          role="status"
          @click="toast.remover(t.id)"
        >
          <span class="toast-icon">
            <Check v-if="t.tipo === 'sucesso'" :size="14" />
            <AlertCircle v-else-if="t.tipo === 'erro'" :size="14" />
            <Info v-else :size="14" />
          </span>
          <span class="toast-msg">{{ t.mensagem }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToastStore } from '@/stores/toast'
import { Check, AlertCircle, Info } from 'lucide-vue-next'

const toast = useToastStore()
</script>

<style scoped>
.toast-host {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 240px;
  max-width: 380px;
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  flex-shrink: 0;
}

.toast-msg {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
}

.toast--sucesso .toast-icon { background: var(--success-subtle); color: var(--success); }
.toast--erro   .toast-icon { background: var(--danger-subtle);  color: var(--danger); }
.toast--info   .toast-icon { background: var(--moss-subtle);    color: var(--moss); }

/* Entrada/saída suave, sem susto */
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
.toast-move {
  transition: transform 0.25s ease;
}
</style>
