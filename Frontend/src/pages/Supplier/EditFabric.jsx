// src/pages/Supplier/EditFabric.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { uploadImage } from '../../utils/imageUpload'; 
import './EditFabric.css';

const EditFabric = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [fabric, setFabric] = useState(null);
  
  const [newImageFile, setNewImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Fetch Fabric Details
  useEffect(() => {
    const fetchFabricDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/fabrics/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Could not fetch fabric details');
        
        const data = await response.json();
        setFabric(data);
        setPreviewUrl(data.imageUrl);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFabricDetails();
  }, [id]);

  const handleChange = (e) => {
    setFabric({ ...fabric, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  // --- SAVE UPDATES ---
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const token = localStorage.getItem('token');
    
    try {
      let finalImageUrl = fabric.imageUrl;

      if (newImageFile) {
        finalImageUrl = await uploadImage(newImageFile);
        if (!finalImageUrl) throw new Error('Image upload failed');
      }

      const response = await fetch(`${API_BASE_URL}/fabrics/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...fabric,
          price: Number(fabric.price),
          quantity: Number(fabric.quantity),
          imageUrl: finalImageUrl
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Update failed');
      }

      navigate('/dashboard');

    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  // --- DELETE FABRIC ---
  const handleDelete = async () => {
    setSaving(true); 
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_BASE_URL}/fabrics/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Delete failed');

      navigate('/dashboard'); 

    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) return <div className="ef-loading">Loading details...</div>;
  if (!fabric) return <div className="ef-loading">Fabric not found.</div>;

  return (
    <div className="ef-layout">
      
      <div className="ef-header">
        <button onClick={() => navigate('/dashboard')} className="ef-back-btn">← Back</button>
        <h1>Manage Product</h1>
        <div style={{width: '80px'}}></div>
      </div>

      <div className="ef-content-grid">
        
        {/* Left Side */}
        <div className="ef-image-section">
          <div className="ef-img-preview">
            <img src={previewUrl} alt="Fabric Preview" />
          </div>
          <input 
            type="file" 
            id="ef-upload-hidden" 
            accept="image/*" 
            style={{display: 'none'}} 
            onChange={handleFileChange}
          />
          <div 
            className="ef-upload-btn"
            onClick={() => document.getElementById('ef-upload-hidden').click()}
          >
            Change Image
          </div>
        </div>

        {/* Right Side */}
        <div className="ef-form-section">
          {error && <div style={{color: '#ef4444', marginBottom: '15px'}}>{error}</div>}
          
          <form onSubmit={handleUpdate}>
            <div className="ef-form-grid">
              
              <div className="ef-group ef-full">
                <label>Fabric Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={fabric.name} 
                  onChange={handleChange} 
                  className="ef-input" 
                  required
                />
              </div>

              <div className="ef-group">
                <label>Category</label>
                <select 
                  name="fabricType" 
                  value={fabric.fabricType} 
                  onChange={handleChange} 
                  className="ef-select"
                >
                  <option value="Cotton">Cotton</option>
                  <option value="Silk">Silk</option>
                  <option value="Velvet">Velvet</option>
                  <option value="Linen">Linen</option>
                  <option value="Wool">Wool</option>
                  <option value="Chiffon">Chiffon</option>
                  <option value="Banarasi">Banarasi</option>
                  <option value="Lawn">Lawn</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="ef-group">
                <label>Status</label>
                <select 
                  name="isAvailable" 
                  value={fabric.isAvailable} 
                  onChange={(e) => setFabric({...fabric, isAvailable: e.target.value === 'true'})} 
                  className="ef-select"
                >
                  <option value="true">Available</option>
                  <option value="false">Hidden / Out of Stock</option>
                </select>
              </div>

              <div className="ef-group">
                <label>Price (PKR)</label>
                <input 
                  type="number" 
                  name="price" 
                  value={fabric.price} 
                  onChange={handleChange} 
                  className="ef-input" 
                  required
                />
              </div>

              <div className="ef-group">
                <label>Stock (Meters)</label>
                <input 
                  type="number" 
                  name="quantity" 
                  value={fabric.quantity} 
                  onChange={handleChange} 
                  className="ef-input" 
                  required
                />
              </div>

              <div className="ef-group ef-full">
                <label>Description</label>
                <textarea 
                  name="description" 
                  value={fabric.description} 
                  onChange={handleChange} 
                  className="ef-textarea"
                />
              </div>

              {/* Action Buttons */}
              <div className="ef-actions">
                <button 
                  type="button" 
                  onClick={handleDelete} 
                  className="ef-delete-btn"
                  disabled={saving}
                >
                  {saving ? 'Deleting...' : 'Delete Product'}
                </button>
                
                <button 
                  type="submit" 
                  className="ef-save-btn"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default EditFabric;