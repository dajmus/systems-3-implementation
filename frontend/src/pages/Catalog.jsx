import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = '/api';

export default function Catalog({ onBookAppointment }) {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [modality, setModality] = useState('');
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadServices();

    if (user.accountType === 'staff') {
      loadDoctors();
    }
  }, []);

  const loadServices = async () => {
    try {
      const response = await fetch(`${API_BASE}/catalog`);
      const data = await response.json();
      setServices(data);
    } catch (err) {
      setMessage('Could not load services.');
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await fetch(`${API_BASE}/catalog/doctors`);
      const data = await response.json();
      setDoctors(data);
    } catch (err) {
      setMessage('Could not load doctors.');
    }
  };

  const addService = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!doctorId || !modality || !price) {
      setMessage('Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/catalog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctor_id: doctorId,
          staff_id: user.staff_id,
          modality,
          price
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Could not add service.');
        return;
      }

      setMessage('Service added.');
      setDoctorId('');
      setModality('');
      setPrice('');
      loadServices();
    } catch (err) {
      setMessage('Something went wrong. Please try again.');
    }
  };

  const removeService = async (catalogId) => {
    try {
      const response = await fetch(`${API_BASE}/catalog/${catalogId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        setMessage('Could not remove service.');
        return;
      }

      loadServices();
    } catch (err) {
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 73px)',
        backgroundColor: '#28777b',
        padding: '48px 24px'
      }}
    >
      <div
        style={{
          maxWidth: '1180px',
          margin: '0 auto'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1
            style={{
              color: '#ffffff',
              fontSize: '32px',
              fontWeight: '700',
              marginBottom: '8px'
            }}
          >
            Diagnostic Services
          </h1>

          <p
            style={{
              color: '#ffffff',
              fontSize: '18px',
              margin: 0
            }}
          >
            Choose a service to view available appointment times.
          </p>
        </div>

        {message && (
          <div
            className="alert alert-info"
            style={{ maxWidth: '700px', margin: '0 auto 25px' }}
          >
            {message}
          </div>
        )}

        {user.accountType === 'staff' && user.role === 'doctor' && (
          <form
            onSubmit={addService}
            style={{
              backgroundColor: '#ffffff',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '25px'
            }}
          >
            <div className="d-flex gap-2 flex-wrap">
              <select
                className="form-select"
                style={{ maxWidth: '220px' }}
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
              >
                <option value="">Select doctor</option>

                {doctors.map((doctor) => (
                  <option
                    key={doctor.doctor_id}
                    value={doctor.doctor_id}
                  >
                    {doctor.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                className="form-control"
                style={{ maxWidth: '220px' }}
                placeholder="Modality"
                value={modality}
                onChange={(e) => setModality(e.target.value)}
              />

              <input
                type="number"
                className="form-control"
                style={{ maxWidth: '140px' }}
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />

              <button
                type="submit"
                className="btn"
                style={{
                  backgroundColor: '#28777b',
                  color: '#ffffff',
                  border: '1px solid #28777b'
                }}
              >
                Add Service
              </button>
            </div>
          </form>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '16px'
          }}
        >
          {services.map((service) => (
            <div
              key={service.catalog_id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '7px',
                padding: '20px 18px',
                minHeight: '145px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div
                  style={{
                    fontSize: '21px',
                    fontWeight: '700',
                    color: '#111111'
                  }}
                >
                  {service.modality}
                </div>

                <div
                  style={{
                    fontSize: '17px',
                    fontWeight: '600',
                    color: '#111111'
                  }}
                >
                  ${service.price}
                </div>
              </div>

              <div
                style={{
                  textAlign: 'center',
                  color: '#666666',
                  fontSize: '17px'
                }}
              >
                Performed by Dr. {service.doctor_name}
              </div>

              {user.accountType === 'patient' && (
                <div style={{ textAlign: 'center' }}>
                  <button
                    className="btn"
                    style={{
                      backgroundColor: '#28777b',
                      color: '#ffffff',
                      border: '1px solid #28777b',
                      padding: '8px 16px'
                    }}
                    onClick={onBookAppointment}
                  >
                    Book Appointment
                  </button>
                </div>
              )}

              {user.accountType === 'staff' && (
                <div style={{ textAlign: 'center' }}>
                  <button
                    className="btn"
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#28777b',
                      border: '1px solid #28777b',
                      padding: '7px 15px'
                    }}
                    onClick={() => removeService(service.catalog_id)}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}