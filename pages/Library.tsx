
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

type Category = 'architecture' | 'ritual' | 'festival';

export interface LibraryItem {
  id: string;
  category: Category;
  ethnic: string;
  title: string;
  desc: string;
  content: string;
  image: string;
}

const Library: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('architecture');
  const [selectedEthnicFilter, setSelectedEthnicFilter] = useState<string>('ALL');
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12; 
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedItem) { document.body.style.overflow = 'hidden'; } else { document.body.style.overflow = 'auto'; }
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedItem]);

  useEffect(() => { setCurrentPage(1); }, [activeCategory, selectedEthnicFilter, searchTerm]);

  const availableEthnics = useMemo(() => {
    const ethnics = new Set(libraryData.map(item => item.ethnic));
    return ['ALL', ...Array.from(ethnics).sort((a, b) => a.localeCompare(b, 'vi'))];
  }, []);

  const filteredData = useMemo(() => {
    return libraryData.filter(item => {
      const matchCategory = item.category === activeCategory;
      const matchEthnic = selectedEthnicFilter === 'ALL' || item.ethnic === selectedEthnicFilter;
      const matchSearch = item.ethnic.toLowerCase().includes(searchTerm.toLowerCase()) || item.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.desc.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchEthnic && matchSearch;
    });
  }, [activeCategory, selectedEthnicFilter, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage, ITEMS_PER_PAGE]);

  const handlePageChange = (page: number) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const categories = [
    { id: 'architecture', icon: 'temple_hindu', label: 'Kiến Trúc' },
    { id: 'ritual', icon: 'self_improvement', label: 'Nghi Lễ' },
    { id: 'festival', icon: 'festival', label: 'Lễ Hội' }
  ];

  return (
    <div className="relative min-h-screen font-display bg-[#F7F3E9]">
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/black-scales.png')" }}></div>

      <div className="max-w-[1920px] mx-auto px-4 lg:px-6 py-8 lg:py-12 relative z-10">
        <header className="mb-8 lg:mb-12 text-center">
          <div className="flex items-center justify-center gap-4 text-primary font-bold tracking-[0.3em] uppercase text-xs lg:text-sm mb-4">
            <span className="h-px w-8 lg:w-12 bg-primary"></span>Kho Tàng Di Sản Số<span className="h-px w-8 lg:w-12 bg-primary"></span>
          </div>
          <h2 className="text-4xl lg:text-7xl font-black text-text-main italic mb-6">Tiếng Vọng <span className="text-gold">Tiền Nhân</span></h2>
          <div className="max-w-md mx-auto relative group z-20 px-4 lg:px-0">
            <input type="text" placeholder="Tìm kiếm di sản..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white/80 backdrop-blur-sm border-2 border-gold/20 rounded-full py-3 px-6 pl-12 text-text-main placeholder:text-text-soft/50 focus:outline-none focus:border-primary transition-colors shadow-lg text-sm" />
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gold group-hover:text-primary transition-colors">search</span>
          </div>
        </header>

        <div className="lg:hidden mb-8 space-y-4 sticky top-20 z-30 bg-[#F7F3E9]/95 backdrop-blur-md py-2 -mx-4 px-4 border-b border-gold/10 shadow-sm">
           <div className="flex gap-2 overflow-x-auto custom-scrollbar-h pb-2">
              {categories.map((cat) => (
                 <button key={cat.id} onClick={() => { setActiveCategory(cat.id as Category); setSelectedEthnicFilter('ALL'); }} className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all border ${activeCategory === cat.id ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-gold/20 text-text-soft hover:bg-gold/10'}`}>
                    <span className="material-symbols-outlined text-lg">{cat.icon}</span><span className="font-black uppercase tracking-widest text-[10px]">{cat.label}</span>
                 </button>
              ))}
           </div>
           
           {/* Thanh lọc Dân tộc có mũi tên điều hướng - ĐÃ CẬP NHẬT GIAO DIỆN NỔI BẬT HƠN */}
           <div className="flex items-center gap-2 group bg-white/50 p-2 rounded-xl border border-gold/10 shadow-inner">
              <button onClick={scrollLeft} className="p-2 bg-gold/10 hover:bg-gold hover:text-white rounded-lg text-gold transition-colors shrink-0 active:scale-95 shadow-sm" aria-label="Cuộn trái">
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              
              <div className="flex-1 flex gap-2 overflow-x-auto custom-scrollbar-h py-1 scroll-smooth no-scrollbar" ref={scrollRef}>
                  {availableEthnics.map((ethnic) => (
                    <button key={ethnic} onClick={() => setSelectedEthnicFilter(ethnic)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap border transition-all shrink-0 ${selectedEthnicFilter === ethnic ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-gold/20 text-text-soft hover:bg-gold/10'}`}>
                      {ethnic === 'ALL' ? 'Tất cả' : ethnic}
                    </button>
                  ))}
              </div>

              <button onClick={scrollRight} className="p-2 bg-gold/10 hover:bg-gold hover:text-white rounded-lg text-gold transition-colors shrink-0 active:scale-95 shadow-sm" aria-label="Cuộn phải">
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <aside className="hidden lg:block w-72 shrink-0 space-y-8 sticky top-24 z-10">
            <div className="bg-white p-2 rounded-[2rem] border border-gold/20 shadow-xl">
               {categories.map((cat) => (
                 <button key={cat.id} onClick={() => { setActiveCategory(cat.id as Category); setSelectedEthnicFilter('ALL'); }} className={`w-full flex items-center gap-4 p-4 rounded-[1.5rem] transition-all duration-300 mb-2 last:mb-0 ${activeCategory === cat.id ? 'bg-primary text-white shadow-lg' : 'hover:bg-gold/10 text-text-soft'}`}>
                    <span className={`material-symbols-outlined ${activeCategory === cat.id ? 'text-white' : 'text-primary'}`}>{cat.icon}</span><span className="font-black uppercase tracking-widest text-xs">{cat.label}</span>
                 </button>
               ))}
            </div>
            <div className="bg-white rounded-[2rem] border border-gold/20 shadow-xl overflow-hidden flex flex-col max-h-[60vh]">
               <div className="p-5 border-b border-gold/10 bg-gold/5"><h3 className="font-black uppercase text-xs tracking-[0.2em] text-text-main flex items-center gap-2"><span className="material-symbols-outlined text-base">groups</span>Chọn Dân Tộc</h3></div>
               <div className="overflow-y-auto p-2 custom-scrollbar flex-1">
                 {availableEthnics.map((ethnic) => (
                   <button key={ethnic} onClick={() => setSelectedEthnicFilter(ethnic)} className={`w-full text-left px-5 py-3 rounded-xl text-sm font-bold transition-all mb-1 flex justify-between items-center ${selectedEthnicFilter === ethnic ? 'bg-text-main text-gold' : 'text-text-soft hover:bg-gold/10'}`}>
                     {ethnic === 'ALL' ? 'Tất cả dân tộc' : `${ethnic}`}
                     {selectedEthnicFilter === ethnic && <span className="size-2 rounded-full bg-gold"></span>}
                   </button>
                 ))}
               </div>
            </div>
          </aside>

          <main className="flex-1 w-full">
             <div className="mb-6 hidden lg:flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                   <h3 className="text-2xl font-black text-text-main uppercase italic">{activeCategory === 'architecture' && 'Không gian kiến trúc'}{activeCategory === 'ritual' && 'Nghi lễ & Tín ngưỡng'}{activeCategory === 'festival' && 'Lễ hội & Văn hóa'}</h3>
                   {selectedEthnicFilter !== 'ALL' && <span className="bg-primary text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest">{selectedEthnicFilter}</span>}
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-bronze uppercase tracking-widest"><span>{filteredData.length} kết quả</span><span>Trang {currentPage}/{totalPages > 0 ? totalPages : 1}</span></div>
             </div>

            {currentData.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                  {currentData.map((item) => (
                    <div key={item.id} onClick={() => setSelectedItem(item)} className="group bg-white rounded-2xl md:rounded-[2rem] overflow-hidden border border-gold/15 shadow-md hover:shadow-2xl hover:-translate-y-2 active:scale-[0.98] transition-all duration-300 cursor-pointer relative flex flex-col h-[300px] md:h-[400px]">
                      <div className="h-40 md:h-56 overflow-hidden relative shrink-0">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105" loading="lazy" decoding="async" />
                        <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-primary/90 text-white text-[8px] md:text-[9px] font-black px-2 md:px-3 py-1 md:py-1.5 rounded-full uppercase tracking-widest backdrop-blur-md border border-white/20 shadow-md z-10">{item.ethnic}</div>
                      </div>
                      <div className="p-3 md:p-6 flex flex-col flex-grow">
                        <h3 className="text-xs md:text-lg font-black text-text-main mb-1 md:mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight">{item.title}</h3>
                        <p className="text-[10px] md:text-xs text-text-soft font-medium line-clamp-2 md:line-clamp-3 mb-2 md:mb-4 leading-relaxed flex-grow opacity-80">{item.desc}</p>
                        <div className="flex items-center justify-between border-t border-gold/10 pt-2 md:pt-4 mt-auto">
                          <span className="text-[8px] md:text-[9px] font-bold text-bronze uppercase tracking-widest group-hover:text-gold transition-colors">Xem chi tiết</span>
                          <div className="size-6 md:size-8 rounded-full bg-gold/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:rotate-45"><span className="material-symbols-outlined text-xs md:text-lg">arrow_outward</span></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 md:mt-12 flex items-center justify-center gap-2 pb-20 lg:pb-0">
                    <button onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="size-8 md:size-10 rounded-full flex items-center justify-center border border-gold/20 bg-white text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary hover:text-white transition-colors"><span className="material-symbols-outlined text-base md:text-lg">chevron_left</span></button>
                    <div className="flex gap-1 md:gap-2 mx-2 md:mx-4">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                         if (page !== 1 && page !== totalPages && Math.abs(currentPage - page) > 1) { if (Math.abs(currentPage - page) === 2) return <span key={page} className="text-gold/50 font-bold self-end text-xs">...</span>; return null; }
                         return <button key={page} onClick={() => handlePageChange(page)} className={`size-8 md:size-10 rounded-full flex items-center justify-center text-[10px] md:text-xs font-black transition-all ${currentPage === page ? 'bg-primary text-white shadow-lg scale-110' : 'bg-white border border-gold/10 text-text-soft hover:border-gold/50'}`}>{page}</button>;
                      })}
                    </div>
                    <button onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="size-8 md:size-10 rounded-full flex items-center justify-center border border-gold/20 bg-white text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary hover:text-white transition-colors"><span className="material-symbols-outlined text-base md:text-lg">chevron_right</span></button>
                  </div>
                )}
              </>
            ) : (<div className="text-center py-32 bg-white/50 rounded-[3rem] border-2 border-dashed border-gold/20"><p className="text-text-soft font-bold text-lg">Chưa có dữ liệu.</p></div>)}
          </main>
        </div>

        {selectedItem && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 font-display">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedItem(null)}></div>
            <div className="bg-white w-full max-w-5xl h-[85vh] md:h-auto md:max-h-[90vh] rounded-[2rem] shadow-2xl relative z-10 animate-slide-up flex flex-col md:flex-row overflow-hidden border-4 border-gold/20">
               {/* Nút Đóng chỉ có Icon X */}
                <button 
                  onClick={() => setSelectedItem(null)} 
                  className="absolute top-2 right-2 z-50 p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors"
                  title="Đóng"
                >
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>

               <div className="w-full md:w-[70%] h-1/2 md:h-auto relative shrink-0 group bg-[#F2EFE6] border-b md:border-b-0 md:border-r border-gold/10">
                 <img src={selectedItem.image} alt={selectedItem.title} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
                 <div className="absolute bottom-4 left-4 md:bottom-10 md:left-16 text-white z-20 max-w-2xl animate-slide-up-content p-2">
                    <div className="inline-block px-3 py-1 bg-gold text-text-main text-[10px] font-black uppercase tracking-widest rounded-full mb-2 shadow-lg border border-white/20">Dân tộc {selectedItem.ethnic}</div>
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-black italic leading-tight mb-2 drop-shadow-lg">{selectedItem.title}</h2>
                 </div>
               </div>

               <div className="w-full md:w-[30%] h-1/2 md:h-auto p-6 md:p-8 bg-white relative flex flex-col">
                 <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 animate-fade-in delay-100 pr-2">
                    <div className="flex items-center gap-3 mb-4">
                       <span className="size-2 bg-primary rounded-full animate-pulse"></span>
                       <span className="text-xs font-black text-primary uppercase tracking-widest">Chi tiết {selectedItem.category}</span>
                    </div>
                    <div className="prose prose-sm text-text-main font-serif leading-relaxed text-justify">
                       <p className="font-bold text-base italic text-text-soft/90 mb-4 border-l-4 border-gold pl-4 py-1">"{selectedItem.desc}"</p>
                       {selectedItem.content.split('\n').map((paragraph, idx) => (<p key={idx} className="mb-3 text-sm">{paragraph}</p>))}
                    </div>
                 </div>
                 <div className="pt-4 border-t border-gold/10 flex gap-4 shrink-0 mt-2">
                        <button className="flex-1 bg-primary text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gold hover:text-text-main transition-all shadow-xl">Tìm hiểu thêm</button>
                 </div>
               </div>
            </div>
          </div>, document.body
        )}
      </div>
      <style>{`
        .custom-scrollbar-h::-webkit-scrollbar { height: 0px; background: transparent; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        @keyframes slide-up { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes slide-up-content { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up-content { animation: slide-up-content 0.6s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #A11D1D; border-radius: 10px; }
        .custom-scrollbar-h::-webkit-scrollbar { height: 0px; background: transparent; }
      `}</style>
    </div>
  );
};

