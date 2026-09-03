import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './PatientPages.css';

const API_BASE = '/api';

export default function BookAppointment() {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    const response = await fetch(`${API_BASE}/schedule/available`);
    const data = await response.json();
    setSlots(data);
  };

  const bookSlot = async (slot) => {
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: user.patient_id,
          slot_id: slot.slot_id,
          doctor_id: slot.doctor_id,
          staff_id: slot.staff_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Could not book this slot.');
        return;
      }

      setMessage('Appointment booked.');
      loadSlots();
    } catch (err) {
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="patient-page">
      <div className="patient-card">
        <h4 className="fw-bold mb-3">Book an Appointment</h4>

        {message && <div className="alert patient-alert py-2">{message}</div>}

        {slots.length === 0 && (
          <p className="patient-empty">No open slots right now.</p>
        )}

        <div>
          {slots.map((slot) => (
            <div
              key={slot.slot_id}
              className="patient-list-item d-flex justify-content-between align-items-center flex-wrap gap-2"
            >
              <div>
                <div className="patient-time">
                  {new Date(slot.date_and_time).toLocaleString()}
                </div>
                <div className="patient-doctor">Dr. {slot.staff_name}</div>
              </div>
              <button
                className="btn btn-teal-outline btn-sm"
                onClick={() => bookSlot(slot)}
              >
                Book
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}