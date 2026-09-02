import { useState } from 'react';
import './Register.css';
import image1 from '../assets/image1.jpg';
import image2 from '../assets/image2.jpg';
import image3 from '../assets/image3.jpg';
import image4 from '../assets/image4.png';
import image5 from '../assets/image5.jpeg';
import patientTeal from '../assets/patientbg.png';
import doctorConsultationWhite from '../assets/consultationbg.png';
import { Carousel } from 'bootstrap';
import { useEffect, useRef } from 'react';

const wheelImages = [image1, image2, image3, image4, image5];
const TEXTBOX_WIDTH = '420px';
const API_BASE = '/api/accounts';

export default function Register({ onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [contactInfoError, setContactInfoError] = useState('');
  const [serverError, setServerError] = useState('');
  const carouselRef = useRef(null);

  useEffect(() => {
    if (carouselRef.current) {
      const carousel = new Carousel(carouselRef.current, { interval: 3000, ride: 'carousel' });
      return () => carousel.dispose();
    }
  }, []);

  const handleSubmit = async (e) => {
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

    setServerError('');

    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, contactInfo }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.message || 'Registration failed.');
        return;
      }

      onSwitchToLogin();
    } 
    
    catch (err) {
      setServerError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-wrap position-relative overflow-hidden">
      <img src={patientTeal} alt="" style={{ position: 'absolute', bottom: -60, left: -60, width: 380, pointerEvents: 'none' }} />
      <img src={doctorConsultationWhite} alt="" style={{ position: 'absolute', top: -60, right: -60, width: 380, pointerEvents: 'none' }} />

      <div className="col-12 col-md-6 d-flex align-items-center justify-content-center bg-white py-5">
        <div className="card p-4 shadow-sm" style={{ maxWidth: '380px' }}>
          <h4 className="fw-bold">Create Account</h4>
          <p className="text-muted">Register to access the clinic system.</p>

          {serverError && <div className="alert alert-danger py-2">{serverError}</div>}

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

      <div className="col-12 col-md-6 d-flex flex-column align-items-center justify-content-center text-white p-5" style={{ backgroundColor: '#0f6e73' }}>
        <div
          style={{
            width: '100%',
            maxWidth: TEXTBOX_WIDTH,
            backgroundColor: '#ffffff',
            border: '2px solid #0b4a4d',
            borderRadius: '8px',
            padding: '28px',
            color: '#0b4a4d',
            fontFamily: 'Georgia, serif',
          }}
        >
          <h2 className="fw-bold mb-3" style={{ fontSize: '2.1rem', color: '#0b4a4d' }}>
            Why choose this system
          </h2>
          <ul className="list-unstyled" style={{ fontSize: '1.35rem', lineHeight: '1.5' }}>
            <li className="mb-3">See real appointment availability and book instantly, no phone calls back and forth.</li>
            <li className="mb-3">One place for your prescriptions and billing, always up to date.</li>
            <li className="mb-3">Your data is protected with hashed passwords and secure access controls.</li>
          </ul>
        </div>

        <div id="featureCarousel" ref={carouselRef} className="carousel slide" style={{ width: '100%', maxWidth: TEXTBOX_WIDTH, marginTop: '32px' }}>
          <div className="carousel-inner">
            {wheelImages.map((img, idx) => (
              <div className={`carousel-item ${idx === 0 ? 'active' : ''}`} key={idx}>
                <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={img} alt={`feature ${idx + 1}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}