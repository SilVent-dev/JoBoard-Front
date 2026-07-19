<template>
  <div class="auth-split">

    <!-- ── Painel esquerdo ── -->
    <div class="art-panel">
      <div class="glow glow-clay"></div>
      <div class="glow glow-light"></div>

      <div class="panel-top">
        <div class="panel-logo">
          <div class="logo-mark">
            <div class="logo-diamond"></div>
          </div>
          <span>Marco</span>
        </div>
      </div>

      <div class="panel-bottom">
        <p class="panel-tagline">Só mais<br>um passo.</p>
        <p class="panel-sub">Confirmamos seu email para manter<br>sua conta segura.</p>
        <div class="panel-dots">
          <span class="dot"></span>
          <span class="dot active"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>

    <!-- ── Área de conteúdo ── -->
    <div class="form-area">
      <div class="form-card">

        <!-- Carregando -->
        <div v-if="estado === 'carregando'" class="estado-box">
          <div class="estado-ring estado-ring--neutro"><Loader2 :size="22" class="spin" /></div>
          <p class="estado-titulo">Confirmando seu email…</p>
          <p class="estado-sub">Isso leva só um instante.</p>
        </div>

        <!-- Sucesso -->
        <div v-else-if="estado === 'sucesso'" class="estado-box">
          <div class="estado-ring">✓</div>
          <p class="estado-titulo">Email confirmado</p>
          <p class="estado-sub">Tudo certo — sua conta está ativa. É só entrar.</p>
          <RouterLink to="/login" class="btn-primary btn-link">Ir para o login</RouterLink>
        </div>

        <!-- Link inválido / expirado / sem token -->
        <div v-else class="estado-box">
          <div class="estado-ring estado-ring--erro"><AlertCircle :size="24" /></div>
          <p class="estado-titulo">{{ token ? 'Link inválido ou expirado' : 'Link incompleto' }}</p>
          <p class="estado-sub">{{ mensagemErro }}</p>
          <RouterLink to="/login" class="btn-primary btn-link">Voltar ao login</RouterLink>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { verificarEmail } from '@/api/auth'
import { Loader2, AlertCircle } from 'lucide-vue-next'

const route = useRoute()
const token = computed(() => route.query.token || '')

const estado = ref('carregando') // 'carregando' | 'sucesso' | 'erro'
const mensagemErro = ref('Este link de verificação não é válido. Faça login para receber um novo.')

onMounted(async () => {
  if (!token.value) {
    estado.value = 'erro'
    mensagemErro.value = 'Não encontramos o código de verificação no link. Faça login para receber um novo email.'
    return
  }
  try {
    await verificarEmail(token.value)
    estado.value = 'sucesso'
  } catch (error) {
    estado.value = 'erro'
    mensagemErro.value = error.response?.data?.mensagem
      || 'Este link já foi usado ou expirou. Faça login para receber um novo email de verificação.'
  }
})
</script>

<style scoped>
.auth-split {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg);
}

/* ── Painel esquerdo ── */
.art-panel {
  width: 400px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 44px;
  background: var(--moss);
}

.glow { position: absolute; border-radius: 50%; pointer-events: none; }
.glow-clay {
  top: -140px; right: -120px; width: 420px; height: 420px;
  background: radial-gradient(circle, rgba(193, 101, 46, 0.30) 0%, transparent 68%);
}
.glow-light {
  bottom: -100px; left: -90px; width: 320px; height: 320px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.06) 0%, transparent 65%);
}

.panel-top, .panel-bottom { position: relative; z-index: 1; }
.panel-logo { display: flex; align-items: center; gap: 10px; }
.logo-mark {
  width: 32px; height: 32px; border-radius: 9px;
  background: rgba(255, 255, 255, 0.16);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.logo-diamond {
  width: 12px; height: 12px; background: var(--clay);
  transform: rotate(45deg); border-radius: 3px;
}
.panel-logo span {
  font-family: var(--font-display); font-size: 18px; font-weight: 600;
  color: var(--text-inverse); letter-spacing: -0.01em;
}
.panel-tagline {
  font-family: var(--font-display); font-size: 32px; font-weight: 600;
  color: var(--text-inverse); line-height: 1.25; letter-spacing: -0.01em; margin-bottom: 12px;
}
.panel-sub { font-size: 13.5px; color: rgba(241, 243, 236, 0.7); line-height: 1.65; margin-bottom: 26px; }
.panel-dots { display: flex; gap: 6px; align-items: center; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(241, 243, 236, 0.25); }
.dot.active { width: 22px; border-radius: 3px; background: var(--clay); }

/* ── Área de conteúdo ── */
.form-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 64px;
}
.form-card {
  width: 100%;
  max-width: 392px;
  padding: 44px;
  border-radius: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: 0 24px 56px rgba(32, 36, 30, 0.08);
}

.estado-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
}
.estado-ring {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--moss-subtle); color: var(--moss);
  font-size: 24px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; margin-bottom: 6px;
}
.estado-ring--neutro { background: var(--surface-alt); color: var(--text-muted); }
.estado-ring--erro { background: var(--danger-subtle); color: var(--danger); }

.estado-titulo {
  font-family: var(--font-display); font-size: 22px; font-weight: 600; color: var(--text-primary);
}
.estado-sub { font-size: 13px; color: var(--text-muted); line-height: 1.6; }

.btn-primary {
  width: 100%;
  margin-top: 22px;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: var(--moss);
  color: var(--text-inverse);
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(63, 93, 78, 0.25);
  transition: background 0.15s;
}
.btn-primary:hover { background: var(--moss-hover); }
.btn-link { text-decoration: none; }

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
