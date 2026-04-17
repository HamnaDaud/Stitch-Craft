import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SupplierNavbar from '../../components/SupplierNavbar';
import { API_BASE_URL } from '../../config';
import './SupplierOrders.css';

const SupplierOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'past'

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      const res = await fetch(`${API_BASE_URL}/fabric-purchases`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        // Handle both array or object return styles just in case
        const allOrders = data.purchases || (Array.isArray(data) ? data : []);
        setOrders(allOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/fabric-purchases/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        // Update local state immediately to reflect change
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
        // Optional: Add a toast notification here
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- Filtering Logic ---
  const activeOrders = orders.filter(o => ['Pending', 'Confirmed', 'Shipped'].includes(o.status));
  const pastOrders = orders.filter(o => ['Delivered', 'Cancelled'].includes(o.status));

  const displayOrders = activeTab === 'active' ? activeOrders : pastOrders;

  if (loading) return <div style={{background:'#050505', minHeight:'100vh', color:'white', display:'flex', justifyContent:'center', alignItems:'center'}}>Loading Orders...</div>;

  return (
    <div className="so-layout">
      <SupplierNavbar />

      <div className="so-container">
        
        {/* Header & Tabs */}
        <header className="so-header">
          <h1 className="so-title">Order Management</h1>
          
          <div className="so-tabs">
            <button 
              className={`so-tab-btn ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active Orders ({activeOrders.length})
            </button>
            <button 
              className={`so-tab-btn ${activeTab === 'past' ? 'active' : ''}`}
              onClick={() => setActiveTab('past')}
            >
              Order History ({pastOrders.length})
            </button>
          </div>
        </header>

        {/* Order List */}
        <div className="so-list">
          {displayOrders.length > 0 ? (
            displayOrders.map(order => (
              <div key={order._id} className="so-card">
                
                {/* Image */}
                <img 
                  src={order.fabric?.imageUrl || "https://via.placeholder.com/150"} 
                  alt="Fabric" 
                  className="so-img" 
                />

                {/* Info */}
                <div className="so-details">
                  <div className="so-id">ID: {order._id.substring(order._id.length - 8)}</div>
                  <h3 className="so-fabric-name">{order.fabric?.name}</h3>
                  
                  <div className="so-meta-row">
                    <div className="so-meta-item">Customer: <strong>{order.customer?.name}</strong></div>
                    <div className="so-meta-item">Date: <strong>{new Date(order.createdAt).toLocaleDateString()}</strong></div>
                    <div className="so-meta-item">Qty: <strong>{order.quantity} m</strong></div>
                  </div>
                  
                  <div style={{color:'#888', fontSize:'0.85rem'}}>
                    Shipping Address: {order.deliveryAddress || "Not provided (Contact Customer)"}
                  </div>
                </div>

                {/* Actions */}
                <div className="so-actions">
                  <div className="so-price">Rs. {order.totalPrice}</div>

                  {activeTab === 'active' ? (
                    <div style={{width:'100%'}}>
                       <label style={{display:'block', fontSize:'0.7rem', color:'#666', marginBottom:'5px'}}>UPDATE STATUS</label>
                       <select 
                         value={order.status} 
                         onChange={(e) => handleStatusChange(order._id, e.target.value)}
                         className="so-status-select"
                       >
                         <option value="Pending">Pending</option>
                         <option value="Confirmed">Confirmed</option>
                         <option value="Delivered">Delivered</option>
                         <option value="Cancelled">Cancelled</option>
                       </select>
                    </div>
                  ) : (
                    <div className={`so-status-badge ${order.status.toLowerCase()}`}>
                      {order.status}
                    </div>
                  )}
                </div>

              </div>
            ))
          ) : (
            <div style={{textAlign:'center', padding:'80px', color:'#666', border:'1px dashed #333'}}>
              No {activeTab} orders found.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SupplierOrders;