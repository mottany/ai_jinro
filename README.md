# AI人狼 (Node.js サーバ)
## サーバ: Node.js + Express
## AIモデル: Gemini API (`@google/generative-ai`)
## フロント: 既存の `templete/index.html` をそのまま配信

## セットアップ
1) 依存をインストール

```pwsh
npm install
```

2) 環境変数を設定
- `.env.example` を参考に `.env` を作成し、`GEMINI_API_KEY` を設定

```env
GEMINI_API_KEY=AIzaSy...
AI_MODEL=gemini-2.5-flash   # 省略可。未設定ならデフォルト
```

3) ローカル起動
```pwsh
npm start
```
- ブラウザで `http://localhost:3000/` を開く

## Render へのデプロイ
- リポジトリに `render.yaml` を含めています
- Render のダッシュボードで Web Service を作成し、このリポジトリを指定
- 環境変数を設定
  - `GEMINI_API_KEY`
  - 任意で `AI_MODEL` (例: `gemini-2.5-flash`)
- 自動で `npm install` → `npm start` が実行されます

## API 仕様
- POST /api/chat
  - req: { "message": string }
  - res: { "reply": string }

Gemini を用いて同様の system プロンプト（人狼AIとして自然に会話）を適用しています。