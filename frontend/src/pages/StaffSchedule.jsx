import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = '/api';

export default function StaffSchedule() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [dateTime, setDateTime] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    const response = await fetch(`${API_BASE}/appointments`);
    const data = await response.json();
    setAppointments(data);
  };

  const addSlot = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!dateTime) {
      setMessage('Please pick a date and time.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_id: user.staff_id, date_and_time: dateTime }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Could not add slot.');
        return;
      }

      setMessage('Slot added.');
      setDateTime('');
    } catch (err) {
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="container py-5">
      <h4 className="fw-bold mb-3">Staff Dashboard</h4>

      {message && <div className="alert alert-info py-2">{message}</div>}

      {user.role === 'doctor' && (
        <form onSubmit={addSlot} className="d-flex gap-2 mb-4">
          <input
            type="datetime-local"
            className="form-control"
            style={{ maxWidth: '260px' }}
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Add Slot</button>
        </form>
      )}

      <h5 className="mb-3">All Appointments</h5>

      {appointments.length === 0 && <p className="text-muted">No appointments yet.</p>}

      <div className="list-group">
        {appointments.map((appt) => (
          <div key={appt.appointment_id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <div>{new Date(appt.date_and_time).toLocaleString()}</div>
              <div className="text-muted">{appt.patient_name} with Dr. {appt.doctor_name}</div>
            </div>
            <span className="badge bg-secondary">{appt.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}