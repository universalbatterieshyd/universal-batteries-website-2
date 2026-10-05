import { Suspense } from 'react'
import QuotesLoginClient from './QuotesLoginClient'

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <QuotesLoginClient />
    </Suspense>
  )
}
