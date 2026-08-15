import { useState } from 'react';
import './Login.css';

export default function Login({ onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = (e) => {
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

  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#eef4f8' }}>
      <div className="text-center">
        <div className="card p-4 shadow-sm" style={{ maxWidth: '380px' }}>
          <h4 className="fw-bold">Clinic Management System</h4>
          <p className="text-muted">Enter your credentials to access your account.</p>

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