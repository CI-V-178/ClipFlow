import { GeminiError } from "./gemini";

/**
 * モデル一覧の最新チェック (設定画面「モデルが最新かチェック」ボタン)
 *
 * BYOAI 原則に従い、ユーザーの API キーはブラウザから Google のエンドポイントへ
 * 直接送信し、ClipFlow のサーバーを経由させない。
 */

const LIST_MODELS_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models";

// ListModels は 1 リクエストの上限件数が pageSize で決まる。全件を確実に得るため最大値を指定する。
const MAX_PAGE_SIZE = "1000";

interface ListModelsResponse {
  models?: Array<{ name?: string; supportedGenerationMethods?: string[] }>;
  nextPageToken?: string;
}

export interface ModelCheckResult {
  /** API から取得した generateContent 対応 Gemini モデル ID 一覧 */
  available: string[];
  /** API にあるが静的リストに無い（新規追加の可能性） */
  added: string[];
  /** 静的リストにあるが API に無い（廃止・シャットダウンの可能性） */
  removed: string[];
  /** added も removed も無ければ true */
  upToDate: boolean;
  /** チェック実行時刻 (ISO8601) */
  checkedAt: string;
}

/**
 * ListModels を叩いて generateContent 対応の Gemini モデル ID を全件取得する。
 * ページネーション (nextPageToken) を辿って全ページを収集する。
 */
export async function fetchAvailableGeminiModels(
  apiKey: string
): Promise<string[]> {
  if (!apiKey || apiKey.trim() === "") {
    throw new GeminiError("Gemini API キーが設定されていません。");
  }

  const ids = new Set<string>();
  let pageToken: string | undefined;

  try {
    do {
      const url = new URL(LIST_MODELS_ENDPOINT);
      url.searchParams.set("key", apiKey);
      url.searchParams.set("pageSize", MAX_PAGE_SIZE);
      if (pageToken) url.searchParams.set("pageToken", pageToken);

      const res = await fetch(url.toString());
      if (!res.ok) {
        if (res.status === 400 || res.status === 401 || res.status === 403) {
          throw new GeminiError(
            "APIキーが無効か、権限がありません。キーを確認してください。"
          );
        }
        throw new GeminiError(
          `モデル一覧の取得に失敗しました (HTTP ${res.status})。`
        );
      }

      const data = (await res.json()) as ListModelsResponse;
      for (const m of data.models ?? []) {
        const id = m.name?.replace(/^models\//, "");
        if (!id) continue;
        // 静的リストは Gemini のテキスト生成モデルのみを対象とするため、
        // 埋め込み/画像/gemma 等の別系統や generateContent 非対応を除外してノイズを避ける。
        if (!id.startsWith("gemini-")) continue;
        if (!m.supportedGenerationMethods?.includes("generateContent")) continue;
        ids.add(id);
      }

      pageToken = data.nextPageToken;
    } while (pageToken);
  } catch (err) {
    if (err instanceof GeminiError) throw err;
    throw new GeminiError(
      "モデル一覧の取得中にエラーが発生しました。通信状況を確認してください。",
      err
    );
  }

  return Array.from(ids).sort();
}

/** API 実在モデルと静的リストの差分を算出する純粋関数。 */
export function compareModelList(
  available: string[],
  known: string[]
): Pick<ModelCheckResult, "added" | "removed" | "upToDate"> {
  const availableSet = new Set(available);
  const knownSet = new Set(known);
  const added = available.filter((id) => !knownSet.has(id)).sort();
  const removed = known.filter((id) => !availableSet.has(id)).sort();
  return { added, removed, upToDate: added.length === 0 && removed.length === 0 };
}

/** モデル一覧の取得と差分比較をまとめて実行する。 */
export async function checkGeminiModelFreshness(
  apiKey: string,
  knownIds: string[]
): Promise<ModelCheckResult> {
  const available = await fetchAvailableGeminiModels(apiKey);
  const { added, removed, upToDate } = compareModelList(available, knownIds);
  return { available, added, removed, upToDate, checkedAt: new Date().toISOString() };
}
