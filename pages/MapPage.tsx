import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, ZoomControl, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';

interface HeritageSite {
  id: string;
  name: string;
  type: 'UNESCO' | 'Đặc biệt' | 'Quốc gia';
  unescoYear?: string;
  category: 'temple' | 'citadel' | 'nature';
  location: string;
  coords: [number, number];
  description: string;
  img: string;
  vrEmbedUrl: string; 
}

const MAP_CENTER: [number, number] = [16.4673, 107.5905];

const MapFixer = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 500);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

// ... (Giữ nguyên heritageData) ...
export const heritageData: HeritageSite[] = [
  { id: 'yentu', name: "Yên Tử – Vĩnh Nghiêm – Côn Sơn, Kiếp Bạc", type: 'UNESCO', unescoYear: '2025', category: 'temple', location: "Quảng Ninh, Bắc Giang và Hải Phòng", coords: [21.1578, 106.7214], description: "Vùng đất thiêng của Phật giáo Trúc Lâm, nơi hội tụ linh khí đất trời và những giá trị lịch sử, văn hóa vô giá.", img: "https://cdn2.tuoitre.vn/thumb_w/1200/471584752817336320/2025/7/12/chua-yen-tu-17523255573811017341205-80-0-1152-2048-crop-1752325584572837395867.jpg", vrEmbedUrl: "https://smarttravel-vr.mobifone.vn/vr-tour/quan-the-di-tich-va-danh-lam-thang-canh-yen-tu/66a8e8db9b37be124d53b99a" },
  { id: 'thanh-nha-ho', name: "Thành Nhà Hồ", type: 'UNESCO', unescoYear: '2011', category: 'citadel', location: "Thanh Hóa", coords: [20.0782, 105.6067], description: "Tòa thành đá độc nhất vô nhị ở Đông Nam Á với kỹ thuật ghép đá tinh xảo từ thế kỷ 14.", img: "https://image.sggp.org.vn/1200x630/Uploaded/2026/lcgkcwvo/2023_11_14/1-9587.jpg.webp", vrEmbedUrl: "https://yootek.vn/chiem-nguong-toan-canh-thanh-nha-ho/" },
  { id: 'myson', name: "Thánh địa Mỹ Sơn", type: 'UNESCO', unescoYear: '1999', category: 'temple', location: "Quảng Nam", coords: [15.7643, 108.1245], description: "Khu di tích đền tháp gạch nung độc đáo của vương quốc Champa cổ đại giữa thung lũng linh thiêng.", img: "https://fvgtravel.com.vn/uploads/up/root/editor/2025/05/20/19/33/w1230/tha1747722808_5733.jpg", vrEmbedUrl: "https://my.matterport.com/show/?m=zMqkoZNoadz" },
  { id: 'hue', name: "Quần thể di tích Cố đô Huế", type: 'UNESCO', unescoYear: '1993', category: 'citadel', location: "Thừa Thiên Huế", coords: [16.4676, 107.5904], description: "Kinh đô của triều đại phong kiến cuối cùng Việt Nam, di sản đầu tiên được UNESCO công nhận.", img: "https://ik.imagekit.io/tvlk/blog/2025/03/quan-the-di-tich-co-do-hue-2-1024x576.jpg?tr=q-70,c-at_max,w-1000,h-600", vrEmbedUrl: "https://www.google.com/maps/embed?pb=!4v1715600000000!6m8!1m2!1sAF1QipMfZ_cZH3QhkJJRvD3Ihzq0qNx1IVIla7np2njI!2i7!3m1!7e115!9m1!2b1" },
  { id: 'halong', name: "Vịnh Hạ Long", type: 'UNESCO', unescoYear: '1994, 2000', category: 'nature', location: "Quảng Ninh", coords: [20.9492, 107.0522], description: "Kỳ quan thiên nhiên thế giới với hàng ngàn đảo đá vôi vươn lên từ mặt biển xanh ngọc lục bảo.", img: "https://tructhang.vn/wp-content/uploads/2022/08/Vinh-Ha-Long.jpg", vrEmbedUrl: "https://www.halomedia.vn/360tours/ha-long-bay" },
  { id: 'hoian', name: "Phố cổ Hội An", type: 'UNESCO', unescoYear: '1999', category: 'citadel', location: "Quảng Nam", coords: [15.8802, 108.3381], description: "Thương cảng quốc tế thế kỷ 17 được bảo tồn nguyên vẹn với những dãy nhà vàng và đèn lồng rực rỡ.", img: "https://images.vietnamtourism.gov.vn/vn//images/2023/cd_hoi_an5.jpeg", vrEmbedUrl: "https://www.halomedia.vn/360tours/hoi-an-360-tour" },
  { id: 'phongnha', name: "Phong Nha - Kẻ Bàng", type: 'UNESCO', unescoYear: '2003, 2015', category: 'nature', location: "Quảng Bình", coords: [17.5412, 106.1545], description: "Vương quốc hang động thế giới, nơi sở hữu Sơn Đoòng và hệ thống núi đá vôi cổ nhất châu Á.", img: "https://vietnamdiscovery.com/wp-content/uploads/2019/11/Phong-nha-ke-bang-national-park.jpg", vrEmbedUrl: "https://www.halomedia.vn/360tours/phong-nha" },
  { id: 'thanglong', name: "Hoàng thành Thăng Long", type: 'UNESCO', unescoYear: '2010', category: 'citadel', location: "Hà Nội", coords: [21.0371, 105.8376], description: "Trung tâm quyền lực bền vững trải dài hơn 13 thế kỷ của các vương triều Việt Nam.", img: "https://lamejorhotel.com/UploadFile/Blog/anh1%20ho%C3%A0ng%20th%C3%A0nh.jpg", vrEmbedUrl: "https://trungbayonline.hoangthanhthanglong.vn/TB360/D67" },
  { id: 'trangan', name: "Quần thể danh thắng Tràng An", type: 'UNESCO', unescoYear: '2014', category: 'nature', location: "Ninh Bình", coords: [20.2465, 105.9128], description: "Di sản thế giới kép đầu tiên và duy nhất tại Việt Nam kết hợp vẻ đẹp thiên nhiên và lịch sử.", img: "https://media.vneconomy.vn/images/upload/2024/10/31/89.jpg", vrEmbedUrl: "https://www.halomedia.vn/360tours/ninh-binh" },
  { id: 'catba', name: "Vịnh Hạ Long - Cát Bà", type: 'UNESCO', unescoYear: '2023', category: 'nature', location: "Hải Phòng - Quảng Ninh", coords: [20.8033, 107.0375], description: "Sự mở rộng liên vùng mới nhất của UNESCO vinh danh hệ sinh thái biển đảo kỳ vĩ của Việt Nam.", img: "https://ktmt.vnmediacdn.com/images/2024/08/25/98-1724593455-vinh-ha-long-quan-dao-cat-ba-duoc-cong-nhan-la-di-san-dia-chat-quoc-te-20240825135755.jpg", vrEmbedUrl: "https://www.google.com/maps/embed?pb=!4v1715600000000!6m8!1m2!1sAF1QipN3Uo5q4O_X_Vq0Bf0b0uY5z_r1r7v_YlU9V0p!2i7!3m1!7e115!9m1!2b1" }
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'temple': return 'temple_buddhist';
    case 'citadel': return 'castle';
    case 'nature': return 'landscape';
    default: return 'location_on';
  }
};

