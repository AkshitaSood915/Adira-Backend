import "dotenv/config";
import express from "express";
import cors from "cors";
import { retrieve } from "./rag/knowledgeBase.js";
import { generateAnswer } from "./services/openai.js";

const app = express();
const allowed = (process.env.CLIENT_ORIGIN || "http://localhost:3000").split(",").map(x => x.trim());
app.use(cors({ origin: allowed.includes("*") ? true : allowed }));
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => res.json({ message: "Adira Node.js backend is running", runtime: "nodejs" }));
app.get("/health", (_req, res) => res.json({ ok: true }));

app.post(["/", "/api/chat"], async (req, res) => {
  try {
    const query = String(req.body?.query ?? req.body?.QUERY ?? "").trim();
    if (!query) return res.status(400).json({ error: 'No "query" found in request body' });

    const lower = query.toLowerCase();
    const fixed = lower === "bye" ? "Good Bye" :
      ["thank you","thankyou","thanks"].includes(lower) ? "You're welcome" :
      ["hello","hi","namaste","satsriyakal"].includes(lower) ? "Namaste! How can I help you?" : null;

    const passages = fixed ? [] : retrieve(query, 5);
    const message = fixed || await generateAnswer(query, passages);
    res.json({ message, RESULT: message, sources: passages.map(p => ({ score: Number(p.score.toFixed(4)), text: p.text })) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to process the request." });
  }
});

const port = Number(process.env.PORT || 5000);
app.listen(port, () => console.log(`Adira backend running on http://localhost:${port}`));
