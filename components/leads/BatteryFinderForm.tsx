'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const FALLBACK_BRANDS = ['Maruti Suzuki', 'Hyundai', 'Honda', 'Tata', 'Mahindra', 'Toyota', 'Kia', 'Other']
const FALLBACK_MODELS: Record<string, string[]> = {
  'Maruti Suzuki': ['Alto', 'Swift', 'Dzire', 'Wagon R', 'Baleno', 'Ertiga', 'Brezza', 'Other'],
  'Hyundai': ['i10', 'i20', 'Creta', 'Venue', 'Verna', 'Santro', 'Other'],
  'Honda': ['City', 'Amaze', 'Jazz', 'WR-V', 'Other'],
  'Tata': ['Nano', 'Tiago', 'Nexon', 'Harrier', 'Safari', 'Other'],
  'Mahindra': ['XUV500', 'Scorpio', 'Bolero', 'XUV300', 'Thar', 'Other'],
  'Toyota': ['Innova', 'Fortuner', 'Glanza', 'Urban Cruiser', 'Other'],
  'Kia': ['Seltos', 'Sonet', 'Carens', 'Other'],
  'Other': ['Other'],
}

export function BatteryFinderForm() {
  const [brands, setBrands] = useState<string[]>(FALLBACK_BRANDS)
  const [modelsByBrand, setModelsByBrand] = useState<Record<string, string[]>>(FALLBACK_MODELS)
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [phone, setPhone] = useState('')
  const [area, setArea] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  useEffect(() => {
    fetch('/api/vehicles')
      .then((r) => r.json())
      .then((r) => r.brands?.length && setBrands([...r.brands, 'Other']))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!brand) return
    fetch(`/api/vehicles?brand=${encodeURIComponent(brand)}`)
      .then((r) => r.json())
      .then((r) => {
        if (r.models?.length) {
          setModelsByBrand((prev) => ({ ...prev, [brand]: [...r.models, 'Other'] }))
        }
      })
      .catch(() => {})
  }, [brand])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone) return
    setStatus('loading')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          area: area || undefined,
          type: 'battery_finder',
          source: 'battery_finder',
          payload: { vehicleBrand: brand, vehicleModel: model },
          website: '', // honeypot
        }),
      })
      const data = await res.json()
      if (data.success) {
        setStatus('success')
        setBrand('')
        setModel('')
        setPhone('')
        setArea('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const models = brand ? (modelsByBrand[brand] || FALLBACK_MODELS[brand] || FALLBACK_MODELS['Other']) : []

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand">Vehicle brand</Label>
          <Select value={brand} onValueChange={(v) => { setBrand(v); setModel('') }}>
            <SelectTrigger id="brand">
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Select value={model} onValueChange={setModel} disabled={!brand}>
            <SelectTrigger id="model">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone *</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="10-digit mobile"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="area">Area (optional)</Label>
        <Input
          id="area"
          placeholder="e.g. Secunderabad"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        />
      </div>
      {status === 'success' && (
        <p className="text-sm text-green-600 dark:text-green-400">We&apos;ll call you with compatible battery options.</p>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">Something went wrong. Please try again.</p>
      )}
      <Button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Submitting...' : 'Get battery options'}
      </Button>
    </form>
  )
}
