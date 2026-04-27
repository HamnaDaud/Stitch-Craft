import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerNavbar from '../../components/CustomerNavbar';
import { API_BASE_URL } from '../../config';
import './ViewPortfolio.css';

const ViewPortfolio = () => {
  const { id } = useParams(); // Tailor ID
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState([]);
  const [tailorName, setTailorName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/users/${id}`, {
             headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setTailorName(data.name);
            setPortfolio(data.portfolio || []);
        }
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  return (
    <div className="view-portfolio-page">
      <CustomerNavbar />
      
      <div className="vp-header">
         <button className="vp-back-btn" onClick={() => navigate(-1)}>← Back</button>
         <h1>The {tailorName} Collection</h1>
      </div>

      <div className="vp-scroll-container">
         {loading ? <p>Loading masterpiece...</p> : (
            portfolio.length === 0 ? (
               <div className="vp-empty">This artisan has not uploaded a portfolio yet.</div>
            ) : (
               <div className="vp-gallery">
                  {portfolio.map((item, index) => (
                    <div key={index} className="vp-card">
                       <div className="vp-img-wrapper">
                         <img src={item.imageUrl} alt="Portfolio Piece" />
                       </div>
                       <div className="vp-desc">
                          <p>{item.description}</p>
                       </div>
                    </div>
                  ))}
               </div>
            )
         )}
      </div>
    </div>
  );
};

export default ViewPortfolio;