import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';

function AppContent() {
  const [view, setView] = useState('login');
  const { user, login, logout } = useAuth();

  if (user) {
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