import { NextResponse } from 'next/server'
export async function GET() { return NextResponse.json({error:'Legacy cron disabled. Scheduled collection is not implemented.'},{status:410}) }