// ... (Giữ nguyên phần dữ liệu libraryData và export default)
// ==========================================
// DỮ LIỆU THƯ VIỆN ĐẦY ĐỦ (KIẾN TRÚC - NGHI LỄ - LỄ HỘI)
// ==========================================
export const libraryData: LibraryItem[] = [
  
  // ==================== KIẾN TRÚC (ARCHITECTURE) ====================
  // Nhóm Kinh
  {
    id: "arch-kinh-dinh", category: "architecture", ethnic: "Kinh",
    title: "Đình Làng Việt", desc: "Biểu tượng quyền lực làng xã và tâm linh.",
    content: "Đình làng là công trình kiến trúc lớn nhất, quan trọng nhất của làng người Việt ở Bắc Bộ. Đây là nơi thờ Thành Hoàng (vị thần bảo hộ của làng) và cũng là nơi hội họp việc làng, tổ chức lễ hội.\n\nKiến trúc đình thường theo kiểu chữ Nhất, chữ Nhị hoặc chữ Công. Điểm đặc sắc nhất là bộ mái xòe rộng chiếm 2/3 chiều cao đình, các đầu đao cong vút mềm mại như cánh chim. Bên trong là hệ thống cột gỗ lim lớn và các mảng chạm khắc tứ linh (Long, Ly, Quy, Phượng), tứ quý rất tinh xảo.",
    image: "pictures-thuvien/kien-truc/kinh/arch-kinh-dinh.png"
  },
  {
    id: "arch-kinh-chua", category: "architecture",
    ethnic: "Kinh",
    title: "Chùa Bắc Tông",
    desc: "Không gian Phật giáo thanh tịnh.",
    content: "Chùa Việt thường có kiến trúc chữ Tam, chữ Công với tam quan, tiền đường, thượng điện. Điểm nhấn là tháp chuông uy nghiêm và hệ thống tượng Phật sơn son thếp vàng lộng lẫy.",
    image: "pictures-thuvien/kien-truc/kinh/arch-kinh-chua.jpg"
  },
  {
    id: "arch-kinh-nharuong", category: "architecture",
    ethnic: "Kinh",
    title: "Nhà Rường Huế",
    desc: "Tinh hoa kiến trúc gỗ truyền thống.",
    content: "Nhà Rường là loại nhà ở 3 gian 2 chái đặc trưng của quan lại và tầng lớp thượng lưu xưa. Toàn bộ khung nhà bằng gỗ mít hoặc lim, được liên kết bằng mộng, không dùng đinh. Các cột, kèo được chạm trổ cực kỳ tinh vi.",
    image: "pictures-thuvien/kien-truc/kinh/arch-kinh-nharuong.jpg"
  },

  // Nhóm Chăm
  {
    id: "arch-cham-thap", category: "architecture", ethnic: "Chăm",
    title: "Tháp Chăm (Kalan)", desc: "Đỉnh cao kỹ thuật xây gạch không mạch.",
    content: "Kalan là đền thờ các vị thần Hindu (Shiva), tượng trưng cho ngọn núi thần thoại Meru. Đặc điểm nổi bật là kỹ thuật xây gạch mài chập, khít mạch không cần vữa kết dính mà vẫn đứng vững ngàn năm. Trên mặt tường gạch là các phù điêu chạm khắc trực tiếp.",
    image: "pictures-thuvien/kien-truc/cham/arch-cham-thap.jpg"
  },
  {
    id: "arch-cham-nhatuc", category: "architecture", ethnic: "Chăm",
    title: "Nhà Tục", desc: "Ngôi nhà gìn giữ phong tục mẫu hệ.",
    content: "Trong khuôn viên gia đình người Chăm, Nhà Tục là nơi quan trọng nhất, nơi diễn ra các nghi lễ vòng đời và thờ cúng tổ tiên. Nhà thường thấp, kín đáo, thể hiện sự tôn nghiêm.",
    image: "pictures-thuvien/kien-truc/cham/arch-cham-nhatuc.jpg"
  },

  // Nhóm Khmer
  {
    id: 'arch-khmer-chua', category: 'architecture', ethnic: 'Khmer',
    title: 'Chùa Khmer (Vihear)', desc: 'Rực rỡ sắc vàng Phật giáo Nam Tông.',
    content: "Chùa là trung tâm sinh hoạt của phum sóc. Chánh điện (Vihear) là kiến trúc chính, mái nhọn nhiều tầng, trang trí tượng rắn Naga, chim thần Keynor, chằn Yeak. Màu vàng rực rỡ tượng trưng cho sự giác ngộ.",
    image: "pictures-thuvien/kien-truc/khmer/arch-khmer-chua.jpg"
  },

  // Nhóm Tây Nguyên (Gia Rai, Ê Đê, Ba Na...)
  {
    id: 'arch-ede-nhadai', category: 'architecture', ethnic: 'Ê Đê',
    title: 'Nhà Dài', desc: 'Dài như tiếng chiêng ngân.',
    content: "Nhà Dài là nơi sinh sống của đại gia đình mẫu hệ. Nhà làm bằng tre nứa gỗ, sàn cao, có cầu thang đực (cho khách) và cầu thang cái (có hình bầu vú, cho người nhà). Độ dài của nhà thể hiện sự thịnh vượng của dòng họ.",
    image: "pictures-thuvien/kien-truc/e-de/arch-ede-nhadai.jpg"
  },
  {
    id: 'arch-bana-nharong', category: 'architecture', ethnic: 'Ba Na',
    title: 'Nhà Rông', desc: 'Lưỡi rìu vút cao giữa đại ngàn.',
    content: "Nhà Rông là ngôi nhà chung, nơi hội họp, xử kiện và tiếp khách của buôn làng Ba Na, Xơ Đăng. Mái nhà cao vút như lưỡi rìu ngược (có thể cao tới 20m), thể hiện sức mạnh và uy quyền của làng trước thiên nhiên.",
    image: "pictures-thuvien/kien-truc/ba-na/arch-bana-nharong.jpg"
  },
  {
    id: 'arch-giarai-nhamo', category: 'architecture', ethnic: 'Gia Rai',
    title: 'Nhà Mồ', desc: 'Kiến trúc tâm linh và nghệ thuật tạc tượng.',
    content: "Nhà mồ được xây dựng công phu cho người chết trước lễ Bỏ mả. Xung quanh nhà mồ là hàng rào tượng gỗ (tượng người khóc, tượng phồn thực...) thể hiện quan niệm sinh sôi nảy nở.",
    image: "pictures-thuvien/kien-truc/gia-rai/arch-giarai-nhamo.jpg"
  },

  // Nhóm Tây Bắc (Thái, H'Mông...)
  {
    id: 'arch-thai-nhasan', category: 'architecture', ethnic: 'Thái',
    title: 'Nhà Sàn Thái', desc: 'Duyên dáng với Khau Cút trên nóc.',
    content: "Nhà sàn người Thái cao ráo, sạch sẽ. Người Thái Đen có biểu tượng Khau Cút trên nóc nhà hình sừng trâu hoặc cánh hoa sen. Người Thái Trắng có lan can chạy quanh nhà.",
    image: 'https://qhkt.hochiminhcity.gov.vn/Media/Uploads/H%C3%ACnh%20Tin%20b%C3%A0i/YkienChuyenGia_03_11_2018/121_1.jpg'
  },
  {
    id: 'arch-hmong-trinhtuong', category: 'architecture', ethnic: "H'Mông",
    title: 'Nhà Trình Tường', desc: 'Pháo đài đất ấm áp trên cao nguyên đá.',
    content: "Nhà người Mông làm bằng đất nện dày để chống lại cái lạnh khắc nghiệt của vùng cao. Cột kê trên đá tảng, mái thấp lợp ngói âm dương hoặc ván pơ mu. Xung quanh thường có hàng rào đá xếp chồng không cần chất kết dính.",
    image: 'https://objectstorage.omzcloud.vn/pys-object-storage/web/uploads/posts/avatar/1595324066.jpg'
  },
  {
    id: 'arch-dao-nhanuasan', category: 'architecture', ethnic: 'Dao',
    title: 'Nhà Nửa Sàn Nửa Đất', desc: 'Thích nghi với địa hình dốc.',
    content: "Do sống ở sườn núi dốc, người Dao (đặc biệt là Dao Khâu) làm nhà một nửa là sàn cột gỗ, một nửa nền đất đắp bằng phẳng. Bàn thờ Bàn Vương luôn được đặt ở vị trí trang trọng nhất.",
    image: 'https://vov4.vov.vn/sites/default/files/styles/large_watermark/public/2023-08/z4584628993421_8aaf8b5bf15fcd2cb20827ddcb89e2ec.jpg'
  },
  {
    id: 'arch-hanhi-nhanam', category: 'architecture', ethnic: 'Hà Nhì',
    title: 'Nhà Trình Tường Hình Nấm', desc: 'Vẻ đẹp cổ tích nơi biên cương.',
    content: "Tường đất nện dày tới 40-50cm, mái tranh phủ kín xuống tận tường giống như cây nấm khổng lồ. Kiến trúc này giúp ngôi nhà ấm vào mùa đông và mát vào mùa hè.",
    image: 'https://thegioidisan.vn/assets/media/2016/Thang%204/0542016/nha-trinh-tuong3.jpg'
  },

  // ==================== NGHI LỄ (RITUALS) ====================
  // Kinh
  {
    id: "arch-kinh-dinh", category: "architecture", ethnic: "Kinh",
    title: "Đình Làng Việt", desc: "Biểu tượng quyền lực làng xã và tâm linh.",
    content: "Đình làng là công trình kiến trúc lớn nhất, quan trọng nhất của làng người Việt ở Bắc Bộ. Đây là nơi thờ Thành Hoàng (vị thần bảo hộ của làng) và cũng là nơi hội họp việc làng, tổ chức lễ hội.\n\nKiến trúc đình thường theo kiểu chữ Nhất, chữ Nhị hoặc chữ Công. Điểm đặc sắc nhất là bộ mái xòe rộng chiếm 2/3 chiều cao đình, các đầu đao cong vút mềm mại như cánh chim. Bên trong là hệ thống cột gỗ lim lớn và các mảng chạm khắc tứ linh (Long, Ly, Quy, Phượng), tứ quý rất tinh xảo.",
    image: "pictures-thuvien/kien-truc/kinh/arch-kinh-dinh.png"
  },
  {
    id: "arch-kinh-chua", category: "architecture",
    ethnic: "Kinh",
    title: "Chùa Bắc Tông",
    desc: "Không gian Phật giáo thanh tịnh.",
    content: "Chùa Việt thường có kiến trúc chữ Tam, chữ Công với tam quan, tiền đường, thượng điện. Điểm nhấn là tháp chuông uy nghiêm và hệ thống tượng Phật sơn son thếp vàng lộng lẫy.",
    image: "pictures-thuvien/kien-truc/kinh/arch-kinh-chua.jpg"
  },
  {
    id: "arch-kinh-nharuong", category: "architecture",
    ethnic: "Kinh",
    title: "Nhà Rường Huế",
    desc: "Tinh hoa kiến trúc gỗ truyền thống.",
    content: "Nhà Rường là loại nhà ở 3 gian 2 chái đặc trưng của quan lại và tầng lớp thượng lưu xưa. Toàn bộ khung nhà bằng gỗ mít hoặc lim, được liên kết bằng mộng, không dùng đinh. Các cột, kèo được chạm trổ cực kỳ tinh vi.",
    image: "pictures-thuvien/kien-truc/kinh/arch-kinh-nharuong.jpg"
  },

  // Nhóm Chăm
  {
    id: "arch-cham-thap", category: "architecture", ethnic: "Chăm",
    title: "Tháp Chăm (Kalan)", desc: "Đỉnh cao kỹ thuật xây gạch không mạch.",
    content: "Kalan là đền thờ các vị thần Hindu (Shiva), tượng trưng cho ngọn núi thần thoại Meru. Đặc điểm nổi bật là kỹ thuật xây gạch mài chập, khít mạch không cần vữa kết dính mà vẫn đứng vững ngàn năm. Trên mặt tường gạch là các phù điêu chạm khắc trực tiếp.",
    image: "pictures-thuvien/kien-truc/cham/arch-cham-thap.jpg"
  },
  {
    id: "arch-cham-nhatuc", category: "architecture", ethnic: "Chăm",
    title: "Nhà Tục", desc: "Ngôi nhà gìn giữ phong tục mẫu hệ.",
    content: "Trong khuôn viên gia đình người Chăm, Nhà Tục là nơi quan trọng nhất, nơi diễn ra các nghi lễ vòng đời và thờ cúng tổ tiên. Nhà thường thấp, kín đáo, thể hiện sự tôn nghiêm.",
    image: "pictures-thuvien/kien-truc/cham/arch-cham-nhatuc.jpg"
  },

  // Nhóm Khmer
  {
    id: 'arch-khmer-chua', category: 'architecture', ethnic: 'Khmer',
    title: 'Chùa Khmer (Vihear)', desc: 'Rực rỡ sắc vàng Phật giáo Nam Tông.',
    content: "Chùa là trung tâm sinh hoạt của phum sóc. Chánh điện (Vihear) là kiến trúc chính, mái nhọn nhiều tầng, trang trí tượng rắn Naga, chim thần Keynor, chằn Yeak. Màu vàng rực rỡ tượng trưng cho sự giác ngộ.",
    image: "pictures-thuvien/kien-truc/khmer/arch-khmer-chua.jpg"
  },

  // Nhóm Tây Nguyên (Gia Rai, Ê Đê, Ba Na...)
  {
    id: 'arch-ede-nhadai', category: 'architecture', ethnic: 'Ê Đê',
    title: 'Nhà Dài', desc: 'Dài như tiếng chiêng ngân.',
    content: "Nhà Dài là nơi sinh sống của đại gia đình mẫu hệ. Nhà làm bằng tre nứa gỗ, sàn cao, có cầu thang đực (cho khách) và cầu thang cái (có hình bầu vú, cho người nhà). Độ dài của nhà thể hiện sự thịnh vượng của dòng họ.",
    image: "pictures-thuvien/kien-truc/e-de/arch-ede-nhadai.jpg"
  },
  {
    id: 'arch-bana-nharong', category: 'architecture', ethnic: 'Ba Na',
    title: 'Nhà Rông', desc: 'Lưỡi rìu vút cao giữa đại ngàn.',
    content: "Nhà Rông là ngôi nhà chung, nơi hội họp, xử kiện và tiếp khách của buôn làng Ba Na, Xơ Đăng. Mái nhà cao vút như lưỡi rìu ngược (có thể cao tới 20m), thể hiện sức mạnh và uy quyền của làng trước thiên nhiên.",
    image: "pictures-thuvien/kien-truc/ba-na/arch-bana-nharong.jpg"
  },
  {
    id: 'arch-giarai-nhamo', category: 'architecture', ethnic: 'Gia Rai',
    title: 'Nhà Mồ', desc: 'Kiến trúc tâm linh và nghệ thuật tạc tượng.',
    content: "Nhà mồ được xây dựng công phu cho người chết trước lễ Bỏ mả. Xung quanh nhà mồ là hàng rào tượng gỗ (tượng người khóc, tượng phồn thực...) thể hiện quan niệm sinh sôi nảy nở.",
    image: "pictures-thuvien/kien-truc/gia-rai/arch-giarai-nhamo.jpg"
  },

  // Nhóm Tây Bắc (Thái, H'Mông...)
  {
    id: 'arch-thai-nhasan', category: 'architecture', ethnic: 'Thái',
    title: 'Nhà Sàn Thái', desc: 'Duyên dáng với Khau Cút trên nóc.',
    content: "Nhà sàn người Thái cao ráo, sạch sẽ. Người Thái Đen có biểu tượng Khau Cút trên nóc nhà hình sừng trâu hoặc cánh hoa sen. Người Thái Trắng có lan can chạy quanh nhà.",
    image: "pictures-thuvien/kien-truc/thai/arch-thai-nhasan.jpg"
  },
  {
    id: 'arch-hmong-trinhtuong', category: 'architecture', ethnic: "H'Mông",
    title: 'Nhà Trình Tường', desc: 'Pháo đài đất ấm áp trên cao nguyên đá.',
    content: "Nhà người Mông làm bằng đất nện dày để chống lại cái lạnh khắc nghiệt của vùng cao. Cột kê trên đá tảng, mái thấp lợp ngói âm dương hoặc ván pơ mu. Xung quanh thường có hàng rào đá xếp chồng không cần chất kết dính.",
    image: "pictures-thuvien/kien-truc/hmong/arch-hmong-trinhtuong.jpg"
  },
  {
    id: 'arch-dao-nhanuasan', category: 'architecture', ethnic: 'Dao',
    title: 'Nhà Nửa Sàn Nửa Đất', desc: 'Thích nghi với địa hình dốc.',
    content: "Do sống ở sườn núi dốc, người Dao (đặc biệt là Dao Khâu) làm nhà một nửa là sàn cột gỗ, một nửa nền đất đắp bằng phẳng. Bàn thờ Bàn Vương luôn được đặt ở vị trí trang trọng nhất.",
    image: "pictures-thuvien/kien-truc/dao/arch-dao-nhanuasan.jpg"
  },
  {
    id: 'arch-hanhi-nhanam', category: 'architecture', ethnic: 'Hà Nhì',
    title: 'Nhà Trình Tường Hình Nấm', desc: 'Vẻ đẹp cổ tích nơi biên cương.',
    content: "Tường đất nện dày tới 40-50cm, mái tranh phủ kín xuống tận tường giống như cây nấm khổng lồ. Kiến trúc này giúp ngôi nhà ấm vào mùa đông và mát vào mùa hè.",
    image: "pictures-thuvien/kien-truc/ha-nhi/arch-hanhi-nhanam.jpg"
  },

  // ==================== NGHI LỄ (RITUALS) ====================
  // Kinh
  {
    id: 'rit-kinh-mau', category: 'ritual', ethnic: 'Kinh',
    title: 'Tín Ngưỡng Thờ Mẫu (Lên Đồng)', desc: 'Di sản văn hóa phi vật thể của nhân loại.',
    content: "Nghi lễ nhập hồn và hầu thánh, thể hiện sự giao tiếp giữa con người và thần linh. Các giá hầu đồng kết hợp âm nhạc chầu văn, trang phục rực rỡ và vũ đạo uyển chuyển. Đây là nghi lễ cầu sức khỏe, tài lộc và may mắn.",
    image: "pictures-thuvien/nghi-le/kinh/tho-mau-len-dong-kinh.webp"
  },
  {
    id: 'rit-kinh-cungto', category: 'ritual', ethnic: 'Kinh',
    title: 'Thờ Cúng Tổ Tiên', desc: 'Đạo lý uống nước nhớ nguồn.',
    content: "Mỗi gia đình người Việt đều có bàn thờ tổ tiên. Nghi lễ cúng giỗ vào ngày mất của người thân là dịp con cháu sum họp, tưởng nhớ công ơn sinh thành dưỡng dục.",
    image: "pictures-thuvien/nghi-le/kinh/tho-cung-to-tien-kinh.jpg"
  },

  // Chăm
  {
    id: 'rit-cham-truongthanh', category: 'ritual', ethnic: 'Chăm',
    title: 'Lễ Trưởng Thành', desc: 'Dấu mốc của thiếu nữ Chăm.',
    content: "Nghi lễ bắt buộc đối với các thiếu nữ Chăm khi đến tuổi dậy thì (khoảng 15-16 tuổi). Chỉ sau nghi lễ này, người con gái mới được công nhận là thành viên chính thức của cộng đồng và được phép lấy chồng.",
    image: "pictures-thuvien/nghi-le/cham/le-truong-thanh-nguoi-cham.jpg"
  },
  {
    id: 'rit-cham-rija', category: 'ritual', ethnic: 'Chăm',
    title: 'Lễ Rija Nưgar', desc: 'Lễ tống ôn, đạp lửa đầu năm.',
    content: "Rija Nưgar là lễ hội mở đầu năm mới, nhằm tẩy uế, xua đuổi những điều xấu xa. Điểm nhấn là điệu múa đạp lửa của thầy Ka-ing, thể hiện sức mạnh xua đuổi tà ma.",
    image: "pictures-thuvien/nghi-le/cham/le-hoi-rija-nagar-nguoi-cham.jpg"
  },

  // Khmer
  {
    id: 'rit-khmer-kathina', category: 'ritual', ethnic: 'Khmer',
    title: 'Lễ Dâng Y Kathina', desc: 'Cầu phước lớn nhất Phật giáo Nam tông.',
    content: "Sau 3 tháng an cư kiết hạ, phật tử tổ chức lễ rước y cà sa dâng lên các nhà sư. Lễ rước trang nghiêm, rực rỡ sắc vàng, thể hiện lòng thành kính với Tam Bảo.",
    image: "pictures-thuvien/nghi-le/khmer/le-dang-y-kathina_khmer.jpg"
  },

  // Dao
  {
    id: 'rit-dao-capsac', category: 'ritual', ethnic: 'Dao',
    title: 'Lễ Cấp Sắc (Quá Tang)', desc: 'Cột mốc trưởng thành của đàn ông Dao.',
    content: "Người đàn ông Dao phải trải qua lễ Cấp Sắc mới được công nhận là người lớn, được đặt tên âm và sau này khi chết mới được về với tổ tiên. Nghi lễ răn dạy đạo đức, kính trọng cha mẹ và sống hướng thiện.",
    image: "pictures-thuvien/nghi-le/dao/le-cap-sac-nguoi-dao.jpg"
  },

  // Tây Nguyên
  {
    id: 'rit-giarai-pothi', category: 'ritual', ethnic: 'Gia Rai',
    title: 'Lễ Bỏ Mả (Pơ Thi)', desc: 'Cuộc chia ly vĩnh viễn bi tráng.',
    content: "Lễ hội lớn nhất Tây Nguyên. Sau nhiều năm nuôi mộ, gia đình làm lễ lớn, dựng nhà mồ đẹp, tạc tượng gỗ để tiễn đưa linh hồn người chết về thế giới bên kia vĩnh viễn. Sau lễ này, người sống không còn thăm nom mộ nữa.",
    image: "pictures-thuvien/nghi-le/gia-rai/le-bo-ma-gia-rai.jpg"
  },
  {
    id: 'rit-bana-damtrau', category: 'ritual', ethnic: 'Ba Na',
    title: 'Lễ Đâm Trâu', desc: 'Hiến sinh tạ ơn thần linh (Yang).',
    content: "Cây nêu thần được dựng lên. Trong tiếng cồng chiêng vang dội, các chàng trai cô gái nhảy múa vòng tròn. Con trâu hiến tế là vật trung gian gửi gắm lời cầu nguyện mưa thuận gió hòa, buôn làng no ấm lên các vị thần.",
    image: "pictures-thuvien/nghi-le/ba-na/le-hoi-dam-trau-ba-na.jpg"
  },
  {
    id: 'rit-ede-bennuoc', category: 'ritual', ethnic: 'Ê Đê',
    title: 'Lễ Cúng Bến Nước', desc: 'Cầu mong nguồn nước sạch dồi dào.',
    content: "Hàng năm sau mùa thu hoạch, buôn làng tổ chức cúng tạ ơn thần Nước. Bến nước được dọn dẹp sạch sẽ, thầy cúng dâng rượu cần cầu mong nguồn nước không bao giờ cạn, dân làng không bị ốm đau.",
    image: "pictures-thuvien/nghi-le/e-de/le-hoi-cung-nuoc-ede.jpg"
  },

  // Các dân tộc khác
  {
    id: 'rit-muong-mo', category: 'ritual', ethnic: 'Mường',
    title: 'Mo Mường', desc: 'Sử thi tang lễ dẫn đường linh hồn.',
    content: "Trong đám tang, ông Mo sẽ đọc (diễn xướng) hàng vạn câu thơ trong bộ sử thi 'Đẻ đất đẻ nước' để kể về nguồn gốc con người và dẫn đường cho linh hồn người chết vượt qua các cửa ải để về Mường Trời.",
    image: "pictures-thuvien/nghi-le/muong/mo-muong-nguoi-muong.jpg"
  },
  {
    id: 'rit-thai-tangcau', category: 'ritual', ethnic: 'Thái',
    title: 'Lễ Tằng Cẩu', desc: 'Nghi thức búi tóc thủy chung.',
    content: "Trước khi về nhà chồng, cô dâu Thái Đen được mẹ chồng hoặc người có uy tín chải tóc và búi ngược lên đỉnh đầu (Tằng cẩu). Từ đây, người phụ nữ chính thức có chồng, búi tóc là biểu tượng của lòng thủy chung son sắt.",
    image: "pictures-thuvien/nghi-le/thai/le-tang-cau-thai.jpg"
  },
  {
    id: 'rit-odu-tiengsam', category: 'ritual', ethnic: 'Ơ Đu',
    title: 'Lễ Tiếng Sấm', desc: 'Đón năm mới theo tiếng sấm đầu mùa.',
    content: "Dân tộc Ơ Đu quan niệm tiếng sấm đầu xuân là dấu hiệu thần linh thức dậy. Khi nghe tiếng sấm, họ mới bắt đầu làm lễ cúng trời đất, giết gà, lợn ăn mừng năm mới.",
    image: "pictures-thuvien/nghi-le/odu/le-tieng-sam-o-du.jpg"
  },
  {
    id: 'rit-lahu-thanrung', category: 'ritual', ethnic: 'La Hủ',
    title: 'Cúng Thần Rừng', desc: 'Xin phép mẹ thiên nhiên.',
    content: "Người La Hủ ('Lá Vàng') sống dựa vào rừng. Vào dịp lễ, họ cúng thần rừng để xin phép săn bắn hái lượm và cầu mong không bị thú dữ làm hại, cây rừng luôn xanh tốt.",
    image: "pictures-thuvien/nghi-le/la-hu/cung-than-rung-la-hu.jpg"
  },
  {
    id: 'rit-chut-laplo', category: 'ritual', ethnic: 'Chứt',
    title: 'Lễ Lấp Lỗ', desc: 'Gieo hạt giống hy vọng.',
    content: "Vào ngày 7/7 âm lịch, người Chứt (Rục, Sách) đào lỗ tra hạt giống xuống đất, sau đó lấp lại và làm lễ cúng thần linh. Nghi thức tượng trưng cho sự sinh sôi nảy nở của cây trồng.",
    image: "pictures-thuvien/nghi-le/chut/le-lap-lo-dan-toc-chut.jpg"
  },
  {
    id: 'rit-cong-hoamaoga', category: 'ritual', ethnic: 'Cống',
    title: 'Lễ Hoa Mào Gà', desc: 'Sắc đỏ may mắn nơi biên cương.',
    content: "Người Cống coi hoa mào gà là biểu tượng của may mắn. Vào Tết cổ truyền (tháng 11), họ hái hoa mào gà về trang trí nhà cửa, cúng tổ tiên và cài lên tóc để cầu bình an.",
    image: "pictures-thuvien/nghi-le/cong/le-hoa-mao-ga-cong.jpg"
  },
  {
    id: 'rit-sila-camban', category: 'ritual', ethnic: 'Si La',
    title: 'Lễ Cấm Bản', desc: 'Không gian thiêng liêng biệt lập.',
    content: "Vào dịp cúng thần bản, người Si La dựng cổng chào, treo ký hiệu cấm người lạ vào bản. Trong thời gian này, nội bất xuất, ngoại bất nhập để đảm bảo sự thanh tịnh cho nghi lễ.",
    image: "pictures-thuvien/nghi-le/si-la/le-cam-ban-si-la.jpg"
  },

  // ==================== LỄ HỘI (FESTIVALS) ====================
  // Kinh
  {
    id: "fes-kinh-tet",
    category: "festival",
    ethnic: "Kinh",
    title: "Tết Nguyên Đán",
    desc: "Lễ hội lớn nhất và thiêng liêng nhất.",
    content: "Tết Nguyên Đán là dịp đoàn viên, sum họp gia đình. Bắt đầu từ lễ cúng ông Công ông Táo (23 tháng Chạp), gói bánh chưng, cúng Giao thừa, hái lộc đầu xuân. Trong 3 ngày Tết, mọi người đi chúc Tết họ hàng, thầy cô, bạn bè.",
    image: "pictures-thuvien/le-hoi/kinh/fes-kinh-tet.jpg"
  },
  {
    id: "fes-kinh-hung",
    category: "festival",
    ethnic: "Kinh",
    title: "Giỗ Tổ Hùng Vương",
    desc: "Tín ngưỡng thờ cúng tổ tiên độc đáo.",
    content: "'Dù ai đi ngược về xuôi, nhớ ngày Giỗ Tổ mùng mười tháng ba'. Lễ hội diễn ra tại đền Hùng (Phú Thọ) để tưởng nhớ 18 đời vua Hùng đã có công dựng nước. Nghi lễ dâng hương, rước kiệu thể hiện đạo lý uống nước nhớ nguồn.",
    image: "pictures-thuvien/le-hoi/kinh/fes-kinh-hung.jpg"
  },
  {
    id: "fes-kinh-giong",
    category: "festival",
    ethnic: "Kinh",
    title: "Hội Gióng",
    desc: "Hào khí chống giặc ngoại xâm.",
    content: "Lễ hội tại đền Sóc và đền Phù Đổng tôn vinh Thánh Gióng - một trong Tứ bất tử. Các màn diễn xướng chiến trận mô phỏng cuộc chiến chống giặc Ân được tổ chức quy mô, hoành tráng.",
    image: "pictures-thuvien/le-hoi/kinh/fes-kinh-giong.jpeg"
  },
  {
    id: "fes-kinh-lim",
    category: "festival",
    ethnic: "Kinh",
    title: "Hội Lim",
    desc: "Câu hát quan họ người ơi người ở.",
    content: "Lễ hội vùng Kinh Bắc với đặc sản là hát Quan họ đối đáp trên thuyền rồng và dưới cửa đình. Các liền anh liền chị trong trang phục mớ ba mớ bảy hát những làn điệu trữ tình.",
    image: "pictures-thuvien/le-hoi/kinh/fes-kinh-lim.jpeg"
  },

  // Khmer
  {
    id: "fes-khmer-chol",
    category: "festival",
    ethnic: "Khmer",
    title: "Chol Chnam Thmay",
    desc: "Tết năm mới, té nước cầu may.",
    content: "Diễn ra vào giữa tháng 4 dương lịch. Người dân đến chùa đắp núi cát (cầu phúc), tắm Phật bằng nước thơm và té nước vào nhau để gột rửa điều xui xẻo. Đây là lễ hội vui tươi nhất của người Khmer Nam Bộ.",
    image: "pictures-thuvien/le-hoi/khmer/fes-khmer-chol.jpg"
  },
  {
    id: "fes-khmer-okombok",
    category: "festival",
    ethnic: "Khmer",
    title: "Ok Om Bok",
    desc: "Cúng Trăng và Đua Ghe Ngo kịch tính.",
    content: "Vào rằm tháng 10 âm lịch, người Khmer cúng tạ ơn thần Mặt Trăng đã ban cho mùa màng tốt tươi. Cốm dẹp là vật phẩm không thể thiếu. Lễ hội kết thúc bằng cuộc đua Ghe Ngo hào hứng và thả đèn gió.",
    image: "pictures-thuvien/le-hoi/khmer/fes-khmer-okombok.jpg"
  },

  // Thái
  {
    id: "fes-thai-hoaban",
    category: "festival",
    ethnic: "Thái",
    title: "Lễ Hội Hoa Ban",
    desc: "Mùa hoa tình yêu Tây Bắc.",
    content: "Tháng 2 âm lịch, khi hoa ban nở trắng rừng, người Thái tổ chức lễ hội để cầu mưa và tưởng nhớ chuyện tình nàng Ban chàng Khum. Trai gái hò hẹn, chơi ném còn, hát giao duyên trong không khí lãng mạn.",
    image: "pictures-thuvien/le-hoi/thai/fes-thai-hoaban.jpg"
  },

  // Chăm
  {
    id: "fes-cham-kate",
    category: "festival",
    ethnic: "Chăm",
    title: "Lễ Hội Kate",
    desc: "Lễ hội lớn nhất bên tháp cổ.",
    content: "Diễn ra vào tháng 7 lịch Chăm tại các khu đền tháp Po Nagar, Po Rome. Người dân rước y phục của vua chúa lên tháp, làm lễ tắm tượng, mặc y phục cho tượng thần. Đây là dịp con cháu tưởng nhớ tổ tiên.",
    image: "pictures-thuvien/le-hoi/cham/fes-cham-kate.jpg"
  },

  // H'Mông, Tày, Dao...
  {
    id: "fes-hmong-gautao",
    category: "festival",
    ethnic: "H'Mông",
    title: "Lễ Hội Gầu Tào",
    desc: "Cầu phúc, cầu mệnh đầu xuân.",
    content: "Gia đình nào hiếm muộn hoặc hay ốm đau sẽ nhờ thầy cúng dựng cây nêu giữa bãi đất rộng để tổ chức Gầu Tào. Đây cũng là dịp vui chơi xuân lớn nhất, trai gái múa khèn, hát gấu plềnh tìm bạn tình.",
    image: "pictures-thuvien/le-hoi/hmong/fes-hmong-gautao.jpg"
  },
  {
    id: "fes-tay-longtong",
    category: "festival",
    ethnic: "Tày",
    title: "Lễ Lồng Tồng",
    desc: "Hội xuống đồng lớn nhất Việt Bắc.",
    content: "Diễn ra vào tháng Giêng. Dân làng cúng Thần Nông cầu mùa. Tâm điểm là hội tung còn: quả còn ngũ sắc phải ném thủng tâm vòng tròn trên cây nêu cao vút thì năm đó bản làng mới may mắn.",
    image: "pictures-thuvien/le-hoi/tay/fes-tay-longtong.jpg"
  },
  {
    id: "fes-dao-tetnhay",
    category: "festival",
    ethnic: "Dao",
    title: "Tết Nhảy",
    desc: "Vũ điệu tri ân Bàn Vương.",
    content: "Một gia đình hoặc dòng họ tổ chức nhảy múa thâu đêm suốt sáng để tạ ơn Bàn Vương đã cứu mạng trong quá trình di cư. Các điệu múa mô tả cảnh luyện binh, săn bắn, cày cấy rất sinh động.",
    image: "pictures-thuvien/le-hoi/dao/fes-dao-tetnhay.jpg"
  },
  {
    id: "fes-pathen-nhaylua",
    category: "festival",
    ethnic: "Pà Thẻn",
    title: "Lễ Hội Nhảy Lửa",
    desc: "Vũ điệu thần bí trên than hồng.",
    content: "Các chàng trai Pà Thẻn sau khi được thầy cúng làm phép nhập đồng sẽ nhảy vào đống than hồng rực bằng chân trần, bốc than tung lên mà không hề bị bỏng. Nghi lễ thể hiện sức mạnh thần linh che chở con người.",
    image: "pictures-thuvien/le-hoi/pa-then/nhay-lua.jpg"
  },
  {
    id: "fes-mnong-duavoi",
    category: "festival",
    ethnic: "M'Nông",
    title: "Lễ Hội Đua Voi",
    desc: "Tinh thần thượng võ Bản Đôn.",
    content: "Tổ chức tại Buôn Đôn, Đắk Lắk. Những chú voi to lớn dưới sự điều khiển của nài voi thi chạy, thi bơi vượt sông Sêrêpôk. Lễ hội tôn vinh tài nghệ thuần dưỡng voi của người M'Nông.",
    image: "pictures-thuvien/le-hoi/mnong/fes-mnong-duavoi.jpg"
  },
  {
    id: "fes-lolo-caumua",
    category: "festival",
    ethnic: "Lô Lô",
    title: "Lễ Cầu Mưa",
    desc: "Hóa trang người rừng gọi mưa.",
    content: "Vào năm hạn hán, người Lô Lô Chải tổ chức lễ cầu mưa. Điểm độc đáo là những người đàn ông hóa trang toàn thân bằng lá ngô, lá cây, múa nhịp nhàng quanh đàn cúng để mời thần Mưa về.",
    image: "pictures-thuvien/le-hoi/lo-lo/fes-lolo-caumua.jpg"
  },
  {
    id: "fes-hanhi-khogiagia",
    category: "festival",
    ethnic: "Hà Nhì",
    title: "Lễ Khô Già Già",
    desc: "Lễ hội cầu mùa tháng 6.",
    content: "Lễ hội lớn nhất trong năm của người Hà Nhì Đen. Họ mổ trâu hiến tế, dựng cây đu, chơi bập bênh. Đây là dịp để cộng đồng gắn kết và cầu mong mùa màng bội thu.",
    image: "pictures-thuvien/le-hoi/ha-nhi/fes-hanhi-khogiagia.jpg"
  }
];

export default Library;
