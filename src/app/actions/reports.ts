'use server'

import { createClient } from '@/utils/supabase/server'

export type MonthlyReportMetrics = {
  totalVisits: number
  completedVisits: number
  canceledVisits: number
  scheduledVisits: number
  completionRate: number
  topClients: { name: string; count: number }[]
  period: string
}

export async function getMonthlyReportData(yearMonth: string): Promise<{ data?: MonthlyReportMetrics; error?: string }> {
  const supabase = await createClient()

  const startDate = `${yearMonth}-01`
  const [yearStr, monthStr] = yearMonth.split('-')
  const lastDay = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10), 0).getDate()
  const endDate = `${yearMonth}-${String(lastDay).padStart(2, '0')}`

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      status,
      clients (
        name
      )
    `)
    .gte('appointment_date', startDate)
    .lte('appointment_date', endDate)

  if (error) {
    return { error: 'Erro ao carregar dados do relatório.' }
  }

  const totalVisits = appointments.length
  let completedVisits = 0
  let canceledVisits = 0
  let scheduledVisits = 0

  const clientCountMap: Record<string, number> = {}

  appointments.forEach((apt) => {
    if (apt.status === 'completed') completedVisits++
    else if (apt.status === 'canceled') canceledVisits++
    else scheduledVisits++

    const client = Array.isArray(apt.clients) ? apt.clients[0] : apt.clients
    if (client?.name) {
      clientCountMap[client.name] = (clientCountMap[client.name] || 0) + 1
    }
  })

  const completionRate = totalVisits > 0 ? Math.round((completedVisits / totalVisits) * 100) : 0

  const topClients = Object.entries(clientCountMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    data: {
      totalVisits,
      completedVisits,
      canceledVisits,
      scheduledVisits,
      completionRate,
      topClients,
      period: yearMonth,
    },
  }
}