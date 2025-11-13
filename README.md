# AI人狼 (Node.js サーバ)
# サーバ: Node.js + Express
# OpenAI: openai SDK (Chat Completions)
# フロント: 既存の `templete/index.html` をそのまま配信

## セットアップ
1) 依存をインストール

```pwsh
npm install
```

2) 環境変数を設定
- `.env.example` を参考に `.env` を作成し、`OPENAI_API_KEY` を設定

```env
OPENAI_API_KEY=sk-...
```

3) ローカル起動
```pwsh
npm start
```
- ブラウザで `http://localhost:3000/` を開く

## Render へのデプロイ
- リポジトリに `render.yaml` を含めています
- Render のダッシュボードで新規 Web Service を作成し、このリポジトリを指定
- 環境変数に `OPENAI_API_KEY` を設定
- 自動で `npm install` → `npm start` が実行されます

## API 仕様
- POST /api/chat
  - req: { "message": string }
  - res: { "reply": string }

Python 版の system プロンプトと同等の挙動を実装しています。