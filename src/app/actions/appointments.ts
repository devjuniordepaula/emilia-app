'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAppointment(formData: FormData) {
  const supabase = await createClient()
  
  const rawClientName = formData.get('client_name') as string
  const appointmentDate = formData.get('appointment_date') as string
  const startTime = formData.get('start_time') as string

  if (!rawClientName || !rawClientName.trim()) {
    return { error: 'Por favor, informe o nome do cliente.' }
  }

  const clientName = rawClientName.trim().toUpperCase()

  let clientId: string

  const { data: existingClient, error: clientSelectError } = await supabase
    .from('clients')
    .select('id')
    .eq('name', clientName)
    .maybeSingle()

  if (clientSelectError) {
    return { error: 'Erro ao verificar cadastro do cliente.' }
  }

  if (existingClient) {
    clientId = existingClient.id
  } else {
    const { data: newClient, error: clientInsertError } = await supabase
      .from('clients')
      .insert([{ name: clientName }])
      .select('id')
      .single()

    if (clientInsertError || !newClient) {
      return { error: 'Erro ao cadastrar novo cliente.' }
    }

    clientId = newClient.id
  }

  const [hours, minutes] = startTime.split(':').map(Number)
  const endTime = `${String((hours + 1) % 24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

  const { data: conflictingAppointments, error: queryError } = await supabase
    .from('appointments')
    .select('id')
    .eq('appointment_date', appointmentDate)
    .lt('start_time', endTime)
    .gt('end_time', startTime)

  if (queryError) {
    return { error: 'Erro ao consultar disponibilidades na agenda.' }
  }

  if (conflictingAppointments && conflictingAppointments.length > 0) {
    return { error: 'Já existe uma visita agendada para este horário.' }
  }

  const { error: insertError } = await supabase
    .from('appointments')
    .insert([{ 
      client_id: clientId, 
      appointment_date: appointmentDate, 
      start_time: startTime, 
      end_time: endTime 
    }])

  if (insertError) {
    return { error: 'Erro ao salvar o agendamento no banco de dados.' }
  }

  revalidatePath('/')
  return { success: true }
}

export async function updateAppointmentStatus(
  id: string, 
  status: 'scheduled' | 'completed' | 'canceled'
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)

  if (error) {
    return { error: 'Erro ao atualizar o status da visita.' }
  }

  revalidatePath('/')
  return { success: true }
}