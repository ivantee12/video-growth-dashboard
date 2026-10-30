import { NextResponse } from 'next/server'
export async function GET() { return NextResponse.json({error:'Legacy demo metrics disabled. Use CSV snapshots on the dashboard.'},{status:410}) }
