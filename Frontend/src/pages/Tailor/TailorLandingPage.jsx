import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TailorNavbar from '../../components/TailorNavbar';
import { useUi } from '../../context/UiContext'; 
import './TailorLandingPage.css';

const TailorLandingPage = () => {
  const navigate = useNavigate();
  const { showToast, showConfirm } = useUi(); 
  
  const [stats, setStats] = useState({ active: 0, pending: 0, completed: 0, earnings: 0 });
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // INITIAL MOCK DATA FETCH
    const fetchDashboardData = () => {
      setLoading(true);
      
      // Simulated Active Jobs for the Tailor
      const mockActiveOrders = [
        {
          _id: 'BK99201',
          status: 'In Progress',
          description: 'Midnight Blue Bespoke 3-Piece Suit - Italian Cut',
          customer: { name: 'Zain Ahmed' },
          offeredPrice: 35000,
          dueDate: '2025-03-28'
        },
        {
          _id: 'BK99205',
          status: 'Accepted',
          description: 'Traditional Velvet Sherwani with Gold Zari Work',
          customer: { name: 'Omar Kassim' },
          offeredPrice: 55000,
          dueDate: '2025-04-05'
        },
        {
          _id: 'BK99210',
          status: 'In Progress',
          description: 'Linen Summer Blazer - Tailored Fit',
          customer: { name: 'Hamza Malik' },
          offeredPrice: 18000,
          dueDate: '2025-03-22'
        }
      ];

      // Simulated Dashboard Stats
      const mockStats = {
        active: 3,
        pending: 5,
        completed: 24,
        earnings: 342000
      };

      setTimeout(() => {
        setStats(mockStats);
        setActiveOrders(mockActiveOrders);
        setLoading(false);
      }, 700);
    };

    fetchDashboardData();
  }, []);

  // DEMO INTERACTION: Simulates updating the backend
  const handleMarkDone = (id) => {
    showConfirm("Are you sure you want to mark this job as Completed?", () => {
        // Find the order to get its price for the earnings update
        const completedOrder = activeOrders.find(o => o._id === id);
        
        // 1. Remove from local list
        setActiveOrders(prev => prev.filter(order => order._id !== id));
        
        // 2. Update Stats locally
        setStats(prev => ({
          ...prev,
          active: prev.active - 1,
          completed: prev.completed + 1,
          earnings: prev.earnings + (completedOrder?.offeredPrice || 0)
        }));

        showToast("Order marked as Completed!", "success");
    });
  };

  return (
    <div className="tl-tailor-page-wrapper">
      <TailorNavbar />
      <div className="tl-tailor-content">
        <div className="tl-dashboard-header">
          <h1>Atelier Dashboard</h1>
          <p>Managing your current craft and production line.</p>
        </div>

        {/* STATS SECTION */}
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

        {/* ACTIVE ORDERS SECTION */}
        <div className="tl-active-orders-section">
            <div className="tl-section-title">
                <h2>Work in Progress</h2>
                <div className="tl-line"></div>
            </div>
            
            {loading ? (
                <p style={{color: '#D4AF37', letterSpacing:'1px'}}>Syncing Atelier Records...</p>
            ) : (
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
                                    <p className="tl-price">Agreed Price: Rs. {order.offeredPrice.toLocaleString()}</p>
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