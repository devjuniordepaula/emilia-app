'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { List, Calendar as CalendarIcon, BarChart3 } from 'lucide-react'
import { DailyTimeline, Appointment } from '@/components/feactures/DailyTimeLine'
import { MonthCalendarView } from './MonthCalendarView'
import { MonthlyReportView } from './MonthlyReportView'

interface AppointmentsViewProps {
  monthAppointments: Appointment[]
  initialSelectedDate: string
}

export function AppointmentsView({ 
  monthAppointments, 
  initialSelectedDate 
}: AppointmentsViewProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar' | 'reports'>('timeline')
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate)

  // Função instantânea de troca de data (0ms delay)
  function handleSelectDate(newDateStr: string) {
    const currentMonthStr = selectedDate.substring(0, 7)
    const newMonthStr = newDateStr.substring(0, 7)

    // Atualiza estado local imediatamente
    setSelectedDate(newDateStr)

    // Sincroniza a URL sem causar re-render do servidor se for o mesmo mês
    if (currentMonthStr === newMonthStr) {
      window.history.replaceState(null, '', `/?date=${newDateStr}`)
    } else {
      // Se mudou de mês, busca os dados do novo mês no servidor
      router.push(`/?date=${newDateStr}`)
    }
  }

  // Filtra as visitas do dia selecionado direto da memória
  const dailyAppointments = monthAppointments.filter(
    (apt) => apt.appointment_date === selectedDate
  )

  // Resumo para as "bolinhas" do calendário
  const monthlySummary = monthAppointments.map((apt) => ({
    appointment_date: apt.appointment_date,
    status: apt.status,
  }))

  return (
    <div className="space-y-4">
      {/* NAVEGAÇÃO ENTRE ABAS */}
      <div className="px-4 pt-2">
        <div className="bg-slate-200/70 p-1 rounded-xl flex gap-1">
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              viewMode === 'timeline'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List size={15} />
            Dia
          </button>

          <button
            onClick={() => setViewMode('calendar')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              viewMode === 'calendar'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon size={15} />
            Mês
          </button>

          <button
            onClick={() => setViewMode('reports')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              viewMode === 'reports'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 size={15} />
            Relatórios
          </button>
        </div>
      </div>

      {/* CONTEÚDO DINÂMICO DA ABA */}
      {viewMode === 'reports' ? (
        <MonthlyReportView initialDate={selectedDate} />
      ) : viewMode === 'calendar' ? (
        <div className="px-4 space-y-4">
          <MonthCalendarView 
            selectedDate={selectedDate}
            monthlyAppointments={monthlySummary}
            onSelectDate={handleSelectDate}
          />

          <div className="pt-2">
            <h3 className="text-sm font-bold text-slate-700 px-1 mb-3">
              Visitas do dia selecionado
            </h3>
            <DailyTimeline 
              initialAppointments={dailyAppointments} 
              selectedDate={selectedDate}
              onDateChange={handleSelectDate}
            />
          </div>
        </div>
      ) : (
        <DailyTimeline 
          initialAppointments={dailyAppointments} 
          selectedDate={selectedDate}
          onDateChange={handleSelectDate}
        />
      )}
    </div>
  )
}