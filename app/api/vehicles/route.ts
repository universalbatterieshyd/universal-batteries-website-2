import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const brand = searchParams.get('brand')
  const listAll = searchParams.get('list') === 'all'

  if (brand) {
    const { data, error } = await supabase
      .from('vehicle_compatibility')
      .select('model, fuel_type')
      .eq('brand', brand)
      .order('model')

    if (error) {
      console.error('Vehicles fetch error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    const uniqueModels = [...new Set((data || []).map((r) => r.model))]
    const modelsWithFuel = (data || []).reduce(
      (acc, r) => {
        if (!acc[r.model]) acc[r.model] = []
        if (r.fuel_type && !acc[r.model].includes(r.fuel_type)) {
          acc[r.model].push(r.fuel_type)
        }
        return acc
      },
      {} as Record<string, string[]>
    )

    return NextResponse.json({
      models: uniqueModels,
      fuelTypesByModel: modelsWithFuel,
    })
  }

  if (listAll) {
    const { data, error } = await supabase
      .from('vehicle_compatibility')
      .select('*')
      .order('brand')
      .order('model')

    if (error) {
      console.error('Vehicles fetch error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
    const brands = [...new Set((data || []).map((r) => r.brand).filter(Boolean))].sort()
    return NextResponse.json({ brands, vehicles: data || [] })
  }

  const { data, error } = await supabase
    .from('vehicle_compatibility')
    .select('brand')
    .order('brand')

  if (error) {
    console.error('Vehicles fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  const brands = [...new Set((data || []).map((r) => r.brand).filter(Boolean))].sort()
  return NextResponse.json({ brands })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { brand, model, fuelType, vehicleSegment, capacityAh, batteryGroupId } = body

    if (!brand || !model) {
      return NextResponse.json(
        { error: 'Missing required fields: brand, model' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('vehicle_compatibility')
      .insert({
        brand,
        model,
        fuel_type: fuelType || null,
        vehicle_segment: vehicleSegment || null,
        capacity_ah: capacityAh || null,
        battery_group_id: batteryGroupId || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Vehicle create error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    return NextResponse.json({
      id: data.id,
      brand: data.brand,
      model: data.model,
      fuelType: data.fuel_type,
      vehicleSegment: data.vehicle_segment,
      capacityAh: data.capacity_ah,
      batteryGroupId: data.battery_group_id,
    })
  } catch (err) {
    console.error('Vehicle create error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
