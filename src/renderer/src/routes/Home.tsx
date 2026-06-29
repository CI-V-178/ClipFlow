import { useState } from 'react'

function Home(): React.JSX.Element {
  const [reply, setReply] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePing = async (): Promise<void> => {
    setError(null)
    try {
      const res = await window.api.ping()
      setReply(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-semibold tracking-tight">ようこそ</h2>
      <p className="mt-2 text-app-muted">
        ClipFlow は AI を利用して動画制作 (配信切り抜き、ショート、オリジナル動画) を支援する
        ローカルファースト型のデスクトップアプリです。
      </p>

      <section className="mt-8 rounded-lg border border-app-border bg-app-surface p-6">
        <h3 className="text-sm font-medium text-app-muted">IPC 疎通テスト</h3>
        <p className="mt-1 text-xs text-app-muted">
          Renderer → preload (contextBridge) → main → preload → Renderer の往復が成立すれば
          &quot;pong&quot; が返ります。
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handlePing}
            className="rounded-md bg-app-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-app-accent-hover"
          >
            ping を送信
          </button>
          {reply && (
            <span className="rounded-md bg-emerald-500/15 px-3 py-1 text-sm text-emerald-300">
              応答: {reply}
            </span>
          )}
          {error && (
            <span className="rounded-md bg-red-500/15 px-3 py-1 text-sm text-red-300">
              エラー: {error}
            </span>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
