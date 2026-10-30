import { createClient } from '@/utils/supabase/server'
import { DailyTimeline, Appointment } from '@/components/feactures/DailyTimeLine'
import { NewAppointmentDrawer } from '@/components/feactures/NewAppointmentDrawer'
import { format } from 'date-fns'


interface HomeProps {
  searchParams: Promise<{ date?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const supabase = await createClient()
  const resolvedParams = await searchParams
  
  // Data selecionada via parâmetro de busca ou data atual
  const selectedDate = resolvedParams.date || format(new Date(), 'yyyy-MM-dd')

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id,
      start_time,
      end_time,
      status,
      clients (
        name,
        address,
        phone
      )
    `)
    .eq('appointment_date', selectedDate)
    .order('start_time', { ascending: true })

  const formattedAppointments = (appointments || []) as unknown as Appointment[]

  return (
    <main className="min-h-screen bg-slate-50 pb-24 relative">
      <header className="bg-white px-4 pt-10 pb-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Visitas da Emilia</h1>
          <p className="text-xs text-slate-500 font-medium">Gestão simplificada de campo</p>
        </div>
      </header>

      <DailyTimeline 
        initialAppointments={formattedAppointments} 
        selectedDate={selectedDate}
      />

      <NewAppointmentDrawer />
    </main>
  )
}