import { Info } from "lucide-react";

/**
 * BYOAI 告知・料金免責 (Issue #9 / #10)
 * - APIキーはブラウザにのみ保存（サーバー送信なし）
 * - AI利用料はユーザー自身のGeminiアカウントに課金される旨の免責
 */
export function ByoaiNotice() {
  return (
    <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
      <div className="flex gap-2">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        <div className="space-y-1">
          <p className="font-medium text-foreground">
            BYOAI（自分のAPIキーを使う方式）について
          </p>
          <p>
            入力された Gemini API キーはお使いのブラウザ（LocalStorage）にのみ保存され、
            ClipFlow のサーバーへ送信・保存されることはありません。
          </p>
          <p>
            AI の利用料金はあなた自身の Google / Gemini アカウントに直接課金されます。
            料金体系・無料枠は各提供元の規約に従います。ClipFlow は料金について一切の責任を負いません。
          </p>
        </div>
      </div>
    </div>
  );
}
