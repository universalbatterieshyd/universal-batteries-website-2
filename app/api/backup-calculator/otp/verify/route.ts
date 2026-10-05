import { NextRequest, NextResponse } from 'next/server'
import {
  VERIFIED_COOKIE,
  VERIFIED_TTL_SECONDS,
  checkOtp,
  createVerifiedToken,
  normalizeIndianMobile,
} from '@/lib/backup-calculator/otp'

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json()
    const e164 = normalizeIndianMobile(phone)
    if (!e164) {
      return NextResponse.json({ error: 'Enter a valid 10-digit mobile number' }, { status: 400 })
    }

    const approved = await checkOtp(e164, String(code || '').trim())
    if (!approved) {
      return NextResponse.json({ error: 'That code is incorrect or expired' }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set(VERIFIED_COOKIE, createVerifiedToken(e164), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/backup-calculator',
      maxAge: VERIFIED_TTL_SECONDS,
    })
    return response
  } catch (err) {
    console.error('Backup calculator verify OTP error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
