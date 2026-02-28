import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * Parse CSV with support for quoted fields.
 * Supports formats:
 * - Simple: brand,model,fuel_type,segment,capacity_ah
 * - Zipowatt: Vehicle Make, Vehicle Segment, Brand + Model, Battery Capacity (AH), Fuel Types, Notes
 */
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []

  const headers = parseCSVLine(lines[0])
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? ''
    })
    rows.push(row)
  }
  return rows
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      inQuotes = !inQuotes
    } else if ((c === ',' && !inQuotes) || c === '\n') {
      result.push(current.trim())
      current = ''
    } else {
      current += c
    }
  }
  result.push(current.trim())
  return result
}

const COLUMN_ALIASES: Record<string, string[]> = {
  brand: ['brand', 'Brand', 'vehicle_make', 'Vehicle Make', 'make'],
  model: ['model', 'Model', 'brand_model', 'Brand + Model', 'brand_model'],
  fuel_type: ['fuel_type', 'Fuel Type', 'Fuel Types', 'fuel_types'],
  segment: ['segment', 'Segment', 'vehicle_segment', 'Vehicle Segment'],
  capacity_ah: ['capacity_ah', 'Capacity (AH)', 'Battery Capacity (AH)', 'capacity', 'Capacity'],
}

function getValue(row: Record<string, string>, field: keyof typeof COLUMN_ALIASES): string {
  const aliases = COLUMN_ALIASES[field]
  for (const alias of aliases) {
    const keys = Object.keys(row).filter(
      (k) => k.toLowerCase() === alias.toLowerCase() || k.trim() === alias
    )
    if (keys.length > 0 && row[keys[0]]) return row[keys[0]].trim()
  }
  return ''
}

/**
 * Parse "Brand + Model" column: "AUDI A3 (Petrol & Diesel), AUDI A4 (Petrol)"
 * Returns array of { model, fuelType }
 */
function parseBrandModelColumn(value: string, brand: string): { model: string; fuelType: string }[] {
  const results: { model: string; fuelType: string }[] = []
  const parts = value.split(',').map((p) => p.trim()).filter(Boolean)
  for (const part of parts) {
    const match = part.match(/^(.+?)\s*\(([^)]+)\)\s*$/)
    if (match) {
      const modelPart = match[1].trim()
      const model = modelPart.replace(new RegExp(`^${brand}\\s*`, 'i'), '').trim() || modelPart
      results.push({ model, fuelType: match[2].trim() })
    } else {
      const model = part.replace(new RegExp(`^${brand}\\s*`, 'i'), '').trim() || part
      results.push({ model, fuelType: '' })
    }
  }
  if (results.length === 0 && value.trim()) {
    results.push({ model: value.trim(), fuelType: '' })
  }
  return results
}

const SEGMENT_MAP: Record<string, string> = {
  CARS: 'car',
  CAR: 'car',
  SUV: 'suv',
  BIKES: 'bike',
  BIKE: 'bike',
  TRUCKS: 'truck',
  TRUCK: 'truck',
  MPV: 'truck',
  TRACTOR: 'tractor',
}

function normalizeSegment(seg: string): string {
  const upper = seg.toUpperCase().trim()
  return SEGMENT_MAP[upper] || seg.toLowerCase() || ''
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let csvText: string

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
      }
      csvText = await file.text()
    } else if (contentType.includes('application/json')) {
      const body = await request.json()
      csvText = body.csv || body.data || ''
      if (!csvText) {
        return NextResponse.json({ error: 'Missing csv or data field' }, { status: 400 })
      }
    } else {
      csvText = await request.text()
    }

    const rows = parseCSV(csvText)
    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No valid rows found. CSV must have header row and at least one data row.' },
        { status: 400 }
      )
    }

    const toInsert: { brand: string; model: string; fuel_type: string | null; vehicle_segment: string | null; capacity_ah: number | null }[] = []
    const seen = new Set<string>()

    for (const row of rows) {
      const brand = getValue(row, 'brand')
      const modelCol = getValue(row, 'model')
      const fuelType = getValue(row, 'fuel_type')
      const segment = normalizeSegment(getValue(row, 'segment'))
      const capacityStr = getValue(row, 'capacity_ah')
      const capacityAh = capacityStr ? parseInt(capacityStr.replace(/\D/g, ''), 10) || null : null

      if (!brand) continue

      if (modelCol && modelCol.includes(',')) {
        const parsed = parseBrandModelColumn(modelCol, brand)
        for (const { model, fuelType: ft } of parsed) {
          if (!model) continue
          const key = `${brand}|${model}|${ft}`
          if (seen.has(key)) continue
          seen.add(key)
          toInsert.push({
            brand,
            model,
            fuel_type: ft || fuelType || null,
            vehicle_segment: segment || null,
            capacity_ah: capacityAh,
          })
        }
      } else {
        const model = modelCol || getValue(row, 'brand_model')
        if (!model) continue
        const key = `${brand}|${model}|${fuelType}`
        if (seen.has(key)) continue
        seen.add(key)
        toInsert.push({
          brand,
          model,
          fuel_type: fuelType || null,
          vehicle_segment: segment || null,
          capacity_ah: capacityAh,
        })
      }
    }

    if (toInsert.length === 0) {
      return NextResponse.json(
        { error: 'No valid vehicles to import. Ensure columns: brand (or Vehicle Make), model (or Brand + Model).' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('vehicle_compatibility')
      .insert(toInsert)
      .select('id, brand, model')

    if (error) {
      console.error('Vehicle import error:', error)
      return NextResponse.json(
        { error: error.message || 'Import failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      imported: data?.length ?? toInsert.length,
      total: toInsert.length,
    })
  } catch (err) {
    console.error('Vehicle import error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
