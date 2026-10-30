'use client'

import { useState } from 'react'
import { createAppointment } from '@/app/actions/appointments'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface NewAppointmentFormProps {
  onSuccess?: () => void
}

export function NewAppointmentForm({ onSuccess }: NewAppointmentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [clientName, setClientName] = useState('')
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
    } else {
      toast({
        title: "Sucesso!",
        description: "Visita agendada com sucesso.",
      })
      setClientName('') // Reseta o input após cadastrar
      if (onSuccess) {
        onSuccess()
      }
    }
  }

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