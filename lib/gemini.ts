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
      throw new GeminiError(
        "Gemini API リクエストに失敗しました。APIキー・モデル名・通信状況を確認してください。",
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
