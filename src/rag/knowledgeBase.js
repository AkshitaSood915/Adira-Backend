import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, "../../data/combined_text.txt");

const stopWords = new Set(["the","a","an","and","or","of","to","in","is","are","was","were","be","been","for","on","with","as","at","by","from","that","this","it","i","you","your","my","we","they","their","what","which","who","how","can","could","would","should","do","does","did"]);

function tokenize(text) {
  return (text.toLowerCase().match(/[a-z0-9]+/g) || []).filter(w => w.length > 1 && !stopWords.has(w));
}

function chunkText(text, maxWords = 180, overlap = 35) {
  const paragraphs = text.replace(/\r/g, "").split(/\n\s*\n/).map(x => x.trim()).filter(Boolean);
  const chunks = [];
  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/);
    if (words.length <= maxWords) { chunks.push(paragraph); continue; }
    for (let i = 0; i < words.length; i += maxWords - overlap) {
      chunks.push(words.slice(i, i + maxWords).join(" "));
      if (i + maxWords >= words.length) break;
    }
  }
  return chunks;
}

const raw = fs.readFileSync(DATA_PATH, "utf8");
const chunks = chunkText(raw);
const tokenized = chunks.map(tokenize);
const documentFrequency = new Map();
for (const tokens of tokenized) {
  for (const word of new Set(tokens)) documentFrequency.set(word, (documentFrequency.get(word) || 0) + 1);
}

function vector(tokens) {
  const counts = new Map();
  for (const word of tokens) counts.set(word, (counts.get(word) || 0) + 1);
  const v = new Map();
  for (const [word, count] of counts) {
    const tf = count / Math.max(tokens.length, 1);
    const idf = Math.log((chunks.length + 1) / ((documentFrequency.get(word) || 0) + 1)) + 1;
    v.set(word, tf * idf);
  }
  return v;
}

const chunkVectors = tokenized.map(vector);
function cosine(a, b) {
  let dot = 0, aa = 0, bb = 0;
  for (const value of a.values()) aa += value * value;
  for (const value of b.values()) bb += value * value;
  for (const [key, value] of a) dot += value * (b.get(key) || 0);
  return dot / ((Math.sqrt(aa) * Math.sqrt(bb)) || 1);
}

export function retrieve(query, topK = 5) {
  const q = vector(tokenize(query));
  return chunks.map((text, i) => ({ text, score: cosine(q, chunkVectors[i]) }))
    .sort((a,b) => b.score - a.score).slice(0, topK).filter(x => x.score > 0);
}
