import axios from 'axios';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function callGroq(systemPrompt, userPrompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  const body = {
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 10,
    temperature: 0,
  };

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  try {
    const res = await axios.post(GROQ_URL, body, { headers });
    return res.data.choices[0].message.content.trim();
  } catch (err) {
    if (err.response?.status === 429) {
      await new Promise(r => setTimeout(r, 2000));
      try {
        const res = await axios.post(GROQ_URL, body, { headers });
        return res.data.choices[0].message.content.trim();
      } catch (retryErr) {
        throw new Error(`Groq API retry failed: ${retryErr.response?.status} ${retryErr.response?.data?.error?.message || retryErr.message}`);
      }
    }
    throw new Error(`Groq API failed: ${err.response?.status} ${err.response?.data?.error?.message || err.message}`);
  }
}
