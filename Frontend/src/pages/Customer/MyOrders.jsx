import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerNavbar from '../../components/CustomerNavbar';
import './MyOrders.css';

const MyOrders = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('fabric');
  const [fabricOrders, setFabricOrders] = useState([]);
  const [tailorBookings, setTailorBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // MOCK DATA FOR ORDERS
    const mockOrders = [
      { _id: 'ORD123456', status: 'Delivered', createdAt: '2025-02-15', quantity: 5, totalPrice: 22500, fabric: { name: 'Midnight Silk' } },
      { _id: 'ORD987654', status: 'Pending', createdAt: '2025-03-10', quantity: 3, totalPrice: 18600, fabric: { name: 'Royal Velvet' } }
    ];

    const mockBookings = [
      { _id: 'BK778899', status: 'Accepted', description: 'Bespoke 3-piece suit for wedding ceremony.', offeredPrice: 45000, dueDate: '2025-04-20', tailor: { name: 'Alessandro Sartori' } },
      { _id: 'BK112233', status: 'Pending', description: 'Traditional Sherwani with gold embroidery.', offeredPrice: 35000, dueDate: '2025-05-05', tailor: { name: 'Elena Moretti' } }
    ];

    setTimeout(() => {
      setFabricOrders(mockOrders);
      setTailorBookings(mockBookings);
      setLoading(false);
    }, 500);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(price);
  };

  const getStatusColor = (status) => {
    if (!status) return '#ccc';
    const s = status.toLowerCase();
    if (s === 'pending') return '#D4AF37';
    if (s === 'accepted') return '#00d4ff';
    if (s === 'completed' || s === 'delivered') return '#00ff80';
    if (s === 'rejected' || s === 'cancelled') return '#ff4444';
    return '#ccc';
  };

  if (loading) return <div className="mo-loading">Accessing Archives...</div>;

  return (
    <div className="mo-wrapper">
      <CustomerNavbar />
      <div className="mo-container">
        <h1 className="mo-title">My Activity</h1>
        <div className="mo-tabs">
            <button className={`mo-tab ${activeTab === 'fabric' ? 'active' : ''}`} onClick={() => setActiveTab('fabric')}>Fabric Orders</button>
            <button className={`mo-tab ${activeTab === 'tailor' ? 'active' : ''}`} onClick={() => setActiveTab('tailor')}>Tailor Bookings</button>
        </div>

        <div className="mo-content">
            {activeTab === 'fabric' && (
                <div className="mo-grid">
                    {fabricOrders.map((order) => (
                        <div key={order._id} className="mo-card">
                            <div className="mo-card-header">
                                <span className="mo-id">#{order._id.slice(-6).toUpperCase()}</span>
                                <span className="mo-status" style={{ color: getStatusColor(order.status), borderColor: getStatusColor(order.status) }}>
                                  {order.status}
                                </span>
                            </div>
                            <div className="mo-card-body">
                                <h3>{order.fabric.name}</h3>
                                <p className="mo-date">Ordered: {new Date(order.createdAt).toLocaleDateString()}</p>
                                <p className="mo-price">{formatPrice(order.totalPrice)}</p>
                                <p className="mo-qty">Quantity: {order.quantity} meters</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'tailor' && (
                <div className="mo-grid">
                    {tailorBookings.map((booking) => (
                        <div key={booking._id} className="mo-card booking-card">
                            <div className="mo-card-header">
                                <span className="mo-id">#{booking._id.slice(-6).toUpperCase()}</span>
                                <span className="mo-status" style={{ color: getStatusColor(booking.status), borderColor: getStatusColor(booking.status) }}>
                                  {booking.status}
                                </span>
                            </div>
                            <div className="mo-card-body">
                                <div className="mo-tailor-info">
                                    <span className="mo-label">Tailor:</span>
                                    <h3>{booking.tailor.name}</h3>
                                </div>
                                <p className="mo-desc">"{booking.description}"</p>
                                <div className="mo-meta-row">
                                    <div className="mo-meta"><span className="mo-label">Budget</span><span>{formatPrice(booking.offeredPrice)}</span></div>
                                    <div className="mo-meta"><span className="mo-label">Due Date</span><span>{new Date(booking.dueDate).toLocaleDateString()}</span></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;