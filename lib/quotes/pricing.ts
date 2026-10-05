/** Pricing helpers for Rapid Quote Engine (GST-inclusive DP). */

export type RoundingMode = 'none' | 'nearest_10' | 'nearest_100' | 'ceil_10' | 'ceil_100'
export type TargetMode = 'percent_of_floor' | 'fixed_amount'

export function applyRounding(value: number, mode: RoundingMode): number {
  if (!Number.isFinite(value)) return 0
  switch (mode) {
    case 'none':
      return Math.round(value * 100) / 100
    case 'nearest_10':
      return Math.round(value / 10) * 10
    case 'nearest_100':
      return Math.round(value / 100) * 100
    case 'ceil_10':
      return Math.ceil(value / 10) * 10
    case 'ceil_100':
      return Math.ceil(value / 100) * 100
    default:
      return Math.round(value * 100) / 100
  }
}

export function computeFloor(
  dpInclGst: number,
  floorMarkupPercent: number,
  rounding: RoundingMode
): number {
  const raw = dpInclGst * (1 + floorMarkupPercent / 100)
  return applyRounding(raw, rounding)
}

export function computeTarget(
  floor: number,
  targetMode: TargetMode,
  targetPercent: number,
  targetFixedAmount: number,
  rounding: RoundingMode
): number {
  const raw =
    targetMode === 'fixed_amount'
      ? floor + targetFixedAmount
      : floor * (1 + targetPercent / 100)
  return applyRounding(raw, rounding)
}

export function lookupBuyback(
  ah: number,
  slabs: { min_ah: number; max_ah: number; buyback_amount: number }[]
): number | null {
  const hit = slabs.find((s) => ah >= Number(s.min_ah) && ah <= Number(s.max_ah))
  return hit ? Number(hit.buyback_amount) : null
}

/** Indian FY label e.g. 26-27 for dates from Apr 2026–Mar 2027 */
export function indianFyLabel(date = new Date()): string {
  const y = date.getFullYear()
  const m = date.getMonth() // 0-based
  const start = m >= 3 ? y : y - 1
  const a = String(start).slice(-2)
  const b = String(start + 1).slice(-2)
  return `${a}-${b}`
}
