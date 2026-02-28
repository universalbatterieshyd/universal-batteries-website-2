'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type SolarEnquiryFormProps = {
  type: 'off_grid' | 'on_grid'
}

export function SolarEnquiryForm({ type }: SolarEnquiryFormProps) {
  const [roofType, setRoofType] = useState('')
  const [roofArea, setRoofArea] = useState('')
  const [monthlyBill, setMonthlyBill] = useState('')
  const [city, setCity] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || !name) return
    setStatus('loading')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          area: city || undefined,
          type: 'solar_enquiry',
          source: type,
          payload: {
            name,
            email,
            roofType,
            roofArea,
            monthlyBill,
            city,
            solarType: type,
          },
          website: '',
        }),
      })
      const data = await res.json()
      if (data.success) {
        setStatus('success')
        setName('')
        setPhone('')
        setEmail('')
        setRoofType('')
        setRoofArea('')
        setMonthlyBill('')
        setCity('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone *</Label>
        <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Roof type</Label>
        <Select value={roofType} onValueChange={setRoofType}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flat">Flat RCC</SelectItem>
            <SelectItem value="sloped">Sloped / Tiled</SelectItem>
            <SelectItem value="metal">Metal sheet</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="roofArea">Roof area (sq ft)</Label>
          <Input
            id="roofArea"
            placeholder="e.g. 500"
            value={roofArea}
            onChange={(e) => setRoofArea(e.target.value)}
          />
        </div>
        {type === 'on_grid' && (
          <div className="space-y-2">
            <Label htmlFor="monthlyBill">Monthly electricity bill (₹)</Label>
            <Input
              id="monthlyBill"
              placeholder="e.g. 5000"
              value={monthlyBill}
              onChange={(e) => setMonthlyBill(e.target.value)}
            />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">City / Area</Label>
        <Input
          id="city"
          placeholder="e.g. Hyderabad"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>
      {status === 'success' && (
        <p className="text-sm text-green-600 dark:text-green-400">
          {type === 'on_grid' ? 'We\'ll schedule a site survey.' : 'We\'ll get back with a solar + inverter quote.'}
        </p>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">Something went wrong. Please try again.</p>
      )}
      <Button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Submitting...' : type === 'on_grid' ? 'Book site survey' : 'Get quote'}
      </Button>
    </form>
  )
}
