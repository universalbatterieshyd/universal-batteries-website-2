'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { OTPInput, type SlotProps } from 'input-otp'
import {
  ArrowLeft,
  ArrowRight,
  BatteryFull,
  Building2,
  Check,
  Clock,
  Home,
  Loader2,
  Lock,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  Store,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  BACKUP_HOUR_OPTIONS,
  DEFAULT_APPLIANCES,
  DEFAULT_HOURS,
  USE_CASE_PRESETS,
  computeConnectedWatts,
  makeCustomApplianceKey,
  type ApplianceDef,
  type ApplianceSelection,
  type BackupPlan,
  type UseCase,
} from '@/lib/backup-calculator/sizing'

type Step = 'place' | 'load' | 'hours' | 'phone' | 'otp' | 'result'
type CustomAppliance = { key: string; name: string; watts: number; count: number }

const STEPS: Step[] = ['place', 'load', 'hours', 'phone', 'otp', 'result']
const PROGRESS_LABELS = ['Place', 'Appliances', 'Backup', 'Verify']

const PLACES: { id: UseCase; label: string; hint: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', hint: 'Lights, fans, TV, WiFi', icon: Home },
  { id: 'shop', label: 'Shop', hint: 'Lights, billing, WiFi', icon: Store },
  { id: 'office', label: 'Office', hint: 'Computers, network', icon: Building2 },
  { id: 'clinic', label: 'Clinic', hint: 'Critical & medical', icon: Stethoscope },
]

const HOUR_HINTS: Record<number, string> = {
  1: 'Short cuts',
  2: 'Most common',
  3: 'Frequent cuts',
  4: 'Long cuts',
  6: 'Half day',
  8: 'All night',
}

const METER_MAX_WATTS = 4000
const RESEND_SECONDS = 30

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919391026003'
const businessPhone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+91 9391026003'

function formatWatts(w: number) {
  return w >= 1000 ? `${(w / 1000).toFixed(w % 1000 === 0 ? 0 : 1)} kW` : `${w} W`
}

