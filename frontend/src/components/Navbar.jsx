const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        ✓ Task Manager
      </div>
      <div className="navbar-right">
        <span style={{ color: '#666', fontSize: '14px' }}>
          {user?.email}
        </span>
        <button className="btn btn-logout btn-sm" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar