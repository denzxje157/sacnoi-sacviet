
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Marker, ZoomControl, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

export interface EthnicGroup {
  name: string;
  location: string;
  population: number; 
  coords: [number, number];
  description: string;
  heritage: string;
  img: string; 
}

interface Story {
  id: string;
  title: string;
  subtitle: string;
  content: string[]; // Mảng các đoạn văn để chia khổ
  image: string;
  themeColor: string;
}

const MAP_CENTER: [number, number] = [16.0, 108.0];

// --- HOOKS & UTILS ---
const useScrollReveal = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  return { ref, isVisible };
};

const RevealSection: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = "", delay = 0 }) => {
  const { ref, isVisible } = useScrollReveal(0.1);
  return (
    <div 
      ref={ref} 
      className={`transition-all duration-[1000ms] ease-out-expo ${className} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const MapFixer = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => { map.invalidateSize(); }, 600);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

const MapInteractionHandler = ({ onInteract }: { onInteract: () => void }) => {
  useMapEvents({
    dragstart: () => onInteract(),
    zoomstart: () => onInteract(),
    click: () => onInteract(),
    mousedown: () => onInteract(),
  });
  return null;
};

const ChangeView = ({ coords }: { coords: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (coords && !isNaN(coords[0]) && !isNaN(coords[1])) {
      map.flyTo(coords, 9, { animate: true, duration: 1.5 });
    }
  }, [coords, map]);
  return null;
};

const EthnicButton = React.memo(({ ethnic, isSelected, onClick, onHover }: any) => (
  <button
    onMouseEnter={() => onHover(ethnic.name)}
    onMouseLeave={() => onHover(null)}
    onClick={() => onClick(ethnic)}
    className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border-2 flex items-center gap-4 group ${
      isSelected 
      ? 'bg-primary border-primary text-white shadow-xl scale-[1.02] z-10' 
      : 'bg-white border-gold/10 text-text-main hover:border-primary/30 shadow-sm hover:translate-x-1'
    }`}
  >
    <div className={`size-10 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-inner transition-colors duration-300 ${
      isSelected ? 'bg-gold/20 text-gold' : 'bg-primary/5 text-primary'
    }`}>
      {ethnic.name.charAt(0)}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-black uppercase text-[12px] tracking-tight truncate">{ethnic.name}</h4>
      <p className={`text-[9px] font-bold tracking-widest transition-colors duration-300 ${isSelected ? 'text-gold-light/70' : 'text-bronze'}`}>
        {ethnic.location}
      </p>
    </div>
  </button>
));

