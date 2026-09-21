# Adira — Full Node.js Environment

This package contains the original Next.js interface plus a new Node.js/Express AI backend. No Python runtime is required.

## Architecture

`Next.js UI -> Express /api/chat -> JS retrieval (TF-IDF + cosine similarity) -> OpenAI generation -> UI`

The existing Firebase authentication/Firestore code remains JavaScript. The previous Python Flask, NLTK, scikit-learn, NumPy and PyPDF2 runtime has been removed from the application path. The legal knowledge base is retained in `backend/data/combined_text.txt`.

## 1. Backend

```bash
cd backend
cp .env.example .env
# put your OPENAI_API_KEY in .env
npm install
npm run dev
```

## 2. Frontend

In the project root create `.env.local` and add:

```env
NEXT_PUBLIC_ADIRA_API_URL=http://localhost:5000
```

Also keep the existing Firebase environment variables required by `config.js`. Then:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deployment

Deploy the root Next.js app to Vercel as before. Deploy `backend/` as a Node web service (for example Render) with `npm start`. Set `OPENAI_API_KEY`, `CLIENT_ORIGIN` and optionally `OPENAI_MODEL` on the backend. Set `NEXT_PUBLIC_ADIRA_API_URL` on the frontend to the deployed backend URL.

## Important security change

The original project called OpenAI using `NEXT_PUBLIC_OPENAI_API_KEY`. Do not use a public-prefixed OpenAI secret. In this version the OpenAI call is made only by the Express backend using `OPENAI_API_KEY`.
