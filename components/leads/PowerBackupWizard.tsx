'use client'

import { useState, useEffect } from 'react'
import { Wizard, type WizardStep } from '@/components/leads/Wizard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

type PowerBackupData = {
  inputMode: 'appliances' | 'direct'
  totalWatts: number
  applianceQuantities: Record<string, number>
  backupHours: number
  upsType: 'offline' | 'online'
  biomedicalLoad: boolean
  name: string
  phone: string
  email: string
}

const DEFAULT_APPLIANCES = [
  { key: 'led-light', name: 'LED Light', watts: 20, emoji: '💡', show_in_visual: true },
  { key: 'fan', name: 'Ceiling Fan', watts: 75, emoji: '🌀', show_in_visual: true },
  { key: 'tv', name: 'TV', watts: 100, emoji: '📺', show_in_visual: true },
  { key: 'laptop', name: 'Laptop', watts: 65, emoji: '💻', show_in_visual: true },
  { key: 'router', name: 'WiFi Router', watts: 15, emoji: '📡', show_in_visual: true },
  { key: 'fridge', name: 'Refrigerator', watts: 150, emoji: '🧊', show_in_visual: true },
  { key: 'ac', name: 'AC (1 Ton)', watts: 1200, emoji: '❄️', show_in_visual: true },
  { key: 'washing-machine', name: 'Washing Machine', watts: 500, emoji: '🧺', show_in_visual: true },
]

function calcRequiredAh(
  loadWatts: number,
  backupHrs: number,
  upsType: 'offline' | 'online'
): { ah: number; va: number; batteries: number; voltage: number } {
  const voltage = 12
  const dod = 0.8
  const efficiency = 0.8
  const derating = upsType === 'offline' ? 0.36 : 0.42
  const powerFactor = 0.8

  const ah = Math.ceil(
    (loadWatts * backupHrs) / (voltage * dod * efficiency * derating * powerFactor)
  )

  let va = 0
  let batteries = 1
  let battVoltage = 12

  if (loadWatts <= 600) {
    va = 600
    batteries = 1
    battVoltage = 12
  } else if (loadWatts <= 1200) {
    va = 1200
    batteries = 1
    battVoltage = 12
  } else if (loadWatts <= 1800) {
    va = 1800
    batteries = 1
    battVoltage = 12
  } else if (loadWatts <= 3000) {
    va = 2000
    batteries = 2
    battVoltage = 24
  } else {
    va = 5000
    batteries = 4
    battVoltage = 48
  }

  const cappedAh = Math.min(ah, 200)
  const actualBatteries = Math.max(1, Math.ceil(cappedAh / 100))

  return {
    ah: Math.min(cappedAh, 200),
    va,
    batteries: upsType === 'online' ? Math.max(2, actualBatteries) : actualBatteries,
    voltage: battVoltage,
  }
}

