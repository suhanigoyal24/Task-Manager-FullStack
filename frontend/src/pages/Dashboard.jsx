import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import TaskForm from '../components/TaskForm'
import TaskDetailModal from '../components/TaskDetailModal'
import axios from '../api/axios'

const Dashboard = () => {
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [viewingTask, setViewingTask] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        } else {
          const response = await axios.get('/api/v1/auth/me/')
          if (response.data.success) {
            setUser(response.data.data)
            localStorage.setItem('user', JSON.stringify(response.data.data))
          }
        }
        await fetchTasks()
      } catch (err) {
        console.error('Error loading dashboard:', err)
        setError('Failed to load dashboard data')
        if (err.response?.status === 401) {
          navigate('/login')
        }
      } finally {
        setLoading(false)
      }
    }
    loadUserData()
  }, [navigate])

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/v1/tasks/')
      if (response.data.success) {
        setTasks(response.data.data)
      }
    } catch (err) {
      console.error('Error fetching tasks:', err)
      setError('Failed to load tasks')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const handleCreateTask = () => {
    setEditingTask(null)
    setShowModal(true)
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowModal(true)
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    try {
      const response = await axios.delete(`/api/v1/tasks/${taskId}/`)
      if (response.data.success) {
        setTasks(tasks.filter(t => t.id !== taskId))
      }
    } catch (err) {
      console.error('Error deleting task:', err)
      alert(err.response?.data?.error || 'Failed to delete task')
    }
  }

  const handleTaskSaved = () => {
    setShowModal(false)
    setEditingTask(null)
    fetchTasks()
  }

  const handleViewTask = (task) => {
    setViewingTask(task)
  }

  const getFullName = () => {
    if (!user) return 'User'
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email
  }

  const getStatusClass = (status) => {
    return `status-badge status-${status}`
  }

  if (loading) {
    return <div className="loading">Loading dashboard</div>
  }

  if (error && !user) {
    return <div className="auth-page"><div className="alert alert-error">{error}</div></div>
  }

  return (
    <div>
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="dashboard">
        {error && <div className="alert alert-error">{error}</div>}
        
        {/* Welcome Card */}
        <div className="welcome-card">
          <div>
            <h2>Welcome back, {getFullName()}!</h2>
            <p>Manage your tasks efficiently</p>
          </div>
          <span className="role-badge">{user?.role_display || user?.role}</span>
        </div>
        
        {/* Tasks Section */}
        <div className="tasks-section">
          <div className="tasks-header">
            <h3>My Tasks</h3>
            <button className="btn-add" onClick={handleCreateTask}>
              + Add New Task
            </button>
          </div>
          
          {tasks.length === 0 ? (
            <div className="no-tasks">
              <p>No tasks yet. Create your first task!</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <strong 
                          style={{ cursor: 'pointer', color: '#1a73e8' }} 
                          onClick={() => handleViewTask(task)}
                        >
                          {task.title}
                        </strong>
                      </td>
                      <td>
                        {/* Only show View button - no description text */}
                        <button 
                          className="btn btn-sm btn-edit"
                          onClick={() => handleViewTask(task)}
                        >
                          View
                        </button>
                      </td>
                      <td>
                        <span className={getStatusClass(task.status)}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{new Date(task.created_at).toLocaleDateString()}</td>
                      <td className="actions-cell">
                        <button 
                          className="btn btn-sm btn-edit"
                          onClick={() => handleEditTask(task)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Task Create/Edit Modal */}
      {showModal && (
        <TaskForm 
          task={editingTask}
          onClose={() => { setShowModal(false); setEditingTask(null) }}
          onSave={handleTaskSaved}
        />
      )}
      
      {/* Task Detail View Modal */}
      {viewingTask && (
        <TaskDetailModal 
          task={viewingTask} 
          onClose={() => setViewingTask(null)} 
        />
      )}
    </div>
  )
}

export default Dashboard