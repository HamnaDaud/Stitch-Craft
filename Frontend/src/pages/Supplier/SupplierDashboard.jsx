// src/pages/Supplier/SupplierDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import './SupplierDashboard.css';
import SupplierNavbar from '../../components/SupplierNavbar';
const SupplierDashboard = () => {
  const navigate = useNavigate();
  const [fabrics, setFabrics] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    const token = localStorage.getItem('token');

    if (!token || !storedUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchFabrics(token, parsedUser._id);
  }, [navigate]);

  const fetchFabrics = async (token, userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/fabrics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Client side filtering for demo
        const myFabrics = data.filter(f => f.supplier?._id === userId || f.supplier === userId);
        setFabrics(myFabrics);
      }
    } catch (error) {
      console.error("Failed to fetch fabrics", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  // Get Initials for Avatar
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'SC';
  };

  return (
    <div className="sd-layout">
      <SupplierNavbar />

      <div className="sd-container">
        <header className="sd-hero">
          <div className="sd-hero-text">
            <h1>Inventory Collection</h1>
            <p>Manage your premium stock for discerning ateliers.</p>
          </div>
          
          <div className="sd-hero-stats">
            <div className="sd-stat-item">
              <span className="sd-stat-num">{fabrics.length}</span>
              <span className="sd-stat-label">Total</span>
            </div>
            <div className="sd-stat-item">
              <span className="sd-stat-num">
                {fabrics.filter(f => f.quantity < 10).length}
              </span>
              <span className="sd-stat-label" style={{color: '#ef4444'}}>Low Stock</span>
            </div>
          </div>
        </header>

        {loading ? (
          <div style={{color:'white', textAlign:'center', padding:'50px'}}>Loading Atelier...</div>
        ) : (
          <div className="sd-grid">
            
            {/* Fabric Cards */}
            {fabrics.map((fabric) => (
              <div key={fabric._id} className="sd-card"
              onClick={() => navigate(`/edit-fabric/${fabric._id}`)}
              style={{cursor: 'pointer'}}>
                <div className="sd-img-wrapper">
                  <img 
                    src={fabric.imageUrl || "https://via.placeholder.com/300x200?text=Fabric"} 
                    alt={fabric.name} 
                    className="sd-img"
                  />
                </div>
                
                <div className="sd-details">
                  <div className="sd-card-header">
                    <h3>{fabric.name}</h3>
                    <span className="sd-badge">{fabric.fabricType}</span>
                  </div>
                  
                  <div className="sd-price-row">
                    <span className="sd-price">Rs. {fabric.price} <small style={{fontSize:'0.6em', color:'#94a3b8'}}>/ m</small></span>
                    
                    <span className="sd-stock">
                      <div className={`sd-dot ${fabric.quantity < 10 ? 'low' : ''}`}></div>
                      {fabric.quantity > 0 ? `${fabric.quantity} Avail.` : 'Sold Out'}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* The "Add New" Card */}
            <div className="sd-add-card" onClick={() => navigate('/add-fabric')}>
               <div className="sd-plus-circle">
                 <span>+</span>
               </div>
               <span className="sd-add-text">Curate New Material</span>
            </div>

          </div>
        )}
      </div>

      <footer className="sd-footer">
        <p style={{fontFamily: 'Playfair Display', fontStyle: 'italic', marginBottom:'10px'}}>
          "Tradition woven into the future."
        </p>
        <small>© {new Date().getFullYear()} StitchCraft Ecosystem</small>
      </footer>
    </div>
  );
};

export default SupplierDashboard;