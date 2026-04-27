import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import TailorNavbar from '../../components/TailorNavbar';
import { API_BASE_URL } from '../../config';
import { useUi } from '../../context/UiContext'; // <--- Import Hook
import './TailorOrders.css';

const TailorOrders = () => {
  const location = useLocation();
  const { showToast, showConfirm } = useUi(); // <--- Init Hook
  const isHistory = location.pathname.includes('history');
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [isHistory]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/tailor-bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const rawData = await res.json();
        const allData = Array.isArray(rawData) ? rawData : (rawData.bookings || []);
        
        if (isHistory) {
          setOrders(allData.filter(d => {
             const s = d.status ? d.status.toLowerCase() : '';
             return ['completed', 'rejected', 'cancelled'].includes(s);
          }));
        } else {
          setOrders(allData.filter(d => {
             const s = d.status ? d.status.toLowerCase() : '';
             return s === 'pending';
          }));
        }
      }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const updateStatus = (id, newStatus) => {
    // <--- Use showConfirm
    showConfirm(`Are you sure you want to ${newStatus} this request?`, async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE_URL}/tailor-bookings/${id}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ status: newStatus })
          });
          
          if(res.ok) {
            showToast(`Request ${newStatus} Successfully`, "success"); // <--- Use showToast
            fetchOrders(); 
          }
        } catch (err) { 
            showToast("Action Failed", "error"); 
        }
    });
  };

  return (
    <div className="to-orders-page-wrapper">
      <TailorNavbar />
      
      <div className="to-orders-container">
        <h1 className="to-page-title">{isHistory ? 'Order History' : 'New Order Requests'}</h1>

        {loading ? <div className="to-loading">Loading...</div> : (
          <div className="to-orders-grid">
            {orders.length === 0 && <div className="to-empty-msg">No records found in this category.</div>}
            
            {orders.map(order => (
              <div key={order._id} className="to-request-card">
                <div className="to-card-header">
                   <span className="to-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                   <span className={`to-status to-${order.status.toLowerCase()}`}>{order.status}</span>
                </div>
                
                <div className="to-card-body">
                   <h3>{order.description}</h3>
                   <div className="to-detail-row">
                     <span>Customer:</span> {order.customer?.name || "Unknown"}
                   </div>
                   <div className="to-detail-row">
                     <span>Contact:</span> {order.contactNumber}
                   </div>
                   <div className="to-detail-row">
                     <span>Due Date:</span> {new Date(order.dueDate).toLocaleDateString()}
                   </div>
                   <div className="to-price-tag">
                      Offered: Rs. {order.offeredPrice}
                   </div>
                </div>

                {!isHistory && (
                  <div className="to-card-actions">
                    <button className="to-btn-reject" onClick={() => updateStatus(order._id, 'Rejected')}>Reject</button>
                    <button className="to-btn-accept" onClick={() => updateStatus(order._id, 'Accepted')}>Accept Job</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TailorOrders;