const VRViewerModal = ({ site, onClose }: { site: HeritageSite, onClose: () => void }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="fixed inset-0 z-[100000] bg-black/90 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-black w-full max-w-7xl h-[80vh] rounded-[2rem] overflow-hidden border-4 border-gold/40 shadow-2xl relative flex flex-col">
        {/* Header Bar */}
        <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-between items-center z-[110] bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
          <div className="flex items-center gap-4 text-white text-left pointer-events-auto">
             <div className="size-10 md:size-12 rounded-full bg-primary flex items-center justify-center text-white border border-gold">
                <span className="material-symbols-outlined text-2xl">view_in_ar</span>
             </div>
             <div>
               <h2 className="text-lg md:text-xl font-black uppercase leading-none">{site.name}</h2>
               <p className="text-gold text-[10px] uppercase tracking-[0.2em] mt-1">Xoay để xem toàn cảnh</p>
             </div>
          </div>
          <button 
            onClick={onClose} 
            className="pointer-events-auto bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-black uppercase text-xs flex items-center gap-2 shadow-glow border-2 border-white transition-transform hover:scale-105 active:scale-95"
          >
            <span>THOÁT VR</span>
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        
        <div className="flex-1 relative bg-zinc-900">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
               <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mb-4"></div>
               <p className="text-gold font-black uppercase tracking-widest animate-pulse text-xs">Đang tải không gian...</p>
            </div>
          )}
          <iframe 
            src={site.vrEmbedUrl} 
            className="w-full h-full border-none" 
            onLoad={() => setIsLoading(false)} 
            allowFullScreen 
            title={site.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

const MapPage: React.FC = () => {
  const [selectedSite, setSelectedSite] = useState<HeritageSite | null>(null);
  const [hoveredSiteId, setHoveredSiteId] = useState<string | null>(null);
  const [isVRMode, setIsVRMode] = useState(false);

  const createMarkerIcon = (site: HeritageSite, isHovered: boolean, isSelected: boolean) => {
    const isUNESCO = site.type === 'UNESCO';
    const iconName = getCategoryIcon(site.category);
    const size = isSelected ? 52 : isHovered ? 44 : 38;
    return L.divIcon({
      className: 'custom-heritage-marker',
      html: `
        <div class="relative flex items-center justify-center transition-all duration-300" style="width:${size}px; height:${size}px;">
          ${isUNESCO ? '<div class="absolute inset-0 bg-gold/40 rounded-full animate-ping"></div>' : ''}
          <div class="absolute inset-0 bg-white rounded-full border-2 ${isSelected ? 'border-primary scale-110 shadow-xl' : 'border-gold/60'} flex items-center justify-center">
             <span class="material-symbols-outlined" style="font-size: ${size * 0.55}px; color: ${isSelected ? '#A11D1D' : '#3E1C1C'}; font-variation-settings: 'FILL' 1;">${iconName}</span>
          </div>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)] overflow-hidden bg-background-light font-display relative">
      {isVRMode && selectedSite && <VRViewerModal site={selectedSite} onClose={() => setIsVRMode(false)} />}
      
      <aside className="w-full lg:w-[450px] bg-background-light border-r border-gold/15 flex flex-col shadow-2xl z-20">
        <div className="p-8 border-b border-gold/20 bg-primary shrink-0 text-left">
          <h2 className="text-2xl font-black text-white italic tracking-tighter mb-1 uppercase leading-tight">Bản Đồ <span className="text-gold">Di Sản</span></h2>
          <p className="text-[9px] font-black uppercase text-gold-light tracking-[0.4em]">Tinh hoa văn hóa Việt Nam</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[#F7F3E9]">
          {heritageData.map((site) => (
            <button 
              key={site.id} 
              onMouseEnter={() => setHoveredSiteId(site.id)} 
              onMouseLeave={() => setHoveredSiteId(null)} 
              onClick={() => setSelectedSite(site)} 
              className={`w-full text-left p-4 rounded-3xl transition-all border-2 flex items-center gap-4 group ${
                selectedSite?.id === site.id 
                ? 'bg-primary border-primary text-white shadow-xl scale-[1.01]' 
                : 'bg-white border-gold/10 text-text-main hover:border-primary/40 shadow-sm'
              }`}
            >
              <div className={`size-12 rounded-full flex items-center justify-center shrink-0 shadow-inner ${
                selectedSite?.id === site.id ? 'bg-white/10 text-gold' : 'bg-primary/5 text-primary'
              }`}>
                <span className="material-symbols-outlined text-2xl font-variation-settings: 'FILL' 1;">{getCategoryIcon(site.category)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black uppercase text-[13px] leading-tight tracking-tight mb-0.5">{site.name}</h4>
                <div className="flex items-center gap-2">
                   <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedSite?.id === site.id ? 'text-gold-light/70' : 'text-bronze'}`}>
                    {site.location}
                  </p>
                  {site.unescoYear && (
                    <span className="text-[9px] bg-gold/20 text-gold px-2 py-0.5 rounded-full font-black">UNESCO {site.unescoYear}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 relative bg-background-light overflow-hidden p-4 lg:p-8">
        <div className="w-full h-full rounded-[2.5rem] overflow-hidden border-2 border-gold/20 shadow-inner relative">
          <MapContainer center={MAP_CENTER} zoom={6} className="w-full h-full" zoomControl={false} attributionControl={false}>
            <MapFixer />
            <TileLayer url="https://mt1.google.com/vt/lyrs=m&hl=vi&x={x}&y={y}&z={z}" noWrap={true} />
            <ZoomControl position="bottomright" />
            {heritageData.map((site) => (
              <Marker 
                key={site.id} 
                position={site.coords} 
                icon={createMarkerIcon(site, hoveredSiteId === site.id, selectedSite?.id === site.id)} 
                eventHandlers={{ click: () => setSelectedSite(site) }}
              >
                <Tooltip direction="top" offset={[0, -25]} opacity={1}>
                  <div className="px-3 py-1 bg-white border-2 border-primary rounded-full shadow-xl">
                    <span className="text-[10px] font-black text-primary uppercase">{site.name}</span>
                  </div>
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {selectedSite && (
          <div className="absolute bottom-4 md:bottom-10 right-4 md:right-10 w-[92%] lg:w-[480px] bg-white border-2 border-gold/30 rounded-[2rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(62,28,28,0.4)] animate-slide-up z-[1000]">
            <button onClick={() => setSelectedSite(null)} className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-full flex items-center justify-center transition-all z-[60] text-[10px] font-black uppercase shadow-lg border border-white">
              Đóng
            </button>
            <div className="h-48 md:h-60 overflow-hidden relative group">
              <img src={selectedSite.img} alt={selectedSite.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute top-6 left-6 z-50 flex gap-2">
                <div className="bg-primary text-white px-5 py-2 text-[10px] font-black uppercase rounded-full shadow-2xl border border-gold/30">DI SẢN THẾ GIỚI</div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
            </div>
            <div className="p-6 md:p-8 space-y-4 md:space-y-6 bg-white relative -mt-4 text-left">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary text-4xl md:text-5xl shrink-0">{getCategoryIcon(selectedSite.category)}</span>
                <div>
                  <h3 className="text-xl md:text-3xl font-black text-text-main italic leading-tight tracking-tighter uppercase">{selectedSite.name}</h3>
                  <p className="text-[10px] font-black text-bronze uppercase tracking-[0.3em] mt-1">{selectedSite.location}</p>
                </div>
              </div>
              <p className="text-xs md:text-sm text-text-soft leading-relaxed font-bold italic border-l-4 border-primary/40 pl-4 md:pl-6">"{selectedSite.description}"</p>
              <button 
                onClick={() => setIsVRMode(true)} 
                className="w-full bg-primary py-4 md:py-5 rounded-2xl md:rounded-3xl text-[10px] md:text-[11px] font-black uppercase text-white hover:brightness-110 shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 border-2 border-white/20"
              >
                <span className="material-symbols-outlined text-xl">view_in_ar</span> VÀO XEM VR 360°
              </button>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D4AF37; border-radius: 10px; }
        @keyframes slide-up { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .custom-heritage-marker { background: transparent !important; border: none !important; }
      `}</style>
    </div>
  );
};

export default MapPage;
