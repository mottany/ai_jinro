import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Server as SocketIOServer } from "socket.io";

dotenv.config();

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templateDir = path.join(__dirname, "templete");
// 静的ファイル配信（CSS/JS）
app.use(express.static(templateDir));

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

// ---- Socket.io セットアップ ----
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  // ルーム参加
  socket.on("join", ({ room, user }) => {
    if (!room) return;
    socket.join(room);
    socket.data.user = user || `user-${socket.id.slice(0,5)}`;
    io.to(room).emit("system", `${socket.data.user} が参加しました`);
  });

  // 通常チャット
  socket.on("chat", async ({ room, message }) => {
    if (!room || !message) return;
    const user = socket.data.user || "unknown";
    // /ai で始まる場合はAIへ問い合わせ
    if (message.startsWith("/ai")) {
      const prompt = message.replace(/^\/ai\s*/, "").trim();
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        const modelName = process.env.AI_MODEL || "gemini-1.5-flash";
        if (!apiKey) {
          io.to(room).emit("chat", { user: "AI", message: "APIキー未設定です" });
          return;
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });
        const systemPrompt = "あなたは人狼AIです。人間に扮して自然に会話します。";
        const fullPrompt = `${systemPrompt}\n\nユーザー(${user}): ${prompt}`;
        const result = await model.generateContent(fullPrompt);
        const aiReply = result?.response?.text() || "";
        io.to(room).emit("chat", { user: "AI", message: aiReply });
      } catch (err) {
        console.error(err);
        io.to(room).emit("chat", { user: "AI", message: "AI応答エラーが発生しました" });
      }
    } else {
      io.to(room).emit("chat", { user, message });
    }
  });

  socket.on("disconnect", () => {
    // 参加していたルーム全部に通知
    const user = socket.data.user;
    const rooms = [...socket.rooms].filter(r => r !== socket.id);
    rooms.forEach(r => io.to(r).emit("system", `${user || 'user'} が離脱しました`));
  });
});

const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
