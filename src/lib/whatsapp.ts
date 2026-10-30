import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Unicode Escapes imunes a problemas de encoding de arquivo (Windows/Linux/Vercel)
const EMOJI = {
  CHART: '\u{1F4CA}',       // 📊
  CALENDAR: '\u{1F5D3}\u{FE0F}', // 🗓️
  PIN: '\u{1F4CC}',         // 📌
  BULLET: '\u{25AB}\u{FE0F}',   // ▫️
  CHECK: '\u{2705}',        // ✅
  HOURGLASS: '\u{23F3}',    // ⏳
  CROSS: '\u{274C}',        // ❌
  TARGET: '\u{1F3AF}',      // 🎯
  TROPHY: '\u{1F3C6}',      // 🏆
  FIRST: '\u{1F947}',       // 🥇
  SECOND: '\u{1F948}',      // 🥈
  THIRD: '\u{1F949}',       // 🥉
  BLUE_DOT: '\u{1F539}',    // 🔹
  MOBILE: '\u{1F4F1}',      // 📱
}

interface TopClient {
  name: string
  count: number
}

export interface ReportData {
  period: string // "YYYY-MM"
  totalVisits: number
  completedVisits: number
  scheduledVisits: number
  canceledVisits: number
  completionRate: number
  topClients: TopClient[]
}

function generateProgressBar(rate: number): string {
  const totalBlocks = 10
  const filledBlocks = Math.round((Math.max(0, Math.min(100, rate)) / 100) * totalBlocks)
  const emptyBlocks = totalBlocks - filledBlocks
  return `[${'█'.repeat(filledBlocks)}${'░'.repeat(emptyBlocks)}]`
}

function formatPeriodText(yearMonth: string): string {
  try {
    const date = parseISO(`${yearMonth}-01`)
    const formatted = format(date, "MMMM 'de' yyyy", { locale: ptBR })
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  } catch {
    return yearMonth
  }
}

export function buildWhatsAppReportText(data: ReportData): string {
  const periodFormatted = formatPeriodText(data.period)
  const progressBar = generateProgressBar(data.completionRate)
  const medals = [EMOJI.FIRST, EMOJI.SECOND, EMOJI.THIRD, EMOJI.BLUE_DOT, EMOJI.BLUE_DOT]

  const clientsList = data.topClients.length > 0
    ? data.topClients
        .map((client, index) => {
          const medal = medals[index] || EMOJI.BLUE_DOT
          const unit = client.count === 1 ? 'visita' : 'visitas'
          return `${medal} *${client.name.trim().toUpperCase()}* (${client.count} ${unit})`
        })
        .join('\n')
    : '_Nenhum atendimento registrado no período._'

  return `${EMOJI.CHART} *RELATÓRIO DE DESEMPENHO DE CAMPO*
${EMOJI.CALENDAR} *Período:* ${periodFormatted}
─────────────────────────

${EMOJI.PIN} *RESUMO EXECUTIVO*
${EMOJI.BULLET} *Total Agendado:* ${data.totalVisits}
${EMOJI.CHECK} *Concluídas:* ${data.completedVisits}
${EMOJI.HOURGLASS} *Pendentes:* ${data.scheduledVisits}
${EMOJI.CROSS} *Canceladas:* ${data.canceledVisits}

${EMOJI.TARGET} *TAXA DE CONCLUSÃO*
${progressBar} *${data.completionRate}%*

${EMOJI.TROPHY} *TOP CLIENTES DO MÊS*
${clientsList}

─────────────────────────
${EMOJI.MOBILE} _Relatório gerado via *Visitas da Emilia*_`
}