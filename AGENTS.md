# AGENTS.md (ClipFlow)

このファイルは、Codex（実装AI）が ClipFlow に対して行った実装内容を、
次回以降のセッションで理解できるように記録するものです。

---

## 最新の実装 (2026-06-07)

### 実装した機能
**PRIDEV-272: プロジェクト基盤（Electron + Web UI）の構築**

- Electron + React + TypeScript + Vite (electron-vite テンプレ) による初期プロジェクトセットアップ
- preload (`contextBridge`) 経由の IPC 双方向疎通（`window.api.ping()` → `'pong'`）
- React Router v6 (HashRouter) + AppShell レイアウト（Sidebar / メインコンテンツ / StatusBar）
- Tailwind CSS v4 によるダーク基調のベース UI
- `pnpm dev` で Electron アプリが起動し、UI 表示・IPC 疎通が確認できる状態

### 変更したファイル

#### 新規 (テンプレ由来をベースに調整)
- `package.json`: `clipflow@0.1.0` に書き換え。author/homepage を CI-V-178 / GitHub URL に更新
- `electron.vite.config.ts`: `@tailwindcss/vite` プラグインを `renderer.plugins` に追加
- `eslint.config.mjs`: `.remember/**` を ESLint 対象外に追加
- `.gitignore`: テンプレ内容と既存 Python 系ignore (`.venv/`, `__pycache__/`) をマージ
- `src/main/index.ts`: 既存 `ipcMain.on('ping')` を `ipcMain.handle('app:ping', () => 'pong')` に置換（双方向化）
- `src/preload/index.ts`: `api.ping` を追加し `AppApi` 型をエクスポート
- `src/preload/index.d.ts`: 旧 `api: unknown` を `AppApi` に置き換え
- `src/renderer/index.html`: `<title>Electron>` → `<title>ClipFlow</title>`
- `src/renderer/src/main.tsx`: そのまま (`./assets/main.css` 経由で Tailwind ロード)
- `src/renderer/src/assets/main.css`: `@import 'tailwindcss';` と `@theme` カスタムトークン (`--color-app-*`)

#### 新規実装
- `src/renderer/src/App.tsx`: HashRouter + Routes 定義 (`/`, `/projects`, 不明パスは `/` へリダイレクト)
- `src/renderer/src/components/AppShell.tsx`: 上段 (Sidebar + main `<Outlet/>`)、下段 StatusBar の flex column レイアウト
- `src/renderer/src/components/Sidebar.tsx`: NavLink ベースのサイドナビ (ホーム / プロジェクト)
- `src/renderer/src/components/StatusBar.tsx`: 起動時に `window.api.ping()` を呼び、結果を色付きインジケータで常時表示
- `src/renderer/src/routes/Home.tsx`: 紹介文 + IPC 疎通テスト用ボタン (応答 / エラーをバッジ表示)
- `src/renderer/src/routes/Projects.tsx`: プレースホルダ画面 (specification.md §3.1 の予告)

#### 削除
- `src/renderer/src/assets/base.css`: Tailwind preflight に統合
- `src/renderer/src/assets/electron.svg`, `wavy-lines.svg`: テンプレ装飾画像 (未使用)
- `src/renderer/src/components/Versions.tsx`: テンプレ既定の Versions 表示 (未使用)

### 重要な実装上の判断

1. **electron-vite テンプレ採用**
   - 指示書 Step 2 の `main / preload / renderer` 分離が標準構成として備わっている
   - electron-forge より構成が薄く、Vite ネイティブに近い

2. **Tailwind CSS v4 + `@tailwindcss/vite`**
   - `tailwind.config.js` 不要、CSS 内の `@theme` でデザイントークン (`--color-app-*`) を定義
   - これにより `bg-app-bg` / `text-app-text` / `bg-app-accent` など ClipFlow 固有のユーティリティクラスが自動生成される

