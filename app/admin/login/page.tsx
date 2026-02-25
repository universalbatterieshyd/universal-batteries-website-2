'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Zap } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden">
          {/* Card with generous padding - content well clear of edges */}
          <div className="p-12 sm:p-14">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#E31B23]/10 text-[#E31B23] mb-8">
                <Zap className="w-10 h-10" strokeWidth={2} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900">
                Universal Batteries Admin
              </h1>
              <p className="text-slate-500 mt-4 text-base">
                Internal access only
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="px-5 py-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full min-h-[52px] py-4 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#E31B23]/30 focus:border-[#E31B23] focus:outline-none transition-shadow"
                  style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
                  placeholder="universalbatterieshyd@gmail.com"
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full min-h-[52px] py-4 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#E31B23]/30 focus:border-[#E31B23] focus:outline-none transition-shadow"
                  style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[52px] py-4 px-10 bg-[#E31B23] text-white font-semibold rounded-xl hover:bg-[#C8161D] focus:ring-2 focus:ring-[#E31B23]/40 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>

            <p className="mt-10 pt-8 px-6 border-t border-slate-100 text-center text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
              Default: universalbatterieshyd@gmail.com / admin123
              <br />
              Change password after first login.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
