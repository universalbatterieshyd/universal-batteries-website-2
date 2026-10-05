'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { FileText } from 'lucide-react'

export default function QuotesLoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const accessError = searchParams?.get('error') === 'no_quote_access'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(
    accessError
      ? 'This account does not have Quotes access. Use a shop login, or ask Admin to grant a quote profile.'
      : ''
  )
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError || !signIn.user) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('quote_profiles')
      .select('user_id, is_active')
      .eq('user_id', signIn.user.id)
      .eq('is_active', true)
      .maybeSingle()

    if (!profile) {
      await supabase.auth.signOut()
      setError(
        'No Quotes access for this account. Shop staff use a Quotes login only — not the website Admin.'
      )
      setLoading(false)
      return
    }

    router.push('/quotes')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-[#004C8F] to-slate-900 flex-col justify-between p-12">
        <div className="text-white/70 text-sm font-medium tracking-wide uppercase">
          Rapid Quote Engine
        </div>
        <div className="space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur">
            <FileText className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <h2 className="text-3xl font-bold text-white">Quotes for the shop floor</h2>
          <p className="text-blue-100/90 text-lg max-w-sm">
            Create accurate quotations in under 30 seconds. Separate from the website Admin — shop
            staff only.
          </p>
        </div>
        <p className="text-blue-200/60 text-sm">Universal Batteries · MG Road & Karkhana</p>
      </div>

      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-12 lg:px-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
            <div className="p-10 sm:p-12">
              <div className="lg:hidden flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-[#E31B23]/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#E31B23]" strokeWidth={2} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Quotes</h1>
                  <p className="text-sm text-slate-500">Shop floor login</p>
                </div>
              </div>

              <h1 className="hidden lg:block text-2xl font-bold text-slate-900 mb-2">
                Sign in to Quotes
              </h1>
              <p className="hidden lg:block text-slate-500 mb-8">
                Not the website Admin. Use your Quotes credentials only.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full h-12 px-4 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#E31B23]/30 focus:border-[#E31B23] focus:outline-none"
                    placeholder="you@shop.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full h-12 px-4 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#E31B23]/30 focus:border-[#E31B23] focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 px-6 bg-[#E31B23] text-white font-semibold rounded-lg hover:bg-[#C8161D] focus:ring-2 focus:ring-[#E31B23]/40 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