3. **HashRouter を採用**
   - Electron は `file://` 起動なので BrowserRouter だと初期パスが file URL と衝突する
   - HashRouter は fragment 識別子なのでローカルファイル起動でも安全に動作

4. **IPC は `invoke / handle` パターン**
   - テンプレ既定の `ipcMain.on('ping') / ipcRenderer.send('ping')` は片方向 → 指示書の「メッセージを送り返答を受け取る」を満たせない
   - `ipcMain.handle('app:ping', () => 'pong')` と `ipcRenderer.invoke('app:ping')` で Promise ベースの双方向疎通に変更
   - チャネル名は `app:ping` のように **ドメイン:アクション** プレフィックスを付け、将来の機能追加 (`project:create`, `media:scan` 等) と衝突しないように設計

5. **`window.electron` を Renderer から直接触らせない方針**
   - preload で `api` (`{ ping }`) を contextBridge で公開、Renderer は **`window.api.*` 経由のみ** で main 機能を呼ぶ
   - `AppApi` 型を preload からエクスポートして `index.d.ts` に流し込むことで、preload を単一の真実の源 (single source of truth) にする

6. **`name` フィールド命名**
   - `clipflow` (kebab-case, npm 標準) を採用
   - スコープ付き (`@civ178/clipflow`) は私的配布なので不要と判断

### 注意すべきポイント

1. **`electron-winstaller` のビルドスクリプト警告**
   - `pnpm install` 時に "Ignored build scripts: electron-winstaller@5.4.0" の警告が出る
   - macOS 開発時は問題なし。Windows ビルド時に `pnpm approve-builds` で承認が必要

2. **`.remember/` 配下のファイルは ESLint 対象外**
   - `eslint.config.mjs` の `ignores` に `.remember/**` を追加済み
   - memory 用の一時 TS ファイル (`.remember/tmp/last-ndc.ts`) で lint が失敗する問題を回避

3. **ベースカラーは `@theme` 経由で定義**
   - 色を変えたいときは `src/renderer/src/assets/main.css` の `@theme` ブロックを編集
   - `--color-app-bg` 等を変えると Tailwind ユーティリティ (`bg-app-bg` 等) にも即時反映

4. **未追跡ファイルが多数残っている**
   - 本実装で生成された `src/`, `package.json`, `pnpm-lock.yaml` 等はまだコミットされていない
   - 次回コミットでまとめてステージング予定 (人間のレビュー後)

### 動作確認

- `pnpm typecheck`: PASS (node / web 両方)
- `pnpm lint`: PASS (`.remember/**` を ignore に追加後)
- `pnpm dev`:
  - vite が main / preload を本番モードでビルド成功
  - renderer dev サーバーが `http://localhost:5173/` で起動 (`HTTP 200`)
  - System Events 上で `Electron` プロセスを確認 → ウィンドウ表示

### 関連ドキュメント

- `docs/task-to-AGENTS.md`: 本実装の指示書 (PRIDEV-272)
- `docs/specification.md`: システム全体仕様 (§3.1 〜 §3.7 が今後の実装対象)
- `docs/architecture.md`: 現状テンプレのまま (本実装で確定したスタックを将来反映する必要あり)
- `prompts/Codex/implement.md`: Codex 実装ロール定義
- `prompts/Codex/handover.md`: 本ファイルのフォーマット指示
- Linear Task: PRIDEV-272 (本実装では未作成 / Status 変更未実施 — テンプレ系初期構築のため)

### 今後の展開

1. `docs/architecture.md` を本実装でセットアップしたスタックで具体化 (Gemini の責務)
2. specification.md §3.1 「プロジェクト管理機能」の実装着手
3. SQLite (better-sqlite3 or sqlite3) を main プロセス側に追加し、`api.project.*` 形式の IPC を整備
4. AI プロバイダー抽象化レイヤー (`api.ai.*`) の設計 (specification.md §3.7)
5. ffmpeg 連携の抽象化 (specification.md §2 のインフラ層方針に従う)

---

## 過去の実装履歴

（今後の実装がここに追記されます）
