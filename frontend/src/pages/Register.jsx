import { useState } from 'react';
import './Register.css';

export default function Register({ onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [contactInfoError, setContactInfoError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    let hasError = false;

    if (!name) {
      setNameError('Please enter your name.');
      hasError = true;
    } else {
      setNameError('');
    }

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
      setPasswordError('Please enter a password.');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (!contactInfo) {
      setContactInfoError('Please enter your contact info.');
      hasError = true;
    } else {
      setContactInfoError('');
    }

    if (hasError) return;

  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center">
        <div className="card p-4 shadow-sm">
          <h4 className="fw-bold">Create Account</h4>
          <p className="text-muted">Register to access the clinic system.</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3 text-start">
              <label className="form-label">Name</label>
              <input
                type="text"
                className={`form-control ${nameError ? 'is-invalid' : ''}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {nameError && <div className="invalid-feedback">{nameError}</div>}
            </div>

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

            <div className="mb-3 text-start">
              <label className="form-label">Contact Info</label>
              <input
                type="text"
                className={`form-control ${contactInfoError ? 'is-invalid' : ''}`}
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
              />
              {contactInfoError && <div className="invalid-feedback">{contactInfoError}</div>}
            </div>

            <button type="submit" className="btn registerbutton w-100 text-white">Register</button>
          </form>

          <hr />
          <p>Already have an account? <a href="#" className="linklogin fw-bold" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>Login</a></p>
        </div>
      </div>
    </div>
  );
}