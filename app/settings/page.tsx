"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, RefreshCw, Loader2, Plus, Zap } from "lucide-react";
import { useSettings, GEMINI_MODELS } from "@/hooks/useSettings";
import {
  checkGeminiModelFreshness,
  testGeminiConnection,
  type ModelCheckResult,
} from "@/lib";
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
    customModels,
    addCustomModel,
    isLoaded,
  } = useSettings();

  // select には静的リストとユーザーが追加したモデルを合わせて表示する。
  const selectableModels = [
    ...GEMINI_MODELS,
    ...customModels.map((id) => ({ id, name: `${id} (追加)` })),
  ];
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<ModelCheckResult | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testOk, setTestOk] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  function showSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  async function handleCheckModels() {
    if (!apiKeys.gemini) return;
    setChecking(true);
    setCheckError(null);
    setCheckResult(null);
    try {
      // 既に追加済みのモデルを「新規」として再検出しないよう、静的リスト＋追加分を既知集合とする。
      const result = await checkGeminiModelFreshness(apiKeys.gemini, [
        ...GEMINI_MODELS.map((m) => m.id),
        ...customModels,
      ]);
      setCheckResult(result);
    } catch (err) {
      setCheckError(
        err instanceof Error ? err.message : "モデルチェックに失敗しました。"
      );
    } finally {
      setChecking(false);
    }
  }

  async function handleTestConnection() {
    if (!apiKeys.gemini) return;
    setTesting(true);
    setTestError(null);
    setTestOk(false);
    try {
      await testGeminiConnection({
        apiKey: apiKeys.gemini,
        model: modelConfig.gemini,
      });
      setTestOk(true);
    } catch (err) {
      setTestError(
        err instanceof Error ? err.message : "導通確認に失敗しました。"
      );
    } finally {
      setTesting(false);
    }
  }

  function handleSaveKey() {
    if (draft.trim() === "") return;
    setApiKey("gemini", draft.trim());
    setDraft("");
    showSaved();
  }

  function handleModelChange(modelId: string) {
    setModelConfig({ ...modelConfig, gemini: modelId });
    // モデルが変われば直前の導通結果は無効になるためクリアする。
    setTestOk(false);
    setTestError(null);
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
              {selectableModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            <div className="space-y-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={!hasGemini || testing}
              >
                {testing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Zap className="size-4" />
                )}
                導通確認
              </Button>

              {!hasGemini && (
                <p className="text-xs text-muted-foreground">
                  導通確認には保存済みの API キーが必要です。
                </p>
              )}

              {testError && (
                <p className="text-xs text-destructive">{testError}</p>
              )}

              {testOk && (
                <p className="text-xs text-green-600">
                  ✓ 導通OK：選択中モデルで生成処理を確認しました。
                </p>
              )}
            </div>

            <div className="space-y-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCheckModels}
                disabled={!hasGemini || checking}
              >
                {checking ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                モデルが最新かチェック
              </Button>

              {!hasGemini && (
                <p className="text-xs text-muted-foreground">
                  チェックには保存済みの API キーが必要です。
                </p>
              )}

              {checkError && (
                <p className="text-xs text-destructive">{checkError}</p>
              )}

              {checkResult && (
                <div className="space-y-2 rounded-md border p-3 text-xs">
                  {checkResult.upToDate ? (
                    <p className="text-green-600">
                      ✓ モデル一覧は最新です（API で {checkResult.available.length}{" "}
                      モデルを確認）。
                    </p>
                  ) : (
                    <>
                      {checkResult.added.length > 0 && (
                        <div>
                          <p className="font-medium text-amber-600">
                            API に新しいモデルがあります（一覧未掲載）:
                          </p>
                          <ul className="mt-1 space-y-1">
                            {checkResult.added.map((id) => {
                              const isAdded = customModels.includes(id);
                              return (
                                <li
                                  key={id}
                                  className="flex items-center justify-between gap-2"
                                >
                                  <span>{id}</span>
                                  {isAdded ? (
                                    <span className="text-green-600">
                                      追加済み
                                    </span>
                                  ) : (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => addCustomModel(id)}
                                    >
                                      <Plus className="size-3" />
                                      追加
                                    </Button>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                      {checkResult.removed.length > 0 && (
                        <div>
                          <p className="font-medium text-destructive">
                            一覧のモデルが API に存在しません（廃止の可能性）:
                          </p>
                          <ul className="ml-4 list-disc">
                            {checkResult.removed.map((id) => (
                              <li key={id}>{id}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p className="text-muted-foreground">
                        ※ 一覧の更新には hooks/useSettings.ts の修正が必要です。
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
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
