# AI運用ルール

## 三位一体の役割定義
|役割|担当|内容|
|--|--|--|
|**Human**|人間|要件定義、優先度調整、命名・Lint指導、Commit実行、CI/CD確認|
|**Gemini**|設計・検証AI|Design.md作成、コードレビュー、test.md作成、テスト分析、ドキュメント作成（DevLog.md, testReport.md, feature.json）|
|**Claude**|実装AI|Linear Task作成、実装、テスト実装、ドキュメント更新（CLAUDE.md, Obsidian）|

## 原則
- 判断は人間が行う
- AIは役割限定（設計判断禁止）
- 既存仕様を壊さない

## 禁止事項
- Claudeによる設計判断
- docs更新なしの仕様変更
- AI間の直接やり取り（必ず人間経由）
