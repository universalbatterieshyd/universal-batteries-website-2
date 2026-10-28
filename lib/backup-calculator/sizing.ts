/**
 * Power backup sizing engine for the customer backup calculator.
 *
 * Battery capacity uses running load (with duty cycle for compressors).
 * Inverter VA is sized on continuous load + motor startup surge, without
 * showing surge numbers on the appliance cards.
 */

export type UseCase = 'home' | 'shop' | 'office' | 'clinic'
export type SystemType = 'inverter' | 'online_ups'

export type ApplianceDef = {
  key: string
  name: string
  watts: number
  emoji: string
  iconUrl?: string | null
}

export type ApplianceSelection = {
  key: string
  count: number
  /** Custom appliances only */
  name?: string
  watts?: number
}

export type BackupPlan = {
  useCase: UseCase
  systemType: SystemType
  backupHours: number
  connectedWatts: number
  runningWatts: number
  peakWatts: number
  energyWh: number
  inverterVa: number
  bankVoltage: number
  batteriesInSeries: number
  strings: number
  batteryAh: number
  totalBatteries: number
  batteryType: string
  estimatedBackupHours: number
  needsSurvey: boolean
  notes: string[]
  lines: { key: string; name: string; emoji: string; iconUrl?: string | null; watts: number; count: number }[]
}

/**
 * Conservative running watts (worst-case nameplate / common Indian models).
 * LED light and ceiling fan match shop practice (20 W / 80 W).
 */
export const DEFAULT_APPLIANCES: ApplianceDef[] = [
  { key: 'led-light', name: 'LED Light', watts: 20, emoji: '💡' },
  { key: 'tube-light', name: 'Tube Light', watts: 40, emoji: '💡' },
  { key: 'fan', name: 'Ceiling Fan', watts: 80, emoji: '🌀' },
  { key: 'bldc-fan', name: 'BLDC Fan', watts: 40, emoji: '🌀' },
  { key: 'tv', name: 'LED TV', watts: 120, emoji: '📺' },
  { key: 'router', name: 'WiFi Router', watts: 20, emoji: '📡' },
  { key: 'laptop', name: 'Laptop', watts: 90, emoji: '💻' },
  { key: 'macbook', name: 'MacBook', watts: 100, emoji: '💻' },
  { key: 'fridge', name: 'Refrigerator', watts: 200, emoji: '🧊' },
  { key: 'washing-machine', name: 'Washing Machine', watts: 800, emoji: '🧺' },
  { key: 'water-pump', name: 'Water Pump', watts: 750, emoji: '💧' },
  { key: 'microwave', name: 'Microwave', watts: 1200, emoji: '🍲' },
  { key: 'ac', name: 'AC (1 Ton)', watts: 1500, emoji: '❄️' },
]

export const USE_CASE_PRESETS: Record<UseCase, Record<string, number>> = {
  home: { 'led-light': 6, fan: 3, tv: 1, router: 1 },
  shop: { 'led-light': 8, fan: 2, laptop: 1, router: 1 },
  office: { 'led-light': 10, fan: 4, laptop: 5, router: 1 },
  clinic: { 'led-light': 6, fan: 3, laptop: 2, router: 1, fridge: 1 },
}

export const DEFAULT_HOURS: Record<UseCase, number> = {
  home: 2,
  shop: 2,
  office: 1,
  clinic: 1,
}

export const BACKUP_HOUR_OPTIONS = [1, 2, 3, 4, 6, 8] as const

/** Fraction of time the appliance actually draws rated power (compressors cycle). */
const DUTY_CYCLE: Record<string, number> = {
  fridge: 0.5,
  ac: 0.7,
  'washing-machine': 0.6,
  microwave: 0.5,
}

/**
 * Startup multiplier vs running watts. Used only for inverter VA sizing
 * so motor loads don't trip the inverter on start.
 */
const SURGE_FACTOR: Record<string, number> = {
  fan: 2.5,
  'bldc-fan': 1.5,
  fridge: 3,
  'washing-machine': 2.5,
  'water-pump': 4,
  ac: 3.5,
  microwave: 1.2,
}

const POWER_FACTOR = 0.8
const CONTINUOUS_MARGIN = 1.15
const INVERTER_EFFICIENCY = 0.85
const USABLE_DOD = 0.8
const BATTERY_VOLTAGE = 12
const STANDARD_AH = [100, 120, 135, 150, 165, 180, 200, 220]
const MAX_STRINGS = 2
const CUSTOM_KEY_PREFIX = 'custom:'

export function isCustomApplianceKey(key: string): boolean {
  return key.startsWith(CUSTOM_KEY_PREFIX)
}

export function makeCustomApplianceKey(): string {
  return `${CUSTOM_KEY_PREFIX}${Date.now().toString(36)}`
}

/** Lead-acid delivers less than its C20 rating when discharged quickly. */
function rateFactor(hours: number): number {
  if (hours <= 3) return 0.85
  if (hours <= 6) return 0.9
  return 0.95
}

const INVERTER_MODELS: { va: number; volts: number }[] = [
  { va: 700, volts: 12 },
  { va: 900, volts: 12 },
  { va: 1100, volts: 12 },
  { va: 1650, volts: 24 },
  { va: 2000, volts: 24 },
  { va: 2500, volts: 24 },
  { va: 3500, volts: 24 },
  { va: 5000, volts: 48 },
]

const ONLINE_UPS_MODELS: { va: number; volts: number }[] = [
  { va: 1000, volts: 24 },
  { va: 2000, volts: 24 },
  { va: 3000, volts: 48 },
  { va: 5000, volts: 48 },
]

