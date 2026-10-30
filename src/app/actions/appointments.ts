'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAppointment(formData: FormData) {
  const supabase = await createClient()
  
  const rawClientName = formData.get('client_name') as string
  const appointmentDate = formData.get('appointment_date') as string
  const startTime = formData.get('start_time') as string
  const address = formData.get('address') as string
  const phone = formData.get('phone') as string

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
    if (address || phone) {
      await supabase
        .from('clients')
        .update({ address, phone })
        .eq('id', clientId)
    }
  } else {
    const { data: newClient, error: clientInsertError } = await supabase
      .from('clients')
      .insert([{ name: clientName, address, phone }])
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

  const { data: insertedAppointment, error: insertError } = await supabase
    .from('appointments')
    .insert([{ 
      client_id: clientId, 
      appointment_date: appointmentDate, 
      start_time: startTime, 
      end_time: endTime 
    }])
    .select('id')
    .single()

  if (insertError || !insertedAppointment) {
    return { error: 'Erro ao salvar o agendamento no banco de dados.' }
  }

  revalidatePath('/')
  
  return { 
    success: true,
    data: {
      id: insertedAppointment.id,
      clientName,
      clientPhone: phone,
      appointmentDate,
      startTime,
      endTime
    }
  }
}

export async function updateAppointment(appointmentId: string, clientId: string, formData: FormData) {
  const supabase = await createClient()

  const clientName = (formData.get('client_name') as string).trim().toUpperCase()
  const appointmentDate = formData.get('appointment_date') as string
  const startTime = formData.get('start_time') as string
  const address = formData.get('address') as string
  const phone = formData.get('phone') as string
  const status = formData.get('status') as string

  // 1. Atualiza dados do cliente
  await supabase
    .from('clients')
    .update({ name: clientName, address, phone })
    .eq('id', clientId)

  // 2. Calcula horário fim
  const [hours, minutes] = startTime.split(':').map(Number)
  const endTime = `${String((hours + 1) % 24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

  // 3. Checa colisão ignorando a própria visita
  const { data: conflicting } = await supabase
    .from('appointments')
    .select('id')
    .eq('appointment_date', appointmentDate)
    .neq('id', appointmentId)
    .lt('start_time', endTime)
    .gt('end_time', startTime)

  if (conflicting && conflicting.length > 0) {
    return { error: 'Horário em conflito com outra visita agendada.' }
  }

  // 4. Atualiza a visita
  const { error } = await supabase
    .from('appointments')
    .update({
      appointment_date: appointmentDate,
      start_time: startTime,
      end_time: endTime,
      status
    })
    .eq('id', appointmentId)

  if (error) {
    return { error: 'Erro ao atualizar dados da visita.' }
  }

  revalidatePath('/')
  return { success: true }
}

export async function deleteAppointment(appointmentId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', appointmentId)

  if (error) {
    return { error: 'Erro ao excluir visita.' }
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

export async function getMonthlyAppointments(yearMonth: string) {
  const supabase = await createClient()
  const startDate = `${yearMonth}-01`
  
  const [yearStr, monthStr] = yearMonth.split('-')
  const lastDay = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10), 0).getDate()
  const endDate = `${yearMonth}-${String(lastDay).padStart(2, '0')}`

  const { data, error } = await supabase
    .from('appointments')
    .select('appointment_date, status')
    .gte('appointment_date', startDate)
    .lte('appointment_date', endDate)

  if (error) return []
  return data
}