export function PowerBackupWizard() {
  const [appliances, setAppliances] = useState(DEFAULT_APPLIANCES)

  useEffect(() => {
    fetch('/api/appliances')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAppliances(
            data.map((a: { key: string; name: string; watts: number; emoji?: string; show_in_visual?: boolean }) => ({
              key: a.key,
              name: a.name,
              watts: a.watts,
              emoji: a.emoji || '📦',
              show_in_visual: a.show_in_visual !== false,
            }))
          )
        }
      })
      .catch(() => {})
  }, [])

  const steps: WizardStep<PowerBackupData>[] = [
    {
      id: 'load',
      title: 'Calculate your load',
      description: 'Add appliances or enter total load in watts.',
      render: ({ data, onUpdate }) => {
        const totalFromAppliances = Object.entries(data.applianceQuantities).reduce(
          (sum, [key, qty]) => {
            const app = appliances.find((a) => a.key === key)
            return sum + (app ? app.watts * qty : 0)
          },
          0
        )
        const totalWatts = data.inputMode === 'direct' ? data.totalWatts : totalFromAppliances

        return (
          <div className="space-y-6">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="inputMode"
                  checked={data.inputMode === 'appliances'}
                  onChange={() => onUpdate({ inputMode: 'appliances' })}
                />
                By appliances
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="inputMode"
                  checked={data.inputMode === 'direct'}
                  onChange={() => onUpdate({ inputMode: 'direct' })}
                />
                Enter watts directly
              </label>
            </div>

            {data.inputMode === 'appliances' ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {appliances.filter((a) => a.show_in_visual !== false).map((app) => (
                  <div
                    key={app.key}
                    className="rounded-xl border p-4 text-center hover:border-primary/50 transition-colors"
                  >
                    <span className="text-2xl block mb-2">{app.emoji}</span>
                    <span className="text-sm font-medium">{app.name}</span>
                    <p className="text-xs text-muted-foreground">{app.watts}W</p>
                    <div className="mt-2 flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdate({
                            applianceQuantities: {
                              ...data.applianceQuantities,
                              [app.key]: Math.max(0, (data.applianceQuantities[app.key] || 0) - 1),
                            },
                          })
                        }
                        className="w-8 h-8 rounded-lg border text-sm"
                      >
                        −
                      </button>
                      <span className="w-8 text-center">
                        {data.applianceQuantities[app.key] || 0}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdate({
                            applianceQuantities: {
                              ...data.applianceQuantities,
                              [app.key]: (data.applianceQuantities[app.key] || 0) + 1,
                            },
                          })
                        }
                        className="w-8 h-8 rounded-lg border text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Total load (watts)</Label>
                <Input
                  type="number"
                  min={0}
                  value={data.totalWatts || ''}
                  onChange={(e) => onUpdate({ totalWatts: parseInt(e.target.value, 10) || 0 })}
                  placeholder="e.g. 500"
                />
              </div>
            )}

            <p className="text-sm font-medium">
              Total load: <strong>{totalWatts}W</strong>
            </p>
          </div>
        )
      },
    },
    {
      id: 'backup',
      title: 'Backup requirements',
      description: 'How long do you need backup? Offline (inverter) or online UPS?',
      render: ({ data, onUpdate }) => {
        const totalWatts =
          data.inputMode === 'direct'
            ? data.totalWatts
            : Object.entries(data.applianceQuantities).reduce(
                (sum, [key, qty]) => {
                  const app = appliances.find((a) => a.key === key)
                  return sum + (app ? app.watts * qty : 0)
                },
                0
              )
        const result = calcRequiredAh(totalWatts, data.backupHours, data.upsType)

        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Backup hours</Label>
              <Select
                value={String(data.backupHours)}
                onValueChange={(v) => onUpdate({ backupHours: parseFloat(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">30 min</SelectItem>
                  <SelectItem value="1">1 hr</SelectItem>
                  <SelectItem value="2">2 hr</SelectItem>
                  <SelectItem value="4">4 hr</SelectItem>
                  <SelectItem value="8">8 hr</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>UPS type</Label>
              <Select
                value={data.upsType}
                onValueChange={(v) => onUpdate({ upsType: v as 'offline' | 'online' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="offline">Offline (Inverter) – home, 1–2 hr</SelectItem>
                  <SelectItem value="online">Online UPS – office, servers, 5 min–1.5 hr</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="biomedical"
                checked={data.biomedicalLoad}
                onCheckedChange={(c) => onUpdate({ biomedicalLoad: !!c })}
              />
              <Label htmlFor="biomedical">Biomedical / medical equipment (needs isolation transformer)</Label>
            </div>
            {totalWatts > 0 && (
              <div className="rounded-xl border p-4 bg-slate-50 dark:bg-slate-900/50">
                <h4 className="font-semibold mb-2">Recommended</h4>
                <ul className="text-sm space-y-1">
                  <li>Inverter: ~{result.va} VA</li>
                  <li>Battery: ~{result.ah} Ah ({result.batteries} × 12V)</li>
                  <li>Installation: {data.upsType === 'offline' ? 'Trolley' : 'Metal rack'}</li>
                </ul>
              </div>
            )}
          </div>
        )
      },
    },
    {
      id: 'contact',
      title: 'Contact details',
      description: 'We\'ll get back with a tailored quote.',
      validate: (d) => !!(d.phone && d.name),
      render: ({ data, onUpdate, onNext }) => {
        const totalWatts =
          data.inputMode === 'direct'
            ? data.totalWatts
            : Object.entries(data.applianceQuantities).reduce(
                (sum, [key, qty]) => {
                  const app = appliances.find((a) => a.key === key)
                  return sum + (app ? app.watts * qty : 0)
                },
                0
              )
        const result = calcRequiredAh(totalWatts, data.backupHours, data.upsType)

        return (
          <div className="space-y-6">
            <div className="rounded-xl border p-4 bg-slate-50 dark:bg-slate-900/50 text-sm mb-6">
              <h4 className="font-semibold mb-2">Your requirements</h4>
              <p>Load: {totalWatts}W • Backup: {data.backupHours} hr • {data.upsType === 'offline' ? 'Offline' : 'Online'}</p>
              <p>Recommended: ~{result.va} VA inverter, ~{result.ah} Ah battery</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => onUpdate({ name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={data.phone}
                  onChange={(e) => onUpdate({ phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => onUpdate({ email: e.target.value })}
                />
              </div>
            </div>
          </div>
        )
      },
    },
  ]

  const initialData: PowerBackupData = {
    inputMode: 'appliances',
    totalWatts: 0,
    applianceQuantities: {},
    backupHours: 2,
    upsType: 'offline',
    biomedicalLoad: false,
    name: '',
    phone: '',
    email: '',
  }

  const handleComplete = async (data: PowerBackupData) => {
    const totalWatts =
      data.inputMode === 'direct'
        ? data.totalWatts
        : Object.entries(data.applianceQuantities).reduce(
            (sum, [key, qty]) => {
              const app = appliances.find((a) => a.key === key)
              return sum + (app ? app.watts * qty : 0)
            },
            0
          )
    const result = calcRequiredAh(totalWatts, data.backupHours, data.upsType)

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: data.phone,
        area: undefined,
        type: 'ups_proposal',
        source: 'power_backup_wizard',
        payload: {
          name: data.name,
          email: data.email,
          totalWatts,
          backupHours: data.backupHours,
          upsType: data.upsType,
          recommendedVa: result.va,
          recommendedAh: result.ah,
          biomedicalLoad: data.biomedicalLoad,
        },
        website: '',
      }),
    })
    const json = await res.json()
    if (json.success) {
      setSubmitStatus('success')
    } else {
      setSubmitStatus('error')
    }
  }

  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  if (submitStatus === 'success') {
    return (
      <div className="rounded-xl border p-8 text-center">
        <p className="text-lg font-medium text-green-600 dark:text-green-400">
          Request submitted. We&apos;ll call you with a tailored quote soon.
        </p>
      </div>
    )
  }

  if (submitStatus === 'error') {
    return (
      <div className="rounded-xl border p-8 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">Something went wrong. Please try again.</p>
        <Button onClick={() => setSubmitStatus('idle')}>Try again</Button>
      </div>
    )
  }

  return (
    <Wizard<PowerBackupData>
      steps={steps}
      initialData={initialData}
      onComplete={handleComplete}
      showProgress
    />
  )
}
