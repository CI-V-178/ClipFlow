# ClipFlow MVP Dev Container

Windows / macOS / VS Code Web(Codespaces) で同一の開発環境を再現するための Dev Container 設定。

## 配置

`devcontainer.json` をリポジトリ直下の `.devcontainer/` に置く:

```
ClipFlow/
└── .devcontainer/
    └── devcontainer.json
```

## 構成の要点

| 項目 | 内容 | 理由 |
|---|---|---|
| ベース | `typescript-node:1-24-bookworm` (Node 24 LTS) | OS非依存でコンテナ内Linuxに統一 |
| パッケージマネージャ | pnpm (corepack経由) | ClipFlow既存の規約に合わせた |
| ポート | 3000 (Next.js dev) | 起動時に自動プレビュー |
| node_modules | 名前付きボリューム | Mac/WindowsのホストFSマウントの遅さを回避 |

## 使い方

### macOS
1. Docker Desktop もしくは OrbStack を起動
2. VS Code 拡張「Dev Containers」を入れる
3. リポジトリを開き `Reopen in Container`

### Windows
1. WSL2 + Docker Desktop を有効化
2. **リポジトリは WSL のLinuxFS側に置く**（`\\wsl$\...`）。WindowsFS上だとマウントが激遅になる
3. VS Code でリポジトリを開き `Reopen in Container`

### VS Code Web (GitHub Codespaces)
1. GitHub の対象リポジトリ → `Code` → `Codespaces` → `Create codespace`
2. 同じ `devcontainer.json` がクラウドで自動展開される（ローカルにDocker不要）
3. ブラウザのVS Codeでそのまま開発・プレビュー可能

> 注: 純粋な vscode.dev（計算環境なしのブラウザ単体）では Dev Container は動きません。コンテナ実行には Codespaces を使ってください。

## 初回起動時の挙動

- `node_modules` ボリュームを node ユーザー所有に変更
- corepack で pnpm を有効化
- `package.json` があれば `pnpm install`（lockfileがあれば `--frozen-lockfile`）
- まだ Next.js プロジェクト未作成なら、コンテナ内で初期化:
  ```bash
  pnpm create next-app@latest . --ts --eslint --tailwind --app
  ```

## カスタマイズの目安

- Node バージョン変更 → `image` のタグ（`1-24-bookworm`）を差し替え
- npm に戻す場合 → `postCreateCommand` を `npm ci || npm install` に、ボリューム名はそのままで可
- 追加の VS Code 拡張 → `customizations.vscode.extensions` に追記
