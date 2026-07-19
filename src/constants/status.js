// Cores e rótulos por status do processo seletivo — fonte: Dashboard.dc.html / Candidaturas.dc.html
export const STATUS = {
  LISTA_DESEJO:              { label: 'Wishlist',       cor: 'var(--text-muted)', bg: 'var(--surface-alt)' },
  APLICADA:                  { label: 'Aplicada',       cor: 'var(--info)',       bg: 'var(--info-subtle)' },
  TRIAGEM_TELEFONICA:        { label: 'Triagem',        cor: 'var(--warning)',    bg: 'var(--warning-subtle)' },
  ENTREVISTA_TECNICA:        { label: 'Ent. Técnica',   cor: 'var(--moss)',       bg: 'var(--moss-subtle)' },
  ENTREVISTA_COMPORTAMENTAL: { label: 'Comportamental', cor: 'var(--purple)',     bg: 'var(--purple-subtle)' },
  TESTE_PRATICO:             { label: 'Teste',          cor: 'var(--teal)',       bg: 'var(--teal-subtle)' },
  PROPOSTA_RECEBIDA:         { label: 'Proposta',       cor: 'var(--clay)',       bg: 'var(--clay-subtle)' },
  ACEITA:                    { label: 'Aceita',         cor: 'var(--success)',    bg: 'var(--success-subtle)' },
  REJEITADA:                 { label: 'Rejeitada',      cor: 'var(--danger)',     bg: 'var(--danger-subtle)' },
  DESISTIDA:                 { label: 'Desistida',      cor: 'var(--text-muted)', bg: 'var(--surface-alt)' },
}

// Etapas exibidas no funil "Por etapa" (exclui estados finais)
export const ETAPAS_PIPELINE = [
  'LISTA_DESEJO',
  'APLICADA',
  'TRIAGEM_TELEFONICA',
  'ENTREVISTA_TECNICA',
  'ENTREVISTA_COMPORTAMENTAL',
  'TESTE_PRATICO',
  'PROPOSTA_RECEBIDA',
]

export const statusLabel = (s) => STATUS[s]?.label || s
export const statusStyle = (s) => {
  const m = STATUS[s] || { cor: 'var(--text-muted)', bg: 'var(--surface-alt)' }
  return { color: m.cor, background: m.bg }
}
