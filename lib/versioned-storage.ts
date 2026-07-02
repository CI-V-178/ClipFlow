/**
 * バージョン付き localStorage ユーティリティ（陳腐化ガード）
 *
 * 保存データにスキーマバージョンを埋め込み、読み込み時にバージョン不一致・破損を
 * 検出したら安全に破棄して初期状態へフォールバックする。
 * 将来の機能拡張で設定を追加・変更する際も、この関数経由で保存/読込すれば
 * 一貫した陳腐化ガードが効く。
 */

// 保存フォーマット or 設定スキーマを変更したら必ず +1 する。
// 旧バージョンの保存データは読み込み時に破棄され、各ストアの既定値へ戻る。
export const SETTINGS_SCHEMA_VERSION = 1;

interface VersionedRecord<T> {
  version: number;
  data: T;
}

function isVersionedRecord(value: unknown): value is VersionedRecord<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    "data" in value
  );
}

/**
 * バージョン付きで localStorage から読み込む。
 * キー無し / JSON 不正 / バージョン不一致 / 形式不正 のいずれでも fallback を返す。
 * 陳腐化・破損データは副作用として削除し、次回以降クリーンな状態にする。
 */
export function loadVersioned<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  let raw: string | null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return fallback;
  }
  if (!raw) return fallback;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      !isVersionedRecord(parsed) ||
      parsed.version !== SETTINGS_SCHEMA_VERSION
    ) {
      // 旧スキーマ or 破損 or バージョン不一致。安全のため破棄して初期状態へ戻す。
      localStorage.removeItem(key);
      return fallback;
    }
    return parsed.data as T;
  } catch {
    // JSON パース失敗も破損とみなして破棄する。
    try {
      localStorage.removeItem(key);
    } catch {
      /* noop: removeItem 自体の失敗は握りつぶす */
    }
    return fallback;
  }
}

/** バージョン付きで localStorage へ保存する。 */
export function saveVersioned<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    const record: VersionedRecord<T> = {
      version: SETTINGS_SCHEMA_VERSION,
      data,
    };
    localStorage.setItem(key, JSON.stringify(record));
  } catch (error) {
    console.error(`Failed to save "${key}" to localStorage:`, error);
  }
}
