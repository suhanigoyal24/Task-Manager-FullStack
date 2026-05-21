import { useState, useEffect } from 'react'
import axios from '../api/axios'

const TaskForm = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo'
      })
    }
  }, [task])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Clean payload before sending: trim whitespace, convert empty description to null
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() === '' ? null : formData.description.trim(),
      status: formData.status
    }

    try {
      if (task?.id) {
        const response = await axios.put(`/api/v1/tasks/${task.id}/`, payload)
        if (response.data.success) {
          setSuccess('Task updated successfully!')
          setTimeout(onSave, 500)
        }
      } else {
        const response = await axios.post('/api/v1/tasks/', payload)
        if (response.data.success) {
          setSuccess('Task created successfully!')
          setTimeout(onSave, 500)
        }
      }
    } catch (err) {
      console.error('Task save error:', err)
      const details = err.response?.data?.details
      if (details && typeof details === 'object') {
        const messages = Object.values(details).flat().join(', ')
        setError(messages || 'Failed to save task')
      } else {
        setError(err.response?.data?.error || 'Failed to save task')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{task?.id ? 'Edit Task' : 'Create New Task'}</h3>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter task title"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description (optional)"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          
          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary btn-sm"
              disabled={loading}
            >
              {loading ? 'Saving...' : (task?.id ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskForm