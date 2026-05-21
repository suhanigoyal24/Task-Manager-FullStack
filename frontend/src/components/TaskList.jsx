const TaskList = ({ tasks, isAdmin, onEdit, onDelete, onView }) => {
  if (tasks.length === 0) {
    return (
      <div className="no-tasks">
        <p>No tasks yet. Create your first task!</p>
      </div>
    );
  }

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '—';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status}`;
  };

  return (
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
                  onClick={() => onView(task)}
                >
                  {task.title}
                </strong>
              </td>
              <td>
                <span style={{ color: task.description ? '#333' : '#999' }}>
                  {truncateText(task.description, 50)}
                </span>
                {task.description && task.description.length > 50 && (
                  <button 
                    className="btn btn-sm btn-edit" 
                    style={{ marginLeft: '8px', padding: '4px 10px' }}
                    onClick={() => onView(task)}
                  >
                    View
                  </button>
                )}
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
                  onClick={() => onEdit(task)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => onDelete(task.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskList;