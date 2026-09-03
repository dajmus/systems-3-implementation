import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Catalog from './Catalog';
import './StaffSchedule.css';

import clinicBg from '../assets/clinicbackground.png';
import recruitmentBg from '../assets/recruitmentbackground.png';

const API_BASE = '/api';

export default function StaffSchedule({ activeTab = 'schedule', onNavigate, onLogout }) {
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
    try {
      const response = await fetch(`${API_BASE}/appointments`);
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Could not load appointments.');
        return;
      }

      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessage('Could not connect to the server.');
      setAppointments([]);
    }
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staff_id: user.staff_id,
          date_and_time: dateTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Could not add slot.');
        return;
      }

      setMessage('Appointment slot added successfully.');
      setDateTime('');
      loadAppointments();
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
        headers: {
          'Content-Type': 'application/json',
        },
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

      setMessage('Prescription issued successfully.');

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: appt.patient_id,
          amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Could not issue bill.');
        return;
      }

      setMessage('Bill issued successfully.');

      setBillAppointmentId(null);
      setAmount('');
    } catch (err) {
      setMessage('Something went wrong. Please try again.');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString([], {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <main className="staff-page">

      <img
        src={clinicBg}
        alt=""
        className="staff-bg staff-bg-top"
      />

      <img
        src={recruitmentBg}
        alt=""
        className="staff-bg staff-bg-bottom"
      />

      <nav className="staff-navbar">

        <div className="staff-navbar-left">

          <button
            type="button"
            className={`btn staff-nav-button ${activeTab === 'schedule' ? 'staff-nav-active' : ''}`}
            onClick={() => onNavigate && onNavigate('schedule')}
          >
            Appointments
          </button>

          <button
            type="button"
            className={`btn staff-nav-button ${activeTab === 'catalog' ? 'staff-nav-active' : ''}`}
            onClick={() => onNavigate && onNavigate('catalog')}
          >
            Services
          </button>

        </div>

        <button
          type="button"
          className="btn staff-nav-button"
          onClick={onLogout}
        >
          Log out
        </button>

      </nav>

      {activeTab === 'catalog' ? (
        <Catalog />
      ) : (
        <div className="staff-content">

          <header className="text-center staff-header">

            <h1 className="fw-bold">
              Staff Dashboard
            </h1>

            <p className="text-muted">
              Manage appointments, prescriptions and patient billing.
            </p>

          </header>


          {message && (
            <div className="alert alert-info mb-4">
              {message}
            </div>
          )}


          {user.role === 'doctor' && (
            <section className="card border-0 shadow-sm staff-card">

              <div className="text-center">

                <h2 className="h4 fw-bold">
                  Add appointment slot
                </h2>

                <p className="text-muted">
                  Create an available time slot for patients.
                </p>

              </div>

              <form onSubmit={addSlot}>

                <div className="row align-items-end">

                  <div className="col">

                    <label
                      htmlFor="appointment-date"
                      className="form-label"
                    >
                      Date and time
                    </label>

                    <input
                      id="appointment-date"
                      type="datetime-local"
                      className="form-control"
                      value={dateTime}
                      onChange={(e) => setDateTime(e.target.value)}
                    />

                  </div>

                  <div className="col-auto">

                    <button
                      type="submit"
                      className="btn staff-button-primary"
                    >
                      Add slot
                    </button>

                  </div>

                </div>

              </form>

            </section>
          )}


          <section className="appointments-section">

            <div className="text-center">

              <h2 className="fw-bold">
                Appointments
              </h2>

              <p className="text-muted">
                {appointments.length} appointments
              </p>

            </div>


            {appointments.map((appt) => (

              <article
                key={appt.appointment_id}
                className="card border-0 shadow-sm appointment-card"
              >

                <div className="text-center">

                  <div className="fw-bold">
                    {formatDate(appt.date_and_time)}
                  </div>

                  <div>
                    {appt.patient_name}
                  </div>

                  <div className="text-muted">
                    with Dr. {appt.doctor_name}
                  </div>

                </div>


                <div className="appointment-actions">

                  <span className="badge rounded-pill status-badge">
                    {appt.status}
                  </span>

                  {user.role === 'doctor' && (
                    <button
                      type="button"
                      className="btn btn-sm staff-button-outline"
                      onClick={() =>
                        setRxAppointmentId(
                          rxAppointmentId === appt.appointment_id
                            ? null
                            : appt.appointment_id
                        )
                      }
                    >
                      Prescription
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-sm staff-button-outline"
                    onClick={() =>
                      setBillAppointmentId(
                        billAppointmentId === appt.appointment_id
                          ? null
                          : appt.appointment_id
                      )
                    }
                  >
                    Issue bill
                  </button>

                </div>


                {rxAppointmentId === appt.appointment_id && (
                  <div className="expand-panel">

                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="Diagnosis"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                    />

                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="Medication"
                      value={medication}
                      onChange={(e) => setMedication(e.target.value)}
                    />

                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="Instructions"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                    />

                    <button
                      type="button"
                      className="btn staff-button-primary"
                      onClick={() => issuePrescription(appt)}
                    >
                      Save prescription
                    </button>

                  </div>
                )}


                {billAppointmentId === appt.appointment_id && (
                  <div className="expand-panel">

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="form-control mb-2"
                      placeholder="Amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />

                    <button
                      type="button"
                      className="btn staff-button-primary"
                      onClick={() => issueBill(appt)}
                    >
                      Save bill
                    </button>

                  </div>
                )}

              </article>

            ))}

          </section>

        </div>
      )}

    </main>
  );
}