import { NextRequest, NextResponse } from 'next/server'
import {
  isDevOtpMode,
  markOtpSent,
  normalizeIndianMobile,
  secondsUntilResendAllowed,
  sendOtp,
} from '@/lib/backup-calculator/otp'

export async function POST(request: NextRequest) {
  try {
    const { phone, website } = await request.json()
    if (website) return NextResponse.json({ success: true })

    const e164 = normalizeIndianMobile(phone)
    if (!e164) {
      return NextResponse.json({ error: 'Enter a valid 10-digit mobile number' }, { status: 400 })
    }

    const wait = secondsUntilResendAllowed(e164)
    if (wait > 0) {
      return NextResponse.json(
        { error: `Please wait ${wait}s before requesting another OTP`, retryAfter: wait },
        { status: 429 }
      )
    }

    const result = await sendOtp(e164)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 })
    }

    markOtpSent(e164)
    return NextResponse.json({ success: true, devMode: isDevOtpMode() })
  } catch (err) {
    console.error('Backup calculator send OTP error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
