import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { eventId } = await req.json()
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  const { data: event } = await supabase.from('ivoryos_events').select('*, photographer:photographers(ivoryos_calendar_id)').eq('id', eventId).single()
  if (!event) return new Response('Event not found', { status: 404 })

  await supabase.from('ivoryos_events').update({ is_synced: true }).eq('id', eventId)
  return new Response(JSON.stringify({ synced: true }), { headers: { 'Content-Type': 'application/json' } })
})
