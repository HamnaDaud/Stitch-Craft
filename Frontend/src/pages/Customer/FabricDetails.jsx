import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerNavbar from '../../components/CustomerNavbar';
import { API_BASE_URL } from '../../config';
import './FabricDetails.css';

const FabricDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fabric, setFabric] = useState(null);
  
  // New State for Address
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState(''); 
  
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE_URL}/fabrics/${id}`, { headers });
        if(res.ok) {
           const data = await res.json();
           setFabric(data);
        }
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchDetails();
  }, [id]);

  const handleBuy = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    // 1. Validate Address before sending
    if (!address.trim()) {
      alert("Please enter a delivery address.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/fabric-purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // 2. Include deliveryAddress in the payload
        body: JSON.stringify({ 
          fabricId: id, 
          quantity: Number(quantity),
          deliveryAddress: address 
        })
      });

      if (res.ok) {
         setShowSuccess(true);
         setTimeout(() => {
           navigate('/my-orders');
         }, 2000);
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.message}`);
      }
    
    } catch (error) {
      alert("Something went wrong");
    }
  };

  if (loading) return <div className="fd-state-msg">Loading...</div>;
  if (!fabric) return <div className="fd-state-msg">Product not found</div>;

  return (
    <div className="fd-details-page-wrapper">
      <CustomerNavbar />
      
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: '120px',
          right: '40px',
          background: '#050505',
          border: '1px solid #D4AF37',
          padding: '20px 30px',
          color: '#fff',
          zIndex: 2000,
          boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          fontFamily: "'Montserrat', sans-serif",
          animation: 'fadeIn 0.5s ease'
        }}>
          <span style={{color: '#D4AF37', fontSize: '1.5rem'}}>✓</span>
          <div>
            <div style={{fontWeight: '600', letterSpacing:'1px', marginBottom:'4px'}}>ORDER PLACED</div>
            <div style={{fontSize: '0.85rem', color:'#888'}}>Redirecting to your orders...</div>
          </div>
        </div>
      )}
      <div className="fd-details-container">
        
        <div className="fd-details-image-box">
          <img 
            src={fabric.imageUrl || "https://via.placeholder.com/600x800"} 
            alt={fabric.name} 
            className="fd-details-image" 
          />
        </div>

        <div className="fd-details-info-box">
          <div className="fd-collection-tag">{fabric.fabricType} Collection</div>
          
          <h1 className="fd-details-title">{fabric.name}</h1>
          
          <div className="fd-details-price">
             Rs. {fabric.price} <span className="fd-per-meter">/ meter</span>
          </div>
          
          <div className="fd-details-description">
             <p className="fd-desc-text">{fabric.description}</p>
             <div className="fd-supplier-info">Supplier: {fabric.supplier?.shopName}</div>
          </div>
          
          {/* Quantity Section */}
          <div className="fd-quantity-section">
             <div>
               <label className="fd-qty-label">Quantity (Meters)</label>
               <input 
                 type="number" 
                 min="1" 
                 max={fabric.quantity}
                 value={quantity} 
                 onChange={(e) => setQuantity(e.target.value)}
                 className="fd-qty-input"
               />
             </div>
             <div className="fd-stock-info">{fabric.quantity} meters currently available</div>
          </div>

          {/* NEW ADDRESS SECTION */}
          <div className="fd-address-section">
            <label className="fd-qty-label">Delivery Address</label>
            <textarea
              className="fd-address-input"
              rows="3"
              placeholder="Enter your full delivery address here..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <button onClick={handleBuy} className="fd-buy-btn">
            Confirm Purchase
          </button>
        </div>
      </div>
      <footer style={{ padding: '80px 0', textAlign: 'center', opacity: 0.6, fontSize: '0.8rem', letterSpacing:'1px' }}>
        <p>© 2025 STITCHCRAFT ATELIER. CRAFTED FOR EXCELLENCE.</p>
      </footer>
    </div>
  );
};

export default FabricDetails;