// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config'; // Using your global config
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // --- CRITICAL STEP: SAVE TOKEN ---
      // This ensures the user stays logged in even if they refresh
      localStorage.setItem('token', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data)); 
      
      console.log('Login Success:', data);
      
      // Redirect to Dashboard/Home
      navigate('/dashboard'); 

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      
      {/* Left Side: Brand Imagery */}
      <div className="login-visual">
        <h1>
          Refining <br />
          <span className="gold-accent">Elegance.</span>
        </h1>
        <p className="urdu-text" dir="rtl">
          نفاست جو نظر آئے،
          <br />
          معیار جو محسوس ہو
        </p>
      </div>

      {/* Right Side: Login Form */}
      <div className="login-form-wrapper">
        <div className="login-box">
          <div className="login-header">
            <h2>Sign In</h2>
            <p>Enter your credentials to access your atelier.</p>
          </div>

          {error && <div className="error-msg" style={{color: 'red', marginBottom: '15px'}}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="styled-input-group">
              <label>Email Address</label>
              <input 
                type="email" 
                name="email" 
                placeholder="name@example.com" 
                required 
                onChange={handleChange} 
              />
            </div>

            <div className="styled-input-group">
              <label>Password</label>
              <input 
                type="password" 
                name="password" 
                placeholder="••••••••" 
                required 
                onChange={handleChange} 
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Log In'}
            </button>

            <p style={{marginTop: '20px', textAlign: 'center', color: '#64748b'}}>
              New to StitchCraft? <Link to="/signup" style={{color: '#ccb068', textDecoration: 'none', fontWeight: '600'}}>Create Account</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;