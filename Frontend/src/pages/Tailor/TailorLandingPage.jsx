import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TailorNavbar from '../../components/TailorNavbar';
import { API_BASE_URL } from '../../config';
import { useUi } from '../../context/UiContext'; // <--- 1. Import Hook
import './TailorLandingPage.css';

const TailorLandingPage = () => {
  const navigate = useNavigate();
  const { showToast, showConfirm } = useUi(); // <--- 2. Destructure
  
  const [stats, setStats] = useState({ active: 0, pending: 0, completed: 0, earnings: 0 });
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/tailor-bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const rawData = await res.json();
        const bookings = Array.isArray(rawData) ? rawData : (rawData.bookings || []);
        
        const active = bookings.filter(b => 
           b.status && ['accepted', 'in progress'].includes(b.status.toLowerCase())
        );
        const pending = bookings.filter(b => 
           b.status && b.status.toLowerCase() === 'pending'
        );
        const completed = bookings.filter(b => 
           b.status && b.status.toLowerCase() === 'completed'
        );
        
        const earnings = completed.reduce((sum, b) => sum + (b.offeredPrice || 0), 0);

        setStats({
          active: active.length,
          pending: pending.length,
          completed: completed.length,
          earnings
        });

        setActiveOrders(active);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDone = (id) => {
    // <--- 3. Use showConfirm instead of window.confirm
    showConfirm("Are you sure you want to mark this job as Completed?", async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/tailor-bookings/${id}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Completed' })
            });

            if(res.ok) {
                showToast("Order marked as Completed!", "success"); // <--- 4. Success Toast
                fetchDashboardData(); 
            } else {
                throw new Error("Failed");
            }
        } catch (err) { 
            showToast("Failed to update status", "error"); // <--- 5. Error Toast
        }
    });
  };

  return (
    <div className="tl-tailor-page-wrapper">
      <TailorNavbar />
      <div className="tl-tailor-content">
        <div className="tl-dashboard-header">
          <h1>Tailor Dashboard</h1>
          <p>Overview of your current production line.</p>
        </div>

        <div className="tl-stats-grid">
          <div className="tl-stat-card gold" onClick={() => navigate('/tailor/requests')} style={{cursor:'pointer'}}>
            <h3>{stats.pending}</h3>
            <span>New Requests →</span>
          </div>
          <div className="tl-stat-card">
            <h3>{stats.active}</h3>
            <span>Active Jobs</span>
          </div>
          <div className="tl-stat-card" onClick={() => navigate('/tailor/history')} style={{cursor:'pointer'}}>
            <h3>{stats.completed}</h3>
            <span>Completed</span>
          </div>
          <div className="tl-stat-card">
            <h3>Rs. {stats.earnings.toLocaleString()}</h3>
            <span>Total Earnings</span>
          </div>
        </div>

        <div className="tl-active-orders-section">
            <div className="tl-section-title">
                <h2>Work in Progress</h2>
                <div className="tl-line"></div>
            </div>
            {loading ? <p>Loading...</p> : (
                <div className="tl-orders-list">
                    {activeOrders.length === 0 ? (
                        <div className="tl-no-orders">
                           No active jobs. <span className="tl-link-text" onClick={() => navigate('/tailor/requests')}>Check your requests</span> to start working.
                        </div>
                    ) : (
                        activeOrders.map(order => (
                            <div key={order._id} className="tl-active-order-card">
                                <div className="tl-order-date">
                                    <span className="tl-label">Due Date</span>
                                    <span className="tl-value">{new Date(order.dueDate).toLocaleDateString()}</span>
                                </div>
                                <div className="tl-order-info">
                                    <h4>{order.description}</h4>
                                    <p>Customer: {order.customer?.name}</p>
                                    <p className="tl-price">Agreed Price: Rs. {order.offeredPrice}</p>
                                </div>
                                <div className="tl-order-status">
                                    <span className={`tl-status-badge tl-${order.status.toLowerCase().replace(' ', '-')}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <button className="tl-action-btn" onClick={() => handleMarkDone(order._id)}>
                                    Mark Completed
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TailorLandingPage;