import { NextResponse } from 'next/server'
export async function POST() { return NextResponse.json({error:'Legacy reporting disabled in the local video MVP.'},{status:410}) }
