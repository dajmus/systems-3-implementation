import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = '/api';

export default function Catalog() {
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
    const response = await fetch(`${API_BASE}/catalog`);
    const data = await response.json();
    setServices(data);
  };

  const loadDoctors = async () => {
    const response = await fetch(`${API_BASE}/catalog/doctors`);
    const data = await response.json();
    setDoctors(data);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_id: doctorId, staff_id: user.staff_id, modality, price }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Could not add service.');
        return;
      }

      setMessage('Service added.');
      setModality('');
      setPrice('');
      loadServices();
    } catch (err) {
      setMessage('Something went wrong. Please try again.');
    }
  };

  const removeService = async (catalogId) => {
    await fetch(`${API_BASE}/catalog/${catalogId}`, { method: 'DELETE' });
    loadServices();
  };

  return (
    <div className="container py-5">
      <h4 className="fw-bold mb-3">Diagnostic Services</h4>

      {message && <div className="alert alert-info py-2">{message}</div>}

      {user.accountType === 'staff' && user.role === 'doctor' && (
        <form onSubmit={addService} className="d-flex gap-2 mb-4 flex-wrap">
          <select className="form-select" style={{ maxWidth: '220px' }} value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
            <option value="">Select doctor</option>
            {doctors.map((doc) => (
              <option key={doc.doctor_id} value={doc.doctor_id}>{doc.name}</option>
            ))}
          </select>
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: '220px' }}
            placeholder="Modality (e.g. X-ray)"
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
          <button type="submit" className="btn btn-primary">Add Service</button>
        </form>
      )}

      <div className="list-group">
        {services.map((service) => (
          <div key={service.catalog_id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-bold">{service.modality}</div>
              <div className="text-muted">Dr. {service.doctor_name} — ${service.price}</div>
            </div>
            {user.accountType === 'staff' && (
              <button className="btn btn-outline-danger btn-sm" onClick={() => removeService(service.catalog_id)}>Remove</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}