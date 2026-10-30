'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { NewAppointmentForm } from './NewAppointmentForm'

export function NewAppointmentDrawer() {
  const [open, setOpen] = useState(false)

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 z-50 flex items-center justify-center transition-transform active:scale-95">
        <Plus className="h-7 w-7" />
        <span className="sr-only">Nova Visita</span>
      </DrawerTrigger>

      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-xl font-bold text-slate-900">Agendar Nova Visita</DrawerTitle>
            <DrawerDescription className="text-slate-500">
              Digite o nome do cliente e defina o horário.
            </DrawerDescription>
          </DrawerHeader>

          <NewAppointmentForm onSuccess={() => setOpen(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}