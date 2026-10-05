/**
 * Per-sheet adapters for Universal_Price List.xlsx → canonical quote products.
 */

export type CanonicalProductRow = {
  sku: string | null
  brand: string | null
  series: string | null
  model_code: string | null
  full_name: string
  capacity_value: number | null
  capacity_unit: 'Ah' | 'VA' | null
  dp_incl_gst: number
  warranty_text: string | null
  warranty_months: number | null
  category_raw: string | null
  price_list_date: string | null
  source_sheet: string
  ref_universal: number | null
  ref_reseller: number | null
  ref_customer: number | null
  ref_mrp: number | null
}

export type BuybackSlabRow = {
  min_ah: number
  max_ah: number
  buyback_amount: number
  weight_note: string | null
  sort_order: number
}

/** Sheets that are not product masters */
export const SKIP_SHEETS = new Set([
  'Pricing Criteria',
  'Dealer Schemes',
  'Rack Sizer',
  '2 wheeler prices',
  'Vendor Tracker',
  'Vehicle Compatibility',
  'Exide-Amaron Equivalents',
  'Sheet14',
  'Weight Comparison',
])

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'number' && Number.isFinite(v)) return v
  const s = String(v).replace(/,/g, '').replace(/₹/g, '').trim()
  if (!s || s === '#N/A' || s === '#ERROR!') return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

function str(v: unknown): string | null {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  return s || null
}

function excelDate(v: unknown): string | null {
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return v.toISOString().slice(0, 10)
  }
  if (typeof v === 'number') {
    // Excel serial date
    const epoch = Date.UTC(1899, 11, 30)
    const d = new Date(epoch + v * 86400000)
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  }
  const s = str(v)
  if (!s) return null
  const parsed = new Date(s)
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)
  return null
}

function headerMap(row: unknown[]): Map<string, number> {
  const map = new Map<string, number>()
  row.forEach((cell, i) => {
    const key = str(cell)?.toLowerCase()
    if (key) map.set(key, i)
  })
  return map
}

function col(map: Map<string, number>, ...aliases: string[]): number | null {
  for (const a of aliases) {
    const i = map.get(a.toLowerCase())
    if (i !== undefined) return i
  }
  // partial match
  for (const [k, i] of map) {
    for (const a of aliases) {
      if (k.includes(a.toLowerCase())) return i
    }
  }
  return null
}

function get(row: unknown[], i: number | null): unknown {
  if (i === null || i === undefined) return null
  return row[i]
}

function inferCapacityUnit(capacity: number | null, sheet: string, series: string | null): 'Ah' | 'VA' | null {
  if (capacity === null) return null
  const blob = `${sheet} ${series || ''}`.toLowerCase()
  if (blob.includes('ups') || blob.includes('inverter') || blob.includes('solar') || capacity >= 400) {
    // Heuristic: large VA for electronics; batteries rarely > 300 Ah in this list
    if (blob.includes('ups') || blob.includes('inverter') || (capacity >= 500 && !blob.includes('battery'))) {
      return 'VA'
    }
  }
  return 'Ah'
}

function buildSearchText(p: CanonicalProductRow): string {
  return [p.brand, p.series, p.model_code, p.full_name, p.sku, p.category_raw]
    .filter(Boolean)
    .join(' ')
}

export function parseBuybackSheet(rows: unknown[][]): BuybackSlabRow[] {
  if (!rows.length) return []
  // Find header row
  let headerIdx = 0
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const joined = rows[i].map((c) => String(c ?? '').toLowerCase()).join(' ')
    if (joined.includes('min') && joined.includes('max')) {
      headerIdx = i
      break
    }
  }
  const map = headerMap(rows[headerIdx] || [])
  const iMin = col(map, 'min value', 'min')
  const iMax = col(map, 'max value', 'max')
  const iBb = col(map, 'buyback price', 'buyback')
  const iWeight = col(map, 'weight range', 'weight')
  const out: BuybackSlabRow[] = []
  let order = 0
  for (let r = headerIdx + 1; r < rows.length; r++) {
    const row = rows[r]
    if (!row?.length) continue
    let minAh = num(get(row, iMin))
    let maxAh = num(get(row, iMax))
    // Skip rows where "Ah Range" was a date
    if (minAh === null && maxAh === null) continue
    if (minAh === null) minAh = maxAh
    if (maxAh === null) maxAh = minAh
    const amount = num(get(row, iBb))
    if (minAh === null || maxAh === null || amount === null) continue
    out.push({
      min_ah: minAh,
      max_ah: maxAh,
      buyback_amount: amount,
      weight_note: str(get(row, iWeight)),
      sort_order: order++,
    })
  }
  return out
}

type SheetKind =
  | 'standard'
  | 'exide_home'
  | 'bpe_hitachi'
  | 'amaron'

function detectKind(sheetName: string, map: Map<string, number>): SheetKind {
  const n = sheetName.toLowerCase()
  if (n.includes('exide_home') || n.includes('exide home')) return 'exide_home'
  if (n.includes('bpe') || n.includes('hitachi')) return 'bpe_hitachi'
  if (col(map, 'dp (excl. gst)', 'dp excl')) return 'bpe_hitachi'
  if (col(map, 'recommended resale price')) return 'exide_home'
  return 'standard'
}

