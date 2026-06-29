"use client";

import { useState, useEffect, useCallback } from "react";
import type { ApiKeys } from "@/types";

const API_KEYS_STORAGE_KEY = "clipflow-api-keys";
const MODEL_CONFIG_STORAGE_KEY = "clipflow-model-config";

type ApiKeyName = keyof ApiKeys;

export interface ModelConfig {
  gemini: string;
}

// 利用可能な Gemini モデル
export const GEMINI_MODELS = [
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (推奨)" },
  { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" },
];

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  gemini: "gemini-2.0-flash",
};

interface UseSettingsReturn {
  apiKeys: ApiKeys;
  setApiKey: (key: ApiKeyName, value: string) => void;
  removeApiKey: (key: ApiKeyName) => void;
  clearAllKeys: () => void;
  hasKey: (key: ApiKeyName) => boolean;
  modelConfig: ModelConfig;
  setModelConfig: (config: ModelConfig) => void;
  isLoaded: boolean;
}

/**
 * LocalStorage を使用した設定管理フック (Issue #5)
 * BYOAI: Gemini API キーはブラウザにのみ保存され、サーバーへ送信されない。
 */
export function useSettings(): UseSettingsReturn {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({});
  const [modelConfig, setModelConfigState] = useState<ModelConfig>(DEFAULT_MODEL_CONFIG);
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

  return {
    apiKeys,
    setApiKey,
    removeApiKey,
    clearAllKeys,
    hasKey,
    modelConfig,
    setModelConfig,
    isLoaded,
  };
}
