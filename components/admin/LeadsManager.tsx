'use client'

import { useState } from 'react'
import { Phone, Battery, Building2, Sun, Check, X } from 'lucide-react'
import type { Lead } from '@/app/admin/leads/page'

const TYPE_LABELS: Record<string, string> = {
  battery_finder: 'Battery Finder',
  ups_proposal: 'UPS Proposal',
  power_backup_wizard: 'Power Backup',
  solar_enquiry: 'Solar Enquiry',
  contact: 'Contact',
  enterprise: 'Enterprise',
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  battery_finder: Battery,
  ups_proposal: Building2,
  power_backup_wizard: Building2,
  solar_enquiry: Sun,
  contact: Phone,
  enterprise: Building2,
}

export function LeadsManager({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads)
  const [filter, setFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  const filtered =
    filter === 'all'
      ? leads
      : filter === 'high_priority'
        ? leads.filter((l) => (l.score ?? 0) >= 70)
        : leads.filter((l) => l.type === filter || l.source === filter)

  const updateLead = async (id: string, updates: { status?: string; notes?: string }) => {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (res.ok) {
      const updated = await res.json()
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...updated, createdAt: updated.created_at } : l))
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

  const payloadSummary = (p: Record<string, unknown>) => {
    const parts: string[] = []
    if (p.vehicleBrand) parts.push(`${p.vehicleBrand} ${p.vehicleModel || ''}`.trim())
    if (p.name) parts.push(String(p.name))
    if (p.orgType) parts.push(String(p.orgType))
    if (p.loadEstimate) parts.push(`${p.loadEstimate} load`)
    if (p.totalWatts) parts.push(`${p.totalWatts}W`)
    if (p.backupHours) parts.push(`${p.backupHours}hr backup`)
    if (p.recommendedVa) parts.push(`~${p.recommendedVa} VA`)
    if (p.roofType) parts.push(`${p.roofType} roof`)
    if (p.solarType) parts.push(p.solarType === 'on_grid' ? 'On-grid' : 'Off-grid')
    return parts.join(' • ') || '-'
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium text-sm ${
            filter === 'all' ? 'bg-[#E31B23] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All ({leads.length})
        </button>
        <button
          onClick={() => setFilter('high_priority')}
          className={`px-4 py-2 rounded-lg font-medium text-sm ${
            filter === 'high_priority' ? 'bg-[#E31B23] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          High priority ({leads.filter((l) => (l.score ?? 0) >= 70).length})
        </button>
        {Object.entries(TYPE_LABELS).map(([key, label]) => {
          const count = leads.filter((l) => l.type === key || l.source === key).length
          if (count === 0) return null
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                filter === key ? 'bg-[#E31B23] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label} ({count})
            </button>
          )
        })}
      </div>

      <div className="space-y-4">
        {filtered.map((lead) => {
          const Icon = TYPE_ICONS[lead.type] || Phone
          return (
            <div
              key={lead.id}
              className="rounded-xl border border-slate-200 p-6 bg-white"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Icon className="w-4 h-4 text-slate-600 shrink-0" />
                    <span className="font-semibold text-slate-900">
                      {TYPE_LABELS[lead.source] || TYPE_LABELS[lead.type] || lead.type}
                    </span>
                    {(lead.score ?? 0) >= 70 && (
                      <span className="px-2 py-0.5 text-xs rounded bg-amber-100 text-amber-800 font-medium">
                        Score {lead.score}
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${
                        lead.status === 'new'
                          ? 'bg-amber-100 text-amber-700'
                          : lead.status === 'contacted'
                            ? 'bg-blue-100 text-blue-700'
                            : lead.status === 'qualified'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">
                    <a href={`tel:${lead.phone}`} className="hover:text-[#E31B23] font-medium">
                      {lead.phone}
                    </a>
                    {lead.area && ` • ${lead.area}`}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {payloadSummary(lead.payload)} • {formatDate(lead.createdAt)}
                  </p>
                  {lead.notes && (
                    <p className="text-sm text-slate-500 mt-2 italic">Notes: {lead.notes}</p>
                  )}
                  {expandedId === lead.id && (
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes..."
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                      />
                      <button
                        onClick={() => updateLead(lead.id, { notes })}
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
                    value={lead.status}
                    onChange={(e) => updateLead(lead.id, { status: e.target.value })}
                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button
                    onClick={() =>
                      updateLead(lead.id, {
                        status: lead.status === 'contacted' ? 'new' : 'contacted',
                      })
                    }
                    className={`p-2 rounded-lg ${
                      lead.status === 'contacted' ? 'bg-slate-100 text-slate-600' : 'bg-green-100 text-green-700'
                    }`}
                    title={lead.status === 'contacted' ? 'Mark new' : 'Mark contacted'}
                  >
                    {lead.status === 'contacted' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setExpandedId(expandedId === lead.id ? null : lead.id)
                      setNotes(lead.notes || '')
                    }}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                  >
                    Notes
                  </button>
                </div>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            No leads yet
          </div>
        )}
      </div>
    </div>
  )
}
