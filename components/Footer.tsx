
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-text-main text-white pt-24 pb-12 px-6 lg:px-20 border-t-4 border-gold relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
      
      <div className="mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 gap-16 border-b border-gold/20 pb-16 lg:grid-cols-4">
          <div className="col-span-1 lg:col-span-2 space-y-8">
            <div className="flex items-center gap-4">
              <img 
                src={`${import.meta.env.BASE_URL}/pictures/logo.png`}
                alt="Logo Sắc Nối" 
                className="h-14 w-14 rounded-full object-cover border-2 border-gold shadow-lg"
              />
              <div>
                 <h2 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">SẮC NỐI</h2>
                 <span className="text-gold text-xs font-black tracking-[0.4em] uppercase">VIỆT NAM</span>
              </div>
            </div>
            <p className="max-w-md text-base leading-relaxed text-white/60 font-medium italic">"Dân ta phải biết sử ta, cho tường gốc tích nước nhà Việt Nam." <br/> <span className="text-gold/80 not-italic text-xs mt-2 block">- Hồ Chí Minh</span></p>
            <div className="flex gap-4">
                {['public', 'video_library', 'share'].map(icon => (
                    <a key={icon} className="h-12 w-12 flex items-center justify-center rounded-full bg-white/5 text-gold hover:bg-gold hover:text-text-main transition-all shadow-md border border-white/10 backdrop-blur-sm" href="#">
                        <span className="material-symbols-outlined">{icon}</span>
                    </a>
                ))}
            </div>
          </div>
          
          <div>
            <h4 className="mb-8 text-[11px] font-black uppercase tracking-widest text-gold border-b border-gold/20 pb-2 inline-block">Địa điểm</h4>
            <ul className="space-y-4 text-sm text-white/60 font-bold">
              <li><a className="hover:text-gold transition-colors flex items-center gap-2" href="#"><span className="w-1 h-1 bg-gold rounded-full"></span> Khu vực phía Bắc</a></li>
              <li><a className="hover:text-gold transition-colors flex items-center gap-2" href="#"><span className="w-1 h-1 bg-gold rounded-full"></span> Khu vực Miền Trung</a></li>
              <li><a className="hover:text-gold transition-colors flex items-center gap-2" href="#"><span className="w-1 h-1 bg-gold rounded-full"></span> Khu vực phía Nam</a></li>
              <li><a className="hover:text-gold transition-colors flex items-center gap-2" href="#"><span className="w-1 h-1 bg-gold rounded-full"></span> Tây Nguyên</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-8 text-[11px] font-black uppercase tracking-widest text-gold border-b border-gold/20 pb-2 inline-block">Thông tin</h4>
            <ul className="space-y-4 text-sm text-white/60 font-bold">
              <li><a className="hover:text-gold transition-colors" href="#">Về chúng tôi</a></li>
              <li><a className="hover:text-gold transition-colors" href="#">Trung tâm lưu trữ</a></li>
              <li><a className="hover:text-gold transition-colors" href="#">Câu hỏi thường gặp</a></li>
              <li><a className="hover:text-gold transition-colors" href="#">Liên hệ</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">© 2026 Sắc Nối • Tôn Vinh Truyên Thống.</p>
          <div className="flex items-center gap-4 text-gold opacity-40">
             <span className="material-symbols-outlined text-sm animate-spin-slow">stars</span>
             <span className="h-px w-12 bg-gold"></span>
             <span className="material-symbols-outlined text-sm animate-spin-slow">stars</span>
          </div>
        </div>
      </div>
      <style>{`
        .animate-spin-slow { animation: spin 10s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </footer>
  );
};

export default Footer;