const StoryModal = ({ story, onClose }: { story: Story, onClose: () => void }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 font-display">
      <div className="absolute inset-0 bg-text-main/80 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
      
      {/* Modal UI updated to match Marketplace ProductModal style */}
      <div className="bg-white w-[95vw] h-[85vh] rounded-[2.5rem] shadow-2xl relative z-10 animate-slide-up flex overflow-hidden border-4 border-gold/20 flex-col md:flex-row">
        
        <button onClick={onClose} className="absolute top-6 right-6 z-50 size-12 rounded-full bg-white/20 hover:bg-primary hover:text-white transition-colors flex items-center justify-center backdrop-blur-md border border-white/40 shadow-lg group">
          <span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform">close</span>
        </button>

        {/* Cột Ảnh: Chiếm 70% chiều rộng trên desktop, 50% chiều cao trên mobile */}
        <div className="w-full md:w-[70%] h-1/2 md:h-full relative bg-[#F2EFE6] group border-b md:border-b-0 md:border-r border-gold/10">
          <img src={story.image} alt={story.title} className="w-full h-full object-cover grayscale-[10%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>
          
          <div className="absolute bottom-6 left-6 md:bottom-10 md:left-16 text-white max-w-2xl p-2">
             <div className="inline-block px-4 py-1.5 bg-primary/90 backdrop-blur text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-3 md:mb-4 border border-white/20 shadow-lg">
               {story.subtitle}
             </div>
             <h2 className="text-3xl md:text-4xl lg:text-6xl font-black italic tracking-tighter leading-tight drop-shadow-lg">
               {story.title}
             </h2>
          </div>
        </div>

        {/* Cột Nội dung: Chiếm 30% trên desktop, 50% chiều cao trên mobile */}
        <div className="w-full md:w-[30%] h-1/2 md:h-full flex flex-col bg-white relative">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 lg:p-10">
             <div className="flex items-center gap-3 mb-6 md:mb-8">
                <span className="w-8 h-1 bg-primary rounded-full"></span>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-text-soft">Câu chuyện di sản</span>
             </div>
             
             <div className="prose prose-sm md:prose-lg text-text-main font-serif leading-loose text-justify">
               {story.content.map((paragraph, idx) => (
                  <p key={idx} className="mb-4 md:mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'forwards' }}>
                    {paragraph}
                  </p>
               ))}
             </div>
             
             <div className="mt-8 md:mt-10 p-6 bg-background-light rounded-2xl border border-gold/10">
                <p className="text-center font-serif italic text-primary font-bold">"Lắng nghe ngàn xưa vọng lại..."</p>
             </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const Home: React.FC = () => {
  const [selectedEthnic, setSelectedEthnic] = useState<EthnicGroup | null>(null);
  const [hoveredEthnicName, setHoveredEthnicName] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  const navigate = useNavigate();
  const mapSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY < window.innerHeight * 1.2) {
            setScrollY(window.scrollY);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToMap = () => {
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createEthnicIcon = useCallback((ethnic: EthnicGroup, isSelected: boolean, isHovered: boolean) => {
    const size = isSelected ? 48 : isHovered ? 40 : 28;
    return L.divIcon({
      className: 'ethnic-marker-container',
      html: `
        <div class="relative flex items-center justify-center transition-all duration-300" style="width:${size}px; height:${size}px;">
          ${isSelected || isHovered ? '<div class="absolute inset-0 bg-gold/40 rounded-full animate-ping"></div>' : ''}
          <div class="absolute inset-0 bg-primary rounded-full border-2 ${isSelected ? 'border-gold scale-110 shadow-2xl' : 'border-white/50 shadow-md'} flex items-center justify-center overflow-hidden">
             <span class="text-white font-black" style="font-size: ${size * 0.4}px;">${ethnic.name.charAt(0)}</span>
          </div>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }, []);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    target.onerror = null;
    target.src = "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800";
    target.style.opacity = '0.7';
  };

  return (
    <div className="relative flex flex-col min-h-screen font-display bg-background-light scroll-smooth overflow-x-hidden">
      
      {activeStory && (
        <StoryModal story={activeStory} onClose={() => setActiveStory(null)} />
      )}

      {/* PHẦN 1: HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-text-main">
        <div 
          className="absolute inset-0 z-0 will-change-transform"
          style={{ 
            transform: `translate3d(0, ${scrollY * 0.3}px, 0) scale(${1 + scrollY * 0.0002})` 
          }}
        >
          <img 
            src="https://cdn.nhandan.vn/assets/web/styles/img/54dantoc/zone-1-1.png" 
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
            alt="Vietnam Heritage"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-background-light"></div>
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
        </div>
        
        <div 
          className="relative z-30 text-center px-6 max-w-6xl will-change-transform"
          style={{ transform: `translate3d(0, ${scrollY * -0.1}px, 0)`, opacity: Math.max(0, 1 - scrollY / 500) }}
        >
          <RevealSection>
            <div className="inline-block px-8 sm:px-12 py-3 bg-white/10 border border-white/20 rounded-full mb-10 backdrop-blur-xl">
              <span className="text-gold text-[10px] sm:text-[13px] font-black uppercase tracking-[0.5em] sm:tracking-[0.8em]">Mỗi sản phẩm là một câu chuyện</span>
            </div>
            {/* Sửa line-height để không bị đè dấu */}
            <h1 className="text-5xl sm:text-6xl lg:text-[10rem] font-black text-white italic tracking-tighter uppercase leading-snug lg:leading-[1.1] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              SẮC NỐI <br /> 
              <span className="text-gold lg:text-[11rem] block mt-2 lg:mt-6 text-shadow-gold">SẮC VIỆT</span>
            </h1>
            
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
              <button 
                onClick={scrollToMap}
                className="group relative px-10 sm:px-12 py-5 sm:py-6 bg-primary text-white font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] rounded-[2rem] shadow-[0_0_40px_rgba(161,29,29,0.4)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_60px_rgba(161,29,29,0.6)] active:scale-95 overflow-hidden text-xs sm:text-sm w-full sm:w-auto"
              >
                <span className="relative z-10">Khám phá bản đồ</span>
                <div className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              </button>
              
              <button 
                onClick={() => navigate('/marketplace')}
                className="group relative px-10 sm:px-12 py-5 sm:py-6 border-2 border-white/30 text-white font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] rounded-[2rem] hover:bg-white hover:text-text-main transition-all duration-500 active:scale-95 text-xs sm:text-sm backdrop-blur-sm w-full sm:w-auto"
              >
                Ghé thăm chợ phiên
              </button>
            </div>
          </RevealSection>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-40 pointer-events-none">
           <span className="text-text-main/60 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Cuộn để khám phá</span>
           <div className="w-px h-16 bg-gradient-to-b from-text-main to-transparent"></div>
        </div>
      </section>

      {/* PHẦN 2: KỂ CHUYỆN DI SẢN */}
      <section className="relative py-20 sm:py-32 bg-[#F2EFE6] overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')] opacity-40"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-20">
           <RevealSection>
              <div className="text-center mb-16 sm:mb-24">
                 <span className="material-symbols-outlined text-4xl text-primary mb-6">auto_stories</span>
                 <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-text-main uppercase italic tracking-tighter leading-snug mb-6">
                    Chuyện Kể <br/><span className="text-primary text-shadow-glow block mt-3">Di Sản</span>
                 </h2>
                 <p className="text-text-soft font-serif text-lg sm:text-xl italic max-w-2xl mx-auto leading-relaxed">
                    "Mỗi di sản là một cuốn sách chưa kể hết. Hãy dừng lại một chút, lắng nghe tiếng vọng của ngàn xưa qua những câu chuyện nhỏ."
                 </p>
              </div>
           </RevealSection>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {storiesData.map((story, index) => (
                <RevealSection key={story.id} delay={index * 150}>
                  <div 
                    className="group relative h-[500px] sm:h-[600px] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-xl hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)] transition-all duration-700 bg-white border border-gold/10"
                    onClick={() => setActiveStory(story)}
                  >
                     <div className="absolute inset-0 overflow-hidden">
                        <img 
                          src={story.image} 
                          className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 filter grayscale-[20%] group-hover:grayscale-0" 
                          alt={story.title}
                          loading="lazy" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/90 opacity-80 group-hover:opacity-70 transition-opacity duration-500"></div>
                     </div>
                     
                     <div className="absolute inset-4 border border-white/20 border-double rounded-[2rem] pointer-events-none group-hover:border-gold/60 transition-colors duration-500"></div>

                     <div className="absolute bottom-0 left-0 w-full p-8 sm:p-10 flex flex-col items-center text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <p className="text-gold text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                          {story.subtitle}
                        </p>
                        <h3 className="text-2xl sm:text-3xl font-black text-white font-display uppercase italic leading-tight mb-8 group-hover:text-gold-light transition-colors">
                          {story.title}
                        </h3>
                        
                        <button className="flex items-center gap-3 px-6 sm:px-8 py-3 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-primary transition-all duration-500 group-hover:scale-105">
                           <span className="material-symbols-outlined text-lg animate-pulse">headphones</span>
                           <span className="text-xs font-black uppercase tracking-widest">Lắng nghe</span>
                        </button>
                     </div>
                  </div>
                </RevealSection>
              ))}
           </div>
        </div>
      </section>

      {/* PHẦN 3: BẢN ĐỒ 54 DÂN TỘC */}
      <section ref={mapSectionRef} className="bg-background-light py-20 sm:py-32 relative z-10 overflow-hidden border-t border-gold/20">
        <div className="max-w-[1700px] mx-auto px-6">
          <RevealSection>
            <div className="mb-12 sm:mb-20 text-center lg:text-left lg:px-14">
              <div className="flex items-center justify-center lg:justify-start gap-5 mb-6">
                 <div className="h-1.5 w-20 bg-primary"></div>
                 <span className="text-primary font-black uppercase tracking-[0.6em] text-[12px]">Không gian văn hóa</span>
              </div>
              {/* Sửa line-height và margin để tránh đè chữ */}
              <h2 className="text-5xl sm:text-6xl lg:text-[9rem] font-black text-primary italic uppercase tracking-tighter leading-snug lg:leading-[1.1] mb-6 drop-shadow-sm">
                BẢN ĐỒ <br/><span className="text-text-main block mt-2 lg:mt-4">54 DÂN TỘC</span>
              </h2>
              <p className="text-bronze font-black uppercase text-[12px] tracking-[0.6em] opacity-80">Hội tụ và lan tỏa sức mạnh dòng máu Lạc Hồng</p>
            </div>
          </RevealSection>
          
          <div className="flex flex-col lg:flex-row h-[700px] sm:h-[900px] gap-8 sm:gap-12">
            <div className="flex-1 relative rounded-[3rem] sm:rounded-[5rem] overflow-hidden border-[8px] border-primary/10 shadow-2xl group transition-all duration-1000 bg-[#e4e9f0]">
               <MapContainer center={MAP_CENTER} zoom={6} className="w-full h-full" zoomControl={false} attributionControl={false}>
                  <MapFixer />
                  <MapInteractionHandler onInteract={() => {}} />
                  <TileLayer url="https://mt1.google.com/vt/lyrs=m&hl=vi&x={x}&y={y}&z={z}" noWrap={true} />
                  <ZoomControl position="bottomright" />
                  {selectedEthnic && <ChangeView coords={selectedEthnic.coords} />}
                  
                  {ethnicData.map((ethnic) => (
                    <Marker 
                      key={ethnic.name} 
                      position={ethnic.coords} 
                      icon={createEthnicIcon(ethnic, selectedEthnic?.name === ethnic.name, hoveredEthnicName === ethnic.name)}
                      eventHandlers={{ 
                        click: () => { 
                          setSelectedEthnic(ethnic); 
                        } 
                      }}
                    >
                      <Tooltip direction="top" offset={[0, -15]} opacity={1}>
                        <div className="px-6 py-2.5 bg-primary text-white border-2 border-gold rounded-full shadow-2xl">
                          <span className="text-[13px] font-black uppercase tracking-[0.2em]">{ethnic.name}</span>
                        </div>
                      </Tooltip>
                    </Marker>
                  ))}
               </MapContainer>
            </div>

            <div className="w-full lg:w-[480px] bg-[#F7F3E9] rounded-[3rem] sm:rounded-[5rem] flex flex-col overflow-hidden border-[8px] border-gold/20 shadow-2xl relative h-[500px] sm:h-auto">
              <div className="p-10 sm:p-14 bg-primary shrink-0 relative overflow-hidden">
                 <div className="absolute -top-10 -right-10 p-8 opacity-10 rotate-12 scale-150">
                   <span className="material-symbols-outlined text-9xl text-white">temple_buddhist</span>
                 </div>
                 <h2 className="text-3xl sm:text-4xl font-black text-white italic uppercase leading-none relative z-10">CỘNG ĐỒNG <br/><span className="text-gold">VIỆT NAM</span></h2>
                 <p className="text-gold-light/80 text-[11px] font-black uppercase tracking-[0.5em] mt-6 relative z-10">Dòng máu Lạc Hồng ngàn năm</p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-5 custom-scrollbar bg-[#F7F3E9]">
                {ethnicData.map((ethnic) => (
                  <EthnicButton 
                    key={ethnic.name}
                    ethnic={ethnic}
                    isSelected={selectedEthnic?.name === ethnic.name}
                    onClick={setSelectedEthnic}
                    onHover={setHoveredEthnicName}
                  />
                ))}
              </div>

              {selectedEthnic && (
                <div className="absolute inset-0 z-[100] bg-background-light p-8 sm:p-12 animate-slide-up-slow flex flex-col overflow-y-auto custom-scrollbar">
                   <button 
                    onClick={() => setSelectedEthnic(null)} 
                    className="self-end size-14 sm:size-16 rounded-full border-2 border-gold/20 flex items-center justify-center bg-white shadow-2xl hover:bg-primary hover:text-white transition-all group"
                   >
                      <span className="material-symbols-outlined text-3xl sm:text-4xl group-hover:rotate-90 transition-transform">close</span>
                   </button>
                   
                   <div className="mt-6 sm:mt-10 space-y-8 sm:space-y-12 text-left">
                      <div className="rounded-[3rem] sm:rounded-[4rem] overflow-hidden aspect-[4/3] border-[6px] sm:border-[8px] border-white shadow-[0_50px_100px_rgba(0,0,0,0.2)] relative group">
                        <img 
                          src={encodeURI(selectedEthnic.img)} 
                          alt={selectedEthnic.name} 
                          className="w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-110" 
                          loading="lazy" 
                          onError={handleImageError}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
                      </div>
                      
                      <div className="space-y-4">
                        <span className="text-primary font-black uppercase text-[10px] sm:text-[12px] tracking-[0.6em] sm:tracking-[0.8em] opacity-60">Thông tin di sản</span>
                        <h3 className="text-5xl sm:text-6xl lg:text-[5rem] font-black text-text-main italic uppercase leading-[0.85]">
                          DÂN TỘC <br/><span className="text-primary">{selectedEthnic.name}</span>
                        </h3>
                      </div>
                      
                      <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] border-2 border-gold/10 shadow-sm relative">
                        <div className="absolute -top-4 -left-4 size-10 bg-gold rounded-full flex items-center justify-center text-white">
                           <span className="material-symbols-outlined text-2xl">format_quote</span>
                        </div>
                        <p className="text-text-soft font-bold italic leading-relaxed text-lg sm:text-xl">"{selectedEthnic.description}"</p>
                      </div>
                      
                      <div className="bg-primary py-10 sm:py-12 px-10 sm:px-12 rounded-[3rem] sm:rounded-[4rem] border-2 border-gold/40 shadow-2xl shadow-primary/30 relative overflow-hidden">
                        <div className="absolute -top-6 -right-6 p-8 opacity-10 rotate-12">
                          <span className="material-symbols-outlined text-9xl text-white">workspace_premium</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-gold/80 text-[10px] sm:text-[11px] font-black uppercase mb-4 tracking-[0.4em] flex items-center gap-2">
                                <span className="w-8 h-0.5 bg-gold/60"></span>
                                Sản phẩm tiêu biểu:
                            </p>
                            <p className="text-white font-black italic text-2xl lg:text-4xl uppercase leading-tight tracking-tight drop-shadow-lg">
                                {selectedEthnic.heritage}
                            </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6 sm:gap-8">
                        <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-gold/15">
                          <p className="text-[10px] font-black text-bronze uppercase mb-3 tracking-widest">Vùng cư trú</p>
                          <p className="text-base sm:text-lg font-black text-primary uppercase leading-tight">{selectedEthnic.location}</p>
                        </div>
                        <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-gold/15">
                          <p className="text-[10px] font-black text-bronze uppercase mb-3 tracking-widest">Dân số</p>
                          <p className="text-base sm:text-lg font-black text-text-main">{selectedEthnic.population.toLocaleString('vi-VN')} người</p>
                        </div>
                      </div>

                      <button 
                        onClick={() => navigate(`/marketplace?ethnic=${encodeURIComponent(selectedEthnic.name.toUpperCase())}`)} 
                        className="w-full bg-gold py-6 sm:py-8 rounded-[2.5rem] font-black text-primary uppercase text-xs sm:text-sm tracking-[0.4em] sm:tracking-[0.5em] shadow-[0_30px_60px_rgba(212,175,55,0.4)] hover:brightness-110 transition-all active:scale-95 mb-10 border border-white/20"
                      >
                        VÀO CHỢ PHIÊN
                      </button>
                      <div className="h-10"></div>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .writing-vertical-rl { writing-mode: vertical-rl; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #A11D1D; border-radius: 10px; }
        @keyframes slide-up-slow { 
          from { transform: translateY(100%); opacity: 0; } 
          to { transform: translateY(0); opacity: 1; } 
        }
        .animate-slide-up-slow { animation: slide-up-slow 0.8s cubic-bezier(0.2, 1, 0.3, 1) forwards; }
        .ethnic-marker-container { background: transparent !important; }
        .ease-out-expo { transition-timing-function: cubic-bezier(0.19, 1, 0.22, 1); }
        .text-shadow-gold { text-shadow: 0 0 40px rgba(212,175,55,0.6); }
        .text-shadow-glow { text-shadow: 0 0 30px rgba(212,175,55,0.5); }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        @keyframes slide-up { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export const storiesData: Story[] = [
  {
    id: 'su-thi-dam-san',
    title: 'Sử Thi Đam San',
    subtitle: 'Huyền thoại Ê Đê',
    themeColor: '#A11D1D',
    image: 'https://cdn.luatminhkhue.vn/lmk/article/2023/Abt%20(3)(23).png',
    content: [
      "Thuở xưa, tù trưởng Đam San mạnh như thần, tiếng nói vang như sấm, bước chân làm rung chuyển cả núi rừng. Chàng đã chiến thắng mọi kẻ thù, nhưng khát vọng lớn nhất của chàng là chinh phục Nữ Thần Mặt Trời để mang ánh sáng vĩnh cửu về cho buôn làng.",
      "Mặc lời can ngăn của Già làng, Đam San cưỡi ngựa băng qua rừng thiêng nước độc, đi mãi đến tận chân trời. Chàng muốn bắt Nữ Thần Mặt Trời về làm vợ, để tù trưởng Ê Đê trở thành người quyền uy nhất thế gian. Nhưng Nữ Thần từ chối, vì nếu nàng đi, vạn vật sẽ chết cháy.",
      "Đam San giận dữ quay về, nhưng cả người và ngựa đều bị chìm dần trong vùng đất lầy của Rừng Sáp Đen. Chàng chết đi, nhưng hồn thiêng hóa thành con ruồi bay vào miệng chị gái mình, để rồi tái sinh thành Đam San cháu, tiếp tục viết nên những trang sử thi hào hùng của người Ê Đê."
    ]
  },
  {
    id: 'chuyen-tinh-khau-vai',
    title: 'Lời Thề Khâu Vai',
    subtitle: 'Hà Giang - Mèo Vạc',
    themeColor: '#3E1C1C',
    image: 'https://image.vovworld.vn/w500/uploaded/vovworld/rdywf/2020_01_25/chuong_1__arts_yogq.png',
    content: [
      "Ngày xưa, ở vùng núi Hà Giang có chàng Ba người Nùng và nàng Út người Giáy yêu nhau tha thiết. Nhưng vì khác biệt tập quán, hai dòng họ cấm cản quyết liệt. Không cam chịu chia lìa, cả hai đã cùng nhau trốn lên đỉnh núi Khâu Vai.",
      "Nhìn xuống bản làng, họ thấy hai bên dòng họ mang gậy gộc ra đánh nhau vì mình. Đau lòng trước cảnh máu chảy, chàng và nàng gạt nước mắt quyết định chia tay để giữ bình yên cho gia tộc. Trước khi rời đi, họ cắt máu ăn thề: Kiếp này không nên duyên chồng vợ, thì mỗi năm sẽ gặp lại nhau một lần tại Khâu Vai vào ngày 27 tháng 3 âm lịch.",
      "Từ đó, Chợ Tình Khâu Vai ra đời. Đó không phải là nơi buôn bán, mà là nơi những người yêu nhau nhưng không đến được với nhau tìm về, để kể cho nhau nghe những vui buồn cuộc sống, giữ trọn lời thề thủy chung son sắt."
    ]
  },
  {
    id: 'su-tich-trau-cau',
    title: 'Sự Tích Trầu Cau',
    subtitle: 'Văn hóa người Kinh',
    themeColor: '#D4AF37',
    image: 'https://sachhoc.com/image/cache/catalog/Truyen/Truyen-tranh/Su-tich-trau-cau-500x554.jpg',
    content: [
      "Vào đời vua Hùng thứ tư, có hai anh em Tân và Lang giống nhau như đúc, thương yêu nhau hết mực. Sau khi Tân lấy vợ, Lang cảm thấy anh không còn quan tâm mình như trước, buồn tủi bỏ đi. Lang đi mãi, kiệt sức và hóa thành tảng đá vôi bên bờ suối.",
      "Tân đi tìm em, đến bờ suối thì gục khóc bên tảng đá rồi hóa thành cây cau cao vút, mọc thẳng đứng bên cạnh. Vợ Tân đi tìm chồng, dựa vào thân cây cau mà chết, hóa thành dây trầu không leo quanh thân cây, che chở cho tảng đá.",
      "Vua Hùng đi qua, nghe chuyện bèn lấy lá trầu, quả cau nghiền với vôi từ tảng đá, thấy tạo ra sắc đỏ thắm như máu. Vua đặt tên là Trầu Cau, biểu tượng cho tình anh em thắm thiết và nghĩa vợ chồng thủy chung. Từ đó, 'miếng trầu là đầu câu chuyện' trong mọi lễ cưới hỏi của người Việt."
    ]
  }
];

export const ethnicData: EthnicGroup[] = [
  { name: "Kinh", location: "TP. Hà Nội", population: 82085826, coords: [21.0285, 105.8542], description: "Dân tộc đa số, giữ vai trò chủ đạo trong việc xây dựng và bảo vệ đất nước Việt Nam.", heritage: "Gốm Bát Tràng, Tranh Đông Hồ, Nón lá Huế.", img: "pictures-54dantoc/kinh.jpg" },
  { name: "Tày", location: "Tỉnh Lạng Sơn", population: 1845492, coords: [21.85, 106.76], description: "Nổi tiếng với hát Then và đàn Tính huyền thoại, cư trú chủ yếu vùng núi phía Bắc.", heritage: "Hát Then, Đàn tính, Vải chàm.", img: "pictures-54dantoc/tay.jpg" },
  { name: "Thái", location: "Tỉnh Sơn La", population: 1820902, coords: [21.32, 103.92], description: "Chủ nhân của các điệu xòe tinh tế và trang phục khăn Piêu độc nhất vô nhị.", heritage: "Múa Xòe, Khăn Piêu, Nhà sàn.", img: "pictures-54dantoc/thai.jpg" },
  { name: "Mường", location: "Tỉnh Phú Thọ", population: 1452095, coords: [20.81, 105.33], description: "Chủ nhân văn hóa Cồng chiêng và bộ sử thi vĩ đại Đẻ đất đẻ nước.", heritage: "Chiêng Mường, Thổ cẩm, Gùi tre.", img: "pictures-54dantoc/muong.jpg" },
  { name: "H'Mông", location: "Tỉnh Tuyên Quang", population: 1393547, coords: [22.82, 104.98], description: "Sống trên những đỉnh núi cao mây phủ, giữ gìn nghề dệt lanh và lễ hội Gầu Tào.", heritage: "Lễ hội Gầu Tào, Vải lanh nhuộm chàm.", img: "pictures-54dantoc/hmong.jpg" },
  { name: "Khmer", location: "TP. Cần Thơ", population: 1319652, coords: [9.6, 105.97], description: "Văn hóa gắn liền với Phật giáo Nam tông và các ngôi chùa tháp rực rỡ vàng son.", heritage: "Khăn Krama, Tượng gỗ Phật giáo, Đua ghe Ngo.", img: "pictures-54dantoc/khmer.jpg" },
  { name: "Nùng", location: "Tỉnh Cao Bằng", population: 1083298, coords: [22.67, 106.26], description: "Giỏi nghề rèn đúc thủ công và có các làn điệu Sli thắm đượm tình người.", heritage: "Vải chàm, Rổ tre, Khăn thêu.", img: "pictures-54dantoc/nung.jpg" },
  { name: "Dao", location: "Tỉnh Lào Cai", population: 891151, coords: [22.48, 103.97], description: "Nổi tiếng với các nghi lễ Cấp sắc linh thiêng và trang phục thêu cầu kỳ.", heritage: "Khăn đỏ thêu, Áo chàm thêu tay, Trang sức bạc.", img: "pictures-54dantoc/dao.jpg" },
  { name: "Hoa", location: "TP. Hồ Chí Minh", population: 749466, coords: [10.76, 106.66], description: "Cộng đồng năng động, giữ gìn nghề thủ công truyền thống và ẩm thực đặc sắc.", heritage: "Đèn lồng, Tranh thư pháp, Gốm sứ.", img: "pictures-54dantoc/hoa.jpg" },
  { name: "Gia Rai", location: "Tỉnh Gia Lai", population: 513930, coords: [13.98, 108.0], description: "Dân tộc đông nhất Tây Nguyên với truyền thống tượng gỗ nhà mồ độc đáo.", heritage: "Tượng nhà mồ, Chiêng, Thổ cẩm.", img: "pictures-54dantoc/gia-rai.jpg" },
  { name: "Ê Đê", location: "Tỉnh Đắk Lắk", population: 398671, coords: [12.66, 108.03], description: "Chủ nhân của sử thi Khan và những ngôi nhà dài mẫu hệ huyền thoại.", heritage: "Gùi mây, Chiêng, Thổ cẩm.", img: "pictures-54dantoc/e-de.webp" },
  { name: "Ba Na", location: "Tỉnh Quảng Ngãi", population: 286910, coords: [14.35, 108.0], description: "Sống trong những nhà Rông vút cao, giỏi chế tác nhạc cụ tre nứa.", heritage: "Nhà rông, Dệt thổ cẩm, Nhạc cụ tre.", img: "pictures-54dantoc/bana.jpg" },
  { name: "Xơ Đăng", location: "Tỉnh Quảng Ngãi", population: 212277, coords: [14.65, 107.9], description: "Nổi tiếng với điệu múa cồng chiêng và nghề rèn đặc sắc.", heritage: "Thổ cẩm, Gùi, Khèn tre.", img: "pictures-54dantoc/xo-dang.jpg" },
  { name: "Sán Chay", location: "Tỉnh Thái Nguyên", population: 201398, coords: [21.59, 105.84], description: "Sở hữu các điệu múa Tắc sình độc nhất vô nhị vùng trung du.", heritage: "Áo chàm, Rổ mây, Tranh dân gian.", img: "pictures-54dantoc/san-chay.jpg" },
  { name: "Cơ Ho", location: "Tỉnh Lâm Đồng", population: 200800, coords: [11.5, 108.1], description: "Cư dân lâu đời của cao nguyên Lâm Viên, giỏi dệt thổ cẩm.", heritage: "Gùi mây, Dệt vải, Nhạc cụ tre.", img: "pictures-54dantoc/co-ho.webp" },
  { name: "Chăm", location: "Tỉnh Khánh Hoà", population: 178948, coords: [11.56, 108.99], description: "Giữ gìn tinh hoa gốm Bàu Trúc và dệt thổ cẩm Mỹ Nghiệp rực rỡ.", heritage: "Gốm Bàu Trúc, Dệt Mỹ Nghiệp.", img: "pictures-54dantoc/cham.jpg" },
  { name: "Sán Dìu", location: "Tỉnh Phú Thọ", population: 183008, coords: [21.3, 105.6], description: "Sống vùng trung du, giữ gìn lối hát Soọng cô thắm đượm tình người.", heritage: "Trang phục truyền thống, Quạt giấy.", img: "pictures-54dantoc/san-diu.jpg" },
  { name: "Hrê", location: "Tỉnh Quảng Ngãi", population: 149460, coords: [15.1, 108.6], description: "Giỏi canh tác lúa nước và làm các loại nhạc cụ gõ bằng tre nứa.", heritage: "Gùi mây, Dệt vải, Nhạc cụ tre.", img: "pictures-54dantoc/hre.jpg" },
  { name: "Ra Glai", location: "Tỉnh Khánh Hoà", population: 146613, coords: [11.8, 108.7], description: "Chủ nhân của Đàn Đá và đàn Chapi huyền thoại vùng Nam Trung Bộ.", heritage: "Đàn Chapi, Vải dệt, Rổ tre.", img: "pictures-54dantoc/ra-glai.jpg" },
  { name: "M'Nông", location: "Tỉnh Lâm Đồng", population: 127334, coords: [12.0, 107.6], description: "Nổi tiếng với nghề săn bắt và thuần dưỡng voi rừng vĩ đại.", heritage: "Gùi tre, Chiêng, Dệt vải.", img: "pictures-54dantoc/mnong.jpg" },
  { name: "Xtiêng", location: "Tỉnh Đồng Nai", population: 100752, coords: [11.7, 106.8], description: "Sống vùng biên giới, giữ nghề dệt và rèn thủ công truyền thống.", heritage: "Gùi, Thổ cẩm, Trống đất.", img: "pictures-54dantoc/xtieng.jpg" },
  { name: "Khơ Mú", location: "Tỉnh Điện Biên", population: 90612, coords: [21.5, 103.1], description: "Giàu truyền thống dân ca và các điệu múa sạp rộn ràng.", heritage: "Múa sạp, Gùi, Thổ cẩm.", img: "pictures-54dantoc/kho-mu.jpg" },
  { name: "Bru-Vân Kiều", location: "Tỉnh Quảng Trị", population: 94598, coords: [16.6, 106.8], description: "Sống dọc dãy Trường Sơn, nổi tiếng với nhạc cụ khèn bè.", heritage: "Gùi, Vải dệt, Sáo tre.", img: "pictures-54dantoc/bru-van-kieu.jpg" },
  { name: "Thổ", location: "Tỉnh Nghệ An", population: 91430, coords: [19.2, 105.2], description: "Dân tộc có truyền thống canh tác lúa nước và nghề dệt gai lâu đời.", heritage: "Võng gai, Cồng chiêng, Dân ca.", img: "pictures-54dantoc/tho.jpg" },
  { name: "Giáy", location: "Tỉnh Lào Cai", population: 67989, coords: [22.4, 103.8], description: "Văn hóa ẩm thực phong phú và trang phục nữ giới rực rỡ sắc màu.", heritage: "Bánh chưng gù, Múa quạt, Trang phục nữ.", img: "pictures-54dantoc/giay.jpg" },
  { name: "Cơ Tu", location: "TP. Đà Nẵng", population: 74172, coords: [15.9, 107.8], description: "Nghệ thuật tạc tượng gỗ và dệt thổ cẩm cườm đặc sắc.", heritage: "Tượng gỗ, Thổ cẩm, Gùi mây.", img: "pictures-54dantoc/co-tu.jpg" },
  { name: "Giẻ Triêng", location: "Tỉnh Quảng Ngãi", population: 63322, coords: [15.2, 107.7], description: "Cộng đồng giữ gìn tốt các điệu múa xoang truyền thống.", heritage: "Thổ cẩm, Nhạc cụ tre, Giỏ mây.", img: "pictures-54dantoc/gie-trieng.jpg" },
  { name: "Mạ", location: "Tỉnh Lâm Đồng", population: 50322, coords: [11.6, 107.8], description: "Cư dân cao nguyên giữ nghề dệt vải truyền thống lâu đời.", heritage: "Gùi mây, Dệt vải, Nhạc cụ tre.", img: "pictures-54dantoc/ma.jpg" },
  { name: "Kháng", location: "Tỉnh Sơn La", population: 16180, coords: [21.6, 103.5], description: "Gắn bó với nghề làm thuyền độc mộc và các điệu múa sạp.", heritage: "Thuyền độc mộc, Múa sạp, Gùi.", img: "pictures-54dantoc/khang.jpg" },
  { name: "Co", location: "Tỉnh Quảng Ngãi", population: 40458, coords: [14.8, 108.4], description: "Gắn bó mật thiết với cây quế và văn hóa cồng chiêng vùng núi.", heritage: "Dệt vải, Giỏ tre, Khèn.", img: "pictures-54dantoc/co.jpg" },
  { name: "Tà Ôi", location: "TP. Huế", population: 52356, coords: [16.2, 107.2], description: "Chủ nhân của nghề dệt vải Zèng - Di sản văn hóa quốc gia.", heritage: "Vải zèng, Trang sức hạt, Gùi.", img: "pictures-54dantoc/ta-oi.jpg" },
  { name: "Chơ Ro", location: "Tỉnh Đồng Nai", population: 29520, coords: [10.8, 107.1], description: "Dân tộc bản địa lâu đời nhất miền Đông Nam Bộ.", heritage: "Gùi, Dệt vải, Sáo tre.", img: "pictures-54dantoc/cho-ro.jpg" },
  { name: "Xinh Mun", location: "Tỉnh Sơn La", population: 29503, coords: [21.1, 104.2], description: "Cư dân miền núi phía Bắc có tục nhuộm răng đen và múa sạp.", heritage: "Gùi, Thổ cẩm, Nhạc cụ.", img: "pictures-54dantoc/xinh-mun.jpg" },
  { name: "Hà Nhì", location: "Tỉnh Lai Châu", population: 25539, coords: [22.6, 102.6], description: "Nhà tường trình đất dày và trang phục thêu độc đáo bậc nhất.", heritage: "Trang phục thêu, Giỏ tre.", img: "pictures-54dantoc/ha-nhi.webp" },
  { name: "Chu Ru", location: "Tỉnh Lâm Đồng", population: 23242, coords: [11.7, 108.2], description: "Sở hữu nghề đúc đồng và làm gốm thủ công gia truyền.", heritage: "Gốm thủ công, Dệt vải, Gùi.", img: "pictures-54dantoc/chu-ru.jpg" },
  { name: "Lào", location: "Tỉnh Điện Biên", population: 17532, coords: [21.4, 102.9], description: "Giỏi nghề dệt vải và sở hữu chữ viết truyền thống riêng biệt.", heritage: "Khăn dệt, Giỏ tre, Đồ bạc.", img: "pictures-54dantoc/lao.jpg" },
  { name: "La Chí", location: "Tỉnh Tuyên Quang", population: 15126, coords: [22.7, 104.6], description: "Những kỹ sư ruộng bậc thang tài ba vùng cao.", heritage: "Váy thổ cẩm, Gùi, Trang sức.", img: "pictures-54dantoc/la-chi.png" },
  { name: "La Ha", location: "Tỉnh Sơn La", population: 10157, coords: [21.7, 103.7], description: "Dân tộc nông nghiệp lâu đời, giỏi đan lát thủ công mỹ nghệ.", heritage: "Dệt vải, Rổ tre, Nhạc cụ.", img: "pictures-54dantoc/la-ha.jpg" },
  { name: "Phù Lá", location: "Tỉnh Lào Cai", population: 12435, coords: [22.7, 104.1], description: "Trang phục thêu tay đặc sắc và vô cùng tinh tế vùng núi cao.", heritage: "Váy thêu, Gùi, Trang sức bạc.", img: "pictures-54dantoc/phu-la.jpg" },
  { name: "La Hủ", location: "Tỉnh Lai Châu", population: 12113, coords: [22.4, 102.7], description: "Gắn bó mật thiết với núi rừng Hoàng Liên Sơn hùng vĩ.", heritage: "Trang phục thêu, Gùi, Trang sức.", img: "pictures-54dantoc/la-hu.jpg" },
  { name: "Lự", location: "Tỉnh Lai Châu", population: 6757, coords: [22.2, 103.2], description: "Phụ nữ có tục nhuộm răng đen và dệt vải thêu hoa văn tinh xảo.", heritage: "Khăn thêu, Dệt vải, Gùi.", img: "pictures-54dantoc/lu.jpg" },
  { name: "Lô Lô", location: "Tỉnh Tuyên Quang", population: 4827, coords: [23.2, 105.4], description: "Chủ nhân trống đồng cổ và trang phục thêu ghép vải cầu kỳ.", heritage: "Trang phục thêu, Trống đồng nhỏ.", img: "pictures-54dantoc/lo-lo.jpg" },
  { name: "Chứt", location: "Tỉnh Quảng Trị", population: 7513, coords: [17.8, 105.9], description: "Lưu giữ lối sống hang động sơ khai vô cùng quý giá.", heritage: "Gùi mây, Dệt vải, Nhạc cụ tre.", img: "pictures-54dantoc/chut.jpg" },
  { name: "Mảng", location: "Tỉnh Lai Châu", population: 4650, coords: [22.3, 103.0], description: "Sống ven sông Đà, giỏi nghề sông nước và đánh bắt cá.", heritage: "Gùi, Rổ tre, Vải dệt.", img: "pictures-54dantoc/mang.jpg" },
  { name: "Pà Thẻn", location: "Tỉnh Tuyên Quang", population: 8248, coords: [22.5, 105.0], description: "Nổi tiếng với lễ hội Nhảy lửa đầy kịch tính và huyền bí.", heritage: "Váy đỏ thêu, Trang sức, Khăn đội đầu.", img: "pictures-54dantoc/pa-then.jpg" },
  { name: "Cơ Lao", location: "Tỉnh Tuyên Quang", population: 4003, coords: [23.0, 105.1], description: "Sống trên các hốc đá tai mèo, giỏi nghề thợ rèn và đan lát.", heritage: "Yên ngựa, Dao rèn, Tục cúng thần rừng.", img: "pictures-54dantoc/co-lao.jpg" },
  { name: "Cống", location: "Tỉnh Lai Châu", population: 2729, coords: [22.3, 102.8], description: "Dân tộc ít người gìn giữ lễ hội hoa mào gà độc đáo.", heritage: "Lễ hội hoa mào gà, Gùi mây, Canh tác nương.", img: "pictures-54dantoc/cong.jpg" },
  { name: "Bố Y", location: "Tỉnh Lào Cai", population: 3232, coords: [22.9, 104.9], description: "Nổi tiếng với trang phục thêu hoa văn tinh tế và đồ trang sức bạc.", heritage: "Trang phục thêu, Trang sức bạc, Lễ hội.", img: "pictures-54dantoc/bo-y.webp" },
  { name: "Si La", location: "Tỉnh Lai Châu", population: 909, coords: [22.5, 102.6], description: "Cư dân biên giới với tục nhuộm răng đen và trang phục đính bạc.", heritage: "Trang phục đính bạc, Tục nhuộm răng, Hát giao duyên.", img: "pictures-54dantoc/si-la.jpg" },
  { name: "Pu Péo", location: "Tỉnh Tuyên Quang", population: 903, coords: [23.1, 105.2], description: "Thờ thần rừng thiêng liêng và giữ gìn các khu rừng cấm.", heritage: "Lễ cúng thần rừng, Trống đồng, Trang phục.", img: "pictures-54dantoc/pu-peo.jpg" },
  { name: "Brâu", location: "Tỉnh Quảng Ngãi", population: 525, coords: [14.7, 107.6], description: "Dân tộc ít người nhất nhì Tây Nguyên với tục cà răng căng tai xưa.", heritage: "Chiêng tha, Cà răng, Nhà rông.", img: "pictures-54dantoc/brau.jpg" },
  { name: "Ơ Đu", location: "Tỉnh Nghệ An", population: 428, coords: [19.1, 104.4], description: "Dân tộc ít người nhất Việt Nam, đang khôi phục bản sắc văn hóa.", heritage: "Lễ hội tiếng sấm, Trang phục, Ngôn ngữ.", img: "pictures-54dantoc/o-du.jpg" },
  { name: "Rơ Măm", location: "Tỉnh Quảng Ngãi", population: 639, coords: [14.4, 107.7], description: "Cư trú tại làng Le, nổi tiếng với nghề dệt vải truyền thống.", heritage: "Vải dệt, Lễ bỏ mả, Cồng chiêng.", img: "pictures-54dantoc/ro-mam.jpg" },
  { name: "Ngái", location: "Tỉnh Thái Nguyên", population: 1649, coords: [21.6, 105.8], description: "Cộng đồng sống rải rác, giỏi nghề làm ruộng và đánh cá.", heritage: "Múa sư tử, Tranh thờ, Lễ hội kỳ yên.", img: "pictures-54dantoc/ngai.jpg" }
];

export default Home;
