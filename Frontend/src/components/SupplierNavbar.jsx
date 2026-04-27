import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CustomerNavbar.css'; 

const SupplierNavbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="customer-nav" style={{position: 'fixed', width: '100%', top:0, zIndex:1000}}>
      {/* Brand */}
      <div className="nav-brand" onClick={() => navigate('/dashboard')}>
        STITCH<span className="gold-text">CRAFT</span>
        <span style={{ marginLeft:'10px', letterSpacing:'2px', color: '#D4AF37', fontSize: '0.8em'}}>Supplier</span>
      </div>

      {/* Hamburger Icon */}
      <div className="mobile-menu-icon" onClick={toggleMenu}>
        {isMenuOpen ? '✕' : '☰'}
      </div>

      {/* Links */}
      <div className={`nav-links-container ${isMenuOpen ? 'active' : ''}`}>
        <Link to="/dashboard" className="nav-link" onClick={closeMenu}>Dashboard</Link>
        <Link to="/supplier/orders" className="nav-link" onClick={closeMenu}>Orders</Link> 
        <Link to="/add-fabric" className="nav-link" onClick={closeMenu}>Add Fabric</Link>
        <Link to="/update-profile" className="nav-link" onClick={closeMenu}>Profile</Link>
        <button className="nav-logout-btn" onClick={handleLogout}>
          LOGOUT
        </button>
      </div>
    </nav>
  );
};

export default SupplierNavbar;