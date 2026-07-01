# 変更ログ

## 2026-07-01: Electron 資材の削除（Next.js 作り直しに伴う整理）

### 概要
アプリを Next.js (Web) 構成へ作り直す方針（`reCreateApp` ブランチ）に伴い、旧構成である Electron 関連資材を一括削除しました。Next.js アプリ本体（`app/` `components/` `lib/` `hooks/` `types/`）は既に Electron 資材から分離されており（`tsconfig.json` の `exclude` 済み）、削除後も型検査・Lint に影響がないことを確認済みです。

### 実施内容
- **削除した資材**
  - Electron ソース: `src/`（`main/` `preload/` `renderer/`）
  - パッケージング資材: `build/`（`icon.icns/.ico/.png`, `entitlements.mac.plist`）, `resources/icon.png`
  - ビルド設定: `electron-builder.yml`, `electron.vite.config.ts`, `tsconfig.node.json`, `tsconfig.web.json`
  - デバッグ設定: `.vscode/launch.json`（electron-vite 用）
  - ビルド成果物: `out/main/`, `out/preload/`
- **修正した資材**
  - `tsconfig.json`: `exclude` から不要になった `src`/`out`/`build`/`electron.vite.config.ts` を除去
  - `pnpm-lock.yaml`: `pnpm install` で再生成し、`electron-builder`/`electron-vite`/`vite` 等を依存グラフから除去
- **検証**: `pnpm typecheck` ✅ / `pnpm lint` ✅

### 未対応（今後の対応事項）
- `README.md` の「An Electron application with React and TypeScript」の記述が現状と矛盾（更新未実施）
- `AGENTS.md` / `CLAUDE.md` に PRIDEV-272（Electron 基盤構築）の実装履歴が残存（履歴ログとして保持）
- 変更は未コミット（人間のレビュー後にステージ済み内容をコミット予定）

## 2026-06-07: 【PRIDEV-272】 プロジェクト基盤の構築 (Electron + React)

### 概要
AI動画制作支援デスクトップアプリケーション「ClipFlow」の第一歩として、基盤となるアプリケーションアーキテクチャの構築を完了しました。
今後のポートフォリオ展示やテックブログでの発信を見据え、モダンでスケーラブルな技術スタックを採用するとともに、セキュリティと関心の分離（Separation of Concerns）を意識した層分離アーキテクチャを導入しています。

### 詳細・技術的ハイライト
- **モダンな開発環境のセットアップ**
  Electron + React + TypeScript + Vite を組み合わせた高速な開発環境を構築。各種静的解析（ESLint, Prettier）も導入し、コード品質を維持する土台を整えました。
- **セキュアなIPC通信アーキテクチャ**
  ElectronのRendererプロセスからNode.js APIへの直接アクセスを遮断（Context Isolation有効化）。`preload.ts` および `contextBridge` を介して、メインプロセスとUIプロセス間のAPIを厳密に定義・公開するセキュアな設計（Ping-Pong疎通で実証済み）を実現しています。
- **拡張性を考慮したUI設計（アプリケーションシェル）**
  React Routerを利用したルーティング基盤を導入し、サイドバー、メインエリア、ステータスバーといった基本レイアウト（AppShell）をコンポーネント化。今後の機能追加（DB連携、AI解析結果の表示など）をシームレスに行えるUI基盤を完成させました。
