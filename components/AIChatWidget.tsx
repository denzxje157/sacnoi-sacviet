import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethnicData } from '../pages/Home.tsx';
import { heritageData } from '../pages/MapPage.tsx';
import { marketplaceData } from '../pages/Marketplace.tsx';
import { libraryData } from '../pages/Library.tsx';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  actionLink?: string; // Link điều hướng nếu có
  actionLabel?: string; // Nhãn nút bấm
}

// Component để hiển thị text với định dạng đặc biệt (Bỏ ** và thay bằng chữ đậm đỏ)
const FormattedMessageText: React.FC<{ text: string }> = ({ text }) => {
  // Tách chuỗi dựa trên dấu **
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          // Loại bỏ dấu ** và render với style đậm + đỏ (Màu Primary của web)
          return (
            <span key={index} className="font-black text-primary">
              {part.slice(2, -2)}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

const AIChatWidget: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'welcome', 
      role: 'model', 
      text: 'Chào người bạn phương xa! Ta là Già làng Di Sản. Con muốn tìm hiểu về sản phẩm dân tộc nào, hay muốn nghe chuyện gì, ta sẽ kể và dẫn con đến nơi con cần.' 
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
    let context = "DƯỚI ĐÂY LÀ DỮ LIỆU CÓ TRÊN WEBSITE SẮC NỐI:\n\n";

    // 1. Thêm dữ liệu sản phẩm Chợ Phiên
    context += "=== 1. DANH SÁCH SẢN PHẨM BÁN TẠI CHỢ PHIÊN (MARKETPLACE) ===\n";
    marketplaceData.forEach(group => {
       group.items.forEach(item => {
          context += `- Dân tộc: ${group.e} | Sản phẩm: ${item.n} | Giá: ${item.p} | Mô tả: ${item.d || 'Không có mô tả'}\n`;
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
       context += `- Dân tộc: ${ethnic.name} | Nơi sống: ${ethnic.location} | Di sản: ${ethnic.heritage} | Mô tả: ${ethnic.description}\n`;
    });

    // 4. Thêm dữ liệu Thư viện (Kiến trúc, Lễ hội...)
    context += "\n=== 4. THƯ VIỆN DI SẢN (KIẾN TRÚC/LỄ HỘI) ===\n";
    libraryData.forEach(lib => {
       context += `- ${lib.title} (${lib.category}): ${lib.desc}. Nội dung: ${lib.content.substring(0, 150)}...\n`;
    });

    return context;
  }, []);

  const handleSendMessage = async () => {
  if (!inputText.trim()) return;

  const userMsg: Message = { id: Date.now().toString(), role: 'user', text: inputText };
  setMessages(prev => [...prev, userMsg]);
  setInputText('');
  setIsLoading(true);

  const aiMsgId = (Date.now() + 1).toString();
  setMessages(prev => [...prev, { id: aiMsgId, role: 'model', text: '' }]);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: inputText,
        context: systemContext,
      }),
    });

    const data = await response.json();

    let fullText = data.reply || "Già làng chưa nghĩ ra câu trả lời.";

    // Xử lý link điều hướng nếu có
    let actionLink: string | undefined;
    let actionLabel: string | undefined;

    const navigateMatch = fullText.match(/<<<NAVIGATE:(.*?)>>>/);
    if (navigateMatch) {
      fullText = fullText.replace(navigateMatch[0], "").trim();
      actionLink = navigateMatch[1];

      if (actionLink.includes("marketplace")) {
        const ethnicParam = actionLink.split("ethnic=")[1];
        const ethnicName = ethnicParam ? decodeURIComponent(ethnicParam) : "Chợ Phiên";
        actionLabel = `Đến gian hàng ${ethnicName}`;
      } else {
        actionLabel = "Xem chi tiết";
      }
    }

    setMessages(prev =>
      prev.map(msg =>
        msg.id === aiMsgId
          ? { ...msg, text: fullText, actionLink, actionLabel }
          : msg
      )
    );

  } catch (error) {
    console.error("Lỗi API:", error);
    const errorMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "model",
      text: "Mạng của già làng đang chập chờn quá. Con thử lại sau nhé.",
    };

    setMessages(prev => prev.filter(msg => msg.id !== aiMsgId).concat(errorMsg));
  } finally {
    setIsLoading(false);
  }
};



      // QUAN TRỌNG: Lặp qua result để lấy từng chunk (result itself is the async iterable)
      
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNavigate = (link: string) => {
    if (link.startsWith('http')) {
      window.open(link, '_blank');
    } else {
      navigate(link);
      onClose(); // Đóng chat khi chuyển trang để người dùng xem
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-[90vw] max-w-[400px] h-[550px] bg-[#F9F5EA] rounded-[2rem] shadow-2xl border-4 border-gold z-[200] flex flex-col overflow-hidden animate-slide-up origin-bottom-right">
      {/* Header */}
      <div className="bg-primary p-4 flex items-center justify-between shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
        <div className="flex items-center gap-3 relative z-10 text-white">
           <div className="size-12 rounded-full bg-white border-2 border-gold flex items-center justify-center overflow-hidden shadow-md">
              <img src="https://cdn-icons-png.flaticon.com/512/3938/3938634.png" alt="Già Làng" className="w-9 h-9 object-cover" />
           </div>
           <div>
              <h3 className="font-black text-base uppercase tracking-widest">Già Làng Di Sản</h3>
              <p className="text-[10px] text-gold-light font-medium flex items-center gap-1">
                 <span className="size-2 bg-green-400 rounded-full animate-pulse"></span> Sẵn sàng giúp đỡ
              </p>
           </div>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white hover:rotate-90 transition-all relative z-10 bg-white/10 rounded-full p-1">
           <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]">
         {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
               <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm whitespace-pre-wrap ${
                  msg.role === 'user' 
                  ? 'bg-primary text-white rounded-br-none' 
                  : 'bg-white text-text-main border border-gold/20 rounded-bl-none'
               }`}>
                  {/* Sử dụng component định dạng text */}
                  {msg.role === 'user' ? msg.text : <FormattedMessageText text={msg.text} />}
               </div>
               
               {/* Nút điều hướng nếu có */}
               {msg.actionLink && msg.actionLabel && (
                 <button 
                   onClick={() => handleNavigate(msg.actionLink!)}
                   className="mt-2 ml-2 bg-gold text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-bronze transition-all flex items-center gap-2 animate-fade-in"
                 >
                   {msg.actionLabel}
                   <span className="material-symbols-outlined text-sm">arrow_forward</span>
                 </button>
               )}
            </div>
         ))}
         {isLoading && (
            <div className="flex justify-start">
               <div className="bg-white border border-gold/20 p-3 rounded-2xl rounded-bl-none flex gap-1 items-center shadow-sm">
                  <span className="text-xs text-bronze font-bold mr-2">Đang viết...</span>
                  <div className="flex gap-1">
                    <span className="size-1.5 bg-primary/60 rounded-full animate-bounce"></span>
                    <span className="size-1.5 bg-primary/60 rounded-full animate-bounce delay-100"></span>
                    <span className="size-1.5 bg-primary/60 rounded-full animate-bounce delay-200"></span>
                  </div>
               </div>
            </div>
         )}
         <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gold/20 shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
         <div className="relative">
            <textarea
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               onKeyDown={handleKeyPress}
               placeholder="Hỏi về sản phẩm, văn hóa..."
               className="w-full bg-background-light border-2 border-gold/20 rounded-2xl py-3 pl-4 pr-12 text-sm text-text-main placeholder:text-text-soft/50 focus:outline-none focus:border-primary focus:ring-0 resize-none max-h-24 font-medium transition-all"
               rows={1}
            />
            <button 
               onClick={handleSendMessage}
               disabled={!inputText.trim() || isLoading}
               className="absolute right-2 top-1/2 -translate-y-1/2 size-9 rounded-xl bg-primary text-white hover:bg-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center shadow-md"
            >
               <span className="material-symbols-outlined text-lg">send</span>
            </button>
         </div>
         <p className="text-[9px] text-center text-text-soft/60 mt-2 font-bold uppercase tracking-wide">
            Sắc Nối AI - Kết nối di sản Việt
         </p>
      </div>
    </div>
  );
};

export default AIChatWidget;