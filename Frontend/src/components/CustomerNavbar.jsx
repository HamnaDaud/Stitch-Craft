import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './CustomerNavbar.css';

const CustomerNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when clicking a link
  const closeMenu = () => setIsMenuOpen(false);

  // Route Checks
  const currentPath = location.pathname;
  const isLanding = currentPath === '/dashboard';
  const isBookTailorPage = currentPath === '/book-tailor';
  const isBuyFabricPage = currentPath === '/buy-fabric';

  return (
    <nav className="customer-nav">
      {/* 1. Logo */}
      <div className="nav-brand" onClick={() => navigate('/dashboard')}>
        STITCH<span className="gold-text">CRAFT</span>
      </div>

      {/* 2. Hamburger Icon (Mobile Only) */}
      <div className="mobile-menu-icon" onClick={toggleMenu}>
        {isMenuOpen ? '✕' : '☰'}
      </div>

      {/* 3. Links Container */}
      <div className={`nav-links-container ${isMenuOpen ? 'active' : ''}`}>
        {token && (
          <>
            {!isLanding && (
              <>
                {!isBookTailorPage && (
                  <Link to="/book-tailor" className="nav-link" onClick={closeMenu}>Book Tailor</Link>
                )}
                
                {!isBuyFabricPage && (
                  <Link to="/buy-fabric" className="nav-link" onClick={closeMenu}>Buy Fabric</Link>
                )}
              </>
            )}

            <Link to="/my-orders" className="nav-link" onClick={closeMenu}>My Wardrobe</Link>
            <Link to="/update-profile" className="nav-link" onClick={closeMenu}>Profile</Link>
            
            <button className="nav-logout-btn" onClick={handleLogout}>
              LOGOUT
            </button>
          </>
        )}

        {!token && (
          <button className="auth-btn login" onClick={() => navigate('/login')}>
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};

export default CustomerNavbar;