function parseProductSheet(
  sheetName: string,
  rows: unknown[][],
  defaultGst = 18
): { products: CanonicalProductRow[]; warnings: string[] } {
  const warnings: string[] = []
  if (rows.length < 2) return { products: [], warnings }

  let headerIdx = -1
  for (let i = 0; i < Math.min(8, rows.length); i++) {
    const map = headerMap(rows[i] || [])
    if (
      col(map, 'battery type', 'ups series', 'model') !== null &&
      (col(map, 'dp', 'recommended resale price', 'dp (excl. gst)', 'universal price') !== null ||
        col(map, 'customer') !== null)
    ) {
      headerIdx = i
      break
    }
  }
  if (headerIdx < 0) {
    warnings.push(`${sheetName}: no header row found — skipped`)
    return { products: [], warnings }
  }

  const map = headerMap(rows[headerIdx])
  const kind = detectKind(sheetName, map)

  const iDate = col(map, 'date')
  const iSeries = col(map, 'battery series', 'ups series', 'series')
  const iType = col(map, 'battery type', 'model', 'model name')
  const iFull = col(map, 'full name')
  const iSku = col(map, 'sku')
  const iAh = col(map, 'ah/ va', 'ah', 'capacity')
  const iDp = col(
    map,
    kind === 'exide_home' ? 'recommended resale price' : 'dp',
    'dp (excl. gst)',
    'recommended resale price',
    'dp'
  )
  const iDpExcl = col(map, 'dp (excl. gst)', 'dp excl')
  const iUni = col(map, 'universal price', 'universal price(incl. gst)')
  const iRes = col(map, 'reseller', 'reseller)')
  const iCust = col(map, 'customer')
  const iMrp = col(map, 'mrp')
  const iWar = col(map, 'warranty')
  const iWarTot = col(map, 'total warranty', 'total warranty (in months)')
  const iCat = col(map, 'category', 'quote category', 'item category')

  const brandGuess =
    sheetName.replace(/_/g, ' ').replace(/\s+/g, ' ').trim() || null

  const products: CanonicalProductRow[] = []

  for (let r = headerIdx + 1; r < rows.length; r++) {
    const row = rows[r]
    if (!row?.length) continue

    const model = str(get(row, iType))
    const full = str(get(row, iFull)) || model
    if (!full && !model) continue

    let dp: number | null = null
    if (kind === 'bpe_hitachi' || iDpExcl !== null) {
      const excl = num(get(row, iDpExcl ?? iDp))
      if (excl !== null) dp = Math.round(excl * (1 + defaultGst / 100) * 100) / 100
    } else {
      dp = num(get(row, iDp))
    }
    // Fallback: Universal Price if DP missing
    if (dp === null) dp = num(get(row, iUni))
    if (dp === null) continue

    const capacity = num(get(row, iAh))
    const series = str(get(row, iSeries))
    const unit = inferCapacityUnit(capacity, sheetName, series)
    const warrantyMonths = num(get(row, iWarTot))
    const warrantyText = str(get(row, iWar))
    const category_raw = str(get(row, iCat))

    const product: CanonicalProductRow = {
      sku: str(get(row, iSku)),
      brand: brandGuess,
      series,
      model_code: model,
      full_name: full || model || 'Unknown',
      capacity_value: capacity,
      capacity_unit: unit,
      dp_incl_gst: dp,
      warranty_text: warrantyText,
      warranty_months: warrantyMonths !== null ? Math.round(warrantyMonths) : null,
      category_raw,
      price_list_date: excelDate(get(row, iDate)),
      source_sheet: sheetName,
      ref_universal: num(get(row, iUni)),
      ref_reseller: num(get(row, iRes)),
      ref_customer: num(get(row, iCust)),
      ref_mrp: num(get(row, iMrp)),
    }
    products.push(product)
  }

  return { products, warnings }
}

export type ParseWorkbookResult = {
  products: CanonicalProductRow[]
  buyback: BuybackSlabRow[]
  warnings: string[]
  sheetStats: { sheet: string; count: number }[]
}

export function parsePriceListWorkbook(
  sheetData: Record<string, unknown[][]>
): ParseWorkbookResult {
  const warnings: string[] = []
  const products: CanonicalProductRow[] = []
  const sheetStats: { sheet: string; count: number }[] = []
  let buyback: BuybackSlabRow[] = []

  for (const [name, rows] of Object.entries(sheetData)) {
    if (name === 'Weight Comparison') {
      buyback = parseBuybackSheet(rows)
      sheetStats.push({ sheet: name, count: buyback.length })
      continue
    }
    if (SKIP_SHEETS.has(name)) {
      warnings.push(`Skipped helper sheet: ${name}`)
      continue
    }
    const parsed = parseProductSheet(name, rows)
    warnings.push(...parsed.warnings)
    products.push(...parsed.products)
    sheetStats.push({ sheet: name, count: parsed.products.length })
  }

  // attach search helper field externally when inserting
  void buildSearchText

  return { products, buyback, warnings, sheetStats }
}

export { buildSearchText }
