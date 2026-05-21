const TaskDetailModal = ({ task, onClose }) => {
  if (!task) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'done': return '#06d6a0';
      case 'in_progress': return '#1a73e8';
      case 'todo': return '#888';
      default: return '#888';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '20px' }}>{task.title}</h3>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#888' }}
          >
            &times;
          </button>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <span style={{
            padding: '6px 14px',
            borderRadius: '20px',
            backgroundColor: getStatusColor(task.status),
            color: 'white',
            fontSize: '13px',
            fontWeight: '600',
            textTransform: 'capitalize'
          }}>
            {task.status.replace('_', ' ')}
          </span>
        </div>
        
        {task.description ? (
          <div style={{ 
            background: '#f8fbff', 
            padding: '16px', 
            borderRadius: '12px',
            borderLeft: '4px solid #1a73e8',
            marginBottom: '20px'
          }}>
            <p style={{ margin: 0, lineHeight: '1.6', color: '#333', whiteSpace: 'pre-wrap' }}>
              {task.description}
            </p>
          </div>
        ) : (
          <p style={{ color: '#999', fontStyle: 'italic', marginBottom: '20px' }}>
            No description added.
          </p>
        )}
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          fontSize: '13px',
          color: '#666',
          paddingTop: '16px',
          borderTop: '1px solid #eee'
        }}>
          <span>Created: {new Date(task.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', month: 'short', day: 'numeric' 
          })}</span>
          {task.owner_name && <span>By: {task.owner_name}</span>}
        </div>
        
        <div className="modal-actions">
          <button className="btn btn-primary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;