import OpenAI from "openai";

let client;
function getClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  client ||= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export async function generateAnswer(query, passages) {
  const openai = getClient();
  if (!openai) {
    if (passages[0]) return passages[0].text;
    return "I am sorry. I could not find relevant information in the knowledge base.";
  }
  const context = passages.map((p, i) => `[Source ${i + 1}]\n${p.text}`).join("\n\n");
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: "You are Adira, a supportive women's-safety information assistant focused on India. Answer clearly and concisely. Use the supplied legal/safety context when relevant. Do not invent legal provisions. If the context is insufficient, say that clearly and give only cautious general guidance. For immediate danger, advise contacting local emergency services or a trusted person. Do not claim to replace a lawyer, doctor, police, or emergency professional." },
      { role: "user", content: `Question: ${query}\n\nRetrieved context:\n${context || "No relevant passage was retrieved."}` }
    ]
  });
  return completion.choices[0]?.message?.content?.trim() || "I could not generate a response.";
}
