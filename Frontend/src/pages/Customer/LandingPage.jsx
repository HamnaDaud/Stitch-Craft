import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Silk from '../../components/Silk'; 
import CustomerNavbar from '../../components/CustomerNavbar';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [fabrics, setFabrics] = useState([]);
  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(true);

  const getInitials = (name) => {
    return name
      ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : 'SC';
  };
  
  useEffect(() => {
    const fetchMockData = () => {
      setLoading(true);
      
      // Verified Luxury Fabric Assets
      const mockFabrics = [
        { 
          _id: 'f1', 
          name: 'Midnight Silk', 
          price: 4500, 
          imageUrl: '/assets/mockFabrics/midnight-silk.jpg' 
        },
        { 
          _id: 'f2', 
          name: 'Royal Velvet', 
          price: 6200, 
          imageUrl: '/assets/mockFabrics/red-velevet.jpg' 
        },
        { 
          _id: 'f3', 
          name: 'Woven Cotton', 
          price: 2800, 
          imageUrl: '/assets/mockFabrics/woven-cotton.jpg' 
        },
        { 
          _id: 'f4', 
          name: 'Raw Silk', 
          price: 5500, 
          imageUrl: '/assets/mockFabrics/raw-silk.jpg' 
        },
         { 
          _id: 'f5', 
          name: 'Chikankari Shawl', 
          price: 4500, 
          imageUrl: '/assets/mockFabrics/chicken-kari.jpg' 
        },
      ];

      // Verified Tailor/Atelier Assets
      const mockTailors = [
        { 
          _id: 't1', 
          name: 'Master Rasheed', 
          portfolio: [{ imageUrl: '/assets/mockTailors/white-shalwaar-kameez.jpg' }] 
        },
        { 
          _id: 't2', 
          name: 'Ritaj', 
          portfolio: [{ imageUrl: '/assets/mockTailors/two-girls.jpg' }] 
        },
        { 
          _id: 't3', 
          name: 'Hammad Amer', 
          portfolio: [] // Testing fallback
        }
      ];

      setTimeout(() => {
        setFabrics(mockFabrics);
        setTailors(mockTailors);
        setLoading(false);
      }, 800);
    };

    fetchMockData();
  }, []);

  const handleFabricClick = (fabricId) => {
    navigate(`/product/${fabricId}`);
  };

  return (
    <div className="clp-landing-wrapper">
      <CustomerNavbar />
      <Silk speed={0.4} scale={1.5} color="#7B7481" noiseIntensity={0.8} rotation={-0.2} />

      <section className="clp-hero-wrapper">
        <div className="clp-hero-content">
          <span className="clp-hero-tagline">Est. 2025 • The Art of Bespoke</span>
          <h1 className="clp-hero-title">Stitch & <br /> Silhouette</h1>
          <p className="clp-hero-subtitle">The finest cloth. The sharpest cut. The ultimate expression of you.</p>
          <div className="clp-hero-actions">
            <button className="clp-action-btn clp-btn-outline" onClick={() => navigate('/buy-fabric')}>Buy Fabric</button>
            <button className="clp-action-btn clp-btn-outline" onClick={() => navigate('/book-tailor')}>Book Tailor</button>
          </div>
        </div>
      </section>

      {/* FABRIC SECTION */}
      <section className="clp-showcase-row">
        <div className="clp-row-header">
          <h2 className="clp-row-title">Fabric Collection</h2>
          <span className="clp-view-all" onClick={() => navigate('/buy-fabric')}>View All Fabrics</span>
        </div>
        <div className="clp-scroll-container">
          {loading ? (
             <div style={{padding:'0 60px', color: '#D4AF37'}}>Curating Collection...</div>
          ) : fabrics.map((fabric) => (
               <div key={fabric._id} className="clp-luxury-card" onClick={() => handleFabricClick(fabric._id)}>
                 <div className="clp-card-img-wrap">
                   <img src={fabric.imageUrl} alt={fabric.name} className="clp-card-img" />
                 </div>
                 <div className="clp-card-overlay">
                   <h3 className="clp-item-name">{fabric.name}</h3>
                   <div className="clp-item-price">PKR {fabric.price}/m</div>
                 </div>
               </div>
          ))}
        </div>
      </section>

      {/* TAILOR SECTION */}
      <section className="clp-showcase-row">
        <div className="clp-row-header">
          <h2 className="clp-row-title">Tailor Atelier</h2>
          <span className="clp-view-all" onClick={() => navigate('/book-tailor')}>View All Tailors</span>
        </div>
        <div className="clp-scroll-container">
          {loading ? (
             <div style={{padding:'0 60px', color: '#D4AF37'}}>Preparing Atelier...</div>
          ) : tailors.map((tailor) => {
               const hasImage = tailor.portfolio?.[0]?.imageUrl;
               return (
                 <div key={tailor._id} className="clp-luxury-card" onClick={() => navigate(`/book-tailor/${tailor._id}`)}>
                   <div className={`clp-card-img-wrap ${!hasImage ? 'clp-no-img' : ''}`}>
                     {hasImage ? (
                        <img src={tailor.portfolio[0].imageUrl} alt={tailor.name} className="clp-card-img" />
                     ) : (
                        <div className="clp-initials-placeholder">{getInitials(tailor.name)}</div>
                     )}
                   </div>
                   <div className="clp-card-overlay">
                     <h3 className="clp-item-name">{tailor.name}</h3>
                     <div className="clp-item-price" style={{color:'white', borderBottom:'1px solid white', width:'fit-content', fontSize:'1rem'}}>
                       Book Appointment
                     </div>
                   </div>
                 </div>
               );
          })}
        </div>
      </section>
      
      <footer style={{ padding: '80px 0', textAlign: 'center', opacity: 0.6, fontSize: '0.8rem', letterSpacing:'1px' }}>
        <p>© 2025 STITCHCRAFT ATELIER. CRAFTED FOR EXCELLENCE.</p>
      </footer>
    </div>
  );
};

export default LandingPage;