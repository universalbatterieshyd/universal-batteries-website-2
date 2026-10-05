import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Mobile OTP via Twilio Verify, plus a signed cookie proving the number was verified.
 * Without Twilio credentials in non-production, code DEV_OTP_CODE is accepted.
 */

export const VERIFIED_COOKIE = 'ub_backup_verified'
export const VERIFIED_TTL_SECONDS = 60 * 60 * 24
export const DEV_OTP_CODE = '123456'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID

export function isTwilioConfigured(): boolean {
  return Boolean(accountSid && authToken && verifyServiceSid)
}

export function isDevOtpMode(): boolean {
  return !isTwilioConfigured() && process.env.NODE_ENV !== 'production'
}

/** Accepts 10-digit Indian mobiles with optional +91 / 91 / 0 prefix. */
export function normalizeIndianMobile(raw: string): string | null {
  const digits = String(raw || '').replace(/\D/g, '')
  const local = digits.length === 12 && digits.startsWith('91')
    ? digits.slice(2)
    : digits.length === 11 && digits.startsWith('0')
      ? digits.slice(1)
      : digits
  return /^[6-9]\d{9}$/.test(local) ? `+91${local}` : null
}

async function twilioVerify(path: string, params: Record<string, string>) {
  const res = await fetch(`https://verify.twilio.com/v2/Services/${verifyServiceSid}/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params),
    cache: 'no-store',
  })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, data }
}

export async function sendOtp(phoneE164: string): Promise<{ ok: boolean; error?: string }> {
  if (isDevOtpMode()) return { ok: true }
  if (!isTwilioConfigured()) return { ok: false, error: 'OTP service is not configured' }

  const { ok, status, data } = await twilioVerify('Verifications', { To: phoneE164, Channel: 'sms' })
  if (ok) return { ok: true }
  console.error('Twilio send OTP failed:', status, data?.code, data?.message)
  if (status === 429 || data?.code === 60203) {
    return { ok: false, error: 'Too many attempts. Please wait a few minutes and try again.' }
  }
  return { ok: false, error: 'Could not send OTP. Please check the number and try again.' }
}

export async function checkOtp(phoneE164: string, code: string): Promise<boolean> {
  if (!/^\d{4,8}$/.test(code)) return false
  if (isDevOtpMode()) return code === DEV_OTP_CODE
  if (!isTwilioConfigured()) return false

  const { ok, data } = await twilioVerify('VerificationCheck', { To: phoneE164, Code: code })
  return ok && data?.status === 'approved'
}

function sessionSecret(): string {
  const secret = process.env.BACKUP_CALC_SESSION_SECRET
  if (secret) return secret
  if (process.env.NODE_ENV !== 'production') return 'dev-only-backup-calculator-secret'
  throw new Error('BACKUP_CALC_SESSION_SECRET is not set')
}

function sign(value: string): string {
  return createHmac('sha256', sessionSecret()).update(value).digest('base64url')
}

export function createVerifiedToken(phoneE164: string): string {
  const exp = Math.floor(Date.now() / 1000) + VERIFIED_TTL_SECONDS
  const body = Buffer.from(JSON.stringify({ phone: phoneE164, exp })).toString('base64url')
  return `${body}.${sign(body)}`
}

export function readVerifiedToken(token: string | undefined): { phone: string } | null {
  if (!token) return null
  const [body, signature] = token.split('.')
  if (!body || !signature) return null
  const expected = Buffer.from(sign(body))
  const given = Buffer.from(signature)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null
  try {
    const { phone, exp } = JSON.parse(Buffer.from(body, 'base64url').toString())
    if (typeof phone !== 'string' || typeof exp !== 'number') return null
    if (exp < Date.now() / 1000) return null
    return { phone }
  } catch {
    return null
  }
}

const lastSendByPhone = new Map<string, number>()
const RESEND_COOLDOWN_MS = 30_000

/** Best-effort per-instance throttle; Twilio Verify enforces its own per-number limits. */
export function secondsUntilResendAllowed(phoneE164: string): number {
  const last = lastSendByPhone.get(phoneE164)
  if (!last) return 0
  return Math.max(0, Math.ceil((last + RESEND_COOLDOWN_MS - Date.now()) / 1000))
}

export function markOtpSent(phoneE164: string): void {
  lastSendByPhone.set(phoneE164, Date.now())
}
