import { useState } from 'react';
import './Login.css';
import clinicBg from '../assets/clinicbackground.png';
import recruitmentBg from '../assets/recruitmentbackground.png';

const API_BASE = '/api/accounts';

export default function Login({ onSwitchToRegister, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;

    if (!email) {
      setEmailError('Please enter your email address.');
      hasError = true;
    } else if (!email.includes('@')) {
      setEmailError('Please enter a valid email address.');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Please enter your password.');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (hasError) return;

    setServerError('');

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.message || 'Login failed.');
        return;
      }

      if (onLoginSuccess) {
        onLoginSuccess(data);
      }
    } 
    
    catch (err) {
      setServerError('Something went wrong. Please try again.');
    }
  };

  return (
<div className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
  <img src={clinicBg} alt="" style={{ position: 'absolute', top: -80, left: -80, width: 380, pointerEvents: 'none' }} />
  <img src={recruitmentBg} alt="" style={{ position: 'absolute', bottom: -60, right: -60, width: 380, pointerEvents: 'none' }} />      <div className="text-center">
        <div className="card p-4 shadow-sm" style={{ maxWidth: '380px' }}>
          <h4 className="fw-bold">Clinic Management System</h4>
          <p className="text-muted">Enter your credentials to access your account.</p>

          {serverError && <div className="alert alert-danger py-2">{serverError}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3 text-start">
              <label className="form-label">Email</label>
              <input
                type="email"
                className={`form-control ${emailError ? 'is-invalid' : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailError && <div className="invalid-feedback">{emailError}</div>}
            </div>

            <div className="mb-3 text-start">
              <label className="form-label">Password</label>
              <input
                type="password"
                className={`form-control ${passwordError ? 'is-invalid' : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {passwordError && <div className="invalid-feedback">{passwordError}</div>}
            </div>

            <div className="text-end mb-3">
              <a href="#" className="linkpassword">Forgot password?</a>
            </div>

            <button type="submit" className="btn loginbutton w-100 text-white">Log in</button>
          </form>

          <hr />
          <p>Don't have an account? <a href="#" className="linkregister fw-bold" onClick={(e) => { e.preventDefault(); onSwitchToRegister(); }}>Create account</a></p>
        </div>
        <p className="text-muted mt-3">
          © 2026 Clinic Management System
        </p>
      </div>
    </div>
  );
}