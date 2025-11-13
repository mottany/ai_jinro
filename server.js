import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import OpenAI from "openai";

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

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "あなたは人狼AIです。人間に扮して自然に会話します。",
        },
        { role: "user", content: userMessage },
      ],
    });

    const aiReply = completion.choices?.[0]?.message?.content ?? "";
    return res.json({ reply: aiReply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "OpenAI API error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
