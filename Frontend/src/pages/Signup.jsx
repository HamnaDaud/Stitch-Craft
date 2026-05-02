import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link for navigation
import { API_BASE_URL } from '../config'; // Import the global variable
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate(); // Hook for redirection
  const [role, setRole] = useState('Customer');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    height: '', chest: '', waist: '',
    specializations: '',
    shopName: '', location: '', fabricTypes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const MIN_PASSWORD_LENGTH = 6;
  const trimmedName = formData.name.trim();
  const trimmedEmail = formData.email.trim();
  const emailValid = emailRegex.test(trimmedEmail);
  const passwordValid = formData.password.length >= MIN_PASSWORD_LENGTH;
  const roleFieldsValid =
    role === 'Customer' ? Boolean(formData.height && formData.chest && formData.waist) :
    role === 'Tailor' ? Boolean(formData.specializations.trim()) :
    role === 'Supplier' ? Boolean(formData.shopName.trim() && formData.location.trim() && formData.fabricTypes.trim()) :
    false;

  useEffect(() => {
    setCanSubmit(Boolean(trimmedName && emailValid && passwordValid && roleFieldsValid));
  }, [trimmedName, emailValid, passwordValid, roleFieldsValid]);

  const handleChange = (e) => {
    const value = e.target.name === 'email'
      ? e.target.value.toLowerCase()
      : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!trimmedName || !trimmedEmail || !formData.password) {
      setError('Name, email, and password are required.');
      return;
    }

    if (!emailValid) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!passwordValid) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (!roleFieldsValid) {
      setError('Please complete all required fields for your selected role.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      name: trimmedName,
      email: trimmedEmail.toLowerCase(),
      password: formData.password,
      role,
    };

    if (role === 'Customer') {
      payload.measurements = {
        height: Number(formData.height),
        chest: Number(formData.chest),
        waist: Number(formData.waist),
      };
    } else if (role === 'Tailor') {
      payload.specializations = formData.specializations.split(',').map(s => s.trim());
    } else if (role === 'Supplier') {
      payload.shopName = formData.shopName;
      payload.location = formData.location;
      payload.fabricTypes = formData.fabricTypes.split(',').map(s => s.trim());
    }

    try {
      // Use the global API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // SUCCESS: No alert, just redirect
      console.log('Registered:', data);
      navigate('/login'); 

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-screen">
      <div className="left-pane">
        <div className="brand-overlay">
          <h2>Heritage Meets <br /><span className="gold-text">Modern Fit.</span></h2>
          <p>Join Pakistan's first digital tailoring ecosystem.</p>
        </div>
      </div>

      <div className="right-pane">
        <div className="form-container">
          <div className="form-header">
            <h1>Create Account</h1>
            <p>Please select your role to continue</p>
          </div>

          <div className="role-tabs">
            {['Customer', 'Tailor', 'Supplier'].map((r) => (
              <button
                key={r}
                type="button" // Prevent form submission
                className={`tab-btn ${role === r ? 'active' : ''}`}
                onClick={() => setRole(r)}
              >
                {r}
              </button>
            ))}
          </div>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input type="text" name="name" placeholder="Full Name" required value={formData.name} onChange={handleChange} />
            </div>
            <div className="input-group">
              <input type="email" name="email" placeholder="Email Address" required value={formData.email} onChange={handleChange} />
              {formData.email && !emailValid && (
                <div className="field-error">Enter a valid email address.</div>
              )}
            </div>
            <div className="input-group">
              <input type="password" name="password" placeholder="Password" required value={formData.password} onChange={handleChange} />
              {formData.password && !passwordValid && (
                <div className="field-error">Password must be at least {MIN_PASSWORD_LENGTH} characters.</div>
              )}
            </div>

            {role === 'Customer' && (
              <div className="dynamic-section slide-in">
                <label>Measurements (Inches)</label>
                <div className="row-3">
                  <input type="number" name="height" placeholder="Height" value={formData.height} required onChange={handleChange} />
                  <input type="number" name="chest" placeholder="Chest" value={formData.chest} required onChange={handleChange} />
                  <input type="number" name="waist" placeholder="Waist" value={formData.waist} required onChange={handleChange} />
                </div>
              </div>
            )}

            {role === 'Tailor' && (
              <div className="dynamic-section slide-in">
                <label>Expertise</label>
                <input type="text" name="specializations" placeholder="e.g. Bridal (Comma separated)" value={formData.specializations} required onChange={handleChange} />
              </div>
            )}

            {role === 'Supplier' && (
              <div className="dynamic-section slide-in">
                <label>Shop Details</label>
                <input type="text" name="shopName" placeholder="Shop Name" value={formData.shopName} required onChange={handleChange} />
                <input type="text" name="location" placeholder="Market Location" value={formData.location} required onChange={handleChange} />
                <label style={{marginTop: '10px', display:'block'}}>Fabric Types</label>
                <input type="text" name="fabricTypes" placeholder="e.g. Silk (Comma separated)" value={formData.fabricTypes} required onChange={handleChange} />
              </div>
            )}

            <button type="submit" className="primary-btn" disabled={!canSubmit || loading}>
              {loading ? 'Creating Account...' : `Join as ${role}`}
            </button>

            <p className="login-link">
              Already have an account? <Link to="/login">Log In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;