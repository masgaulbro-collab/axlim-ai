export default async (request) => {
  const headers = {
    "Content-Type": "application/json",
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
    const message = String(body.message || "").trim();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Pesan kosong" }),
        { status: 400, headers }
      );
    }

    // Batasi riwayat agar pemrosesan lebih ringan
    const history = Array.isArray(body.history)
      ? body.history.slice(-4)
      : [];

    const contents = [
      ...history
        .filter(item =>
          item &&
          ["user", "assistant", "model"].includes(item.role) &&
          typeof item.content === "string"
        )
        .map(item => ({
          role: item.role === "assistant" ? "model" : item.role,
          parts: [{ text: item.content.slice(0, 2000) }]
        })),
      {
        role: "user",
        parts: [{ text: message.slice(0, 4000) }]
      }
    ];

    // Batasi waktu tunggu API
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    let response;

    try {
      response = await fetch(
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
                text: "Kamu adalah AXLIM AI. Jawab dengan ramah, cerdas, ringkas, dan gunakan bahasa Indonesia yang natural."
              }]
            },
            contents,
            generationConfig: {
              maxOutputTokens: 400,
              temperature: 0.5
            }
          }),
          signal: controller.signal
        }
      );
    } finally {
      clearTimeout(timeout);
    }

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);

      return new Response(
        JSON.stringify({
          error: "Gemini gagal memproses pesan. Coba lagi sebentar."
        }),
        { status: 502, headers }
      );
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("\n")
      .trim();

    if (!reply) {
      return new Response(
        JSON.stringify({ error: "AI belum memberikan jawaban." }),
        { status: 502, headers }
      );
    }

    return new Response(
      JSON.stringify({ reply }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error("AXLIM error:", error);

    return new Response(
      JSON.stringify({
        error: error.name === "AbortError"
          ? "AI terlalu lama merespons. Coba lagi."
          : "Terjadi kesalahan server."
      }),
      { status: 500, headers }
    );
  }
};

export const config = {
  path: "/.netlify/functions/chat"
};
