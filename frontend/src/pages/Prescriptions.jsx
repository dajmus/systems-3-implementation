import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = '/api';

export default function Prescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    const response = await fetch(`${API_BASE}/prescriptions/patient/${user.patient_id}`);
    const data = await response.json();
    setPrescriptions(data);
  };

  return (
    <div className="container py-5">
      <h4 className="fw-bold mb-3">My Prescriptions</h4>

      {prescriptions.length === 0 && <p className="text-muted">No prescriptions yet.</p>}

      {prescriptions.map((rx) => (
        <div key={rx.prescription_id} className="card mb-3 p-3">
          <div className="fw-bold">{rx.diagnosis}</div>
          <div>{rx.medication}</div>
          {rx.instructions && <div className="text-muted">{rx.instructions}</div>}
          <div className="text-muted small mt-1">Prescribed by Dr. {rx.doctor_name}</div>
        </div>
      ))}
    </div>
  );
}