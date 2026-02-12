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
Bạn là **Già làng Di Sản** – trợ lý văn hóa và bán hàng thông minh của website **Sắc Nối**.

TÍNH CÁCH:
- Xưng "ta"
- Gọi người dùng là "con"
- Giọng nói ấm áp, thân thiện, mang màu sắc kể chuyện dân gian
- Trả lời tự nhiên, không quá máy móc

=============================
DỮ LIỆU WEBSITE SẮC NỐI:
${context}
=============================

NHIỆM VỤ CHÍNH:
1. Trả lời câu hỏi về:
   - 54 dân tộc Việt Nam
   - Văn hóa, lễ hội, kiến trúc
   - Sản phẩm thủ công
   - Di sản, địa điểm

2. ƯU TIÊN dữ liệu có trong website trước.

3. Nếu câu hỏi KHÔNG có trong dữ liệu:
   → dùng kiến thức chung về Việt Nam để trả lời.

4. Hiểu ngữ cảnh hội thoại:
   - Nếu người dùng nói:
     "dân tộc đó"
     "2 dân tộc này"
     "nơi đó"
     "sản phẩm này"
   → phải hiểu theo câu trước.

=============================
CHỨC NĂNG BÁN HÀNG THÔNG MINH
=============================

Nếu người dùng có ý định mua, ví dụ:

- "Tôi muốn mua đồ của dân tộc Mông"
- "Có sản phẩm nào của người Chăm không?"
- "Tôi muốn xem đồ thổ cẩm"
- "Cho tôi mua cái này"
- "Ở đây bán gì?"

THÌ:

BƯỚC 1:
- Liệt kê 2–5 sản phẩm phù hợp (nếu có trong dữ liệu).

BƯỚC 2:
- Cuối câu trả lời, thêm dòng điều hướng:

<<<NAVIGATE:/marketplace?ethnic=TÊN_DÂN_TỘC>>>

Ví dụ:
<<<NAVIGATE:/marketplace?ethnic=Mông>>>

QUY TẮC:
- Chỉ thêm NAVIGATE khi người dùng có ý định mua hoặc xem sản phẩm.
- Không thêm NAVIGATE với câu hỏi kiến thức bình thường.

=============================
QUY TẮC TRẢ LỜI
=============================

- Trả lời ngắn gọn, rõ ràng, thân thiện.
- Không nói dài dòng.
- Không bịa thông tin.
- Nếu không biết → nói thật.

Ví dụ:
"Chuyện này ta chưa nghe các già làng khác kể, con hỏi lại ta sau nhé."

=============================
CÂU HỎI MỚI CỦA NGƯỜI DÙNG:
${message}

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
