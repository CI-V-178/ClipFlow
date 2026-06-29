"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings, Loader2 } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { createGeminiClient, GeminiError } from "@/lib/gemini";
import type { ClipCandidate } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ByoaiNotice } from "@/components/byoai-notice";

function formatSec(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "--:--";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function HomePage() {
  const { apiKeys, modelConfig, hasKey, isLoaded } = useSettings();
  const [transcript, setTranscript] = useState("");
  const [candidates, setCandidates] = useState<ClipCandidate[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const keyReady = isLoaded && hasKey("gemini");

  async function handleAnalyze() {
    setError(null);
    setCandidates(null);

    if (!keyReady) {
      setError("先に設定画面で Gemini API キーを登録してください。");
      return;
    }
    if (transcript.trim() === "") {
      setError("書き起こしテキストを入力してください。");
      return;
    }

    setLoading(true);
    try {
      const client = createGeminiClient({
        apiKey: apiKeys.gemini!,
        model: modelConfig.gemini,
      });
      const result = await client.analyzeTranscript(transcript);
      setCandidates(result);
    } catch (err) {
      // Issue #11: API失敗のハンドリング
      setError(
        err instanceof GeminiError
          ? err.message
          : "予期しないエラーが発生しました。"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ClipFlow</h1>
          <p className="text-sm text-muted-foreground">
            書き起こしから切り抜き候補を提案します（提案のみ・編集は行いません）
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/settings">
            <Settings className="size-4" />
            設定
          </Link>
        </Button>
      </header>

      <ByoaiNotice />

      {isLoaded && !hasKey("gemini") && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
          Gemini API キーが未設定です。{" "}
          <Link href="/settings" className="font-medium underline">
            設定画面
          </Link>
          で登録してください。
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>書き起こしを入力</CardTitle>
          <CardDescription>
            動画の文字起こし（タイムスタンプ付きでも可）を貼り付けてください。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="transcript" className="sr-only">
            書き起こし
          </Label>
          <Textarea
            id="transcript"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="例) 00:00 みなさんこんにちは… 03:12 ここで衝撃の展開が…"
            className="min-h-48"
          />
          <div className="flex items-center gap-3">
            <Button onClick={handleAnalyze} disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? "解析中…" : "切り抜き候補を抽出"}
            </Button>
            <span className="text-xs text-muted-foreground">
              {transcript.length} 文字
            </span>
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      {candidates && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            切り抜き候補（{candidates.length}件）
          </h2>
          {candidates.length === 0 && (
            <p className="text-sm text-muted-foreground">
              候補が見つかりませんでした。入力内容を変えて再試行してください。
            </p>
          )}
          {candidates.map((c, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-base">{c.title}</CardTitle>
                <CardDescription>
                  {formatSec(c.startSec)} – {formatSec(c.endSec)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{c.reason}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
}
