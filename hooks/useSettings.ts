"use client";

import { useState, useEffect, useCallback } from "react";
import type { ApiKeys } from "@/types";

const API_KEYS_STORAGE_KEY = "clipflow-api-keys";
const MODEL_CONFIG_STORAGE_KEY = "clipflow-model-config";
// 「モデルが最新かチェック」で検出し、ユーザーが select に追加したモデル ID。
// 静的な GEMINI_MODELS はソースコードのため、実行時に追加した分はここへ永続化する。
const CUSTOM_MODELS_STORAGE_KEY = "clipflow-custom-models";

type ApiKeyName = keyof ApiKeys;

export interface ModelConfig {
  gemini: string;
}

// 利用可能な Gemini モデル
// 出典: https://ai.google.dev/gemini-api/docs/models (最終確認 2026-07-02)
// 注意: Gemini 2.0 / 1.5 系は既に公式でシャットダウン済みのため掲載しない。
//       プレビュー版 (gemini-3.1-pro-preview 等) は ID が変動/消滅しうるため安定運用の観点で除外。
export const GEMINI_MODELS = [
  { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash (推奨)" },
  { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
  { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite" },
];

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  gemini: "gemini-3.5-flash",
};

interface UseSettingsReturn {
  apiKeys: ApiKeys;
  setApiKey: (key: ApiKeyName, value: string) => void;
  removeApiKey: (key: ApiKeyName) => void;
  clearAllKeys: () => void;
  hasKey: (key: ApiKeyName) => boolean;
  modelConfig: ModelConfig;
  setModelConfig: (config: ModelConfig) => void;
  /** ユーザーが追加したモデル ID（静的 GEMINI_MODELS には含まれない） */
  customModels: string[];
  /** 検出した新規モデルを select に追加する（重複・静的リスト掲載済みは無視） */
  addCustomModel: (id: string) => void;
  isLoaded: boolean;
}

const STATIC_MODEL_IDS = new Set(GEMINI_MODELS.map((m) => m.id));

/**
 * LocalStorage を使用した設定管理フック (Issue #5)
 * BYOAI: Gemini API キーはブラウザにのみ保存され、サーバーへ送信されない。
 */
export function useSettings(): UseSettingsReturn {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({});
  const [modelConfig, setModelConfigState] = useState<ModelConfig>(DEFAULT_MODEL_CONFIG);
  const [customModels, setCustomModels] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // マウント時に LocalStorage(外部ストア) から状態をハイドレーションする正当な同期処理。
    // SSR とのハイドレーション不整合を避けるため effect 内で読む必要がある。
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const storedKeys = localStorage.getItem(API_KEYS_STORAGE_KEY);
      if (storedKeys) setApiKeys(JSON.parse(storedKeys) as ApiKeys);

      const storedModel = localStorage.getItem(MODEL_CONFIG_STORAGE_KEY);
      if (storedModel) setModelConfigState(JSON.parse(storedModel) as ModelConfig);

      const storedCustom = localStorage.getItem(CUSTOM_MODELS_STORAGE_KEY);
      if (storedCustom) {
        const parsed = JSON.parse(storedCustom) as string[];
        // 静的リストに後から取り込まれた ID は重複するため除外する。
        if (Array.isArray(parsed)) {
          setCustomModels(parsed.filter((id) => !STATIC_MODEL_IDS.has(id)));
        }
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const saveApiKeysToStorage = useCallback((keys: ApiKeys) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
    } catch (error) {
      console.error("Failed to save API keys to localStorage:", error);
    }
  }, []);

  const setApiKey = useCallback(
    (key: ApiKeyName, value: string) => {
      setApiKeys((prev) => {
        const updated = { ...prev, [key]: value };
        saveApiKeysToStorage(updated);
        return updated;
      });
    },
    [saveApiKeysToStorage]
  );

  const removeApiKey = useCallback(
    (key: ApiKeyName) => {
      setApiKeys((prev) => {
        const updated = { ...prev };
        delete updated[key];
        saveApiKeysToStorage(updated);
        return updated;
      });
    },
    [saveApiKeysToStorage]
  );

  const clearAllKeys = useCallback(() => {
    setApiKeys({});
    if (typeof window !== "undefined") {
      localStorage.removeItem(API_KEYS_STORAGE_KEY);
    }
  }, []);

  const hasKey = useCallback(
    (key: ApiKeyName) => Boolean(apiKeys[key] && apiKeys[key]!.trim() !== ""),
    [apiKeys]
  );

  const setModelConfig = useCallback((config: ModelConfig) => {
    setModelConfigState(config);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(MODEL_CONFIG_STORAGE_KEY, JSON.stringify(config));
      } catch (error) {
        console.error("Failed to save model config to localStorage:", error);
      }
    }
  }, []);

  const addCustomModel = useCallback((id: string) => {
    const trimmed = id.trim();
    if (trimmed === "" || STATIC_MODEL_IDS.has(trimmed)) return;
    setCustomModels((prev) => {
      if (prev.includes(trimmed)) return prev;
      const updated = [...prev, trimmed];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(CUSTOM_MODELS_STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
          console.error("Failed to save custom models to localStorage:", error);
        }
      }
      return updated;
    });
  }, []);

  return {
    apiKeys,
    setApiKey,
    removeApiKey,
    clearAllKeys,
    hasKey,
    modelConfig,
    setModelConfig,
    customModels,
    addCustomModel,
    isLoaded,
  };
}
