// src/pages/UpdateProfile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import './UpdateProfile.css'; 

const UpdateProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});


  const handleMeasurementChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      measurements: {
        ...(prev.measurements || {}), // Keep existing measurements
        [name]: Number(value) // Save as number
      }
    }));
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('userInfo');

      if (!token) {
        navigate('/login');
        return;
      }

      // 1. Set initial state from LocalStorage (fast load)
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        // Format arrays to strings immediately for inputs
        setFormData(formatDataForForm(parsed));
      }

      // 2. Fetch Fresh Data from Backend (ensures Shop details are accurate)
      try {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const freshData = await response.json();
          setUser(freshData);
          setFormData(formatDataForForm(freshData));
          
          // Keep local storage in sync
          localStorage.setItem('userInfo', JSON.stringify(freshData));
        }
      } catch (error) {
        console.error("Failed to load fresh profile data", error);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Helper: Converts Database Arrays -> Input Strings
  const formatDataForForm = (data) => {
    return {
      ...data,
      // If fabricTypes is an array ["Silk", "Cotton"], join it to "Silk, Cotton"
      fabricTypes: Array.isArray(data.fabricTypes) ? data.fabricTypes.join(', ') : data.fabricTypes,
      // Same for Specializations
      specializations: Array.isArray(data.specializations) ? data.specializations.join(', ') : data.specializations,
    };
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    const payload = { ...formData };
    
    // Convert Strings back to Arrays for Database
    if (formData.specializations && typeof formData.specializations === 'string') {
        payload.specializations = formData.specializations.split(',').map(s => s.trim());
    }
    if (formData.fabricTypes && typeof formData.fabricTypes === 'string') {
        payload.fabricTypes = formData.fabricTypes.split(',').map(s => s.trim());
    }
    
    // Formatting numbers
    if (payload.height) payload.height = Number(payload.height);
    if (payload.chest) payload.chest = Number(payload.chest);
    if (payload.waist) payload.waist = Number(payload.waist);

    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/dashboard'); 

    } catch (error) {
      console.error('Update failed:', error);
      alert("Failed to update profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="up-update-profile-container">Loading...</div>;

  return (
    <div className="up-update-profile-container">
      <div className="up-profile-card">
        
        <div className="up-profile-header">
          <h1>Profile Settings</h1>
          <p>Update your personal information and preferences.</p>
        </div>

        <form onSubmit={handleSubmit} className="up-profile-form">
          
          {/* --- Common Fields --- */}
          <div className="up-input-group">
            <label>Full Name</label>
            <input 
              type="text" 
              name="name" 
              className="up-luxury-input"
              value={formData.name || ''} 
              onChange={handleChange} 
            />
          </div>

          <div className="up-input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" 
              className="up-luxury-input"
              value={formData.email || ''} 
              disabled 
              style={{opacity: 0.6, cursor: 'not-allowed'}}
            />
          </div>

 

          {/* --- PASTE THIS BLOCK HERE --- */}
          {user?.role === 'Customer' && (
            <div className="up-role-section">
              <h4 className="up-section-title">My Measurements (Inches)</h4>
              <div className="up-grid-3" style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'20px'}}> 
                
                <div className="up-input-group">
                  <label>Height</label>
                  <input 
                    type="number" 
                    name="height" 
                    placeholder="e.g. 68"
                    className="up-luxury-input" 
                    value={formData.measurements?.height || ''} 
                    onChange={handleMeasurementChange} 
                  />
                </div>

                <div className="up-input-group">
                  <label>Chest</label>
                  <input 
                    type="number" 
                    name="chest" 
                    placeholder="e.g. 40"
                    className="up-luxury-input" 
                    value={formData.measurements?.chest || ''} 
                    onChange={handleMeasurementChange} 
                  />
                </div>

                <div className="up-input-group">
                  <label>Waist</label>
                  <input 
                    type="number" 
                    name="waist" 
                    placeholder="e.g. 32"
                    className="up-luxury-input" 
                    value={formData.measurements?.waist || ''} 
                    onChange={handleMeasurementChange} 
                  />
                </div>

              </div>
            </div>
          )}
          {/* ----------------------------- */}

          {/* ... Supplier/Tailor Section starts here ... */}
          {user.role === 'Tailor' && (
            <div className="up-role-section">
               <h4>Professional Details</h4>
               <div className="up-input-group">
                 <label>Specializations (comma separated)</label>
                 <input 
                   type="text" 
                   name="specializations" 
                   className="up-luxury-input"
                   placeholder="e.g. Suits, Wedding Wear, Alterations"
                   value={formData.specializations || ''} 
                   onChange={handleChange} 
                 />
               </div>

               {/* --- NEW PORTFOLIO BUTTON --- */}
               <div style={{ marginTop: '20px' }}>
                 <button 
                   type="button"
                   onClick={() => navigate('/tailor/portfolio')} // This route needs to be created
                   className="up-luxury-input"
                   style={{ 
                     width: '100%', 
                     cursor: 'pointer', 
                     background: 'rgba(204, 176, 104, 0.1)', 
                     borderColor: '#ccb068', 
                     color: '#ccb068',
                     fontWeight: '600',
                     display: 'flex',
                     justifyContent: 'center',
                     alignItems: 'center',
                     gap: '10px',
                     transition: 'all 0.3s ease'
                   }}
                   onMouseOver={(e) => e.currentTarget.style.background = 'rgba(204, 176, 104, 0.2)'}
                   onMouseOut={(e) => e.currentTarget.style.background = 'rgba(204, 176, 104, 0.1)'}
                 >
                   Make / Update Portfolio
                 </button>
               </div>
            </div>
          )}

          {/* --- SUPPLIER SPECIFIC --- */}
          {user.role === 'Supplier' && (
            <div className="up-role-section">
               <h4>Shop Information</h4>
               
               <div className="up-input-group">
                 <label>Shop Name</label>
                 <input 
                   type="text" 
                   name="shopName" 
                   className="up-luxury-input" 
                   value={formData.shopName || ''} 
                   onChange={handleChange} 
                 />
               </div>

               <div className="up-input-group" style={{marginTop: '15px'}}>
                 <label>Location / Address</label>
                 <input 
                   type="text" 
                   name="location" 
                   className="up-luxury-input" 
                   value={formData.location || ''} 
                   onChange={handleChange} 
                 />
               </div>

               <div className="up-input-group" style={{marginTop: '15px'}}>
                 <label>Fabric Types (comma separated)</label>
                 <input 
                   type="text" 
                   name="fabricTypes" 
                   className="up-luxury-input" 
                   placeholder="e.g. Silk, Cotton, Wool" 
                   value={formData.fabricTypes || ''} 
                   onChange={handleChange} 
                 />
               </div>
            </div>
          )}

          {/* --- Action Buttons --- */}
          <div className="up-form-actions">
             <button 
               type="button" 
               onClick={() => navigate('/dashboard')} 
               className="up-btn-secondary"
             >
               Cancel
             </button>
             <button 
               type="submit" 
               className="up-btn-primary" 
               disabled={loading}
             >
               {loading ? 'Saving...' : 'Save Changes'}
             </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;