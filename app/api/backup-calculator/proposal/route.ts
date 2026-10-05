import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendLeadToGoogleSheets } from '@/lib/google-sheets-leads'
import { VERIFIED_COOKIE, normalizeIndianMobile, readVerifiedToken } from '@/lib/backup-calculator/otp'
import {
  BACKUP_HOUR_OPTIONS,
  DEFAULT_APPLIANCES,
  recommendBackupPlan,
  type ApplianceDef,
  type ApplianceSelection,
  type UseCase,
} from '@/lib/backup-calculator/sizing'

const USE_CASES: UseCase[] = ['home', 'shop', 'office', 'clinic']

async function loadCatalog(): Promise<ApplianceDef[]> {
  const { data, error } = await supabase
    .from('appliance')
    .select('key, name, watts, emoji')
    .order('order', { ascending: true })
  if (error || !data?.length) return DEFAULT_APPLIANCES
  return data.map((a) => ({ key: a.key, name: a.name, watts: Number(a.watts), emoji: a.emoji || '🔌' }))
}

export async function POST(request: NextRequest) {
  const verified = readVerifiedToken(request.cookies.get(VERIFIED_COOKIE)?.value)
  if (!verified) {
    return NextResponse.json({ error: 'Please verify your mobile number first' }, { status: 401 })
  }

  try {
    const body = await request.json()
    if (body.phone && normalizeIndianMobile(body.phone) !== verified.phone) {
      return NextResponse.json({ error: 'Please verify this mobile number' }, { status: 401 })
    }
    const useCase: UseCase = USE_CASES.includes(body.useCase) ? body.useCase : 'home'
    const backupHours = (BACKUP_HOUR_OPTIONS as readonly number[]).includes(Number(body.backupHours))
      ? Number(body.backupHours)
      : 2
    const selections: ApplianceSelection[] = (Array.isArray(body.selections) ? body.selections : [])
      .map((s: { key?: unknown; count?: unknown }) => ({
        key: String(s.key ?? ''),
        count: Math.min(50, Math.max(0, Math.floor(Number(s.count) || 0))),
      }))
      .filter((s: ApplianceSelection) => s.key && s.count > 0)

    if (!selections.length) {
      return NextResponse.json({ error: 'Add at least one appliance' }, { status: 400 })
    }

    const plan = recommendBackupPlan({ useCase, backupHours, selections, catalog: await loadCatalog() })
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : ''

    const payload = {
      name: name || undefined,
      phoneVerified: true,
      orgType: useCase,
      totalWatts: plan.connectedWatts,
      runningWatts: plan.runningWatts,
      backupHours,
      upsType: plan.systemType,
      recommendedVa: plan.inverterVa,
      batteryAh: plan.batteryAh,
      totalBatteries: plan.totalBatteries,
      bankVoltage: plan.bankVoltage,
      needsSurvey: plan.needsSurvey,
      appliances: plan.lines.map((l) => ({ key: l.key, count: l.count })),
    }

    const { error } = await supabase.from('leads').insert({
      phone: verified.phone,
      type: 'ups_proposal',
      source: 'backup_calculator',
      payload,
      score: Math.min(100, 60 + (plan.inverterVa >= 5000 ? 20 : plan.inverterVa >= 2000 ? 10 : 0)),
    })
    if (error) console.error('Backup calculator lead insert error:', error)

    await sendLeadToGoogleSheets({
      source: 'power_backup_wizard',
      name: name || undefined,
      phone: verified.phone,
      totalWatts: plan.connectedWatts,
      backupHours,
      upsType: plan.systemType,
      extra: JSON.stringify(payload),
    })

    return NextResponse.json({ plan })
  } catch (err) {
    console.error('Backup calculator proposal error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
