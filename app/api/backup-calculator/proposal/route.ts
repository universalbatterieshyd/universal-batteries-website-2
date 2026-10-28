import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendBackupCalculatorToGoogleSheets } from '@/lib/google-sheets-leads'
import { VERIFIED_COOKIE, normalizeIndianMobile, readVerifiedToken } from '@/lib/backup-calculator/otp'
import {
  BACKUP_HOUR_OPTIONS,
  DEFAULT_APPLIANCES,
  isCustomApplianceKey,
  recommendBackupPlan,
  type ApplianceDef,
  type ApplianceSelection,
  type UseCase,
} from '@/lib/backup-calculator/sizing'

const USE_CASES: UseCase[] = ['home', 'shop', 'office', 'clinic']

async function loadCatalog(): Promise<ApplianceDef[]> {
  const { data, error } = await supabase
    .from('appliance')
    .select('key, name, watts, emoji, icon_url')
    .order('order', { ascending: true })
  if (error || !data?.length) return DEFAULT_APPLIANCES
  return data.map((a) => ({
    key: a.key,
    name: a.name,
    watts: Number(a.watts),
    emoji: a.emoji || '🔌',
    iconUrl: a.icon_url || null,
  }))
}

function parseSelections(raw: unknown): ApplianceSelection[] {
  if (!Array.isArray(raw)) return []
  const out: ApplianceSelection[] = []
  for (const item of raw) {
    const s = item as { key?: unknown; count?: unknown; name?: unknown; watts?: unknown }
    const key = String(s.key ?? '')
    const count = Math.min(50, Math.max(0, Math.floor(Number(s.count) || 0)))
    if (!key || !count) continue
    if (isCustomApplianceKey(key)) {
      const watts = Math.min(5000, Math.max(1, Math.floor(Number(s.watts) || 0)))
      if (!watts) continue
      out.push({
        key,
        count,
        name: String(s.name || 'Custom').trim().slice(0, 40),
        watts,
      })
    } else {
      out.push({ key, count })
    }
  }
  return out
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
    const selections = parseSelections(body.selections)

    if (!selections.length) {
      return NextResponse.json({ error: 'Add at least one appliance' }, { status: 400 })
    }

    const plan = recommendBackupPlan({ useCase, backupHours, selections, catalog: await loadCatalog() })
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : ''
    const appliancesSummary = plan.lines.map((l) => `${l.count}× ${l.name} (${l.watts}W)`).join('; ')

    const payload = {
      name: name || undefined,
      phoneVerified: true,
      orgType: useCase,
      totalWatts: plan.connectedWatts,
      runningWatts: plan.runningWatts,
      peakWatts: plan.peakWatts,
      backupHours,
      upsType: plan.systemType,
      recommendedVa: plan.inverterVa,
      batteryAh: plan.batteryAh,
      totalBatteries: plan.totalBatteries,
      bankVoltage: plan.bankVoltage,
      estimatedBackupHours: plan.estimatedBackupHours,
      needsSurvey: plan.needsSurvey,
      notes: plan.notes,
      appliances: plan.lines.map((l) => ({
        key: l.key,
        name: l.name,
        watts: l.watts,
        count: l.count,
      })),
      appliancesSummary,
    }

    const { error } = await supabase.from('leads').insert({
      phone: verified.phone,
      type: 'ups_proposal',
      source: 'backup_calculator',
      payload,
      score: Math.min(100, 60 + (plan.inverterVa >= 5000 ? 20 : plan.inverterVa >= 2000 ? 10 : 0)),
    })
    if (error) console.error('Backup calculator lead insert error:', error)

    await sendBackupCalculatorToGoogleSheets({
      name: name || undefined,
      phone: verified.phone,
      useCase,
      backupHours,
      connectedWatts: plan.connectedWatts,
      runningWatts: plan.runningWatts,
      peakWatts: plan.peakWatts,
      systemType: plan.systemType,
      inverterVa: plan.inverterVa,
      batteryAh: plan.batteryAh,
      totalBatteries: plan.totalBatteries,
      bankVoltage: plan.bankVoltage,
      estimatedBackupHours: plan.estimatedBackupHours,
      needsSurvey: plan.needsSurvey,
      appliancesSummary,
      notes: plan.notes.join(' | '),
      extra: JSON.stringify(payload),
    })

    return NextResponse.json({ plan })
  } catch (err) {
    console.error('Backup calculator proposal error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
