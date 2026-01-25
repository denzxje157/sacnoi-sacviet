
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext.tsx';
import AIChatWidget from './AIChatWidget.tsx';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // State cho Chatbot
  const location = useLocation();
  const { toggleCart, totalItems } = useCart();

  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Bản đồ di sản', path: '/map' },
    { name: 'Chợ Phiên', path: '/marketplace' },
    { name: 'Thư viện', path: '/library' },
    { name: 'Cộng đồng', path: '/community' },
  ];

  return (
    <>
      <header className="sticky top-0 z-[100] w-full border-b border-gold/20 bg-background-light/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="https://lh3.googleusercontent.com/d/18IzzMdMCckjzNcMpkhqp52zhXw72K9js" 
              alt="Logo Sắc Nối" 
              className="h-12 w-12 rounded-full object-cover border-2 border-gold shadow-md transition-transform group-hover:scale-110"
            />
            <div className="flex flex-col leading-none">
              <h1 className="text-xl font-black uppercase tracking-tighter text-primary">SẮC NỐI</h1>
              <span className="text-[10px] font-bold tracking-[0.3em] text-text-soft group-hover:text-gold transition-colors">SẮC VIỆT</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs font-black uppercase tracking-widest transition-all hover:text-primary relative py-2 group ${
                  location.pathname === link.path ? 'text-primary' : 'text-text-soft'
                }`}
              >
                {link.name}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${
                  location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Cart Button */}
            <button 
              onClick={toggleCart}
              className="relative size-10 flex items-center justify-center rounded-full bg-white border border-gold/20 text-text-main hover:bg-gold hover:text-white transition-colors shadow-sm group"
            >
              <span className="material-symbols-outlined text-xl group-hover:animate-pulse">shopping_bag</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-background-light shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>

            {/* AI Discovery Button (Active) */}
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`hidden rounded-full px-7 py-2.5 text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 sm:flex items-center gap-2 shadow-lg ${
                isChatOpen 
                ? 'bg-gold text-text-main border border-gold shadow-gold/40' 
                : 'bg-primary text-white border border-primary/20 shadow-primary/20 hover:bg-gold hover:text-text-main'
              }`}
            >
              {isChatOpen ? (
                <>Đóng Chat <span className="material-symbols-outlined text-sm">close</span></>
              ) : (
                <>Khám phá AI <span className="material-symbols-outlined text-sm animate-pulse">auto_awesome</span></>
              )}
            </button>
            
            <button 
              className="lg:hidden text-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="material-symbols-outlined text-3xl">
                {isMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="lg:hidden bg-background-light border-t border-gold/20 p-6 flex flex-col gap-4 animate-fade-in absolute w-full shadow-2xl h-screen top-[81px]">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-bold uppercase text-text-main hover:text-primary flex items-center justify-between border-b border-gold/10 pb-4"
              >
                {link.name}
                <span className="material-symbols-outlined text-gold/50 text-sm">arrow_forward</span>
              </Link>
            ))}
            <button 
              onClick={() => { setIsChatOpen(true); setIsMenuOpen(false); }}
              className="w-full rounded-lg bg-primary py-4 font-black text-white uppercase tracking-widest mt-4 hover:bg-gold transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">auto_awesome</span>
              Hỏi Trợ Lý AI
            </button>
          </div>
        )}
      </header>

      {/* AI Chat Widget */}
      <AIChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
};

export default Navbar;
