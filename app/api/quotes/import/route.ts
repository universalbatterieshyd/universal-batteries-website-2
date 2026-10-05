import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { createClient } from '@/lib/supabase/server'
import { getQuoteProfile, isQuoteAdmin } from '@/lib/quotes/auth'
import {
  buildSearchText,
  parsePriceListWorkbook,
  type CanonicalProductRow,
} from '@/lib/quotes/import-adapters'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function POST(request: Request) {
  const profile = await getQuoteProfile()
  if (!isQuoteAdmin(profile)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const form = await request.formData()
  const file = form.get('file')
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'file required' }, { status: 400 })
  }

  const buf = Buffer.from(await file.arrayBuffer())
  const wb = XLSX.read(buf, { type: 'buffer', cellDates: true })
  const sheetData: Record<string, unknown[][]> = {}
  for (const name of wb.SheetNames) {
    const sheet = wb.Sheets[name]
    sheetData[name] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: null,
      raw: true,
    }) as unknown[][]
  }

  const parsed = parsePriceListWorkbook(sheetData)
  const supabase = await createClient()

  // Category lookup
  const { data: categories } = await supabase
    .from('quote_categories')
    .select('id, name, slug')

  const bySlug = new Map((categories ?? []).map((c) => [c.slug.toLowerCase(), c.id]))
  const byName = new Map((categories ?? []).map((c) => [c.name.toLowerCase(), c.id]))

  const unmatchedCategories = new Set<string>()
  const resolveCategory = (raw: string | null) => {
    if (!raw) return null
    const id = bySlug.get(slugify(raw)) || byName.get(raw.toLowerCase())
    if (!id) unmatchedCategories.add(raw)
    return id ?? null
  }

  // Replace buyback slabs
  let buybackUpserted = 0
  if (parsed.buyback.length) {
    await supabase.from('quote_buyback_slabs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    const { error: bbErr } = await supabase.from('quote_buyback_slabs').insert(
      parsed.buyback.map((b) => ({
        min_ah: b.min_ah,
        max_ah: b.max_ah,
        buyback_amount: b.buyback_amount,
        weight_note: b.weight_note,
        sort_order: b.sort_order,
        is_active: true,
      }))
    )
    if (bbErr) {
      return NextResponse.json({ error: `Buyback import failed: ${bbErr.message}` }, { status: 400 })
    }
    buybackUpserted = parsed.buyback.length
  }

  // Upsert products by model_code + source_sheet (simple key)
  let inserted = 0
  let updated = 0
  const batchSize = 100

  const toRow = (p: CanonicalProductRow) => {
    const search = buildSearchText(p)
    return {
      sku: p.sku,
      brand: p.brand,
      series: p.series,
      model_code: p.model_code,
      full_name: p.full_name,
      capacity_value: p.capacity_value,
      capacity_unit: p.capacity_unit,
      dp_incl_gst: p.dp_incl_gst,
      warranty_text: p.warranty_text,
      warranty_months: p.warranty_months,
      category_id: resolveCategory(p.category_raw),
      price_list_date: p.price_list_date,
      source_sheet: p.source_sheet,
      ref_universal: p.ref_universal,
      ref_reseller: p.ref_reseller,
      ref_customer: p.ref_customer,
      ref_mrp: p.ref_mrp,
      search_text: search,
      is_active: true,
    }
  }

  // Load existing keys
  const { data: existing } = await supabase
    .from('quote_products')
    .select('id, model_code, source_sheet')

  const existingMap = new Map(
    (existing ?? []).map((e) => [`${e.source_sheet}::${e.model_code || ''}`.toLowerCase(), e.id])
  )

  const toInsert: ReturnType<typeof toRow>[] = []
  const toUpdate: { id: string; row: ReturnType<typeof toRow> }[] = []

  for (const p of parsed.products) {
    const key = `${p.source_sheet}::${p.model_code || p.full_name}`.toLowerCase()
    const id = existingMap.get(key)
    const row = toRow(p)
    if (id) toUpdate.push({ id, row })
    else toInsert.push(row)
  }

  for (let i = 0; i < toInsert.length; i += batchSize) {
    const chunk = toInsert.slice(i, i + batchSize)
    const { error } = await supabase.from('quote_products').insert(chunk)
    if (error) {
      return NextResponse.json({ error: `Product insert failed: ${error.message}` }, { status: 400 })
    }
    inserted += chunk.length
  }

  for (const item of toUpdate) {
    const { error } = await supabase.from('quote_products').update(item.row).eq('id', item.id)
    if (error) {
      return NextResponse.json({ error: `Product update failed: ${error.message}` }, { status: 400 })
    }
    updated += 1
  }

  return NextResponse.json({
    ok: true,
    products_parsed: parsed.products.length,
    inserted,
    updated,
    buyback_slabs: buybackUpserted,
    sheet_stats: parsed.sheetStats,
    warnings: parsed.warnings,
    unmatched_categories: Array.from(unmatchedCategories).sort(),
  })
}
