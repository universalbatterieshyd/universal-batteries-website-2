import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('power_backup_config')
    .select('key, value')

  if (error) {
    console.error('Power backup config fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }

  const config: Record<string, unknown> = {}
  for (const row of data || []) {
    config[row.key] = row.value
  }
  return NextResponse.json(config)
}
