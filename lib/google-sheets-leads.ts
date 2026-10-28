/**
 * Send lead data to Google Sheets via Google Apps Script Web App.
 * Most leads go to the "Leads" tab. Backup calculator leads go to a
 * separate "Power Backup Calculator" tab in the same spreadsheet.
 */

export type LeadSource =
  | 'contact'
  | 'enterprise'
  | 'battery_finder'
  | 'ups_proposal'
  | 'solar_enquiry'
  | 'power_backup_wizard'
  | 'backup_calculator'
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

export type BackupCalculatorSheetPayload = {
  timestamp?: string
  name?: string
  phone: string
  useCase: string
  backupHours: number
  connectedWatts: number
  runningWatts: number
  peakWatts?: number
  systemType: string
  inverterVa: number
  batteryAh: number
  totalBatteries: number
  bankVoltage: number
  estimatedBackupHours: number
  needsSurvey: boolean
  appliancesSummary: string
  notes?: string
  extra?: string
}

/** Flatten lead to row for the main Leads sheet */
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

function backupCalculatorToRow(payload: BackupCalculatorSheetPayload): string[] {
  const ts = payload.timestamp || new Date().toISOString()
  return [
    ts,
    payload.name || '',
    payload.phone || '',
    payload.useCase || '',
    String(payload.backupHours ?? ''),
    String(payload.connectedWatts ?? ''),
    String(payload.runningWatts ?? ''),
    String(payload.peakWatts ?? ''),
    payload.systemType || '',
    String(payload.inverterVa ?? ''),
    String(payload.batteryAh ?? ''),
    String(payload.totalBatteries ?? ''),
    String(payload.bankVoltage ?? ''),
    String(payload.estimatedBackupHours ?? ''),
    payload.needsSurvey ? 'Yes' : 'No',
    payload.appliancesSummary || '',
    payload.notes || '',
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

export const BACKUP_CALC_HEADERS = [
  'Timestamp',
  'Name',
  'Phone',
  'Use Case',
  'Backup Hours',
  'Connected Load (W)',
  'Running Load (W)',
  'Peak / Surge (W)',
  'System Type',
  'Inverter VA',
  'Battery Ah',
  'Battery Count',
  'Bank Voltage',
  'Estimated Hours',
  'Needs Survey',
  'Appliances',
  'Notes',
  'Extra',
]

async function postToSheets(body: Record<string, unknown>): Promise<boolean> {
  const url = process.env.GOOGLE_SHEETS_WEB_APP_URL
  if (!url) return false

  try {
    const securityKey = process.env.GOOGLE_SHEETS_SECURITY_KEY
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: securityKey, ...body }),
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

export async function sendLeadToGoogleSheets(payload: LeadPayload): Promise<boolean> {
  return postToSheets({
    action: 'append_lead',
    row: leadToRow(payload),
    source: payload.source,
  })
}

/** Append a row to the Power Backup Calculator tab in the same spreadsheet. */
export async function sendBackupCalculatorToGoogleSheets(
  payload: BackupCalculatorSheetPayload
): Promise<boolean> {
  const tab =
    process.env.GOOGLE_SHEETS_BACKUP_CALC_TAB?.trim() || 'Power Backup Calculator'
  return postToSheets({
    action: 'append_backup_calculator',
    sheetName: tab,
    row: backupCalculatorToRow(payload),
    source: 'backup_calculator',
  })
}
