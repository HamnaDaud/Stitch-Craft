import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerNavbar from '../../components/CustomerNavbar';
import { API_BASE_URL } from '../../config';
import './TailorSearch.css';

const TailorSearch = () => {
  const navigate = useNavigate();
  
  // State for the Displayed List (changes when you search)
  const [tailors, setTailors] = useState([]);
  
  // State for the Master List (keeps all data safe)
  const [allTailors, setAllTailors] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Helper: Get Initials for Fallback (e.g. "Ali Khan" -> "AK")
  const getInitials = (name) => {
    return name
      ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : 'SC';
  };

  useEffect(() => {
    const fetchTailors = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/users?role=Tailor`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            const users = data.users || [];
            
            // Store in BOTH states initially
            setAllTailors(users);
            setTailors(users);
        }
      } catch (err) { 
          console.error("Error fetching tailors:", err); 
      } finally { 
          setLoading(false); 
      }
    };
    fetchTailors();
  }, []);

  // Filter Logic
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = allTailors.filter(tailor => {
      const nameMatch = tailor.name.toLowerCase().includes(term);
      const skillMatch = tailor.specializations && tailor.specializations.some(
        skill => skill.toLowerCase().includes(term)
      );
      return nameMatch || skillMatch;
    });

    setTailors(filtered);
  };

  return (
    <div className="ts-wrapper">
      <CustomerNavbar />
      
      <div className="ts-container">
        
        {/* Header Section */}
        <div className="ts-header">
          <h1 className="ts-title">Tailor Atelier</h1>
          <p className="ts-subtitle">Connect with master craftsmen for your bespoke needs.</p>
          
          {/* Search Bar */}
          <div className="ts-search-box">
            <input 
              type="text" 
              placeholder="SEARCH Tailors..." 
              value={searchTerm}
              onChange={handleSearch}
              className="ts-search-input"
            />
          
          </div>
        </div>

        {/* Grid Section */}
        {loading ? (
          <div className="ts-msg">Loading tailors...</div> 
        ) : (
          <div className="ts-grid">
            {tailors.length === 0 ? (
                <div className="ts-msg">No tailors found matching "{searchTerm}".</div>
            ) : (
                tailors.map(tailor => {
                  // Check if a valid image exists
                  const hasImage = tailor.portfolio?.[0]?.imageUrl;

                  return (
                    <div key={tailor._id} className="ts-card" onClick={() => navigate(`/book-tailor/${tailor._id}`)}>
                        
                        {/* Image Box OR Initials Box */}
                        <div className={`ts-img-box ${!hasImage ? 'ts-no-img' : ''}`}>
                          {hasImage ? (
                            <img 
                                src={tailor.portfolio[0].imageUrl} 
                                alt={tailor.name} 
                            />
                          ) : (
                            <div className="ts-initials-placeholder">
                              {getInitials(tailor.name)}
                            </div>
                          )}

                          <div className="ts-overlay">
                              <span>View Profile</span>
                          </div>
                        </div>

                        {/* Card Info */}
                        <div className="ts-info">
                            <span className="ts-tag">Tailor</span>
                            <h3>{tailor.name}</h3>
                            <div className="ts-specs">
                                {tailor.specializations && tailor.specializations.length > 0 
                                    ? tailor.specializations.slice(0, 2).join(', ') 
                                    : 'Bespoke Specialist'}
                            </div>
                        </div>
                    </div>
                  );
                })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TailorSearch;