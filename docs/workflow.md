# 開発ワークフロー

## フェーズ1: 要件定義
1. **Human**: `docs/requirements.md` に要件を記載
2. **Gemini**: `prompts/gemini/create_design.md` に基づき `Design.md` を作成
3. **Claude**: `prompts/claude/create_linear_task.md` に基づき Linear Task を作成
4. **Human**: Linear上でTask優先度・親子関係を調整

## フェーズ2: 実装
5. **Claude**: 実装開始
6. **Claude**: 実装完了後、Task status を "gemini review" に変更
7. **Gemini**: `prompts/gemini/code_review.md` に基づき実装をレビュー
8. **Claude**: レビュー指摘を反映
9. **Claude**: Task status を "human review" に変更
10. **Human**: 命名・構成・Lintを確認し指示
11. **Claude**: 人間の指示を反映
12. **Gemini**: `DevLog.md` を更新

## フェーズ3: テスト
13. **Gemini**: `prompts/gemini/create_test_plan.md` に基づき `test.md` を作成
14. **Claude**: Task status を "test" に変更
15. **Claude**: `prompts/claude/test_implement.md` に基づきテストを実装・実行
16. **Gemini**: カバレッジと評価を実施

### テスト失敗時
17. **Gemini**: `prompts/gemini/analyze_failure.md` に基づき原因を推察
18. **Human**: import/構成修正を指示
19. **Claude**: 修正を実装
20. → フェーズ2に戻る

### テスト成功時
21. **Gemini**: `prompts/gemini/create_test_report.md` に基づき `testReport.md` を作成
22. **Human**: Commit実行

## フェーズ4: CI/CD
23. **Human**: CI/CD結果を確認

### 修正必要時
24. **Gemini**: 修正指示を整理
25. **Claude**: 修正を実装
26. → フェーズ2に戻る

### 問題なし時
27. → 引継ぎフェーズへ

## フェーズ5: 引継ぎ
28. **Claude**: `prompts/claude/handover.md` に基づき `CLAUDE.md` を更新
29. **Claude**: Obsidian Vaultを更新
30. **Claude**: Task status を "done" に変更
31. **Gemini**: `prompts/gemini/update_feature_json.md` に基づき `feature.json` を更新
32. **Human**: 最終Commit実行

## 注意事項
- AI間の直接やり取りは禁止（必ず人間経由）
- 各フェーズで適切なプロンプトファイルを参照すること
- Task statusは必ず正しく更新すること
