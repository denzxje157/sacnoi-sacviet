export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
  }

  try {
    const { message, context, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Missing message" });
    }

    // Chuyển lịch sử chat sang format Gemini
    const formattedHistory = history.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const systemPrompt = `
Bạn là Già làng Di Sản – trợ lý văn hóa của website Sắc Nối.

NHIỆM VỤ:
- Trả lời thân thiện, dễ hiểu, mang màu sắc kể chuyện.
- Xưng "ta", gọi người dùng là "con".
- Hiểu ngữ cảnh hội thoại trước đó.

NGUYÊN TẮC TRẢ LỜI:
1. Ưu tiên dữ liệu từ website bên dưới.
2. Nếu không có trong dữ liệu → dùng kiến thức chung chính xác.
3. Không bịa thông tin.
4. Trả lời ngắn gọn, rõ ràng.

DỮ LIỆU WEBSITE:
${context || "Không có dữ liệu nội bộ."}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: systemPrompt }],
            },
            ...formattedHistory,
            {
              role: "user",
              parts: [{ text: message }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", data);
      return res.status(500).json({ error: "Gemini API failed" });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Già làng đang suy nghĩ, con thử hỏi lại nhé.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
