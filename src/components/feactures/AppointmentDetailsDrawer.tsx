'use client'

import { useState } from 'react'
import { Eye, Pencil, Trash2, MapPin, Phone, Clock, X, Check } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateAppointment, deleteAppointment } from '@/app/actions/appointments'
import { useToast } from '@/hooks/use-toast'
import { Appointment } from '@/components/feactures/DailyTimeLine'

interface AppointmentDetailsDrawerProps {
  appointment: Appointment
  selectedDate: string
}

export function AppointmentDetailsDrawer({ appointment, selectedDate }: AppointmentDetailsDrawerProps) {
  const [open, setOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const client = Array.isArray(appointment.clients) ? appointment.clients[0] : appointment.clients
  if (!client) return null

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const res = await updateAppointment(appointment.id, client.id, formData)

    setIsLoading(false)

    if (res.error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar', description: res.error })
    } else {
      toast({ title: 'Sucesso', description: 'Visita atualizada com sucesso!' })
      setIsEditing(false)
      setOpen(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja excluir esta visita?')) return

    setIsDeleting(true)
    const res = await deleteAppointment(appointment.id)
    setIsDeleting(false)

    if (res.error) {
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: res.error })
    } else {
      toast({ title: 'Excluída', description: 'Registro de visita removido.' })
      setOpen(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={(val) => { setOpen(val); setIsEditing(false); }}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100">
          <Eye size={18} />
          <span className="sr-only">Ver Registro</span>
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-sm px-4 pb-8">
          <DrawerHeader className="px-0 flex justify-between items-center">
            <DrawerTitle className="text-xl font-bold text-slate-900">
              {isEditing ? 'Editar Visita' : 'Detalhes do Registro'}
            </DrawerTitle>
            
            {!isEditing && (
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl text-slate-700" onClick={() => setIsEditing(true)}>
                  <Pencil size={16} />
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl text-red-600 hover:bg-red-50 border-red-200" onClick={handleDelete} disabled={isDeleting}>
                  <Trash2 size={16} />
                </Button>
              </div>
            )}
          </DrawerHeader>

          {isEditing ? (
            /* MODAL DE EDIÇÃO */
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="client_name">Nome do Cliente</Label>
                <Input id="client_name" name="client_name" defaultValue={client.name} required className="h-11 uppercase" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="appointment_date">Data</Label>
                  <Input id="appointment_date" type="date" name="appointment_date" defaultValue={selectedDate} required className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="start_time">Horário</Label>
                  <Input id="start_time" type="time" name="start_time" defaultValue={appointment.start_time.substring(0, 5)} required className="h-11" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address">Endereço</Label>
                <Input id="address" name="address" defaultValue={client.address || ''} placeholder="Rua, número, bairro" className="h-11" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input id="phone" name="phone" defaultValue={client.phone || ''} placeholder="85999999999" className="h-11" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={appointment.status}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Agendada</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="canceled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-3">
                <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                  {isLoading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          ) : (
            /* VISUALIZAÇÃO DOS DETALHES */
            <div className="space-y-4 pt-2">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cliente</span>
                  <h3 className="text-lg font-bold text-slate-900 uppercase">{client.name}</h3>
                </div>

                <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                  <Clock size={16} />
                  <span>Horário: {appointment.start_time.substring(0, 5)} - {appointment.end_time.substring(0, 5)}</span>
                </div>

                {client.address && (
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin size={16} className="shrink-0 mt-0.5 text-slate-400" />
                    <span>{client.address}</span>
                  </div>
                )}

                {client.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone size={16} className="shrink-0 text-slate-400" />
                    <span>{client.phone}</span>
                  </div>
                )}
              </div>

              {/* Botões de Ação Direta */}
              <div className="space-y-2 pt-2">
                {client.address && (
                  <Button className="w-full h-12 rounded-xl bg-slate-900 text-white" onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(client.address!)}`, '_blank')}>
                    <MapPin size={16} className="mr-2" />
                    Abrir no GPS (Maps)
                  </Button>
                )}

                {client.phone && (
                  <Button className="w-full h-12 rounded-xl bg-green-600 text-white hover:bg-green-700" onClick={() => window.open(`https://wa.me/${client.phone}?text=${encodeURIComponent(`Olá ${client.name}, sobre nossa visita...`)}`, '_blank')}>
                    <Phone size={16} className="mr-2" />
                    Chamar no WhatsApp
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}