'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { List, Calendar as CalendarIcon } from 'lucide-react'
import { DailyTimeline, Appointment } from '@/components/feactures/DailyTimeLine'
import { MonthCalendarView } from './MonthCalendarView'

interface AppointmentSummary {
  appointment_date: string
  status: string
}

interface AppointmentsViewProps {
  initialAppointments: Appointment[]
  monthlyAppointments: AppointmentSummary[]
  selectedDate: string
}

export function AppointmentsView({ 
  initialAppointments, 
  monthlyAppointments, 
  selectedDate 
}: AppointmentsViewProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline')

  function handleSelectDate(dateStr: string) {
    router.push(`/?date=${dateStr}`)
  }

  return (
    <div className="space-y-4">
      {/* SEGMENTED CONTROL (ALTERNA VISUALIZAÇÃO) */}
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
            Lista / Dia
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
            Calendário / Mês
          </button>
        </div>
      </div>

      {/* RENDERIZAÇÃO CONDICIONAL */}
      {viewMode === 'calendar' ? (
        <div className="px-4 space-y-4">
          <MonthCalendarView 
            selectedDate={selectedDate}
            monthlyAppointments={monthlyAppointments}
            onSelectDate={handleSelectDate}
          />

          <div className="pt-2">
            <h3 className="text-sm font-bold text-slate-700 px-1 mb-3">
              Visitas do dia selecionado
            </h3>
            <DailyTimeline 
              initialAppointments={initialAppointments} 
              selectedDate={selectedDate} 
            />
          </div>
        </div>
      ) : (
        <DailyTimeline 
          initialAppointments={initialAppointments} 
          selectedDate={selectedDate} 
        />
      )}
    </div>
  )
}