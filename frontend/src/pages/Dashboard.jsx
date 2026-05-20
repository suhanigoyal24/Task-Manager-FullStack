import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import Navbar from '../components/Navbar';
import TaskForm from '../components/TaskForm';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Load user profile and tasks
    fetchData();
  }, [navigate]);

  // Fetch user profile and tasks from API
  const fetchData = async () => {
    try {
      // Get user profile
      const profileRes = await axiosInstance.get('/api/v1/auth/me/');
      if (profileRes.data.success) {
        setUser(profileRes.data.data);
        localStorage.setItem('user', JSON.stringify(profileRes.data.data));
      }

      // Get tasks list
      const tasksRes = await axiosInstance.get('/api/v1/tasks/');
      if (tasksRes.data.success) {
        setTasks(tasksRes.data.data);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load data. Please try again.');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Handle create new task
  const handleCreateTask = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  // Handle edit existing task
  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  // Handle delete task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await axiosInstance.delete(`/api/v1/tasks/${taskId}/`);
      if (response.data.success) {
        // Remove deleted task from state
        setTasks(tasks.filter((task) => task.id !== taskId));
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.response?.data?.error || 'Failed to delete task');
    }
  };

  // Callback when task is created/updated successfully
  const handleTaskSuccess = () => {
    setShowForm(false);
    setEditingTask(null);
    fetchData(); // Refresh tasks list
  };

  // Show loading state
  if (loading) {
    return <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div>
      {/* Navbar with user info and logout */}
      <Navbar user={user} onLogout={handleLogout} />

      <div className="container">
        {/* Show error if any */}
        {error && <div className="alert-error">{error}</div>}

        {/* Header with create button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>My Tasks</h2>
          <button className="btn" onClick={handleCreateTask}>+ New Task</button>
        </div>

        {/* Tasks table */}
        {tasks.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>No tasks found. Create your first task!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <strong>{task.title}</strong>
                    {task.description && (
                      <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '4px' }}>
                        {task.description.length > 50 
                          ? task.description.substring(0, 50) + '...' 
                          : task.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      backgroundColor: task.status === 'done' ? '#28a745' : 
                                      task.status === 'in_progress' ? '#ffc107' : '#6c757d',
                      color: task.status === 'in_progress' ? '#000' : '#fff',
                      textTransform: 'capitalize'
                    }}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{new Date(task.created_at).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn" 
                      style={{ padding: '6px 12px', marginRight: '8px' }}
                      onClick={() => handleEditTask(task)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '6px 12px' }}
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm 
          existingTask={editingTask}
          onSuccess={handleTaskSuccess}
          onClose={() => { setShowForm(false); setEditingTask(null); }}
        />
      )}
    </div>
  );
};

export default Dashboard;