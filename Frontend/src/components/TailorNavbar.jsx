import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TailorNavbar.css';

const TailorNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="tailor-navbar">
      <div className="nav-brand" onClick={() => navigate('/tailor/dashboard')}>
        STITCHCRAFT <span className="gold-text">TAILOR</span>
      </div>
      
      {/* Hamburger Icon */}
      <div className="tailor-mobile-icon" onClick={toggleMenu}>
        {isMenuOpen ? '✕' : '☰'}
      </div>

      {/* Nav Links Container */}
      <div className={`nav-links ${isMenuOpen ? 'mobile-active' : ''}`}>
        <button className={isActive('/tailor/dashboard')} onClick={() => { navigate('/tailor/dashboard'); closeMenu(); }}>
          Dashboard
        </button>
        <button className={isActive('/tailor/requests')} onClick={() => { navigate('/tailor/requests'); closeMenu(); }}>
          Order Requests
        </button>
        <button className={isActive('/tailor/history')} onClick={() => { navigate('/tailor/history'); closeMenu(); }}>
          Order History
        </button>
        <button className={isActive('/update-profile')} onClick={() => { navigate('/update-profile'); closeMenu(); }}>
          Profile
        </button>

        {/* Moved Logout here so it appears in the mobile menu */}
        <button className="logout-btn-nav" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default TailorNavbar;