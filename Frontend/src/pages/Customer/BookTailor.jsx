import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerNavbar from '../../components/CustomerNavbar';
import { API_BASE_URL } from '../../config';
import './BookTailor.css';

const BookTailor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tailor, setTailor] = useState(null);
  const [loading, setLoading] = useState(true);

  

  // Form State
  const [formData, setFormData] = useState({
    description: '',
    dueDate: '',
    contactNumber: '',
    offeredPrice: ''
  });

  const getInitials = (name) => {
    return name
      ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : 'SC';
  };

  useEffect(() => {
    const fetchTailor = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/users/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setTailor(data);
        }
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchTailor();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const selectedDate = new Date(formData.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to midnight for accurate comparison

    // Fix for timezone issues: ensure we compare local dates properly
    // If the selected date (in local time) is strictly less than today (in local time)
    // Note: input type="date" returns YYYY-MM-DD. When parsed by new Date(), 
    // it can sometimes be treated as UTC. To be safe, we can just compare timestamps 
    // or use this simple logic which usually works for standard inputs:
    if (selectedDate < today) {
        alert("Invalid Date: Please select a date that is today or in the future.");
        return; // Stop the function here
    }

    try {
        const res = await fetch(`${API_BASE_URL}/tailor-bookings`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                tailorId: id,
                ...formData
            })
        });

        if (res.ok) {
            alert("Booking Request Sent Successfully!");
            navigate('/my-orders'); 
        } else {
            const err = await res.json();
            alert(`Error: ${err.message}`);
        }
    } catch (error) {
        alert("Something went wrong");
    }
  };

  if (loading) return <div className="bt-state-msg">Loading...</div>;
  if (!tailor) return <div className="bt-state-msg">Tailor not found</div>;

  // Check if image exists
  const hasImage = tailor.portfolio?.[0]?.imageUrl;

  return (
    <div className="bt-booking-page-wrapper">
      <CustomerNavbar />
      
      <div className="bt-booking-container">
        
        {/* Left: Tailor Info & Portfolio Link */}
        <div className="bt-tailor-info-side">
           
           {/* Dynamic Profile Frame: Image OR Initials */}
           <div className={`bt-profile-frame ${!hasImage ? 'bt-no-img' : ''}`}>
              {hasImage ? (
                <img 
                  src={tailor.portfolio[0].imageUrl} 
                  className="bt-tailor-img-content" 
                  alt="Tailor"
                />
              ) : (
                <div className="bt-initials-placeholder">
                  {getInitials(tailor.name)}
                </div>
              )}
           </div>

           <h1 className="bt-tailor-name">{tailor.name}</h1>
           <p className="bt-tailor-specs">
             {tailor.specializations?.join(' • ') || "General Specialist"}
           </p>
           
           <button 
             className="bt-view-portfolio-btn"
             onClick={() => navigate(`/tailor-portfolio-view/${id}`)}
           >
             <span>✦</span> View Full Portfolio
           </button>
        </div>

        {/* Right: Booking Form */}
        <div className="bt-booking-form-side">
           <div className="bt-form-box">
             <h2>Request Commission</h2>
             <p className="bt-form-subtitle">Submit your details for a bespoke creation.</p>
             
             <form onSubmit={handleSubmit}>
                <div className="bt-input-group">
                    <label>Description of Request</label>
                    <textarea 
                      rows="4" 
                      placeholder="Describe the design, fabric, and specific requirements..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      required
                    />
                </div>

                <div className="bt-input-row">
                    <div className="bt-input-group">
                        <label>Date Required</label>
                        <input 
                          type="date" 
                          value={formData.dueDate}
                          onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                          required
                        />
                    </div>
                    <div className="bt-input-group">
                        <label>Budget (Rs.)</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 5000"
                          value={formData.offeredPrice}
                          onChange={(e) => setFormData({...formData, offeredPrice: e.target.value})}
                          required
                        />
                    </div>
                </div>

                <div className="bt-input-group">
                    <label>Contact Number</label>
                    <input 
                      type="text" 
                      placeholder="0300-1234567"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                      required
                    />
                </div>

                <button type="submit" className="bt-submit-booking-btn">
                    Send Request
                </button>
             </form>
           </div>
        </div>

      </div>
    </div>
  );
};

export default BookTailor;