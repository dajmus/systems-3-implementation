export default function Register({ onSwitchToLogin }) {
  // TODO: one useState per field, name, email, password, contact_info
  // TODO: handleSubmit function, will eventually fetch('/api/accounts/register')

  return (
    <div className="container mt-5">
      <h2>Register</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input type="text" className="form-control" />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" className="form-control" />
        </div>
        <div className="mb-3">
          <label className="form-label">Contact Info</label>
          <input type="text" className="form-control" />
        </div>
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
      <p className="mt-3">
        Already have an account?{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>Login</a>
      </p>
    </div>
  );
}