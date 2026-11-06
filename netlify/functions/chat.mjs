export default async (request) => {
  const headers = {
    "Content-Type": "application/json"
  };

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Metode tidak didukung" }),
      { status: 405, headers }
    );
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API Key belum dipasang di Netlify" }),
        { status: 503, headers }
      );
    }

    const body = await request.json();
    const message = body.message || "";

ji    if (!message.trim()) {
      return new Response(
        JSON.stringify({ error: "Pesan kosong" }),
        { status: 400, headers }
      );
    }

    const history = Array.isArray(body.history)
      ? body.history.slice(-10)
      : [];

    const contents = [
      ...history.map(item => ({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: item.content }]
      })),
      {
        role: "user",
        parts: [{ text: message }]
      }
    ];

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "Kamu adalah AXLIM AI. Jawab dengan ramah, cerdas, dan gunakan bahasa Indonesia yang natural."
            }]
          },
          contents,
          generationConfig: {
  maxOutputTokens: 800
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Gemini bermasalah atau kuota habis." }),
        { status: 502, headers }
      );
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("\n") || "Maaf, coba lagi ya.";

    return new Response(
      JSON.stringify({ reply }),
      { status: 200, headers }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan server." }),
      { status: 500, headers }
    );
  }
};

export const config = {
  path: "/.netlify/functions/chat"
};
