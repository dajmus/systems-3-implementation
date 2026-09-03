import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = '/api';

export default function MyAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    const response = await fetch(`${API_BASE}/appointments/patient/${user.patient_id}`);
    const data = await response.json();
    setAppointments(data);
  };

  const cancelAppointment = async (appointmentId) => {
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/appointments/${appointmentId}/cancel`, {
        method: 'PUT',
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Could not cancel this appointment.');
        return;
      }

      setMessage('Appointment cancelled.');
      loadAppointments();
    } catch (err) {
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="container py-5">
      <h4 className="fw-bold mb-3">My Appointments</h4>

      {message && <div className="alert alert-info py-2">{message}</div>}

      {appointments.length === 0 && <p className="text-muted">No appointments yet.</p>}

      <div className="list-group">
        {appointments.map((appt) => (
          <div key={appt.appointment_id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <div>{new Date(appt.date_and_time).toLocaleString()}</div>
              <div className="text-muted">Dr. {appt.doctor_name}</div>
              <span className="badge bg-secondary">{appt.status}</span>
            </div>
            {appt.status !== 'cancelled' && (
              <button className="btn btn-outline-danger" onClick={() => cancelAppointment(appt.appointment_id)}>Cancel</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}