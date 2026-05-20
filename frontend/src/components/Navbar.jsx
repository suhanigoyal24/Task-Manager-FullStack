const Navbar = ({ user, onLogout }) => {
  // Get user email from props or localStorage as fallback
  const userEmail = user?.email || JSON.parse(localStorage.getItem('user'))?.email || 'User';
  const userRole = user?.role_display || JSON.parse(localStorage.getItem('user'))?.role_display || '';

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: '#2c3e50',
      color: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* App name on left */}
      <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
        Task Manager
      </div>

      {/* User info and logout on right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.95rem' }}>
          {userEmail}
          {userRole && (
            <span style={{
              marginLeft: '8px',
              padding: '2px 8px',
              backgroundColor: userRole.toLowerCase() === 'admin' ? '#e74c3c' : '#3498db',
              borderRadius: '4px',
              fontSize: '0.8rem',
              textTransform: 'uppercase'
            }}>
              {userRole}
            </span>
          )}
        </span>
        
        <button 
          onClick={onLogout}
          style={{
            padding: '6px 16px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;