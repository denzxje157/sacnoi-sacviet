
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Home from './pages/Home.tsx';
import MapPage from './pages/MapPage.tsx';
import Marketplace from './pages/Marketplace.tsx';
import Library from './pages/Library.tsx';
import Community from './pages/Community.tsx';
import Footer from './components/Footer.tsx';
import { CartProvider } from './context/CartContext.tsx';
import CartDrawer from './components/CartDrawer.tsx';

// Component phụ trợ: Tự động cuộn lên đầu trang khi đổi route
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Dùng instant để tránh xung đột với animation fade-in
    });
  }, [pathname]);

  return null;
};

// Component Wrapper để tạo hiệu ứng fade-in khi chuyển trang
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  return (
    <div key={location.pathname} className="animate-fade-in-page">
      {children}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <CartDrawer />
          <main className="flex-grow relative">
            <PageWrapper>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/library" element={<Library />} />
                <Route path="/community" element={<Community />} />
              </Routes>
            </PageWrapper>
          </main>
          <Footer />
        </div>
        <style>{`
          @keyframes fade-in-page {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-page {
            animation: fade-in-page 0.5s ease-out forwards;
          }
        `}</style>
      </Router>
    </CartProvider>
  );
};

export default App;
