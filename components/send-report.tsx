'use client'

import { useState } from 'react'
import { Send, Printer, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export function SendReport() {
  const [slack, setSlack] = useState<Status>('idle')
  const [discord, setDiscord] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  async function send(channel: 'slack' | 'discord') {
    const setter = channel === 'slack' ? setSlack : setDiscord
    setter('sending')
    setError(null)
    try {
      const res = await fetch('/api/report/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'failed')
      setter('sent')
      setTimeout(() => setter('idle'), 3000)
    } catch (err) {
      setter('error')
      setError(String(err))
      setTimeout(() => setter('idle'), 4000)
    }
  }

  function StatusIcon({ s }: { s: Status }) {
    if (s === 'sent') return <CheckCircle2 className="h-4 w-4" />
    if (s === 'error') return <XCircle className="h-4 w-4" />
    return <Send className="h-4 w-4" />
  }

  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <Button variant="secondary" onClick={() => window.print()}>
        <Printer className="h-4 w-4" /> Print / save as PDF
      </Button>
      <Button onClick={() => send('slack')} disabled={slack === 'sending'}>
        <StatusIcon s={slack} />
        {slack === 'sending' ? 'Sending…' : slack === 'sent' ? 'Sent to Slack' : 'Send to Slack'}
      </Button>
      <Button variant="secondary" onClick={() => send('discord')} disabled={discord === 'sending'}>
        <StatusIcon s={discord} />
        {discord === 'sending' ? 'Sending…' : discord === 'sent' ? 'Sent to Discord' : 'Send to Discord'}
      </Button>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  )
}