export function systemTypeFor(useCase: UseCase): SystemType {
  return useCase === 'office' || useCase === 'clinic' ? 'online_ups' : 'inverter'
}

function roundUpToStandardAh(ah: number): number | null {
  return STANDARD_AH.find((s) => s >= ah) ?? null
}

function resolveLine(
  selection: ApplianceSelection,
  catalog: ApplianceDef[]
): { key: string; name: string; emoji: string; iconUrl?: string | null; watts: number; count: number } | null {
  if (selection.count <= 0) return null
  if (isCustomApplianceKey(selection.key)) {
    const watts = Math.min(5000, Math.max(1, Math.floor(Number(selection.watts) || 0)))
    const name = String(selection.name || 'Custom').trim().slice(0, 40) || 'Custom'
    if (!watts) return null
    return { key: selection.key, name, emoji: '🔌', watts, count: selection.count }
  }
  const a = catalog.find((x) => x.key === selection.key)
  if (!a) return null
  return {
    key: a.key,
    name: a.name,
    emoji: a.emoji,
    iconUrl: a.iconUrl,
    watts: a.watts,
    count: selection.count,
  }
}

export function computeConnectedWatts(
  selections: ApplianceSelection[],
  catalog: ApplianceDef[]
): number {
  return selections.reduce((sum, s) => {
    const line = resolveLine(s, catalog)
    return sum + (line ? line.watts * line.count : 0)
  }, 0)
}

export function recommendBackupPlan(input: {
  useCase: UseCase
  backupHours: number
  selections: ApplianceSelection[]
  catalog: ApplianceDef[]
}): BackupPlan {
  const { useCase, backupHours, catalog } = input
  const lines = input.selections
    .map((s) => resolveLine(s, catalog))
    .filter((l): l is NonNullable<typeof l> => Boolean(l))

  const connectedWatts = lines.reduce((sum, l) => sum + l.watts * l.count, 0)
  const runningWatts = Math.round(
    lines.reduce((sum, l) => sum + l.watts * l.count * (DUTY_CYCLE[l.key] ?? 1), 0)
  )
  const peakWatts = Math.round(
    lines.reduce((sum, l) => sum + l.watts * l.count * (SURGE_FACTOR[l.key] ?? 1), 0)
  )
  const energyWh = Math.round(runningWatts * backupHours)

  const systemType = systemTypeFor(useCase)
  const models = systemType === 'online_ups' ? ONLINE_UPS_MODELS : INVERTER_MODELS
  const continuousVa = Math.ceil((connectedWatts / POWER_FACTOR) * CONTINUOUS_MARGIN)
  const surgeVa = Math.ceil(peakWatts / POWER_FACTOR)
  const requiredVa = Math.max(continuousVa, surgeVa)
  const usable = INVERTER_EFFICIENCY * USABLE_DOD * rateFactor(backupHours)
  const ahAt = (volts: number) => energyWh / (volts * usable)

  // Installers step up one voltage tier before paralleling battery strings,
  // but never oversize the inverter by more than that tier.
  const base = models.find((m) => m.va >= requiredVa)
  let needsSurvey = !base
  const stepUp = base && models.find((m) => m.va >= requiredVa && m.volts > base.volts)
  const tiers = [base, stepUp].filter((m): m is { va: number; volts: number } => Boolean(m))
  const chosen =
    tiers.find((m) => roundUpToStandardAh(ahAt(m.volts)) !== null) ??
    tiers[tiers.length - 1] ??
    models[models.length - 1]

  const bankVoltage = chosen.volts
  const batteriesInSeries = bankVoltage / BATTERY_VOLTAGE
  const requiredAh = ahAt(bankVoltage)

  let strings = 1
  let batteryAh = roundUpToStandardAh(requiredAh)
  while (batteryAh === null && strings < MAX_STRINGS) {
    strings += 1
    batteryAh = roundUpToStandardAh(requiredAh / strings)
  }
  if (batteryAh === null) {
    needsSurvey = true
    batteryAh = STANDARD_AH[STANDARD_AH.length - 1]
  }

  const usableWh = bankVoltage * batteryAh * strings * usable
  const estimatedBackupHours =
    runningWatts > 0 ? Math.round((usableWh / runningWatts) * 10) / 10 : 0

  const hasMotorLoad = lines.some((l) => (SURGE_FACTOR[l.key] ?? 1) > 1.2)
  const notes: string[] = []
  if (systemType === 'online_ups') {
    notes.push('Online UPS gives zero changeover time, which is safe for computers and billing systems.')
  }
  if (useCase === 'clinic') {
    notes.push('For medical equipment, add an isolation transformer to the UPS output.')
  }
  if (lines.some((l) => l.key === 'ac')) {
    notes.push('ACs draw a heavy start-up current. Our team will confirm compatibility at site.')
  } else if (hasMotorLoad) {
    notes.push('We sized the inverter for motor start-up (fridge, pump, fans) so it does not trip on restart.')
  }
  if (strings > 1) {
    notes.push('Your backup needs two battery banks in parallel for the hours selected.')
  }
  if (needsSurvey) {
    notes.push('Your load is above standard systems. We will do a free site survey to size it exactly.')
  }

  return {
    useCase,
    systemType,
    backupHours,
    connectedWatts,
    runningWatts,
    peakWatts,
    energyWh,
    inverterVa: chosen.va,
    bankVoltage,
    batteriesInSeries,
    strings,
    batteryAh,
    totalBatteries: batteriesInSeries * strings,
    batteryType: systemType === 'online_ups' ? 'SMF / VRLA' : 'Tall tubular',
    estimatedBackupHours,
    needsSurvey,
    notes,
    lines,
  }
}
