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
      // CHẾ ĐỘ ONLINE (GEMINI API)
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
            { role: 'user', parts: [{ text: userMsg.text }] }
        ],
        config: {
          systemInstruction: `Bạn là 'Già làng Di Sản' - một chuyên gia văn hóa Việt Nam uyên bác của website Sắc Nối.
          
          ${systemContext}

          NHIỆM VỤ CỦA BẠN:
          1. Ưu tiên hàng đầu: Dùng dữ liệu ở trên để trả lời. Ví dụ: Nếu hỏi "có bán gùi không", hãy tìm trong mục 1 (Chợ Phiên) và liệt kê tên, giá tiền chính xác. Nếu hỏi về "Vịnh Hạ Long", tìm trong mục 2.
          2. Nếu không tìm thấy thông tin trong dữ liệu trên: Hãy dùng kiến thức rộng lớn của bạn về văn hóa Việt Nam để trả lời.
          3. Phong cách: Giọng văn già làng, ấm áp, xưng "Ta" - gọi "con".
          4. Nếu khách hỏi mua hàng: Hãy hướng dẫn họ vào trang "Chợ Phiên".
          5. Trả lời ngắn gọn, súc tích (dưới 150 từ).`,
        },
      });

      const text = response.text;
      if (text) {
        const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: text };
        setMessages(prev => [...prev, aiMsg]);
      }
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
      <div className="bg-primary p-4 flex items-center justify-between shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
        <div className="flex items-center gap-3 relative z-10 text-white">
           <div className="size-10 rounded-full bg-white border-2 border-gold flex items-center justify-center overflow-hidden">
              <img src="https://cdn-icons-png.flaticon.com/512/3938/3938634.png" alt="Già Làng" className="w-8 h-8 object-cover" />
           </div>
           <div>
              <h3 className="font-black text-sm uppercase tracking-widest">Già Làng Di Sản</h3>
              <p className="text-[10px] text-gold-light font-medium flex items-center gap-1">
                 <span className="size-1.5 bg-green-400 rounded-full animate-pulse"></span> Đang trực tuyến
              </p>
           </div>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white hover:rotate-90 transition-all relative z-10">
           <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]">
         {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[85%] p-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                  ? 'bg-primary text-white rounded-br-none' 
                  : 'bg-white text-text-main border border-gold/20 rounded-bl-none'
               }`}>
                  {msg.text}
               </div>
            </div>
         ))}
         {isLoading && (
            <div className="flex justify-start">
               <div className="bg-white border border-gold/20 p-3 rounded-2xl rounded-bl-none flex gap-1 items-center">
                  <span className="text-xs text-bronze font-bold mr-2">Già làng đang suy ngẫm...</span>
                  <div className="flex gap-1">
                    <span className="size-1.5 bg-bronze/50 rounded-full animate-bounce"></span>
                    <span className="size-1.5 bg-bronze/50 rounded-full animate-bounce delay-100"></span>
                    <span className="size-1.5 bg-bronze/50 rounded-full animate-bounce delay-200"></span>
                  </div>
               </div>
            </div>
         )}
         <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gold/20 shrink-0">
         <div className="relative">
            <textarea
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               onKeyDown={handleKeyPress}
               placeholder="Hỏi già làng về di sản..."
               className="w-full bg-background-light border border-gold/20 rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none max-h-24"
               rows={1}
            />
            <button 
               onClick={handleSendMessage}
               disabled={!inputText.trim() || isLoading}
               className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-primary text-white hover:bg-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
               <span className="material-symbols-outlined text-lg">send</span>
            </button>
         </div>
         <p className="text-[10px] text-center text-text-soft/60 mt-2">
            Già làng có thể mắc sai sót. Hãy kiểm tra lại thông tin quan trọng.
         </p>
      </div>
    </div>
  );
};

export default AIChatWidget;
