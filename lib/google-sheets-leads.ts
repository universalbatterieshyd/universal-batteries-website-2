/**
 * Send lead data to a single Google Sheet via Google Apps Script Web App.
 * All lead types (contact, enterprise, battery_finder, ups_proposal, solar, etc.)
 * go to one sheet with a "Source" column and flexible attribution columns.
 */

export type LeadSource =
  | 'contact'
  | 'enterprise'
  | 'battery_finder'
  | 'ups_proposal'
  | 'solar_enquiry'
  | 'power_backup_wizard'
  | 'general'

export type LeadPayload = {
  source: LeadSource
  timestamp?: string
  /** Contact name or primary contact */
  name?: string
  phone?: string
  email?: string
  /** Contact form */
  queryType?: string
  message?: string
  /** Enterprise */
  companyName?: string
  contactPerson?: string
  requiredQuantity?: string
  timeline?: string
  comments?: string
  /** Battery finder */
  vehicleBrand?: string
  vehicleModel?: string
  vehicleVariant?: string
  /** Power backup / UPS */
  loadWatts?: number
  totalWatts?: number
  backupHours?: number
  upsType?: string
  /** Solar */
  roofType?: string
  roofArea?: string
  monthlyBill?: string
  /** Any extra data as JSON string */
  extra?: string
}

/** Flatten lead to row for Google Sheet - single tab with all attribution columns */
function leadToRow(payload: LeadPayload): string[] {
  const ts = payload.timestamp || new Date().toISOString()
  return [
    ts,
    payload.source,
    payload.name || '',
    payload.phone || '',
    payload.email || '',
    payload.queryType || '',
    payload.message || '',
    payload.companyName || '',
    payload.contactPerson || '',
    payload.requiredQuantity || '',
    payload.timeline || '',
    payload.comments || '',
    payload.vehicleBrand || '',
    payload.vehicleModel || '',
    payload.vehicleVariant || '',
    String(payload.loadWatts ?? payload.totalWatts ?? ''),
    String(payload.backupHours ?? ''),
    payload.upsType || '',
    payload.roofType || '',
    payload.roofArea || '',
    payload.monthlyBill || '',
    payload.extra || '',
  ]
}

/** Header row for the Leads sheet */
export const LEADS_HEADERS = [
  'Timestamp',
  'Source',
  'Name',
  'Phone',
  'Email',
  'Query Type',
  'Message',
  'Company',
  'Contact Person',
  'Quantity',
  'Timeline',
  'Comments',
  'Vehicle Brand',
  'Vehicle Model',
  'Vehicle Variant',
  'Load (W)',
  'Backup Hours',
  'UPS Type',
  'Roof Type',
  'Roof Area',
  'Monthly Bill',
  'Extra',
]

export async function sendLeadToGoogleSheets(payload: LeadPayload): Promise<boolean> {
  const url = process.env.GOOGLE_SHEETS_WEB_APP_URL
  if (!url || url === '') {
    return false
  }

  try {
    const row = leadToRow(payload)
    const securityKey = process.env.GOOGLE_SHEETS_SECURITY_KEY

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: securityKey,
        action: 'append_lead',
        row,
        source: payload.source,
      }),
    })

    if (!res.ok) {
      console.error('Google Sheets lead error:', res.status, await res.text())
      return false
    }

    const data = await res.json()
    if (data?.ok !== true) {
      console.error('Google Sheets lead error:', data)
      return false
    }

    return true
  } catch (err) {
    console.error('Google Sheets lead error:', err)
    return false
  }
}
