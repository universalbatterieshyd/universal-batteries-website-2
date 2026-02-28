import { Headphones } from 'lucide-react'
import { SupportTicketForm } from '@/components/leads/SupportTicketForm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
      <div className="container mx-auto px-6 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Headphones className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Support & Service</h1>
              <p className="text-muted-foreground">Submit a ticket for warranty, service, or product enquiries.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900/50 p-8 shadow-sm">
            <SupportTicketForm />
          </div>
          <p className="mt-6 text-sm text-muted-foreground text-center">
            Need immediate help?{' '}
            <Button asChild variant="link" className="p-0 h-auto">
              <Link href="/#contact">View contact details</Link>
            </Button>
          </p>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  )
}
