'use client'

import { useState } from 'react'
import { MapPin, Phone, Clock, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateAppointmentStatus } from '@/app/actions/appointments'
import { useToast } from '@/hooks/use-toast'
import { format, addDays, subDays, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AppointmentDetailsDrawer } from './AppointmentDetailsDrawer'

export type Client = {
  id: string
  name: string
  address?: string | null
  phone?: string | null
}

export type Appointment = {
  id: string
  appointment_date: string
  start_time: string
  end_time: string
  status: 'scheduled' | 'completed' | 'canceled'
  clients: Client | Client[] | null
}

interface DailyTimelineProps {
  initialAppointments: Appointment[]
  selectedDate: string
  onDateChange: (newDate: string) => void
}

export function DailyTimeline({ initialAppointments, selectedDate, onDateChange }: DailyTimelineProps) {
  const { toast } = useToast()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const currentDate = parseISO(selectedDate)

  function handleNavigate(newDate: Date) {
    const formatted = format(newDate, 'yyyy-MM-dd')
    onDateChange(formatted) // Atualização instantânea em memória
  }

  async function handleStatusChange(id: string, newStatus: 'scheduled' | 'completed' | 'canceled') {
    setLoadingId(id)
    const res = await updateAppointmentStatus(id, newStatus)
    setLoadingId(null)

    if (res.error) {
      toast({ variant: 'destructive', title: 'Erro', description: res.error })
    } else {
      toast({
        title: 'Status Atualizado',
        description: newStatus === 'completed' ? 'Visita marcada como concluída!' : 'Visita reaberta.'
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* NAVEGADOR DE DATA (INSTANTÂNEO 0MS) */}
      <div className="bg-white px-4 py-3 border-b border-slate-100 sticky top-[72px] z-10 shadow-xs flex items-center justify-between">
        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl" onClick={() => handleNavigate(subDays(currentDate, 1))}>
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="text-center">
          <p className="text-sm font-semibold text-slate-900 capitalize">
            {format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => e.target.value && onDateChange(e.target.value)}
            className="text-xs text-blue-600 bg-transparent border-none text-center font-medium focus:outline-none cursor-pointer"
          />
        </div>

        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl" onClick={() => handleNavigate(addDays(currentDate, 1))}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* LISTA DE REGISTROS DE VISITAS */}
      {initialAppointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-16 px-4 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="text-slate-400" size={32} />
          </div>
          <h2 className="text-lg font-medium text-slate-700">Nenhuma visita nesta data</h2>
          <p className="text-slate-500 mt-1 text-sm">
            Toque no botão <strong className="text-blue-600">+</strong> abaixo para agendar um cliente.
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {initialAppointments.map((apt) => {
            const client = Array.isArray(apt.clients) ? apt.clients[0] : apt.clients
            if (!client) return null

            const isCompleted = apt.status === 'completed'
            const isCanceled = apt.status === 'canceled'

            return (
              <div 
                key={apt.id} 
                className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${
                  isCompleted 
                    ? 'border-green-200 bg-green-50/20' 
                    : isCanceled 
                    ? 'border-slate-200 opacity-60' 
                    : 'border-slate-100'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                      {client.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1 text-blue-600 font-semibold bg-blue-50 w-fit px-2.5 py-1 rounded-lg text-xs">
                      <Clock size={13} />
                      <span>{apt.start_time.substring(0, 5)} - {apt.end_time.substring(0, 5)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <AppointmentDetailsDrawer appointment={apt} selectedDate={selectedDate} />
                    
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      isCompleted 
                        ? 'bg-green-100 text-green-700' 
                        : isCanceled 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {isCompleted ? 'Concluída' : isCanceled ? 'Cancelada' : 'Agendada'}
                    </span>
                  </div>
                </div>

                {client.address && (
                  <div className="flex items-start gap-2 text-slate-600 text-sm mt-3">
                    <MapPin size={16} className="shrink-0 mt-0.5 text-slate-400" />
                    <span>{client.address}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-100">
                  {client.address && (
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="flex-1 rounded-xl bg-slate-100 text-xs font-medium" 
                      onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(client.address!)}`, '_blank')}
                    >
                      <MapPin size={14} className="mr-1.5" />
                      Navegar
                    </Button>
                  )}
                  
                  {client.phone && (
                    <Button 
                      size="sm"
                      className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-medium" 
                      onClick={() => {
                        const text = encodeURIComponent(`Olá ${client.name}, confirmando nossa visita agendada.`)
                        window.open(`https://wa.me/${client.phone}?text=${text}`, '_blank')
                      }}
                    >
                      <Phone size={14} className="mr-1.5" />
                      WhatsApp
                    </Button>
                  )}

                  {!isCanceled && (
                    <Button
                      variant={isCompleted ? "outline" : "default"}
                      size="sm"
                      disabled={loadingId === apt.id}
                      className={`rounded-xl text-xs font-medium ${
                        isCompleted ? 'border-slate-300 text-slate-600' : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                      onClick={() => handleStatusChange(apt.id, isCompleted ? 'scheduled' : 'completed')}
                    >
                      <CheckCircle2 size={14} className="mr-1.5" />
                      {isCompleted ? 'Reabrir' : 'Concluir'}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}