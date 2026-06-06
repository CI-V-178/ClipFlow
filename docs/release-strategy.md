# リリース計画

## Phase 0 : 設計・基盤構築

期間目安：
1〜2週間

目的：
開発基盤の安定化

対象：

- Electron + Next.js 構築
- SQLite構築
- Prisma導入
- ffmpeg wrapper作成
- AI provider abstraction作成
- project構造定義
- JSON schema定義

完了条件：

- Windowsで起動可能
- Mac開発環境で動作可能
- project作成可能

---

# Phase 1 : MVP

期間目安：
2〜4週間

目的：
動画制作補助として最低限利用可能にする

対象：

- 動画登録
- Whisper字幕生成
- AIタイトル生成
- AI概要欄生成
- タグ生成
- ショート候補抽出
- AI結果保存
- 字幕JSON保存

対象外：

- 自動編集
- 自動投稿
- Remotion
- Davinci連携

完了条件：

- 実際の配信切り抜き制作で利用可能
- project管理可能
- AI候補が再利用可能

---

# Phase 2 : 実運用改善

期間目安：
2〜6週間

目的：
制作効率改善

対象：

- 字幕修正UI
- AI prompt管理
- AI履歴管理
- project検索
- candidate比較
- export改善
- cache改善
- queue管理

完了条件：

- 毎日利用可能
- 長時間動画運用可能
- AIコスト抑制可能

---

# Phase 3 : Community Preview

目的：
外部利用テスト

対象：

- GitHub公開
- OSS core公開
- issue template作成
- plugin interface公開
- ドキュメント整備

完了条件：

- 他ユーザー利用可能
- issue収集可能
- workflow改善可能

---

# Phase 4 : Monetize

目的：
収益化

対象：

- Pro workflow
- 高品質prompt pack
- template pack
- Remotion template
- 商用利用改善
- UI polish

販売想定：

- BOOTH
- Gumroad
- note

完了条件：

- 初回売上発生
- 継続利用ユーザー発生

---

# Phase 5 : Advanced Automation

目的：
半自動制作

対象：

- Remotion integration
- template render
- structured animation
- short auto generation

対象外：

- 完全自動編集
- AI完全自律制作

完了条件：

- 半自動ショート生成可能
- 制作時間短縮確認

---

# 長期計画

## 将来候補

- NAS native support
- Web management UI
- Cloud sync
- Team workflow
- Resolve exporter
- Premiere exporter

---

# 優先順位

最優先：

1. project管理
2. 字幕生成
3. AI候補生成
4. タイトル生成

後回し：

- 編集ソフト制御
- 自動投稿
- 完全自動編集
- SaaS化

# Business Plan 事業計画

## 概要

本プロジェクトはAIを利用して動画制作を支援するローカルファースト型ツールを提供する。

対象：

- 配信切り抜き
- VTuber
- ゲーム実況
- ショート動画運用
- 個人動画制作者

目的：

- 制作速度向上
- 切り抜き候補抽出
- AIによる下書き支援
- 制作管理効率化

---

# 市場課題

既存AI動画サービスは：

- 自動編集偏重
- SaaS偏重
- 英語圏中心
- 日本語切り抜き文化との乖離

がある。

特に：

- 長時間配信
- 切り抜き管理
- ショート候補管理
- タイトル量産

への最適化が不足している。

---

# 差別化

本ツールは：

- ローカルファースト
- 日本語配信切り抜き特化
- AI補助型
- 編集ソフト非依存
- workflow重視

を特徴とする。

AIによる完全自動化ではなく、

「AI下書き + 人間最終判断」

を前提とする。

---

# 提供価値

## 主価値

「切り抜き制作速度向上」

---

## 副次価値

- AIタイトル生成
- AI概要欄生成
- ショート候補抽出
- project管理
- AI履歴管理

---

# 収益化戦略

## 初期

無料配布

目的：

- workflow検証
- 実運用改善
- ユーザーヒアリング

---

# 中期

Open Core モデル

## OSS部分

- core engine
- project schema
- plugin interface
- provider abstraction

---

## 有料部分

- 高品質prompt
- template pack
- workflow pack
- Remotion template
- 高品質analysis

---

# 販売チャネル

- BOOTH
- Gumroad
- note
- GitHub Sponsors

---

# 想定顧客

## primary

- VTuber切り抜き師
- 小規模YouTuber
- 配信編集者

---

## secondary

- ショート動画運用者
- SNS運用者
- 動画マーケター

---

# 競合

競合：

- Adobe
- Descript
- CapCut
- AI動画SaaS

---

# 競争戦略

真正面競争は行わない。

以下に特化：

- 日本語切り抜き
- workflow支援
- local first
- AI下書き支援

---

# 開発戦略

## Phase 1

MVP

目的：

- 自分で毎日使える状態

---

## Phase 2

community preview

目的：

- 実利用者フィードバック収集

---

## Phase 3

monetize

目的：

- workflow pack販売
- template販売

---

# リスク

## 技術リスク

- AI provider仕様変更
- API価格変更
- Windows差異
- ffmpeg依存

---

## 事業リスク

- AI動画市場競争激化
- SaaS大手参入
- AIコスト高騰

---

# リスク対策

- provider abstraction
- local first
- OSS core
- plugin architecture
- software non dependency

---

# 長期展望

最終目標：

「動画制作OS」

以下を一元化する：

- project管理
- AI解析
- 字幕設計
- ショート化
- workflow管理
- template生成

---

# 現時点で対象外

- 完全自動編集
- AI完全自律制作
- 動画生成AI
- SaaS全面移行
