'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday, 
  parseISO 
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AppointmentSummary {
  appointment_date: string
  status: string
}

interface MonthCalendarViewProps {
  selectedDate: string
  monthlyAppointments: AppointmentSummary[]
  onSelectDate: (date: string) => void
}

export function MonthCalendarView({ selectedDate, monthlyAppointments, onSelectDate }: MonthCalendarViewProps) {
  const router = useRouter()
  const [currentMonth, setCurrentMonth] = useState(() => parseISO(selectedDate))

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days = eachDayOfInterval({ start: startDate, end: endDate })
  const selected = parseISO(selectedDate)

  // Conjunto de datas que possuem pelo menos uma visita
  const datesWithVisits = new Set(monthlyAppointments.map(a => a.appointment_date))

  function handleMonthChange(newMonth: Date) {
    setCurrentMonth(newMonth)
    // Atualiza a URL para o primeiro dia do novo mês
    const newDateStr = format(newMonth, 'yyyy-MM-01')
    router.push(`/?date=${newDateStr}`)
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-4">
      {/* Cabeçalho do Mês */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 capitalize flex items-center gap-2">
          <CalendarIcon size={18} className="text-blue-600" />
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>

        <div className="flex gap-1">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-9 w-9 rounded-xl"
            onClick={() => handleMonthChange(subMonths(currentMonth, 1))}
          >
            <ChevronLeft size={18} />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-9 w-9 rounded-xl"
            onClick={() => handleMonthChange(addMonths(currentMonth, 1))}
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      {/* Dias da Semana */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 uppercase">
        <span>Dom</span>
        <span>Seg</span>
        <span>Ter</span>
        <span>Qua</span>
        <span>Qui</span>
        <span>Sex</span>
        <span>Sáb</span>
      </div>

      {/* Grade de Dias do Mês */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const isSelected = isSameDay(day, selected)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const hasVisit = datesWithVisits.has(dateStr)

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`h-11 rounded-xl flex flex-col items-center justify-center relative transition-all ${
                !isCurrentMonth ? 'text-slate-300' : 'text-slate-800 font-medium'
              } ${
                isSelected 
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30' 
                  : isToday(day) 
                  ? 'border border-blue-600 text-blue-600 font-semibold' 
                  : 'hover:bg-slate-100'
              }`}
            >
              <span>{format(day, 'd')}</span>
              
              {/* Ponto Indicador de Visita */}
              {hasVisit && (
                <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                  isSelected ? 'bg-white' : 'bg-blue-600'
                }`} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}