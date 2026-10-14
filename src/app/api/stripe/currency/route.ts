import { NextRequest, NextResponse } from 'next/server'
import { detectCurrency } from '@/src/lib/stripe'

export async function GET(req: NextRequest) {
  return NextResponse.json({ currency: detectCurrency(req.headers) })
}
