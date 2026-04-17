// src/pages/Supplier/AddFabric.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { uploadImage } from '../../utils/imageUpload'; // Import the new helper
import './AddFabric.css';

const AddFabric = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    fabricType: '',
    price: '',
    quantity: '',
    description: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');

    if (!formData.name || !formData.price || !formData.quantity || !imageFile) {
      setError('Please fill in all fields and select an image.');
      setLoading(false);
      return;
    }

    try {
      // 1. Upload to ImgBB (Frontend Direct)
      const uploadedImageUrl = await uploadImage(imageFile);

      if (!uploadedImageUrl) {
        throw new Error('Image upload failed.');
      }

      // 2. Save URL to Database
      const response = await fetch(`${API_BASE_URL}/fabrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          quantity: Number(formData.quantity),
          imageUrl: uploadedImageUrl
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add fabric');
      }

      navigate('/dashboard');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="af-layout">
      <div className="af-header">
        <h1>Curate New Material</h1>
        <p>Add a new textile to your digital showroom.</p>
      </div>

      <div className="af-card">
        {error && <div style={{color: '#ef4444', marginBottom:'20px', textAlign:'center'}}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="af-grid">
            <div className="af-group af-full">
              <label>Fabric Name</label>
              <input type="text" name="name" className="af-input" placeholder="e.g. Royal Black Velvet" onChange={handleChange} required />
            </div>

            <div className="af-group">
              <label>Material Type</label>
              <select name="fabricType" className="af-select" onChange={handleChange} required>
                <option value="">Select Category</option>
                <option value="Cotton">Cotton</option>
                <option value="Silk">Silk</option>
                <option value="Velvet">Velvet</option>
                <option value="Lawn">Lawn</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="af-group">
              <label>Price (PKR)</label>
              <input type="number" name="price" className="af-input" placeholder="0.00" onChange={handleChange} required />
            </div>

            <div className="af-group">
              <label>Stock (Meters)</label>
              <input type="number" name="quantity" className="af-input" placeholder="0" onChange={handleChange} required />
            </div>

            <div className="af-group af-full">
              <label>Fabric Image</label>
              <input type="file" accept="image/*" id="file-upload" onChange={handleFileChange} style={{display: 'none'}} />
              <div className="af-preview-box" onClick={() => document.getElementById('file-upload').click()}>
                {previewUrl ? <img src={previewUrl} alt="Preview" /> : <span className="af-placeholder">Click to Upload Image</span>}
              </div>
            </div>
            
            <div className="af-group af-full">
              <label>Description</label>
              <textarea name="description" className="af-textarea" placeholder="Describe the fabric..." onChange={handleChange} required></textarea>
            </div>
          </div>

          <div className="af-actions">
            <button type="button" className="af-btn-cancel" onClick={() => navigate('/dashboard')}>Cancel</button>
            <button type="submit" className="af-btn-submit" disabled={loading}>
              {loading ? 'Publishing...' : 'Publish to Showroom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFabric;