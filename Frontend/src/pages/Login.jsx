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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const MIN_PASSWORD_LENGTH = 6;
  const emailValid = emailRegex.test(formData.email.trim());
  const passwordValid = formData.password.length >= MIN_PASSWORD_LENGTH;
  const isFormValid = emailValid && passwordValid;
  const buttonDisabled = loading || !isFormValid;

  const handleChange = (e) => {
    const value = e.target.name === 'email'
      ? e.target.value.toLowerCase()
      : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = formData.email.trim();
    const password = formData.password;

    if (!trimmedEmail || !password) {
      setError('Email and password are required.');
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data));
      console.log('Login Success:', data);
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
                value={formData.email}
                onChange={handleChange} 
              />
              {formData.email && !emailValid && (
                <div className="field-error">Enter a valid email address.</div>
              )}
            </div>

            <div className="styled-input-group">
              <label>Password</label>
              <input 
                type="password" 
                name="password" 
                placeholder="••••••••" 
                required 
                value={formData.password}
                onChange={handleChange} 
              />
              {formData.password && !passwordValid && (
                <div className="field-error">Password must be at least {MIN_PASSWORD_LENGTH} characters.</div>
              )}
            </div>

            <button type="submit" className="login-btn" disabled={buttonDisabled}>
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