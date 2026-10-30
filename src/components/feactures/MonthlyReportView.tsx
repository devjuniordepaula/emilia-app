'use client'

import { useState, useEffect } from 'react'
import { getMonthlyReportData, MonthlyReportMetrics } from '@/app/actions/reports'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, Clock, TrendingUp, Download, Share2, Calendar, Loader2 } from 'lucide-react'
import { buildWhatsAppReportText } from '@/lib/whatsapp'

interface MonthlyReportViewProps {
  initialDate: string
}

export function MonthlyReportView({ initialDate }: MonthlyReportViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => initialDate.substring(0, 7))
  const [metrics, setMetrics] = useState<MonthlyReportMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const res = await getMonthlyReportData(selectedMonth)
      if (res.data) {
        setMetrics(res.data)
      }
      setLoading(false)
    }
    loadData()
  }, [selectedMonth])

  function exportCSV() {
    if (!metrics) return

    const csvContent = [
      ['Métrica', 'Valor'],
      ['Período', metrics.period],
      ['Total de Visitas Agendadas', metrics.totalVisits.toString()],
      ['Visitas Concluídas', metrics.completedVisits.toString()],
      ['Visitas Canceladas', metrics.canceledVisits.toString()],
      ['Taxa de Conclusão (%)', `${metrics.completionRate}%`],
      [''],
      ['Top Clientes', 'Visitas'],
      ...metrics.topClients.map((c) => [c.name, c.count.toString()]),
    ]
      .map((e) => e.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `relatorio_visitas_${selectedMonth}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function shareWhatsAppSummary() {
    if (!metrics) return

    const mainPhone = process.env.NEXT_PUBLIC_REPORTS_WHATSAPP || '5585996582422'

    const messageText = buildWhatsAppReportText({
      period: selectedMonth,
      totalVisits: metrics.totalVisits,
      completedVisits: metrics.completedVisits,
      scheduledVisits: metrics.scheduledVisits,
      canceledVisits: metrics.canceledVisits,
      completionRate: metrics.completionRate,
      topClients: metrics.topClients,
    })

    // API oficial para deep link universal no iOS/Android
    const targetUrl = `https://api.whatsapp.com/send?phone=${mainPhone}&text=${encodeURIComponent(messageText)}`
    window.open(targetUrl, '_blank')
  }

  return (
    <div className="p-4 space-y-4 pb-20">
      {/* SELETOR DE MÊS */}
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-blue-600" />
          <span className="text-sm font-bold text-slate-900">Período de Análise</span>
        </div>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => e.target.value && setSelectedMonth(e.target.value)}
          className="text-xs font-semibold text-blue-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none cursor-pointer"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-xs font-medium">Calculando métricas do mês...</p>
        </div>
      ) : metrics ? (
        <>
          {/* GRID DE KPIS */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-slate-100 shadow-xs">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-xs text-slate-500 font-medium">Total de Visitas</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 flex justify-between items-end">
                <span className="text-2xl font-black text-slate-900">{metrics.totalVisits}</span>
                <Clock size={18} className="text-slate-400 mb-1" />
              </CardContent>
            </Card>

            <Card className="border-green-100 bg-green-50/30 shadow-xs">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-xs text-green-700 font-medium">Concluídas</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 flex justify-between items-end">
                <span className="text-2xl font-black text-green-700">{metrics.completedVisits}</span>
                <CheckCircle2 size={18} className="text-green-600 mb-1" />
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-xs">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-xs text-slate-500 font-medium">Canceladas</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 flex justify-between items-end">
                <span className="text-2xl font-black text-slate-700">{metrics.canceledVisits}</span>
                <XCircle size={18} className="text-slate-400 mb-1" />
              </CardContent>
            </Card>

            <Card className="border-blue-100 bg-blue-50/30 shadow-xs">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-xs text-blue-700 font-medium">Taxa de Sucesso</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 flex justify-between items-end">
                <span className="text-2xl font-black text-blue-700">{metrics.completionRate}%</span>
                <TrendingUp size={18} className="text-blue-600 mb-1" />
              </CardContent>
            </Card>
          </div>

          {/* RANKING DE CLIENTES */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Clientes no Mês</h3>

            {metrics.topClients.length === 0 ? (
              <p className="text-xs text-slate-400 py-2 text-center">Nenhum atendimento registrado neste mês.</p>
            ) : (
              <div className="space-y-2.5">
                {metrics.topClients.map((client, index) => {
                  const percentage = metrics.totalVisits > 0 ? (client.count / metrics.totalVisits) * 100 : 0
                  return (
                    <div key={client.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-800 uppercase">
                          {index + 1}. {client.name}
                        </span>
                        <span className="text-blue-600 font-bold">{client.count} visita(s)</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* BOTÕES DE EXPORTAÇÃO */}
          <div className="space-y-2 pt-2">
            <Button
              className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium"
              onClick={shareWhatsAppSummary}
            >
              <Share2 size={16} className="mr-2" />
              Compartilhar Resumo no WhatsApp
            </Button>

            <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 text-slate-700 font-medium" onClick={exportCSV}>
              <Download size={16} className="mr-2" />
              Exportar Relatório (CSV)
            </Button>
          </div>
        </>
      ) : null}
    </div>
  )
}