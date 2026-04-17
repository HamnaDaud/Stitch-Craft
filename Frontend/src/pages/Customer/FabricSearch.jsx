import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerNavbar from '../../components/CustomerNavbar';
import { API_BASE_URL } from '../../config';
import './FabricSearch.css'; 

const FabricSearch = () => {
  const navigate = useNavigate();
  const [fabrics, setFabrics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // Default state
  const [loading, setLoading] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // --- REAL-TIME SEARCH (DEBOUNCE) ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFabrics(searchQuery);
    }, 500); // Wait 500ms after typing

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, sortOrder]); // Re-fetch when Query OR Sort changes

  const fetchFabrics = async (query = '') => {
    setLoading(true);
    try {
      // 1. GET TOKEN
      const token = localStorage.getItem('token');

      // 2. CONSTRUCT URL (Fixed typo here)
      let url = `${API_BASE_URL}/fabrics/search?sort=${sortOrder}`;
      if (query) url += `&q=${query}`;
      
      // 3. FETCH WITH HEADERS
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // <--- CRITICAL FIX
        }
      });

      if (res.ok) {
        const data = await res.json();
        setFabrics(data);
        setCurrentPage(1); // Reset to page 1 on new search
      } else if (res.status === 401) {
        console.error("Unauthorized: Please log in.");
        // Optional: navigate('/login');
      }
    } catch (error) {
      console.error("Error fetching fabrics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination Logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentFabrics = fabrics.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(fabrics.length / itemsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="fb-search-page-wrapper">
      <CustomerNavbar />

      <div className="fb-search-container">
        
        <header className="fb-search-header">
          <h1 className="fb-page-title">Fabric Collection</h1>
          <div className="fb-page-subtitle">Curated Fabrics for the Discerning Eye</div>
        </header>

        <div className="fb-toolbar">
          <div className="fb-search-bar-box">
            <input 
              type="text" 
              placeholder="Search silk, velvet, linen..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="fb-search-input"
            />
          </div>
          
          <div className="fb-sort-box">
            {/* UPDATED VALUES TO MATCH BACKEND */}
            <select onChange={(e) => setSortOrder(e.target.value)} value={sortOrder}>
              <option value="newest">New Arrivals</option>
              <option value="lowToHigh">Price: Low to High</option>
              <option value="highToLow">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* --- GRID --- */}
        {loading ? (
          <div style={{textAlign:'center', padding:'100px', color:'#666', fontStyle:'italic'}}>Searching Archives...</div>
        ) : (
          <div className="fb-fabric-grid">
            {currentFabrics.length > 0 ? currentFabrics.map(fabric => (
              <div key={fabric._id} className="fb-shop-card" onClick={() => navigate(`/product/${fabric._id}`)}>
                
                <div className="fb-shop-img-box">
                  <img src={fabric.imageUrl || "https://via.placeholder.com/300x400"} alt={fabric.name} />
                  <div className="fb-card-overlay">
                    <span className="fb-view-btn">View Details</span>
                  </div>
                </div>

                <div className="fb-shop-info">
                  <span className="fb-type-tag">{fabric.fabricType}</span>
                  <h3>{fabric.name}</h3>
                  <div className="fb-shop-footer">
                    <span className="fb-shop-price">Rs. {fabric.price} <span className="fb-per-meter">/m</span></span>
                  </div>
                </div>

              </div>
            )) : (
              <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '80px', color: '#888', borderTop:'1px solid #222'}}>
                No pieces found matching "{searchQuery}".
              </div>
            )}
          </div>
        )}

        {/* --- PAGINATION --- */}
        {totalPages > 1 && (
          <div className="fb-pagination">
            {pageNumbers.map(number => (
              <button 
                key={number} 
                className={currentPage === number ? 'active' : ''}
                onClick={() => setCurrentPage(number)}
              >
                {number < 10 ? `0${number}` : number}
              </button>
            ))}
          </div>
        )}
      </div>
            <footer style={{ padding: '80px 0', textAlign: 'center', opacity: 0.6, fontSize: '0.8rem', letterSpacing:'1px' }}>
        <p>© 2025 STITCHCRAFT ATELIER. CRAFTED FOR EXCELLENCE.</p>
      </footer>
    </div>
  );
};

export default FabricSearch;