import type { NextRequest } from 'next/server'
export function isLocalWrite(request: NextRequest) {
  try {
    const origin = new URL(request.headers.get('origin') ?? '')
    return ['127.0.0.1', 'localhost', '[::1]'].includes(origin.hostname)
      && origin.host === request.headers.get('host') && origin.protocol === request.nextUrl.protocol
  } catch { return false }
}
