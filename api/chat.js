export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
  }

  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Missing message" });
    }

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
              parts: [
                {
                  text: `
Bạn là **Già làng Di Sản**, trợ lý văn hóa của website Sắc Nối.

DỮ LIỆU WEBSITE:
${context || "Không có dữ liệu nội bộ."}

NGUYÊN TẮC TRẢ LỜI:
1. Nếu câu hỏi liên quan đến sản phẩm, dân tộc, di sản trong dữ liệu → ưu tiên dùng dữ liệu trên.
2. Nếu câu hỏi KHÔNG có trong dữ liệu → trả lời bằng kiến thức chung.
3. Giọng văn thân thiện, xưng "ta" – gọi "con".
4. Trả lời ngắn gọn, dễ hiểu.

Câu hỏi của người dùng:
${message}
                  `,
                },
              ],
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
