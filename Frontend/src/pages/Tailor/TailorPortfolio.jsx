import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { uploadImage } from '../../utils/imageUpload'; 
import './TailorPortfolio.css';

const TailorPortfolio = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null); 
  
  const [portfolio, setPortfolio] = useState([]);
  
  // Form states
  const [selectedFile, setSelectedFile] = useState(null);
  const [desc, setDesc] = useState('');
  
  // Loading states
  const [uploadingImg, setUploadingImg] = useState(false); 
  const [saving, setSaving] = useState(false); 
  const [initialLoad, setInitialLoad] = useState(true);

  // 1. Fetch existing portfolio
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          
          // --- FIX: ROBUST DATA CHECKING ---
          // Check if portfolio exists directly (GET) or inside details (PUT response)
          let loadedPortfolio = [];
          
          if (Array.isArray(data.portfolio)) {
             loadedPortfolio = data.portfolio;
          } else if (data.details && Array.isArray(data.details.portfolio)) {
             loadedPortfolio = data.details.portfolio;
          } else if (data.user && Array.isArray(data.user.portfolio)) {
             loadedPortfolio = data.user.portfolio;
          }

          setPortfolio(loadedPortfolio);
        }
      } catch (err) {
        console.error("Error fetching portfolio:", err);
      } finally {
        setInitialLoad(false);
      }
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleAddItem = async () => {
    if (!selectedFile) {
      alert("Please select an image file.");
      return;
    }
    if (!desc.trim()) {
      alert("Please provide a description.");
      return;
    }

    setUploadingImg(true);

    try {
      const hostedUrl = await uploadImage(selectedFile);
      
      if (hostedUrl) {
        const newItem = { imageUrl: hostedUrl, description: desc };
        setPortfolio([newItem, ...portfolio]);
        
        setSelectedFile(null);
        setDesc('');
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingImg(false);
    }
  };

  const handleRemoveItem = (indexToRemove) => {
    const updated = portfolio.filter((_, index) => index !== indexToRemove);
    setPortfolio(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ portfolio })
      });

      if (res.ok) {
        navigate('/update-profile');
      } else {
        alert("Failed to save portfolio.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving portfolio.");
    } finally {
      setSaving(false);
    }
  };

  if (initialLoad) return <div className="tp-portfolio-page">Loading...</div>;

  return (
    <div className="tp-portfolio-page">
      <div className="tp-portfolio-container">
        
        {/* --- NEW BACK BUTTON --- */}
        <button className="tp-back-btn" onClick={() => navigate('/update-profile')}>
          ← Back to Profile
        </button>

        <header className="tp-portfolio-header">
          <h1>Curate Your Masterpiece</h1>
          <p>Upload photos of your finest work.</p>
        </header>

        {/* --- INPUT SECTION --- */}
        <div className="tp-input-card">
          <div className="tp-input-group">
            <label>Upload Image</label>
            <div className="tp-file-upload-wrapper">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                id="file-upload"
                className="hidden-file-input"
              />
              <label htmlFor="file-upload" className="tp-custom-file-btn">
                {selectedFile ? `Selected: ${selectedFile.name}` : 'Choose Image File'}
              </label>
            </div>
          </div>

          <div className="tp-input-group">
            <label>Description</label>
            <textarea 
              rows="2" 
              placeholder="Describe the style, fabric, or occasion..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <button className="tp-add-btn" onClick={handleAddItem} disabled={uploadingImg}>
            {uploadingImg ? 'Uploading Image...' : '+ Add to Collection'}
          </button>
        </div>

        {/* --- SCROLL VIEW SECTION --- */}
        <div className="tp-portfolio-scroll-view">
          {portfolio.length === 0 ? (
            <div className="tp-empty-state">
              <div className="tp-empty-icon">📂</div>
              <h3>Your Portfolio is Empty</h3>
              <p>Add images and descriptions above.</p>
            </div>
          ) : (
            <div className="tp-portfolio-grid">
              {portfolio.map((item, index) => (
                <div key={index} className="tp-portfolio-item-card">
                  <div className="tp-card-image">
                    <img src={item.imageUrl} alt="Portfolio" />
                  </div>
                  <div className="tp-card-content">
                    <p>{item.description}</p>
                    <button className="tp-remove-btn" onClick={() => handleRemoveItem(index)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="tp-portfolio-footer">
          <button className="tp-done-btn" onClick={handleSave} disabled={saving || uploadingImg}>
            {saving ? 'Saving Profile...' : 'Mark as Done ✓'}
          </button>
        </footer>

      </div>
    </div>
  );
};

export default TailorPortfolio;