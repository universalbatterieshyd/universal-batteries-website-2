export const dynamic = 'force-dynamic'
import { supabase } from '@/lib/supabase'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { VehiclesManager } from '@/components/admin/VehiclesManager'

export type Vehicle = {
  id: string
  brand: string
  model: string
  fuelType: string | null
  vehicleSegment: string | null
  capacityAh: number | null
  batteryGroupId: string | null
}

export default async function VehiclesPage() {
  const { data } = await supabase
    .from('vehicle_compatibility')
    .select('*')
    .order('brand')
    .order('model')

  const vehicles: Vehicle[] = (data || []).map((r) => ({
    id: r.id,
    brand: r.brand,
    model: r.model,
    fuelType: r.fuel_type,
    vehicleSegment: r.vehicle_segment,
    capacityAh: r.capacity_ah,
    batteryGroupId: r.battery_group_id,
  }))

  return (
    <div className="min-h-screen">
      <AdminPageHeader
        title="Vehicle Database"
        description="Manage vehicle compatibility for battery finder. Add brands and models."
      />
      <div className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <VehiclesManager initialVehicles={vehicles} />
        </div>
      </div>
    </div>
  )
}
