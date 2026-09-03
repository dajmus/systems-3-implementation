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
  const [patientTab, setPatientTab] = useState('catalog');
  const [staffTab, setStaffTab] = useState('schedule');
  const { user, login, logout } = useAuth();

  if (user) {
    if (user.accountType === 'patient') {
      return (
        <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
          <div
            className="d-flex justify-content-between align-items-center p-3 border-bottom"
            style={{ backgroundColor: '#ffffff' }}
          >
            <div>
              <button
                className="btn btn-sm me-2"
                style={{
                  backgroundColor: patientTab === 'catalog' ? '#ffffff' : '#ffffff',
                  color: '#28777b',
                  border: '1px solid #28777b'
                }}
                onClick={() => setPatientTab('catalog')}
              >
                Services
              </button>

              <button
                className="btn btn-sm me-2"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#28777b',
                  border: '1px solid #28777b'
                }}
                onClick={() => setPatientTab('mine')}
              >
                My Appointments
              </button>

              <button
                className="btn btn-sm me-2"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#28777b',
                  border: '1px solid #28777b'
                }}
                onClick={() => setPatientTab('prescriptions')}
              >
                Prescriptions
              </button>

              <button
                className="btn btn-sm"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#28777b',
                  border: '1px solid #28777b'
                }}
                onClick={() => setPatientTab('billing')}
              >
                Billing
              </button>
            </div>

            <button
              className="btn btn-sm"
              style={{
                backgroundColor: '#ffffff',
                color: '#28777b',
                border: '1px solid #28777b'
              }}
              onClick={logout}
            >
              Log out
            </button>
          </div>

          {patientTab === 'catalog' && (
            <Catalog onBookAppointment={() => setPatientTab('book')} />
          )}

          {patientTab === 'book' && <BookAppointment />}

          {patientTab === 'mine' && <MyAppointments />}

          {patientTab === 'prescriptions' && <Prescriptions />}

          {patientTab === 'billing' && <Billing />}
        </div>
      );
    }

    return (
      <StaffSchedule
        activeTab={staffTab}
        onNavigate={setStaffTab}
        onLogout={logout}
      />
    );
  }

  if (view === 'register') {
    return (
      <Register
        onSwitchToLogin={() => setView('login')}
      />
    );
  }

  return (
    <Login
      onSwitchToRegister={() => setView('register')}
      onLoginSuccess={login}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}