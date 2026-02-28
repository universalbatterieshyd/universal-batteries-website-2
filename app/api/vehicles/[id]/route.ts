import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { brand, model, fuelType, vehicleSegment, capacityAh, batteryGroupId } = body

    const updates: Record<string, unknown> = {}
    if (brand !== undefined) updates.brand = brand
    if (model !== undefined) updates.model = model
    if (fuelType !== undefined) updates.fuel_type = fuelType
    if (vehicleSegment !== undefined) updates.vehicle_segment = vehicleSegment
    if (capacityAh !== undefined) updates.capacity_ah = capacityAh
    if (batteryGroupId !== undefined) updates.battery_group_id = batteryGroupId

    const { data, error } = await supabase
      .from('vehicle_compatibility')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Vehicle update error:', error)
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
    console.error('Vehicle update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await supabase.from('vehicle_compatibility').delete().eq('id', id)
    if (error) {
      console.error('Vehicle delete error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Vehicle delete error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
