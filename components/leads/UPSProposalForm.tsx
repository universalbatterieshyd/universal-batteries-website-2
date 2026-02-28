'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type UPSProposalFormProps = {
  source?: 'office' | 'factory'
}

export function UPSProposalForm({ source = 'office' }: UPSProposalFormProps) {
  const [orgType, setOrgType] = useState('')
  const [loadEstimate, setLoadEstimate] = useState('')
  const [backupHours, setBackupHours] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [comments, setComments] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || !name) return
    setStatus('loading')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          area: undefined,
          type: 'ups_proposal',
          source: source === 'factory' ? 'factory' : 'office',
          payload: {
            name,
            email,
            orgType,
            loadEstimate,
            backupHours,
            comments,
          },
          website: '',
        }),
      })
      const data = await res.json()
      if (data.success) {
        setStatus('success')
        setName('')
        setPhone('')
        setEmail('')
        setOrgType('')
        setLoadEstimate('')
        setBackupHours('')
        setComments('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone *</Label>
        <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Organization type</Label>
        <Select value={orgType} onValueChange={setOrgType}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="office">Office</SelectItem>
            <SelectItem value="clinic">Clinic</SelectItem>
            <SelectItem value="datacentre">Datacentre</SelectItem>
            <SelectItem value="factory">Factory</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="load">Approx. load (VA/kVA)</Label>
          <Input
            id="load"
            placeholder="e.g. 2 kVA"
            value={loadEstimate}
            onChange={(e) => setLoadEstimate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="backup">Backup needed (hours)</Label>
          <Select value={backupHours} onValueChange={setBackupHours}>
            <SelectTrigger id="backup">
              <SelectValue placeholder="Select" />
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
      </div>
      <div className="space-y-2">
        <Label htmlFor="comments">Additional details</Label>
        <Textarea
          id="comments"
          rows={3}
          placeholder="Servers, biomedical equipment, etc."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
      </div>
      {status === 'success' && (
        <p className="text-sm text-green-600 dark:text-green-400">We&apos;ll get back with a proposal soon.</p>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">Something went wrong. Please try again.</p>
      )}
      <Button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Submitting...' : 'Request proposal'}
      </Button>
    </form>
  )
}
