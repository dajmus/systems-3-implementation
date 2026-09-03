import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';

function AppContent() {
  const [view, setView] = useState('login');
  const [patientTab, setPatientTab] = useState('book');
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
                className={`btn btn-sm ${patientTab === 'mine' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setPatientTab('mine')}
              >
                My Appointments
              </button>
            </div>
            <button className="btn btn-outline-secondary btn-sm" onClick={logout}>Log out</button>
          </div>

          {patientTab === 'book' ? <BookAppointment /> : <MyAppointments />}
        </div>
      );
    }

    return (
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center">
        <h3>Logged in as {user.name || user.email}</h3>
        <p className="text-muted">
          Account type: {user.accountType}
          {user.role ? ` (${user.role})` : ''}
        </p>
        <button className="btn btn-outline-secondary" onClick={logout}>Log out</button>
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