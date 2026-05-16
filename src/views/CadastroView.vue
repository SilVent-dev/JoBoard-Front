<template>
  <div class="auth-split">

    <div class="art-panel">
      <div class="art-blobs">
        <div class="blob b1"></div>
        <div class="blob b2"></div>
        <div class="blob b3"></div>
        <div class="blob b4"></div>
        <div class="blob-mountain"></div>
      </div>

      <div class="panel-top">
        <div class="panel-logo">
          <div class="logo-mark">
            <Briefcase :size="15" />
          </div>
          <span>Joboard</span>
        </div>
      </div>

      <div class="panel-bottom">
        <p class="panel-tagline">Comece sua<br>jornada agora.</p>
        <p class="panel-sub">Crie sua conta e tenha<br>controle de cada processo.</p>
        <div class="panel-dots">
          <span class="dot"></span>
          <span class="dot active"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>

    <div class="form-area">
      <div class="bg-blob bg-blob--1"></div>
      <div class="bg-blob bg-blob--2"></div>
      <div class="bg-blob bg-blob--3"></div>

      <div class="glass-card">

        <div v-if="!sucesso">
          <div class="form-header">
            <h2 class="form-title">Criar conta</h2>
            <p class="form-sub">Preencha os dados para começar</p>
          </div>

          <form @submit.prevent="handleCadastro">
            <div class="field">
              <label>Nome completo</label>
              <div class="input-wrap">
                <UserIcon :size="14" class="input-icon" />
                <input
                  v-model="form.nome"
                  type="text"
                  placeholder="Seu nome"
                  autocomplete="name"
                  required
                />
              </div>
            </div>

            <div class="field">
              <label>Email</label>
              <div class="input-wrap">
                <Mail :size="14" class="input-icon" />
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="seu@email.com"
                  autocomplete="email"
                  required
                />
              </div>
            </div>

            <div class="field">
              <label>Senha</label>
              <div class="input-wrap">
                <Lock :size="14" class="input-icon" />
                <input
                  v-model="form.senha"
                  :type="mostrarSenha ? 'text' : 'password'"
                  placeholder="Mínimo 8 caracteres"
                  autocomplete="new-password"
                  minlength="8"
                  required
                />
                <button type="button" class="toggle-senha" @click="mostrarSenha = !mostrarSenha">
                  <Eye v-if="!mostrarSenha" :size="13" />
                  <EyeOff v-else :size="13" />
                </button>
              </div>
            </div>

            <p v-if="auth.erro" class="erro">{{ auth.erro }}</p>

            <button type="submit" class="btn-primary" :disabled="auth.carregando">
              <Loader2 v-if="auth.carregando" :size="14" class="spin" />
              {{ auth.carregando ? 'Criando conta...' : 'Criar conta' }}
            </button>
          </form>
        </div>

        <div v-else class="sucesso-box">
          <div class="sucesso-ring">
            <CheckCircle :size="32" />
          </div>
          <p class="sucesso-titulo">Conta criada!</p>
          <p class="sucesso-sub">Verifique seu email para ativar o acesso. O link expira em 2 horas.</p>
          <RouterLink to="/login" class="btn-primary" style="text-decoration:none;justify-content:center;display:flex">
            Ir para o login
          </RouterLink>
        </div>

        <p class="auth-link">
          Já tem conta?
          <RouterLink to="/login">Entrar</RouterLink>
        </p>

      </div>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { Briefcase, User as UserIcon, Mail, Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-vue-next'

const auth = useAuthStore()
const sucesso = ref(false)
const mostrarSenha = ref(false)
const form = reactive({ nome: '', email: '', senha: '' })

async function handleCadastro() {
  const ok = await auth.cadastrar(form.nome, form.email, form.senha)
  if (ok) sucesso.value = true
}
</script>

<style scoped>
.auth-split {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* Painel esquerdo — idêntico ao login */
.art-panel {
  width: 400px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 32px 36px;
  background: #D94518;
}

.art-blobs { position: absolute; inset: 0; pointer-events: none; }

.blob { position: absolute; border-radius: 50%; }

.b1 {
  width: 420px; height: 420px;
  top: -140px; right: -100px;
  background: radial-gradient(ellipse at 40% 35%, #F8DCC8 0%, #F2B088 25%, #E07040 55%, transparent 72%);
  opacity: 0.9;
}
.b2 {
  width: 320px; height: 320px;
  top: 15%; left: -100px;
  background: radial-gradient(ellipse at 60% 50%, #F5C090 0%, #E08050 35%, transparent 65%);
  opacity: 0.5;
}
.b3 {
  width: 280px; height: 280px;
  top: 38%; right: -60px;
  background: radial-gradient(ellipse at 45% 40%, #F0A870 0%, #D06030 45%, transparent 68%);
  opacity: 0.55;
}
.b4 {
  width: 360px; height: 220px;
  bottom: 25%; left: -40px;
  background: radial-gradient(ellipse at 50% 80%, #A03010 0%, #C04825 45%, transparent 70%);
  opacity: 0.7;
}
.blob-mountain {
  position: absolute;
  bottom: 22%; left: -15%;
  width: 130%; height: 52%;
  background: radial-gradient(ellipse 72% 100% at 50% 100%, #6A1E08 0%, #8C2F14 20%, #B04525 45%, #CC6035 62%, transparent 78%);
  border-radius: 48% 52% 0 0 / 60% 60% 0 0;
}

.panel-top, .panel-bottom { position: relative; z-index: 1; }

.panel-logo { display: flex; align-items: center; gap: 9px; }

.logo-mark {
  width: 30px; height: 30px;
  border-radius: 8px;
  background: rgba(255,255,255,0.22);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.3);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
}

.panel-logo span {
  font-size: 17px; font-weight: 700;
  color: rgba(255,255,255,0.92);
  letter-spacing: -0.02em;
}

.panel-bottom { display: flex; flex-direction: column; gap: 0; padding-bottom: 8px; }

.panel-tagline {
  font-size: 30px; font-weight: 700;
  color: #fff; line-height: 1.2;
  letter-spacing: -0.025em; margin-bottom: 10px;
}

.panel-sub {
  font-size: 13.5px; color: rgba(255,255,255,0.62);
  line-height: 1.65; margin-bottom: 24px;
}

.panel-dots { display: flex; gap: 6px; align-items: center; }

.dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.28);
}

.dot.active {
  width: 22px; border-radius: 3px;
  background: rgba(255,255,255,0.82);
}

/* Área do formulário */
.form-area {
  flex: 1;
  display: flex; align-items: center; justify-content: center;
  padding: 48px 64px;
  background: #F5F0EB;
  position: relative; overflow: hidden;
}

.bg-blob { position: absolute; border-radius: 50%; pointer-events: none; }
.bg-blob--1 { width: 480px; height: 480px; top: -180px; right: -140px; background: radial-gradient(circle, rgba(217,69,24,0.13) 0%, transparent 65%); }
.bg-blob--2 { width: 360px; height: 360px; bottom: -120px; left: -80px; background: radial-gradient(circle, rgba(240,130,60,0.10) 0%, transparent 65%); }
.bg-blob--3 { width: 220px; height: 220px; top: 40%; left: 55%; background: radial-gradient(circle, rgba(217,69,24,0.07) 0%, transparent 60%); }

/* Glass card */
.glass-card {
  position: relative;
  width: 100%; max-width: 400px;
  padding: 44px 48px;
  border-radius: 28px;
  background: rgba(255,255,255,0.58);
  backdrop-filter: blur(48px) saturate(160%) brightness(1.04);
  -webkit-backdrop-filter: blur(48px) saturate(160%) brightness(1.04);
  border: 1px solid rgba(255,255,255,0.72);
  box-shadow:
    0 1px 0 rgba(255,255,255,0.95) inset,
    1px 0 0 rgba(255,255,255,0.45) inset,
    -1px 0 0 rgba(255,255,255,0.35) inset,
    0 4px 16px rgba(0,0,0,0.05),
    0 16px 48px rgba(0,0,0,0.09),
    0 40px 80px rgba(0,0,0,0.06);
}

.glass-card::before {
  content: '';
  position: absolute;
  top: 0; left: 10%; width: 80%; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.95) 30%, rgba(255,255,255,0.95) 70%, transparent);
  border-radius: 0 0 50% 50%;
}

.form-header { margin-bottom: 30px; }

.form-title {
  font-size: 26px; font-weight: 700;
  color: #1a1208; letter-spacing: -0.025em; margin-bottom: 6px;
}

.form-sub { font-size: 13.5px; color: #9a8878; }

form { display: flex; flex-direction: column; gap: 14px; }

.field { display: flex; flex-direction: column; gap: 5px; }

.field label {
  font-size: 11.5px; font-weight: 600;
  color: #6a5a4a; letter-spacing: 0.04em; text-transform: uppercase;
}

.input-wrap { position: relative; display: flex; align-items: center; }

.input-icon { position: absolute; left: 12px; color: #b8a898; pointer-events: none; }

.input-wrap input {
  width: 100%;
  padding: 11px 12px 11px 36px;
  border: 1px solid rgba(200,180,160,0.5);
  border-radius: 12px;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(8px);
  color: #1a1208; font-size: 14px;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
  outline: none;
}

.input-wrap input:focus {
  border-color: rgba(217,69,24,0.6);
  background: rgba(255,255,255,0.88);
  box-shadow: 0 0 0 3px rgba(217,69,24,0.08);
}

.toggle-senha {
  position: absolute; right: 12px;
  background: none; border: none;
  color: #b8a898; padding: 2px;
  display: flex; align-items: center; cursor: pointer;
}

.toggle-senha:hover { color: #6a5a4a; }

.erro {
  font-size: 12px; color: #c0392b;
  padding: 8px 10px;
  background: rgba(252,235,235,0.8);
  border: 1px solid rgba(254,202,202,0.8);
  border-radius: 10px;
}

.btn-primary {
  width: 100%; padding: 12px;
  background: #D94518; color: #fff;
  border: none; border-radius: 12px;
  font-size: 14px; font-weight: 600;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  margin-top: 6px; cursor: pointer;
  transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
  box-shadow: 0 2px 8px rgba(217,69,24,0.35), 0 1px 0 rgba(255,255,255,0.15) inset;
}

.btn-primary:hover:not(:disabled) {
  background: #BB3510;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(217,69,24,0.4);
}

.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Sucesso */
.sucesso-box {
  display: flex; flex-direction: column;
  align-items: center; text-align: center;
  gap: 12px; padding: 8px 0;
}

.sucesso-ring {
  width: 64px; height: 64px;
  border-radius: 50%;
  background: rgba(217,69,24,0.08);
  color: #D94518;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 4px;
}

.sucesso-titulo {
  font-size: 22px; font-weight: 700;
  color: #1a1208; letter-spacing: -0.02em;
}

.sucesso-sub {
  font-size: 13px; color: #9a8878; line-height: 1.6;
}

.auth-link {
  text-align: center; font-size: 13px;
  color: #9a8878; margin-top: 20px;
}

.auth-link a { color: #D94518; font-weight: 600; text-decoration: none; }
.auth-link a:hover { text-decoration: underline; }
</style>