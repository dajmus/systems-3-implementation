import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = '/api';

export default function Prescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      const response = await fetch(`${API_BASE}/prescriptions/patient/${user.patient_id}`);
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Could not load prescriptions.');
        return;
      }

      setPrescriptions(data);
    } catch (err) {
      setMessage('Could not load prescriptions.');
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 73px)', backgroundColor: '#28777b', padding: '48px 24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#ffffff', fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
            My Prescriptions
          </h1>
          <p style={{ color: '#ffffff', fontSize: '18px', margin: 0 }}>
            View prescriptions issued by your doctor.
          </p>
        </div>

        {message && (
          <div className="alert alert-info" style={{ maxWidth: '700px', margin: '0 auto 25px' }}>
            {message}
          </div>
        )}

        {prescriptions.length === 0 && !message && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '7px', padding: '25px', textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#666666', fontSize: '17px' }}>
              No prescriptions yet.
            </p>
          </div>
        )}

        <div>
          {prescriptions.map((rx) => (
            <div
              key={rx.prescription_id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '7px',
                padding: '22px',
                marginBottom: '16px'
              }}
            >
              <div style={{ fontSize: '21px', fontWeight: '700', color: '#111111', marginBottom: '12px' }}>
                {rx.diagnosis}
              </div>

              <div style={{ fontSize: '18px', color: '#111111', marginBottom: '8px' }}>
                <strong>Medication:</strong> {rx.medication}
              </div>

              {rx.instructions && (
                <div style={{ fontSize: '17px', color: '#666666', marginBottom: '8px' }}>
                  <strong>Instructions:</strong> {rx.instructions}
                </div>
              )}

              <div style={{ fontSize: '16px', color: '#666666' }}>
                Prescribed by Dr. {rx.doctor_name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}