export function BackupCalculator() {
  const [step, setStep] = useState<Step>('place')
  const [direction, setDirection] = useState(1)
  const [catalog, setCatalog] = useState<ApplianceDef[]>(DEFAULT_APPLIANCES)
  const [useCase, setUseCase] = useState<UseCase>('home')
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [customs, setCustoms] = useState<CustomAppliance[]>([])
  const [customName, setCustomName] = useState('')
  const [customWatts, setCustomWatts] = useState('')
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [hours, setHours] = useState<number>(2)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [devMode, setDevMode] = useState(false)
  const [resendIn, setResendIn] = useState(0)
  const [plan, setPlan] = useState<BackupPlan | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const honeypot = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/appliances')
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: { key: string; name: string; watts: number; emoji?: string; icon_url?: string | null; show_in_visual?: boolean }[]) => {
        const visible = rows.filter((r) => r.show_in_visual !== false)
        if (visible.length) {
          setCatalog(
            visible.map((r) => ({
              key: r.key,
              name: r.name,
              watts: Number(r.watts),
              emoji: r.emoji || '🔌',
              iconUrl: r.icon_url || null,
            }))
          )
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (resendIn <= 0) return
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resendIn])

  const selections = useMemo((): ApplianceSelection[] => {
    const fromCatalog = Object.entries(counts)
      .filter(([, c]) => c > 0)
      .map(([key, count]) => ({ key, count }))
    const fromCustom = customs
      .filter((c) => c.count > 0 && c.watts > 0)
      .map((c) => ({ key: c.key, count: c.count, name: c.name, watts: c.watts }))
    return [...fromCatalog, ...fromCustom]
  }, [counts, customs])
  const connectedWatts = useMemo(() => computeConnectedWatts(selections, catalog), [selections, catalog])
  const applianceCount = selections.reduce((s, x) => s + x.count, 0)

  const go = useCallback((next: Step) => {
    setDirection(STEPS.indexOf(next) >= STEPS.indexOf(step) ? 1 : -1)
    setError('')
    setStep(next)
  }, [step])

  const back = () => {
    const prev: Partial<Record<Step, Step>> = { load: 'place', hours: 'load', phone: 'hours', otp: 'phone' }
    if (prev[step]) go(prev[step]!)
  }

  const choosePlace = (id: UseCase) => {
    setUseCase(id)
    const keys = new Set(catalog.map((a) => a.key))
    setCounts(Object.fromEntries(Object.entries(USE_CASE_PRESETS[id]).filter(([k]) => keys.has(k))))
    setCustoms([])
    setShowCustomForm(false)
    setHours(DEFAULT_HOURS[id])
    go('load')
  }

  const bump = (key: string, delta: number) =>
    setCounts((c) => ({ ...c, [key]: Math.min(50, Math.max(0, (c[key] || 0) + delta)) }))

  const bumpCustom = (key: string, delta: number) =>
    setCustoms((list) =>
      list
        .map((c) => (c.key === key ? { ...c, count: Math.min(50, Math.max(0, c.count + delta)) } : c))
        .filter((c) => c.count > 0)
    )

  const addCustomAppliance = () => {
    const watts = Math.min(5000, Math.max(1, Math.floor(Number(customWatts) || 0)))
    const name = customName.trim().slice(0, 40)
    if (!name || !watts) {
      setError('Enter a name and wattage for your appliance')
      return
    }
    setError('')
    setCustoms((list) => [...list, { key: makeCustomApplianceKey(), name, watts, count: 1 }])
    setCustomName('')
    setCustomWatts('')
    setShowCustomForm(false)
  }

  const fetchPlan = useCallback(async () => {
    const res = await fetch('/api/backup-calculator/proposal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ useCase, backupHours: hours, selections, name, phone }),
    })
    const data = await res.json()
    if (!res.ok) throw Object.assign(new Error(data.error || 'Could not prepare your plan'), { status: res.status })
    return data.plan as BackupPlan
  }, [useCase, hours, selections, name, phone])

  const sendOtp = async () => {
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/backup-calculator/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, website: honeypot.current?.value || '' }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.retryAfter) setResendIn(data.retryAfter)
        throw new Error(data.error || 'Could not send OTP')
      }
      setDevMode(Boolean(data.devMode))
      setOtp('')
      setResendIn(RESEND_SECONDS)
      if (step !== 'otp') go('otp')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send OTP')
    } finally {
      setBusy(false)
    }
  }

  const submitPhone = async () => {
    setBusy(true)
    setError('')
    try {
      setPlan(await fetchPlan())
      go('result')
      setBusy(false)
    } catch (e) {
      if ((e as { status?: number }).status === 401) {
        await sendOtp()
      } else {
        setError(e instanceof Error ? e.message : 'Something went wrong')
        setBusy(false)
      }
    }
  }

  const verifyOtp = async (code: string) => {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/backup-calculator/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Verification failed')
      setPlan(await fetchPlan())
      go('result')
    } catch (e) {
      setOtp('')
      setError(e instanceof Error ? e.message : 'Verification failed')
    } finally {
      setBusy(false)
    }
  }

  const restart = () => {
    setPlan(null)
    go('place')
  }

  const progressIndex = Math.min(STEPS.indexOf(step), 3)
  const phoneValid = /^[6-9]\d{9}$/.test(phone)

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="pointer-events-none absolute -inset-x-10 -top-10 h-64 rounded-full bg-gradient-to-r from-[#004C8F]/20 via-[#E31B23]/10 to-[#004C8F]/20 blur-3xl" />

      <div className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_60px_-20px_rgba(0,76,143,0.35)] dark:border-slate-800 dark:bg-slate-950">
        {step !== 'result' && (
          <header className="flex items-center gap-3 px-5 pt-5 sm:px-7 sm:pt-6">
            <button
              type="button"
              onClick={back}
              aria-label="Go back"
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition active:scale-95 dark:bg-slate-800 dark:text-slate-200',
                step === 'place' && 'hidden'
              )}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <div className="flex gap-1.5">
                {PROGRESS_LABELS.map((label, i) => (
                  <div key={label} className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#004C8F] to-[#2a7fd4]"
                      initial={false}
                      animate={{ width: i <= progressIndex ? '100%' : '0%' }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                    />
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs font-medium text-slate-500">
                Step {progressIndex + 1} of 4 · {PROGRESS_LABELS[progressIndex]}
              </p>
            </div>
          </header>
        )}

        <div className="relative">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -28 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {step === 'place' && (
                <section className="px-5 pb-6 pt-5 sm:px-7 sm:pb-8">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Where do you need backup?
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">We&apos;ll pre-fill typical appliances so you can finish in seconds.</p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {PLACES.map(({ id, label, hint, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => choosePlace(id)}
                        className="group relative flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 text-left transition active:scale-[0.97] hover:border-[#004C8F]/40 hover:shadow-lg dark:border-slate-800 dark:from-slate-900 dark:to-slate-950"
                      >
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#004C8F]/10 text-[#004C8F] transition group-hover:bg-[#004C8F] group-hover:text-white dark:text-sky-300">
                          <Icon className="h-6 w-6" />
                        </span>
                        <span>
                          <span className="block text-base font-semibold text-slate-900 dark:text-white">{label}</span>
                          <span className="block text-xs text-slate-500">{hint}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-5 flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5" /> Takes under a minute · Free expert advice
                  </p>
                </section>
              )}

              {step === 'load' && (
                <section className="pt-5">
                  <div className="px-5 sm:px-7">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      What should keep running?
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">Tap to add. Use − to remove.</p>
                    <LoadMeter watts={connectedWatts} count={applianceCount} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2.5 px-5 pb-4 sm:grid-cols-3 sm:px-7">
                    {catalog.map((a) => {
                      const c = counts[a.key] || 0
                      return (
                        <div
                          key={a.key}
                          className={cn(
                            'relative rounded-2xl border p-3 transition',
                            c > 0
                              ? 'border-[#004C8F] bg-[#004C8F]/[0.04] ring-1 ring-[#004C8F]/30 dark:bg-sky-500/10'
                              : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => bump(a.key, 1)}
                            className="flex w-full items-center gap-2.5 text-left active:scale-[0.98]"
                            aria-label={`Add ${a.name}`}
                          >
                            <ApplianceIcon emoji={a.emoji} iconUrl={a.iconUrl} />
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{a.name}</span>
                              <span className="block text-xs text-slate-500">{a.watts} W</span>
                            </span>
                          </button>
                          <div className="mt-2.5 flex items-center justify-between rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                            <button
                              type="button"
                              onClick={() => bump(a.key, -1)}
                              disabled={c === 0}
                              aria-label={`Remove ${a.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm transition active:scale-90 disabled:opacity-40 dark:bg-slate-700 dark:text-white"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <motion.span
                              key={c}
                              initial={{ scale: 1.35, opacity: 0.4 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="w-8 text-center text-base font-bold tabular-nums text-slate-900 dark:text-white"
                            >
                              {c}
                            </motion.span>
                            <button
                              type="button"
                              onClick={() => bump(a.key, 1)}
                              aria-label={`Add ${a.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#004C8F] text-white shadow-sm transition active:scale-90"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}

                    {customs.map((c) => (
                      <div
                        key={c.key}
                        className="relative rounded-2xl border border-[#004C8F] bg-[#004C8F]/[0.04] p-3 ring-1 ring-[#004C8F]/30 dark:bg-sky-500/10"
                      >
                        <div className="flex w-full items-center gap-2.5 text-left">
                          <ApplianceIcon emoji="🔌" />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{c.name}</span>
                            <span className="block text-xs text-slate-500">{c.watts} W · custom</span>
                          </span>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                          <button
                            type="button"
                            onClick={() => bumpCustom(c.key, -1)}
                            aria-label={`Remove ${c.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm transition active:scale-90 dark:bg-slate-700 dark:text-white"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-base font-bold tabular-nums text-slate-900 dark:text-white">
                            {c.count}
                          </span>
                          <button
                            type="button"
                            onClick={() => bumpCustom(c.key, 1)}
                            aria-label={`Add ${c.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#004C8F] text-white shadow-sm transition active:scale-90"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="col-span-2 sm:col-span-3">
                      {showCustomForm ? (
                        <div className="rounded-2xl border border-dashed border-[#004C8F]/40 bg-slate-50 p-4 dark:bg-slate-900">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">Add a custom appliance</p>
                          <p className="mt-0.5 text-xs text-slate-500">Use the wattage printed on the label or adapter.</p>
                          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_120px_auto]">
                            <input
                              type="text"
                              value={customName}
                              onChange={(e) => setCustomName(e.target.value)}
                              placeholder="e.g. Desktop PC"
                              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#004C8F] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                            />
                            <input
                              type="number"
                              inputMode="numeric"
                              min={1}
                              max={5000}
                              value={customWatts}
                              onChange={(e) => setCustomWatts(e.target.value)}
                              placeholder="Watts"
                              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#004C8F] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                            />
                            <button
                              type="button"
                              onClick={addCustomAppliance}
                              className="h-11 rounded-xl bg-[#004C8F] px-4 text-sm font-semibold text-white"
                            >
                              Add
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setShowCustomForm(false)
                              setError('')
                            }}
                            className="mt-2 text-xs font-medium text-slate-500"
                          >
                            Cancel
                          </button>
                          {error && step === 'load' && <p className="mt-2 text-sm text-[#E31B23]">{error}</p>}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowCustomForm(true)}
                          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 text-sm font-semibold text-[#004C8F] transition hover:border-[#004C8F]/50 hover:bg-[#004C8F]/5 dark:border-slate-700 dark:text-sky-400"
                        >
                          <Plus className="h-4 w-4" /> Add custom appliance
                        </button>
                      )}
                    </div>
                  </div>
                  <StickyAction
                    disabled={connectedWatts === 0}
                    onClick={() => go('hours')}
                    label={connectedWatts === 0 ? 'Add an appliance' : 'Continue'}
                  />
                </section>
              )}

              {step === 'hours' && (
                <section className="px-5 pb-6 pt-5 sm:px-7 sm:pb-8">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    How long are your power cuts?
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Backup needed for {formatWatts(connectedWatts)} of appliances.
                  </p>
                  <div className="mt-5 grid grid-cols-3 gap-2.5">
                    {BACKUP_HOUR_OPTIONS.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => {
                          setHours(h)
                          go('phone')
                        }}
                        className={cn(
                          'flex flex-col items-center rounded-2xl border px-2 py-4 transition active:scale-95',
                          hours === h
                            ? 'border-[#004C8F] bg-[#004C8F] text-white shadow-lg shadow-[#004C8F]/25'
                            : 'border-slate-200 bg-white text-slate-900 hover:border-[#004C8F]/40 dark:border-slate-800 dark:bg-slate-900 dark:text-white'
                        )}
                      >
                        <span className="text-3xl font-bold tabular-nums leading-none">{h}</span>
                        <span className={cn('mt-1 text-xs font-medium', hours === h ? 'text-white/80' : 'text-slate-500')}>
                          {h === 1 ? 'hour' : 'hours'}
                        </span>
                        <span className={cn('mt-2 text-[11px]', hours === h ? 'text-white/70' : 'text-slate-400')}>
                          {HOUR_HINTS[h]}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {step === 'phone' && (
                <section className="px-5 pb-6 pt-5 sm:px-7 sm:pb-8">
                  <LockedPreview />
                  <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Your plan is ready
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">Verify your mobile number to unlock it. One quick OTP.</p>
                  <form
                    className="mt-5 space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (phoneValid && !busy) submitPhone()
                    }}
                  >
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name (optional)"
                      autoComplete="name"
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#004C8F] focus:bg-white focus:ring-4 focus:ring-[#004C8F]/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    />
                    <div className="flex h-14 items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition focus-within:border-[#004C8F] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#004C8F]/10 dark:border-slate-800 dark:bg-slate-900">
                      <span className="flex h-full items-center gap-1.5 border-r border-slate-200 px-4 text-base font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        autoFocus
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(-10))}
                        placeholder="98765 43210"
                        aria-label="Mobile number"
                        className="h-full flex-1 bg-transparent px-4 text-lg font-medium tracking-wide text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                      />
                    </div>
                    <input ref={honeypot} name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
                    {error && <p className="text-sm font-medium text-[#E31B23]">{error}</p>}
                    <PrimaryButton type="submit" disabled={!phoneValid || busy} busy={busy}>
                      Get OTP <ArrowRight className="h-5 w-5" />
                    </PrimaryButton>
                    <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Used only to share your plan. No spam, ever.
                    </p>
                  </form>
                </section>
              )}

              {step === 'otp' && (
                <section className="px-5 pb-6 pt-5 sm:px-7 sm:pb-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#004C8F]/10 text-[#004C8F]">
                    <MessageCircle className="h-7 w-7" />
                  </div>
                  <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Enter the code</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Sent by SMS to <span className="font-semibold text-slate-800 dark:text-slate-200">+91 {phone.slice(0, 5)} {phone.slice(5)}</span>{' '}
                    <button type="button" onClick={() => go('phone')} className="font-semibold text-[#004C8F] dark:text-sky-400 underline-offset-2 hover:underline">
                      Change
                    </button>
                  </p>
                  <div className="mt-6 flex justify-center">
                    <OTPInput
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                      onComplete={verifyOtp}
                      autoFocus
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      disabled={busy}
                      containerClassName="flex items-center gap-2 sm:gap-3"
                      render={({ slots }) => (
                        <>
                          {slots.map((slot, i) => (
                            <OtpSlot key={i} {...slot} error={Boolean(error)} />
                          ))}
                        </>
                      )}
                    />
                  </div>
                  <div className="mt-4 min-h-[20px] text-center text-sm">
                    {busy ? (
                      <span className="inline-flex items-center gap-2 text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
                      </span>
                    ) : error ? (
                      <span className="font-medium text-[#E31B23]">{error}</span>
                    ) : devMode ? (
                      <span className="text-amber-600">Test mode: use code 123456</span>
                    ) : null}
                  </div>
                  <div className="mt-4 text-center">
                    {resendIn > 0 ? (
                      <span className="text-sm text-slate-500">Resend code in {resendIn}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={sendOtp}
                        disabled={busy}
                        className="text-sm font-semibold text-[#004C8F] dark:text-sky-400 underline-offset-2 hover:underline"
                      >
                        Resend code
                      </button>
                    )}
                  </div>
                </section>
              )}

              {step === 'result' && plan && <PlanResult plan={plan} name={name} onRestart={restart} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function ApplianceIcon({
  emoji,
  iconUrl,
  size = 'md',
}: {
  emoji: string
  iconUrl?: string | null
  size?: 'sm' | 'md'
}) {
  const box = size === 'sm' ? 'h-5 w-5 text-sm' : 'h-8 w-8 text-2xl'
  if (iconUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={iconUrl} alt="" className={cn(box, 'shrink-0 rounded-md object-contain')} />
    )
  }
  return <span className={cn(box, 'inline-flex shrink-0 items-center justify-center leading-none')}>{emoji}</span>
}

function LoadMeter({ watts, count }: { watts: number; count: number }) {
  const pct = Math.min(100, (watts / METER_MAX_WATTS) * 100)
  const tone = watts > 2500 ? 'from-amber-500 to-[#E31B23]' : 'from-[#004C8F] to-sky-400'
  return (
    <div className="mt-4 rounded-2xl bg-slate-900 p-4 text-white dark:bg-slate-900">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Connected load</p>
          <motion.p
            key={watts}
            initial={{ y: 6, opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-0.5 text-3xl font-bold tabular-nums"
          >
            {formatWatts(watts)}
          </motion.p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
          <Zap className="h-3.5 w-3.5 text-amber-300" />
          {count} {count === 1 ? 'item' : 'items'}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={cn('h-full rounded-full bg-gradient-to-r', tone)}
          initial={false}
          animate={{ width: `${Math.max(pct, watts > 0 ? 3 : 0)}%` }}
          transition={{ type: 'spring', stiffness: 160, damping: 22 }}
        />
      </div>
    </div>
  )
}

function StickyAction({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <div className="sticky bottom-0 z-10 border-t border-slate-100 bg-white/90 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 sm:px-7">
      <PrimaryButton type="button" onClick={onClick} disabled={disabled}>
        {label} {!disabled && <ArrowRight className="h-5 w-5" />}
      </PrimaryButton>
    </div>
  )
}

function PrimaryButton({
  children,
  busy,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  return (
    <button
      {...props}
      className={cn(
        'flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#E31B23] to-[#c2141b] text-base font-semibold text-white shadow-lg shadow-[#E31B23]/25 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none dark:disabled:from-slate-700 dark:disabled:to-slate-700',
        className
      )}
    >
      {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : children}
    </button>
  )
}

function OtpSlot({ char, isActive, hasFakeCaret, error }: SlotProps & { error: boolean }) {
  return (
    <div
      className={cn(
        'relative flex h-14 w-11 items-center justify-center rounded-xl border-2 bg-slate-50 text-2xl font-bold text-slate-900 transition sm:h-16 sm:w-12 dark:bg-slate-900 dark:text-white',
        error ? 'border-[#E31B23]/60' : isActive ? 'border-[#004C8F] bg-white ring-4 ring-[#004C8F]/10' : 'border-slate-200 dark:border-slate-800'
      )}
    >
      {char}
      {hasFakeCaret && <div className="absolute h-6 w-0.5 animate-pulse bg-[#004C8F]" />}
    </div>
  )
}

function LockedPreview() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#00305c] via-[#004C8F] to-[#0b65b8] p-4 text-white">
      <div className="space-y-3 blur-[6px]" aria-hidden>
        <div className="h-3 w-24 rounded bg-white/40" />
        <div className="h-7 w-40 rounded bg-white/60" />
        <div className="flex gap-2">
          <div className="h-10 flex-1 rounded-lg bg-white/25" />
          <div className="h-10 flex-1 rounded-lg bg-white/25" />
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-[#004C8F] shadow-lg">
          <Lock className="h-4 w-4" /> Unlock with OTP
        </span>
      </div>
    </div>
  )
}

function PlanResult({ plan, name, onRestart }: { plan: BackupPlan; name: string; onRestart: () => void }) {
  const systemLabel = plan.systemType === 'online_ups' ? 'Online UPS' : 'Inverter'
  const batteryLine = `${plan.totalBatteries} × ${plan.batteryAh} Ah`
  const message = [
    `Hi Universal Batteries, I used your backup calculator.`,
    `Recommended: ${plan.inverterVa} VA ${systemLabel} with ${batteryLine} ${plan.batteryType} battery (${plan.bankVoltage}V).`,
    `Load: ${plan.connectedWatts} W, backup needed: ${plan.backupHours} h.`,
    `Please share the best price.`,
  ].join('\n')
  const waHref = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
  const telHref = `tel:${businessPhone.replace(/[^\d+]/g, '')}`

  return (
    <section>
      <div className="relative overflow-hidden bg-gradient-to-br from-[#00264a] via-[#004C8F] to-[#0b65b8] px-5 pb-6 pt-6 text-white sm:px-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#E31B23]/30 blur-3xl" />
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400 text-emerald-950"
        >
          <Check className="h-6 w-6" strokeWidth={3} />
        </motion.div>
        <p className="mt-4 text-sm text-sky-100">{name ? `${name.split(' ')[0]}, here's` : "Here's"} your backup plan</p>
        <h2 className="mt-1 text-4xl font-bold tracking-tight">
          {plan.inverterVa >= 1000 ? `${parseFloat((plan.inverterVa / 1000).toFixed(2))} kVA` : `${plan.inverterVa} VA`}
          <span className="ml-2 text-xl font-semibold text-sky-100">{systemLabel}</span>
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <Stat icon={<BatteryFull className="h-4 w-4" />} label={`${plan.batteryType} battery`} value={batteryLine} />
          <Stat icon={<Clock className="h-4 w-4" />} label="Backup on your load" value={`≈ ${plan.estimatedBackupHours} h`} />
        </div>
      </div>

      <div className="space-y-5 px-5 pb-6 pt-5 sm:px-7 sm:pb-8">
        <div className="grid grid-cols-3 divide-x divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50 py-3 text-center dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          <MiniStat label="Connected" value={formatWatts(plan.connectedWatts)} />
          <MiniStat label="System" value={`${plan.bankVoltage} V`} />
          <MiniStat label="You asked" value={`${plan.backupHours} h`} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Running on backup</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {plan.lines.map((l) => (
              <span
                key={l.key}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <ApplianceIcon emoji={l.emoji} iconUrl={l.iconUrl} size="sm" /> {l.count} × {l.name}
              </span>
            ))}
          </div>
        </div>

        {plan.notes.length > 0 && (
          <ul className="space-y-2 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
            {plan.notes.map((n) => (
              <li key={n} className="flex gap-2">
                <Zap className="mt-0.5 h-4 w-4 shrink-0" /> {n}
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-2.5">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] text-base font-semibold text-white shadow-lg shadow-[#25D366]/25 transition active:scale-[0.98]"
          >
            <MessageCircle className="h-5 w-5" /> Get best price on WhatsApp
          </a>
          <a
            href={telHref}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 text-base font-semibold text-slate-800 transition active:scale-[0.98] dark:border-slate-800 dark:text-white"
          >
            <Phone className="h-5 w-5" /> Talk to an expert
          </a>
        </div>
        <p className="text-center text-xs text-slate-500">
          Our team will also call you to confirm the plan. Final sizing is checked at installation.
        </p>
        <button
          type="button"
          onClick={onRestart}
          className="mx-auto flex items-center gap-1.5 text-sm font-semibold text-[#004C8F] dark:text-sky-400"
        >
          <RotateCcw className="h-4 w-4" /> Recalculate
        </button>
      </div>
    </section>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-sky-100">
        {icon} {label}
      </p>
      <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 text-base font-bold tabular-nums text-slate-900 dark:text-white">{value}</p>
    </div>
  )
}
