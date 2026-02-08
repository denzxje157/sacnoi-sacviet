import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ethnicData } from '../pages/Home.tsx';
import { heritageData } from '../pages/MapPage.tsx';
import { marketplaceData } from '../pages/Marketplace.tsx';
import { libraryData } from '../pages/Library.tsx';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

// Kịch bản trả lời giả lập (Dùng khi mất mạng hoặc lỗi quota)
const MOCK_KNOWLEDGE_BASE: Record<string, string[]> = {
  "default": [
    "Câu hỏi này thú vị đấy! Nhưng Già làng đang mất kết nối với thần linh (Lỗi mạng), con thử hỏi lại sau nhé?",
    "Kiến thức là biển rộng, câu này ta xin khất để tra lại sách sử đã nhé.",
  ]
};

const getMockResponse = (input: string): string => {
  const defaultAnswers = MOCK_KNOWLEDGE_BASE['default'];
  return defaultAnswers[Math.floor(Math.random() * defaultAnswers.length)];
};

const AIChatWidget: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'welcome', 
      role: 'model', 
      text: 'Chào người bạn phương xa! Ta là Già làng Di Sản. Ta biết mọi thứ về sản phẩm, di sản và câu chuyện trên trang web này. Con muốn hỏi gì nào?' 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Tạo Context String từ dữ liệu website
  const systemContext = useMemo(() => {
    let context = "DƯỚI ĐÂY LÀ DỮ LIỆU CÓ TRÊN WEBSITE SẮC NỐI. HÃY DÙNG NÓ ĐỂ TRẢ LỜI:\n\n";

    // 1. Thêm dữ liệu sản phẩm Chợ Phiên
    context += "=== 1. DANH SÁCH SẢN PHẨM BÁN TẠI CHỢ PHIÊN ===\n";
    marketplaceData.forEach(group => {
       group.items.forEach(item => {
          context += `- Sản phẩm: ${item.n} | Dân tộc: ${group.e} | Giá: ${item.p} | Mô tả: ${item.d || 'Không có mô tả'}\n`;
       });
    });

    // 2. Thêm dữ liệu Di sản trên bản đồ
    context += "\n=== 2. DANH SÁCH DI SẢN TRÊN BẢN ĐỒ ===\n";
    heritageData.forEach(site => {
       context += `- Di sản: ${site.name} | Loại: ${site.type} | Địa điểm: ${site.location} | Mô tả: ${site.description}\n`;
    });

    // 3. Thêm dữ liệu Dân tộc
    context += "\n=== 3. THÔNG TIN 54 DÂN TỘC ===\n";
    ethnicData.forEach(ethnic => {
       context += `- Dân tộc: ${ethnic.name} | Nơi sống: ${ethnic.location} | Dân số: ${ethnic.population} | Di sản: ${ethnic.heritage} | Mô tả: ${ethnic.description}\n`;
    });

    // 4. Thêm dữ liệu Thư viện (Kiến trúc, Lễ hội...)
    context += "\n=== 4. THƯ VIỆN DI SẢN (KIẾN TRÚC/LỄ HỘI) ===\n";
    libraryData.forEach(lib => {
       context += `- ${lib.title} (${lib.category}): ${lib.desc}. Nội dung: ${lib.content.substring(0, 150)}...\n`;
    });

    return context;
  }, []);

  // Xử lý gửi tin nhắn
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // CHẾ ĐỘ ONLINE (qua backend Vercel)
         const response = await fetch("/api/chat", {
          method: "POST",
            headers: {
                 "Content-Type": "application/json",
               },
               body: JSON.stringify({
                  message: userMsg.text,
                  context: systemContext
               }),
               });

               const data = await response.json();

               const aiMsg: Message = {
               id: (Date.now() + 1).toString(),
               role: "model",
               text: data.reply || "Già làng chưa nghĩ ra câu trả lời.",
               };

setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error("Lỗi API:", error);
      // Fallback nếu API lỗi
      setTimeout(() => {
         const reply = getMockResponse(userMsg.text);
         const fallbackMsg: Message = { 
           id: (Date.now() + 1).toString(), 
           role: 'model', 
           text: `(Già làng đang nghỉ ngơi một chút) ${reply}` 
         };
         setMessages(prev => [...prev, fallbackMsg]);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

return (
  <div className="fixed bottom-24 right-6 w-[90vw] max-w-[400px] h-[500px] bg-[#F7F3E9] rounded-[2rem] shadow-2xl border-4 border-gold z-[200] flex flex-col overflow-hidden animate-slide-up origin-bottom-right">
    
    {/* Header */}
    <div className="bg-primary p-4 flex items-center justify-between shrink-0">
      <div className="text-white font-bold">
        Già Làng Di Sản
      </div>

      <button
        onClick={onClose}
        className="text-white hover:rotate-90 transition"
      >
        ✕
      </button>
    </div>

    {/* Chat area */}
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={msg.role === "user" ? "text-right" : "text-left"}
        >
          <div
            className={`inline-block px-3 py-2 rounded-xl ${
              msg.role === "user"
                ? "bg-primary text-white"
                : "bg-white border"
            }`}
          >
            {msg.text}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>

    {/* Input */}
    <div className="p-3 border-t">
      <div className="flex gap-2">
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="Hỏi già làng..."
        />
        <button
          onClick={handleSendMessage}
          className="bg-primary text-white px-4 rounded-lg"
        >
          Gửi
        </button>
      </div>
    </div>
  </div>
);


export default AIChatWidget;
