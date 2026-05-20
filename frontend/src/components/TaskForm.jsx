import { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';

const TaskForm = ({ existingTask, onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Populate form if editing existing task
  useEffect(() => {
    if (existingTask) {
      setFormData({
        title: existingTask.title || '',
        description: existingTask.description || '',
        status: existingTask.status || 'todo',
      });
    }
  }, [existingTask]);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (message.text) setMessage({ type: '', text: '' });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let response;
      
      if (existingTask?.id) {
        // Update existing task (PUT request)
        response = await axiosInstance.put(
          `/api/v1/tasks/${existingTask.id}/`,
          formData
        );
      } else {
        // Create new task (POST request)
        response = await axiosInstance.post('/api/v1/tasks/', formData);
      }

      if (response.data.success) {
        setMessage({
          type: 'success',
          text: existingTask ? 'Task updated!' : 'Task created!',
        });
        
        // Call success callback and close after delay
        setTimeout(() => {
          onSuccess();
        }, 800);
      }
    } catch (err) {
      // Show validation errors or generic error
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.details?.title?.[0] ||
        err.response?.data?.details?.non_field_errors?.[0] ||
        'Failed to save task';
      
      setMessage({ type: 'error', text: errorMsg });
      console.error('Task save error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Close modal when clicking overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>{existingTask ? 'Edit Task' : 'New Task'}</h3>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}
          >
            &times;
          </button>
        </div>

        {/* Show success or error message */}
        {message.text && (
          <div className={`alert-${message.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '1rem' }}>
            {message.text}
          </div>
        )}

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
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Enter task description (optional)"
              disabled={loading}
              style={{ resize: 'vertical', minHeight: '80px' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Saving...' : (existingTask ? 'Update' : 'Create')}
            </button>
            <button 
              type="button" 
              className="btn btn-danger" 
              onClick={onClose}
              disabled={loading}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;