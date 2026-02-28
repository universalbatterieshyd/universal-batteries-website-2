'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Battery, ArrowLeft } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/admin'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left: branded panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1a365d] via-[#2c5282] to-[#1a365d] flex-col justify-between p-12">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to site
          </Link>
        </div>
        <div className="space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur">
            <Battery className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <h2 className="text-3xl font-bold text-white">
            Universal Batteries
          </h2>
          <p className="text-blue-200/90 text-lg max-w-sm">
            Staff portal — internal access for branches, products, content, and inquiries.
          </p>
        </div>
        <p className="text-blue-200/70 text-sm">
          Trusted power solutions since 1992
        </p>
      </div>

      {/* Right: login form */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-12 lg:px-12">
        <div className="w-full max-w-md">
          <Link href="/" className="lg:hidden inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to site
          </Link>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
            <div className="p-10 sm:p-12">
              <div className="lg:hidden flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-[#E31B23]/10 flex items-center justify-center">
                  <Battery className="w-6 h-6 text-[#E31B23]" strokeWidth={2} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Universal Batteries</h1>
                  <p className="text-sm text-slate-500">Staff portal</p>
                </div>
              </div>

              <h1 className="hidden lg:block text-2xl font-heading font-bold text-slate-900 mb-2">
                Sign in to Admin
              </h1>
              <p className="hidden lg:block text-slate-500 mb-8">
                Enter your credentials to access the staff portal
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm flex items-center gap-2">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-500" />
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
                    className="w-full h-12 px-4 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#E31B23]/30 focus:border-[#E31B23] focus:outline-none transition-all"
                    placeholder="your@email.com"
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
                    className="w-full h-12 px-4 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#E31B23]/30 focus:border-[#E31B23] focus:outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 px-6 bg-[#E31B23] text-white font-semibold rounded-lg hover:bg-[#C8161D] focus:ring-2 focus:ring-[#E31B23]/40 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              <p className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
                Change your password anytime in Admin → Settings → Account
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
