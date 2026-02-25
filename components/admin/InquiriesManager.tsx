'use client'

import { useState } from 'react'
import { Phone, Building2, Check, X } from 'lucide-react'
import type { Contact, Enterprise } from '@/types/db'

export function InquiriesManager({
  initialContacts,
  initialEnterprise,
}: {
  initialContacts: Contact[]
  initialEnterprise: Enterprise[]
}) {
  const [contacts, setContacts] = useState(initialContacts)
  const [enterprise, setEnterprise] = useState(initialEnterprise)
  const [tab, setTab] = useState<'contact' | 'enterprise'>('contact')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  const toggleContacted = async (
    type: 'contact' | 'enterprise',
    id: string,
    contacted: boolean
  ) => {
    const url =
      type === 'contact'
        ? `/api/inquiries/contact/${id}`
        : `/api/inquiries/enterprise/${id}`
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contacted }),
    })
    if (res.ok) {
      const updated = await res.json()
      if (type === 'contact') {
        setContacts((prev) => prev.map((c) => (c.id === id ? updated : c)))
      } else {
        setEnterprise((prev) => prev.map((e) => (e.id === id ? updated : e)))
      }
    }
  }

  const saveNotes = async (type: 'contact' | 'enterprise', id: string) => {
    const url =
      type === 'contact'
        ? `/api/inquiries/contact/${id}`
        : `/api/inquiries/enterprise/${id}`
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    })
    if (res.ok) {
      const updated = await res.json()
      if (type === 'contact') {
        setContacts((prev) => prev.map((c) => (c.id === id ? updated : c)))
      } else {
        setEnterprise((prev) => prev.map((e) => (e.id === id ? updated : e)))
      }
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

  const exportToCSV = (type: 'contact' | 'enterprise') => {
    const data = type === 'contact' ? contacts : enterprise
    if (data.length === 0) return

    const headers =
      type === 'contact'
        ? ['Date', 'Name', 'Phone', 'Email', 'Query Type', 'Message', 'Contacted']
        : ['Date', 'Company', 'Contact', 'Email', 'Phone', 'Quantity', 'Timeline', 'Contacted']
    const rows = data.map((item: Contact | Enterprise) => {
      if (type === 'contact') {
        const c = item as Contact
        return [formatDate(c.createdAt), c.name, c.phone, c.email || '', c.queryType, c.message, c.contacted ? 'Yes' : 'No']
      } else {
        const e = item as Enterprise
        return [formatDate(e.createdAt), e.companyName, e.contactPerson, e.email, e.phone, e.requiredQuantity, e.timeline, e.contacted ? 'Yes' : 'No']
      }
    })
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${type}-inquiries-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => setTab('contact')}
          className={`px-4 py-2 rounded-lg font-medium ${
            tab === 'contact' ? 'bg-energy-red text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Contact ({contacts.length})
        </button>
        <button
          onClick={() => setTab('enterprise')}
          className={`px-4 py-2 rounded-lg font-medium ${
            tab === 'enterprise' ? 'bg-energy-red text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Enterprise ({enterprise.length})
        </button>
        <button
          onClick={() => exportToCSV(tab)}
          className="ml-auto px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium"
        >
          Export CSV
        </button>
      </div>

      {tab === 'contact' && (
        <div className="space-y-4">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-700" />
                    <span className="font-semibold">{c.name}</span>
                    {c.contacted ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                        Contacted
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">
                    <a href={`tel:${c.phone}`} className="hover:text-energy-red">
                      {c.phone}
                    </a>
                    {c.email && ` • ${c.email}`}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {c.queryType} • {formatDate(c.createdAt)}
                  </p>
                  <p className="text-gray-700 mt-3">{c.message}</p>
                  {c.notes && (
                    <p className="text-sm text-gray-500 mt-2 italic">Notes: {c.notes}</p>
                  )}
                  {expandedId === c.id && (
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <button
                        onClick={() => saveNotes('contact', c.id)}
                        className="px-4 py-2 bg-energy-red text-white rounded-lg hover:bg-[#C8161D]"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setExpandedId(null)
                          setNotes('')
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleContacted('contact', c.id, !c.contacted)}
                    className={`p-2 rounded-lg font-medium ${
                      c.contacted ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                    }`}
                    title={c.contacted ? 'Mark uncontacted' : 'Mark contacted'}
                  >
                    {c.contacted ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setExpandedId(expandedId === c.id ? null : c.id)
                      setNotes(c.notes || '')
                    }}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                  >
                    Notes
                  </button>
                </div>
              </div>
            </div>
          ))}
          {contacts.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
              No contact inquiries yet
            </div>
          )}
        </div>
      )}

      {tab === 'enterprise' && (
        <div className="space-y-4">
          {enterprise.map((e) => (
            <div
              key={e.id}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-700" />
                    <span className="font-semibold">{e.companyName}</span>
                    {e.contacted ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                        Contacted
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">
                    {e.contactPerson} • {e.phone} • {e.email}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Qty: {e.requiredQuantity} • Timeline: {e.timeline} • {formatDate(e.createdAt)}
                  </p>
                  {e.comments && (
                    <p className="text-gray-700 mt-3">{e.comments}</p>
                  )}
                  {e.notes && (
                    <p className="text-sm text-gray-500 mt-2 italic">Notes: {e.notes}</p>
                  )}
                  {expandedId === e.id && (
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        value={notes}
                        onChange={(ev) => setNotes(ev.target.value)}
                        placeholder="Add notes..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <button
                        onClick={() => saveNotes('enterprise', e.id)}
                        className="px-4 py-2 bg-energy-red text-white rounded-lg hover:bg-[#C8161D]"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setExpandedId(null)
                          setNotes('')
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleContacted('enterprise', e.id, !e.contacted)}
                    className={`p-2 rounded-lg font-medium ${
                      e.contacted ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                    }`}
                    title={e.contacted ? 'Mark uncontacted' : 'Mark contacted'}
                  >
                    {e.contacted ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setExpandedId(expandedId === e.id ? null : e.id)
                      setNotes(e.notes || '')
                    }}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                  >
                    Notes
                  </button>
                </div>
              </div>
            </div>
          ))}
          {enterprise.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
              No enterprise leads yet
            </div>
          )}
        </div>
      )}
    </div>
  )
}
