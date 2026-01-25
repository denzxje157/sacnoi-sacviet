
import React, { useState } from 'react';
import { useCart } from '../context/CartContext.tsx';

const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, toggleCart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', note: '' });

  if (!isCartOpen) return null;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Tạo nội dung tin nhắn
    let message = `🛒 *ĐƠN ĐẶT HÀNG MỚI TỪ SẮC NỐI*\n`;
    message += `--------------------------------\n`;
    message += `👤 Khách hàng: ${formData.name}\n`;
    message += `📞 SĐT: ${formData.phone}\n`;
    message += `📍 Địa chỉ: ${formData.address}\n`;
    if (formData.note) message += `📝 Ghi chú: ${formData.note}\n`;
    message += `--------------------------------\n`;
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name} (${item.ethnic}) \n   SL: ${item.quantity} x ${item.price}\n`;
    });
    message += `--------------------------------\n`;
    message += `💰 *TỔNG CỘNG: ${totalPrice.toLocaleString('vi-VN')} VNĐ*\n`;
    
    // Copy nội dung và mở Zalo
    navigator.clipboard.writeText(message).then(() => {
        setStep('success');
        setTimeout(() => {
           // Mở trang Zalo (thay số điện thoại shop ở đây)
           window.open(`https://zalo.me/0987654321`, '_blank'); 
           clearCart();
           setStep('cart');
        }, 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-end font-display">
      {/* Overlay */}
      <div className="absolute inset-0 bg-text-main/60 backdrop-blur-sm animate-fade-in" onClick={toggleCart}></div>
      
      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-[#F7F3E9] h-full shadow-2xl flex flex-col border-l-4 border-gold animate-slide-in-right">
        
        {/* Header */}
        <div className="p-6 bg-primary text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
               <span className="material-symbols-outlined text-2xl">shopping_bag</span>
            </div>
            <div>
               <h2 className="text-lg font-black uppercase tracking-widest leading-none">Giỏ Hàng</h2>
               <p className="text-[10px] text-gold-light font-bold mt-1 opacity-90">Di sản trong tay bạn</p>
            </div>
          </div>
          <button onClick={toggleCart} className="hover:bg-white/20 p-2 rounded-full transition-colors flex items-center">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#F7F3E9]">
          
          {step === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-text-soft/50 space-y-4">
                   <span className="material-symbols-outlined text-6xl opacity-50">remove_shopping_cart</span>
                   <p className="font-bold text-lg">Chưa có bảo vật nào</p>
                   <button onClick={toggleCart} className="text-primary font-black uppercase text-xs hover:underline mt-2">Quay lại chợ phiên</button>
                </div>
              ) : (
                <div className="space-y-6">
                   {cart.map((item) => (
                     <div key={item.id} className="flex gap-4 bg-white p-4 rounded-2xl border border-gold/20 shadow-sm relative group">
                        <img src={item.img} alt={item.name} className="size-20 rounded-xl object-cover border border-gold/10 bg-gray-100" />
                        <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-start mb-1">
                              <h3 className="font-black text-text-main text-sm line-clamp-2 pr-2">{item.name}</h3>
                              <button onClick={() => removeFromCart(item.id)} className="text-text-soft/40 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                           </div>
                           <p className="text-[10px] text-bronze uppercase font-black tracking-widest mb-2">{item.ethnic}</p>
                           <div className="flex items-center justify-between">
                              <span className="text-primary font-bold text-sm">{item.price}</span>
                              <div className="flex items-center bg-background-light rounded-lg border border-gold/10">
                                 <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-1 hover:text-primary">-</button>
                                 <span className="text-xs font-black px-1">{item.quantity}</span>
                                 <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-1 hover:text-primary">+</button>
                              </div>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
              )}
            </>
          )}

          {step === 'checkout' && (
             <div className="bg-white p-6 rounded-3xl border border-gold/20 shadow-sm animate-fade-in">
                <h3 className="font-black text-text-main uppercase text-sm mb-6 flex items-center gap-2">
                   <span className="material-symbols-outlined text-primary">fact_check</span>
                   Thông tin người nhận
                </h3>
                <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
                   <div>
                      <label className="block text-[10px] font-black uppercase text-bronze mb-1 ml-2">Họ và tên</label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-background-light border border-gold/20 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Ví dụ: Nguyễn Văn A" />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black uppercase text-bronze mb-1 ml-2">Số điện thoại</label>
                      <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-background-light border border-gold/20 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Ví dụ: 0912..." />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black uppercase text-bronze mb-1 ml-2">Địa chỉ nhận hàng</label>
                      <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-background-light border border-gold/20 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[80px]" placeholder="Số nhà, phường/xã..."></textarea>
                   </div>
                   <div>
                      <label className="block text-[10px] font-black uppercase text-bronze mb-1 ml-2">Lời nhắn (Tùy chọn)</label>
                      <textarea value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full bg-background-light border border-gold/20 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[60px]" placeholder="Gói quà giúp tôi..."></textarea>
                   </div>
                </form>
             </div>
          )}

          {step === 'success' && (
             <div className="h-full flex flex-col items-center justify-center text-center p-6 animate-fade-in">
                <div className="size-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                   <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
                </div>
                <h3 className="text-2xl font-black text-text-main mb-2">Đã Sao Chép Đơn!</h3>
                <p className="text-text-soft mb-8">Hệ thống đang chuyển bạn đến Zalo để gửi đơn hàng cho nghệ nhân...</p>
                <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
             </div>
          )}
        </div>

        {/* Footer Actions */}
        {cart.length > 0 && step !== 'success' && (
          <div className="p-6 bg-white border-t border-gold/10 shrink-0">
             <div className="flex justify-between items-center mb-6">
                <span className="text-text-soft font-bold text-sm">Tổng cộng:</span>
                <span className="text-2xl font-black text-primary">{totalPrice.toLocaleString('vi-VN')} đ</span>
             </div>
             
             {step === 'cart' ? (
               <button onClick={() => setStep('checkout')} className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                 Tiến hành đặt hàng
                 <span className="material-symbols-outlined text-lg">arrow_forward</span>
               </button>
             ) : (
               <div className="flex gap-3">
                  <button onClick={() => setStep('cart')} className="flex-1 bg-background-light text-text-soft border border-gold/20 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gold/10 transition-colors">
                    Quay lại
                  </button>
                  <button type="submit" form="checkout-form" className="flex-[2] bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                    Gửi đơn (Zalo)
                    <span className="material-symbols-outlined text-lg">send</span>
                  </button>
               </div>
             )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in-right { animation: slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D4AF37; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default CartDrawer;
