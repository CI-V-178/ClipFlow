import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ClipCandidate } from "@/types";
import { buildClipCandidatePrompt } from "@/lib/prompts/clip-candidate";

export interface GeminiClientConfig {
  apiKey: string;
  model?: string;
}

export interface GeminiClient {
  /** 任意のプロンプトでテキスト生成（低レベル） */
  generateContent(prompt: string): Promise<string>;
  /** 書き起こし → 切り抜き候補配列 (Issue #7) */
  analyzeTranscript(transcript: string): Promise<ClipCandidate[]>;
}

const DEFAULT_MODEL = "gemini-2.0-flash";

/** API 失敗を UI 側で判別しやすくするためのエラー型 (Issue #11) */
export class GeminiError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "GeminiError";
  }
}

/** レスポンスからマークダウンのコードフェンスを除去して JSON 文字列を取り出す */
function stripCodeFence(text: string): string {
  let s = text.trim();
  if (s.startsWith("```json")) s = s.slice(7);
  else if (s.startsWith("```")) s = s.slice(3);
  if (s.endsWith("```")) s = s.slice(0, -3);
  return s.trim();
}

export function createGeminiClient(config: GeminiClientConfig): GeminiClient {
  if (!config.apiKey || config.apiKey.trim() === "") {
    throw new GeminiError("Gemini API キーが設定されていません。");
  }
  const genAI = new GoogleGenerativeAI(config.apiKey);
  const modelName = config.model ?? DEFAULT_MODEL;

  async function generateContent(prompt: string): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      // 原因切り分けのため、SDK/HTTP の実エラー内容を必ず表面化する。
      // 例: "[404] models/xxx is not found" / "[400] API key not valid"
      console.error("Gemini generateContent failed:", err);
      const detail = err instanceof Error ? err.message : String(err);
      throw new GeminiError(
        `Gemini API リクエストに失敗しました: ${detail}（APIキー・モデル名・通信状況を確認してください）`,
        err
      );
    }
  }

  async function analyzeTranscript(transcript: string): Promise<ClipCandidate[]> {
    if (!transcript || transcript.trim() === "") {
      throw new GeminiError("書き起こしテキストが空です。");
    }
    const response = await generateContent(buildClipCandidatePrompt(transcript));
    const jsonString = stripCodeFence(response);
    try {
      const parsed = JSON.parse(jsonString) as ClipCandidate[];
      if (!Array.isArray(parsed)) {
        throw new Error("配列ではありません");
      }
      return parsed;
    } catch (err) {
      throw new GeminiError(
        "AIの応答を切り抜き候補として解析できませんでした。もう一度お試しください。",
        err
      );
    }
  }

  return { generateContent, analyzeTranscript };
}

/**
 * 導通確認: 設定中の API キー・モデルで generateContent を1回だけ実行し、
 * 実際に生成処理が行えるかを検証する。成功時は解決、失敗時は GeminiError を投げる。
 * キー・モデル・通信のいずれに問題があっても generateContent 側で GeminiError 化される。
 */
export async function testGeminiConnection(
  config: GeminiClientConfig
): Promise<void> {
  const client = createGeminiClient(config);
  // トークン消費を抑えるための最小プロンプト。応答内容自体は問わない。
  const text = await client.generateContent("ping");
  if (!text || text.trim() === "") {
    throw new GeminiError(
      "API から空の応答が返りました。モデル設定を確認してください。"
    );
  }
}
