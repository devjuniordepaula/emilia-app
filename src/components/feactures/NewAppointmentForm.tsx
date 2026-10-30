'use client'

import { useState } from 'react'
import { createAppointment } from '@/app/actions/appointments'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Phone, Clock, Plus } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CreatedAppointment {
  id: string
  clientName: string
  clientPhone: string | null
  appointmentDate: string
  startTime: string
  endTime: string
}

interface NewAppointmentFormProps {
  onSuccess?: () => void
}

export function NewAppointmentForm({ onSuccess }: NewAppointmentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [clientName, setClientName] = useState('')
  const [createdAppointment, setCreatedAppointment] = useState<CreatedAppointment | null>(null)
  const { toast } = useToast()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const response = await createAppointment(formData)

    setIsLoading(false)

    if (response.error) {
      toast({
        variant: "destructive",
        title: "Atenção",
        description: response.error,
      })
    } else if (response.data) {
      setCreatedAppointment(response.data)
      toast({
        title: "Sucesso!",
        description: "Visita agendada com sucesso.",
      })
    }
  }

  // TELA DE CONFIRMAÇÃO (ETAPA 2)
  if (createdAppointment) {
    return (
      <div className="space-y-5 px-4 pb-8 text-center">
        <div className="flex flex-col items-center justify-center pt-2">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 text-green-600">
            <CheckCircle2 size={36} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Visita Agendada!</h3>
          <p className="text-sm text-slate-500">O agendamento foi salvo na agenda da Emilia.</p>
        </div>

        {/* Card do Resumo */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Resumo do Agendamento</p>
          <p className="text-lg font-bold text-slate-900 uppercase">{createdAppointment.clientName}</p>
          <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
            <Clock size={16} className="text-blue-600 shrink-0" />
            <span>
              {format(parseISO(createdAppointment.appointmentDate), "EEEE, dd/MM/yyyy", { locale: ptBR })} às {createdAppointment.startTime.substring(0, 5)}
            </span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-3 pt-2">
          {createdAppointment.clientPhone && (
            <Button 
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl text-base font-medium"
              onClick={() => {
                const msg = encodeURIComponent(`Olá ${createdAppointment.clientName}, sua visita foi agendada para ${format(parseISO(createdAppointment.appointmentDate), 'dd/MM/yyyy')} às ${createdAppointment.startTime.substring(0, 5)}!`)
                window.open(`https://wa.me/${createdAppointment.clientPhone}?text=${msg}`, '_blank')
              }}
            >
              <Phone size={18} className="mr-2" />
              Enviar Confirmação no WhatsApp
            </Button>
          )}

          <Button 
            variant="outline"
            className="w-full h-12 rounded-xl text-base font-medium border-slate-300"
            onClick={() => {
              setCreatedAppointment(null)
              setClientName('')
            }}
          >
            <Plus size={18} className="mr-2" />
            Agendar Outra Visita
          </Button>

          <Button 
            variant="ghost"
            className="w-full text-slate-500 text-sm"
            onClick={() => {
              setCreatedAppointment(null)
              setClientName('')
              if (onSuccess) onSuccess()
            }}
          >
            Concluir e Voltar para Agenda
          </Button>
        </div>
      </div>
    )
  }

  // FORMULÁRIO PRINCIPAL (ETAPA 1)
  return (
    <form onSubmit={onSubmit} className="space-y-5 px-4 pb-8">
      <div className="space-y-2">
        <Label htmlFor="client_name">Nome do Cliente</Label>
        <Input
          id="client_name"
          name="client_name"
          type="text"
          required
          placeholder="EX: MARIA DA SILVA"
          value={clientName}
          onChange={(e) => setClientName(e.target.value.toUpperCase())}
          className="h-12 text-base uppercase"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="appointment_date">Data</Label>
          <Input 
            id="appointment_date"
            type="date" 
            name="appointment_date" 
            required 
            defaultValue={new Date().toISOString().split('T')[0]}
            className="h-12 text-base block w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="start_time">Horário</Label>
          <Input 
            id="start_time"
            type="time" 
            name="start_time" 
            required 
            defaultValue="09:00"
            className="h-12 text-base block w-full"
          />
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full h-14 text-lg mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
      >
        {isLoading ? 'Agendando...' : 'Confirmar Agendamento'}
      </Button>
    </form>
  )
}