import { useEffect, useState } from 'react'

type IpcStatus = 'pending' | 'ok' | 'error'

type Indicator = {
  color: string
  label: string
}

function StatusBar(): React.JSX.Element {
  const [status, setStatus] = useState<IpcStatus>('pending')
  const [reply, setReply] = useState<string>('')

  // 起動時に一度だけ Main の生存確認を行い、結果を常時表示する
  useEffect(() => {
    let active = true
    window.api
      .ping()
      .then((res) => {
        if (!active) return
        setReply(res)
        setStatus('ok')
      })
      .catch(() => {
        if (!active) return
        setStatus('error')
      })
    return () => {
      active = false
    }
  }, [])

  const indicator: Indicator = (
    {
      pending: { color: 'bg-amber-400', label: '接続確認中…' },
      ok: { color: 'bg-emerald-400', label: `Main 応答: ${reply}` },
      error: { color: 'bg-red-500', label: 'Main 未応答' }
    } as const
  )[status]

  return (
    <footer className="flex h-7 items-center justify-between border-t border-app-border bg-app-surface px-4 text-xs text-app-muted">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${indicator.color}`} />
        <span>IPC: {indicator.label}</span>
      </div>
      <span>ClipFlow v0.1.0</span>
    </footer>
  )
}

export default StatusBar
