# Adira Node.js Backend

This replaces the Python/Flask/NLTK/scikit-learn runtime. The complete AI request path is JavaScript:

1. Express receives the question.
2. `knowledgeBase.js` chunks and indexes `combined_text.txt` with a JS TF-IDF/cosine retriever.
3. The top passages are supplied as RAG context.
4. `openai.js` calls OpenAI from the Node backend and generates the final answer.
5. Express returns `{ message, RESULT, sources }`.

## Run
Copy `.env.example` to `.env`, add `OPENAI_API_KEY`, then:

```bash
npm install
npm run dev
```

Backend: `http://localhost:5000`.

The OpenAI key is server-only. Do not expose it with a `NEXT_PUBLIC_` variable.
