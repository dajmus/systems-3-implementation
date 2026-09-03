import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import StaffSchedule from './pages/StaffSchedule';
import Catalog from './pages/Catalog';
import Prescriptions from './pages/Prescriptions';
import Billing from './pages/Billing';

function AppContent() {
  const [view, setView] = useState('login');
  const [patientTab, setPatientTab] = useState('book');
  const [staffTab, setStaffTab] = useState('schedule');
  const { user, login, logout } = useAuth();

  if (user) {
    if (user.accountType === 'patient') {
      return (
        <div>
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
            <div>
              <button
                className={`btn btn-sm me-2 ${patientTab === 'book' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setPatientTab('book')}
              >
                Book Appointment
              </button>
              <button
                className={`btn btn-sm me-2 ${patientTab === 'mine' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setPatientTab('mine')}
              >
                My Appointments
              </button>
              <button
                className={`btn btn-sm me-2 ${patientTab === 'catalog' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setPatientTab('catalog')}
              >
                Services
              </button>
              <button
                className={`btn btn-sm me-2 ${patientTab === 'prescriptions' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setPatientTab('prescriptions')}
              >
                Prescriptions
              </button>
              <button
                className={`btn btn-sm ${patientTab === 'billing' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setPatientTab('billing')}
              >
                Billing
              </button>
            </div>
            <button className="btn btn-outline-secondary btn-sm" onClick={logout}>Log out</button>
          </div>

          {patientTab === 'book' && <BookAppointment />}
          {patientTab === 'mine' && <MyAppointments />}
          {patientTab === 'catalog' && <Catalog />}
          {patientTab === 'prescriptions' && <Prescriptions />}
          {patientTab === 'billing' && <Billing />}
        </div>
      );
    }

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <div>
            <button
              className={`btn btn-sm me-2 ${staffTab === 'schedule' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setStaffTab('schedule')}
            >
              Appointments
            </button>
            <button
              className={`btn btn-sm ${staffTab === 'catalog' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setStaffTab('catalog')}
            >
              Services
            </button>
          </div>
          <button className="btn btn-outline-secondary btn-sm" onClick={logout}>Log out</button>
        </div>

        {staffTab === 'schedule' && <StaffSchedule />}
        {staffTab === 'catalog' && <Catalog />}
      </div>
    );
  }

  if (view === 'register') {
    return <Register onSwitchToLogin={() => setView('login')} />;
  }

  return (
    <Login onSwitchToRegister={() => setView('register')} onLoginSuccess={login} />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}