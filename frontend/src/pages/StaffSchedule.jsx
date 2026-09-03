import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = '/api';

export default function StaffSchedule() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [dateTime, setDateTime] = useState('');
  const [message, setMessage] = useState('');
  const [rxAppointmentId, setRxAppointmentId] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [medication, setMedication] = useState('');
  const [instructions, setInstructions] = useState('');
  const [billAppointmentId, setBillAppointmentId] = useState(null);
  const [amount, setAmount] = useState('');

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

  const issuePrescription = async (appt) => {
    if (!diagnosis || !medication) {
      setMessage('Diagnosis and medication are required.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: appt.patient_id,
          doctor_id: appt.doctor_id,
          diagnosis,
          medication,
          instructions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Could not issue prescription.');
        return;
      }

      setMessage('Prescription issued.');
      setRxAppointmentId(null);
      setDiagnosis('');
      setMedication('');
      setInstructions('');
    } catch (err) {
      setMessage('Something went wrong. Please try again.');
    }
  };

  const issueBill = async (appt) => {
    if (!amount) {
      setMessage('Amount is required.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/billing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: appt.patient_id, amount }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Could not issue bill.');
        return;
      }

      setMessage('Bill issued.');
      setBillAppointmentId(null);
      setAmount('');
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
          <div key={appt.appointment_id} className="list-group-item">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div>{new Date(appt.date_and_time).toLocaleString()}</div>
                <div className="text-muted">{appt.patient_name} with Dr. {appt.doctor_name}</div>
              </div>
              <div>
                <span className="badge bg-secondary me-2">{appt.status}</span>
                {user.role === 'doctor' && (
                  <button
                    className="btn btn-outline-primary btn-sm me-2"
                    onClick={() => setRxAppointmentId(rxAppointmentId === appt.appointment_id ? null : appt.appointment_id)}
                  >
                    Issue prescription
                  </button>
                )}
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setBillAppointmentId(billAppointmentId === appt.appointment_id ? null : appt.appointment_id)}
                >
                  Issue bill
                </button>
              </div>
            </div>

            {rxAppointmentId === appt.appointment_id && (
              <div className="mt-3 d-flex gap-2 flex-wrap">
                <input
                  type="text"
                  className="form-control"
                  style={{ maxWidth: '200px' }}
                  placeholder="Diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
                <input
                  type="text"
                  className="form-control"
                  style={{ maxWidth: '200px' }}
                  placeholder="Medication"
                  value={medication}
                  onChange={(e) => setMedication(e.target.value)}
                />
                <input
                  type="text"
                  className="form-control"
                  style={{ maxWidth: '200px' }}
                  placeholder="Instructions (optional)"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
                <button className="btn btn-primary btn-sm" onClick={() => issuePrescription(appt)}>Save</button>
              </div>
            )}

            {billAppointmentId === appt.appointment_id && (
              <div className="mt-3 d-flex gap-2">
                <input
                  type="number"
                  className="form-control"
                  style={{ maxWidth: '160px' }}
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <button className="btn btn-primary btn-sm" onClick={() => issueBill(appt)}>Save</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}