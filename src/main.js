import { createApp } from 'vue'
import { createPinia } from 'pinia'
import * as Sentry from '@sentry/vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

// Monitoramento de erros — só ativa se o DSN estiver configurado (produção)
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [Sentry.browserTracingIntegration({ router })],
    tracesSampleRate: 0.1
  })
}

app.use(createPinia())
app.use(router)
app.mount('#app')
