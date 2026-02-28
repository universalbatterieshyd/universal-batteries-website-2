'use client'

import { useState } from 'react'
import { Headphones, Check, X } from 'lucide-react'
import type { Ticket } from '@/app/admin/tickets/page'

const CATEGORY_LABELS: Record<string, string> = {
  warranty: 'Warranty',
  service: 'Service / Repair',
  installation: 'Installation',
  product: 'Product enquiry',
  billing: 'Billing',
  other: 'Other',
}

export function TicketsManager({ initialTickets }: { initialTickets: Ticket[] }) {
  const [tickets, setTickets] = useState(initialTickets)
  const [filter, setFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  const filtered =
    filter === 'all'
      ? tickets
      : tickets.filter((t) => t.status === filter)

  const updateTicket = async (id: string, updates: { status?: string; notes?: string }) => {
    const res = await fetch(`/api/support-tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: updates.status,
        assignedTo: undefined,
        notes: updates.notes,
      }),
    })
    if (res.ok) {
      const updated = await res.json()
      setTickets((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, status: updated.status ?? t.status, notes: updated.notes ?? t.notes }
            : t
        )
      )
      setExpandedId(null)
      setNotes('')
    }
  }

  const formatDate = (d: string | Date) =>
    new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const openCount = tickets.filter((t) => t.status === 'open').length
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium text-sm ${
            filter === 'all' ? 'bg-[#E31B23] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All ({tickets.length})
        </button>
        <button
          onClick={() => setFilter('open')}
          className={`px-4 py-2 rounded-lg font-medium text-sm ${
            filter === 'open' ? 'bg-[#E31B23] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Open ({openCount})
        </button>
        <button
          onClick={() => setFilter('in_progress')}
          className={`px-4 py-2 rounded-lg font-medium text-sm ${
            filter === 'in_progress' ? 'bg-[#E31B23] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          In Progress ({inProgressCount})
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`px-4 py-2 rounded-lg font-medium text-sm ${
            filter === 'resolved' ? 'bg-[#E31B23] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Resolved ({resolvedCount})
        </button>
      </div>

      <div className="space-y-4">
        {filtered.map((ticket) => (
          <div
            key={ticket.id}
            className="rounded-xl border border-slate-200 p-6 bg-white"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Headphones className="w-4 h-4 text-slate-600 shrink-0" />
                  <span className="font-semibold text-slate-900">{ticket.name}</span>
                  <span
                    className={`px-2 py-0.5 text-xs rounded ${
                      ticket.status === 'open'
                        ? 'bg-amber-100 text-amber-700'
                        : ticket.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {ticket.status === 'in_progress' ? 'In Progress' : ticket.status}
                  </span>
                  <span className="text-xs text-slate-500">
                    {CATEGORY_LABELS[ticket.category] || ticket.category} • {ticket.urgency}
                  </span>
                </div>
                <p className="text-slate-600 mt-1">
                  <a href={`tel:${ticket.phone}`} className="hover:text-[#E31B23] font-medium">
                    {ticket.phone}
                  </a>
                  {ticket.email && ` • ${ticket.email}`}
                </p>
                {ticket.message && (
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{ticket.message}</p>
                )}
                {ticket.preferredSlot && (
                  <p className="text-sm text-slate-500 mt-1">Preferred: {ticket.preferredSlot}</p>
                )}
                <p className="text-xs text-slate-400 mt-1">{formatDate(ticket.createdAt)}</p>
                {ticket.notes && (
                  <p className="text-sm text-slate-500 mt-2 italic">Notes: {ticket.notes}</p>
                )}
                {expandedId === ticket.id && (
                  <div className="mt-4 flex gap-2">
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                    />
                    <button
                      onClick={() => updateTicket(ticket.id, { notes })}
                      className="px-4 py-2 bg-[#E31B23] text-white rounded-lg hover:bg-[#C8161D]"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setExpandedId(null)
                        setNotes('')
                      }}
                      className="px-4 py-2 border border-slate-300 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={ticket.status}
                  onChange={(e) => updateTicket(ticket.id, { status: e.target.value })}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                <button
                  onClick={() => {
                    setExpandedId(expandedId === ticket.id ? null : ticket.id)
                    setNotes(ticket.notes || '')
                  }}
                  className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Notes
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            No tickets yet
          </div>
        )}
      </div>
    </div>
  )
}
