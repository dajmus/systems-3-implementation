import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './MyAppointments.css';

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
        setMessage(data.error || 'Could not cancel this appointment.');
        return;
      }

      setMessage('Appointment cancelled.');
      loadAppointments();
    } catch (err) {
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="patient-page">
      <div className="patient-card">
        <h4 className="fw-bold mb-3">My Appointments</h4>

        {message && <div className="alert patient-alert py-2">{message}</div>}

        {appointments.length === 0 && (
          <p className="patient-empty">No appointments yet.</p>
        )}

        <div>
          {appointments.map((appt) => (
            <div
              key={appt.appointment_id}
              className="patient-list-item d-flex justify-content-between align-items-center flex-wrap gap-2"
            >
              <div>
                <div className="patient-time">
                  {new Date(appt.date_and_time).toLocaleString()}
                </div>
                <div className="patient-doctor">Dr. {appt.doctor_name}</div>
                <span className="badge patient-status-badge">{appt.status}</span>
              </div>
              {appt.status !== 'cancelled' && (
                <button
                  className="btn btn-cancel btn-sm"
                  onClick={() => cancelAppointment(appt.appointment_id)}
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}