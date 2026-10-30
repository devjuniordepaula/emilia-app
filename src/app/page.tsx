import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { AppointmentsView } from '@/components/feactures/AppointmentsView'
import { Appointment } from '@/components/feactures/DailyTimeLine'
import { NewAppointmentDrawer } from '@/components/feactures/NewAppointmentDrawer'
import { getMonthlyAppointments } from '@/app/actions/appointments'
import { format } from 'date-fns'


interface HomeProps {
  searchParams: Promise<{ date?: string }>
}

async function AppointmentsContainer({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const supabase = await createClient()
  const resolvedParams = await searchParams
  
  const selectedDate = resolvedParams.date || format(new Date(), 'yyyy-MM-dd')
  const yearMonth = selectedDate.substring(0, 7) // "YYYY-MM"

  // Executa as duas consultas em paralelo para máxima performance
  const [appointmentsRes, monthlyAppointments] = await Promise.all([
    supabase
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
      .order('start_time', { ascending: true }),
    getMonthlyAppointments(yearMonth)
  ])

  const formattedAppointments = (appointmentsRes.data || []) as unknown as Appointment[]

  return (
    <AppointmentsView 
      initialAppointments={formattedAppointments}
      monthlyAppointments={monthlyAppointments}
      selectedDate={selectedDate}
    />
  )
}

function TimelineSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      <div className="h-10 bg-slate-200 rounded-xl w-full" />
      <div className="h-32 bg-slate-200 rounded-2xl w-full" />
      <div className="h-32 bg-slate-200 rounded-2xl w-full" />
    </div>
  )
}

export default function Home({ searchParams }: HomeProps) {
  return (
    <main className="min-h-screen bg-slate-50 pb-24 relative">
      <header className="bg-white px-4 pt-10 pb-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Visitas da Emilia</h1>
          <p className="text-xs text-slate-500 font-medium">Gestão simplificada de campo</p>
        </div>
      </header>

      <Suspense fallback={<TimelineSkeleton />}>
        <AppointmentsContainer searchParams={searchParams} />
      </Suspense>

      <NewAppointmentDrawer />
    </main>
  )
}