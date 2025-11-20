import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templateDir = path.join(__dirname, "templete");

app.get("/", (_req, res) => {
  res.sendFile(path.join(templateDir, "index.html"));
});

app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body?.message || "";
    if (!userMessage) {
      return res.status(400).json({ error: "'message' is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not set" });
    }

    const modelName = process.env.AI_MODEL || "gemini-2.5-flash"; // 必要なら他モデルへ変更
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const systemPrompt = "あなたは人狼AIです。人間に扮して自然に会話します。";
    // Geminiは1つのテキストpromptで送る（会話履歴管理は後で拡張可能）
    const prompt = `${systemPrompt}\n\nユーザー: ${userMessage}`;

    const result = await model.generateContent(prompt);
    const aiReply = result?.response?.text() || "";
    return res.json({ reply: aiReply });
  } catch (err) {
    console.error(err);
    // レートやクォータ系エラー簡易判定
    const message = (err?.message || "Gemini API error").toLowerCase();
    if (message.includes("quota") || message.includes("rate") || message.includes("limit")) {
      return res.json({ reply: "ただいまAIが混み合っています。時間をおいて再試行してください。" });
    }
    return res.status(500).json({ error: "Gemini API error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
