"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useSettings, GEMINI_MODELS } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ByoaiNotice } from "@/components/byoai-notice";

export default function SettingsPage() {
  const {
    apiKeys,
    setApiKey,
    removeApiKey,
    modelConfig,
    setModelConfig,
    isLoaded,
  } = useSettings();
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);

  function showSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function handleSaveKey() {
    if (draft.trim() === "") return;
    setApiKey("gemini", draft.trim());
    setDraft("");
    showSaved();
  }

  function handleModelChange(modelId: string) {
    setModelConfig({ ...modelConfig, gemini: modelId });
    showSaved();
  }

  const hasGemini = Boolean(apiKeys.gemini && apiKeys.gemini.trim() !== "");

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">設定</h1>
        {saved && <span className="text-sm text-green-600">保存しました</span>}
      </header>

      <ByoaiNotice />

      <Card>
        <CardHeader>
          <CardTitle>Gemini API キー</CardTitle>
          <CardDescription>
            キーはこのブラウザにのみ保存されます（BYOAI）。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gemini-key">APIキー</Label>
            <div className="flex gap-2">
              <Input
                id="gemini-key"
                type="password"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={hasGemini ? "保存済み（再入力で上書き）" : "AIza..."}
              />
              <Button onClick={handleSaveKey} disabled={!isLoaded}>
                保存
              </Button>
            </div>
            {hasGemini && (
              <button
                type="button"
                onClick={() => removeApiKey("gemini")}
                className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
              >
                <Trash2 className="size-3" />
                保存済みキーを削除
              </button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gemini-model">モデル</Label>
            <select
              id="gemini-model"
              value={modelConfig.gemini}
              onChange={(e) => handleModelChange(e.target.value)}
              className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              {GEMINI_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        APIキーは{" "}
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Google AI Studio
        </a>{" "}
        で取得できます。
      </p>
    </main>
  );
}
