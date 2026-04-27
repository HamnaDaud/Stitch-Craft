import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerNavbar from '../../components/CustomerNavbar';
import { API_BASE_URL } from '../../config';
import './MyOrders.css';

const MyOrders = () => {
  const navigate = useNavigate();
  
  // State
  const [activeTab, setActiveTab] = useState('fabric'); // 'fabric' or 'tailor'
  const [fabricOrders, setFabricOrders] = useState([]);
  const [tailorBookings, setTailorBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
           navigate('/login');
           return;
        }

        // 1. Fetch Fabric Purchases
        const fabricRes = await fetch(`${API_BASE_URL}/fabric-purchases`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (fabricRes.ok) {
           const data = await fabricRes.json();
           if (data.purchases) setFabricOrders(data.purchases);
           else if (Array.isArray(data)) setFabricOrders(data);
           else setFabricOrders([]);
        }

        // 2. Fetch Tailor Bookings
        const bookingRes = await fetch(`${API_BASE_URL}/tailor-bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (bookingRes.ok) {
            const bookingData = await bookingRes.json();
            if (bookingData.bookings) setTailorBookings(bookingData.bookings);
            else if (Array.isArray(bookingData)) setTailorBookings(bookingData);
            else setTailorBookings([]);
        }

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Helper: Format Price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(price);
  };

  // Helper: Status Color Logic (Unified for both Tabs)
  const getStatusColor = (status) => {
    if (!status) return '#ccc';
    
    const s = status.toLowerCase(); // Case insensitive check
    
    if (s === 'pending') return '#D4AF37';       // Gold
    if (s === 'accepted') return '#00d4ff';      // Blue
    if (s === 'completed' || s === 'delivered') return '#00ff80'; // Green
    if (s === 'rejected' || s === 'cancelled') return '#ff4444';  // Red
    
    return '#ccc'; // Grey for unknown/processing
  };

  if (loading) return <div className="mo-loading">Loading your requests...</div>;

  return (
    <div className="mo-wrapper">
      <CustomerNavbar />
      
      <div className="mo-container">
        <h1 className="mo-title">My Activity</h1>
        
        {/* Tab Switcher */}
        <div className="mo-tabs">
            <button 
              className={`mo-tab ${activeTab === 'fabric' ? 'active' : ''}`}
              onClick={() => setActiveTab('fabric')}
            >
              Fabric Orders
            </button>
            <button 
              className={`mo-tab ${activeTab === 'tailor' ? 'active' : ''}`}
              onClick={() => setActiveTab('tailor')}
            >
              Tailor Bookings
            </button>
        </div>

        {/* Content Area */}
        <div className="mo-content">
            
            {/* ---------------- FABRIC ORDERS ---------------- */}
            {activeTab === 'fabric' && (
                <div className="mo-grid">
                    {fabricOrders.length > 0 ? (
                        fabricOrders.map((order) => (
                            <div key={order._id} className="mo-card">
                                <div className="mo-card-header">
                                    <span className="mo-id">#{order._id.slice(-6).toUpperCase()}</span>
                                    {/* Status Badge */}
                                    <span 
                                      className="mo-status"
                                      style={{ 
                                          color: getStatusColor(order.status),
                                          borderColor: getStatusColor(order.status) 
                                      }}
                                    >
                                      {order.status || 'Processing'}
                                    </span>
                                </div>

                                <div className="mo-card-body">
                                    <h3>{order.fabric?.name || 'Unknown Fabric'}</h3>
                                    <p className="mo-date">Ordered: {new Date(order.createdAt).toLocaleDateString()}</p>
                                    <p className="mo-price">{formatPrice(order.totalPrice)}</p>
                                    <p className="mo-qty">Quantity: {order.quantity} meters</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="mo-empty">
                            <p>No fabric purchases found.</p>
                            <button onClick={() => navigate('/buy-fabric')}>Browse Fabrics</button>
                        </div>
                    )}
                </div>
            )}

            {/* ---------------- TAILOR BOOKINGS ---------------- */}
            {activeTab === 'tailor' && (
                <div className="mo-grid">
                    {tailorBookings.length > 0 ? (
                        tailorBookings.map((booking) => (
                            <div key={booking._id} className="mo-card booking-card">
                                <div className="mo-card-header">
                                    <span className="mo-id">#{booking._id.slice(-6).toUpperCase()}</span>
                                    {/* Status Badge */}
                                    <span 
                                      className="mo-status"
                                      style={{ 
                                          color: getStatusColor(booking.status),
                                          borderColor: getStatusColor(booking.status) 
                                      }}
                                    >
                                      {booking.status}
                                    </span>
                                </div>

                                <div className="mo-card-body">
                                    <div className="mo-tailor-info">
                                        <span className="mo-label">Tailor:</span>
                                        <h3>{booking.tailor?.name || 'Unknown Tailor'}</h3>
                                    </div>
                                    
                                    <p className="mo-desc">"{booking.description.length > 50 ? booking.description.substring(0,50)+'...' : booking.description}"</p>
                                    
                                    <div className="mo-meta-row">
                                        <div className="mo-meta">
                                            <span className="mo-label">Budget</span>
                                            <span>{formatPrice(booking.offeredPrice)}</span>
                                        </div>
                                        <div className="mo-meta">
                                            <span className="mo-label">Due Date</span>
                                            <span>{new Date(booking.dueDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="mo-empty">
                            <p>No active tailor bookings.</p>
                            <button onClick={() => navigate('/book-tailor')}>Find a Tailor</button>
                        </div>
                    )}
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default MyOrders;