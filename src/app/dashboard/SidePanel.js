import React, { useState } from 'react';
import styles from './SidePanel.module.css';
import { users } from '../../../models/users';
import { useUser } from '../../context/UserContext';
import TimeLoggingModal from '../../components/TimeLoggingModal';

export default function SidePanel({ 
  onClose, 
  onSubmit, 
  onDelete, 
  onCloseTask, 
  onApprove, 
  onReopen,
  onLogTime,
  task
}) {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(!task);
  const [showTimeLoggingModal, setShowTimeLoggingModal] = useState(false);
  
  // Update status checks
  const isPendingApproval = task?.status === 'Pending Approval';
  const isClosed = task?.status === 'Closed';

  const [form, setForm] = useState(task ? {
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    assignee: task.assignee,
    dueDate: task.dueDate,
    estimatedTime: task.estimatedTime || '',
    loggedTime: task.loggedTime || 0,
    effort: task.effort,
    type: task.type,
    project: task.project,
  } : {
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Open',
    assignee: '',
    dueDate: '',
    estimatedTime: '',
    loggedTime: 0,
    effort: '',
    type: 'Bug',
    project: '',
  });

  const [assigneeInput, setAssigneeInput] = useState(task?.assignee || '');
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAssigneeInput = (e) => {
    setAssigneeInput(e.target.value);
    setForm({ ...form, assignee: e.target.value });
    setShowAssigneeDropdown(true);
  };

  const handleAssigneeSelect = (username) => {
    setForm({ ...form, assignee: username });
    setAssigneeInput(username);
    setShowAssigneeDropdown(false);
  };

  const handleTimeLog = (timeInMinutes) => {
    const newLoggedTime = (form.loggedTime || 0) + timeInMinutes;
    const updatedForm = { ...form, loggedTime: newLoggedTime };
    setForm(updatedForm);
    onLogTime && onLogTime(task.key, newLoggedTime);
    setShowTimeLoggingModal(false);
    
    // If we're editing, we want to make sure these changes are saved
    if (isEditing) {
      onSubmit(updatedForm);
    }
  };

  const parseEstimatedTime = (timeStr) => {
    if (!timeStr) return 0;
    const matches = timeStr.match(/(\d+)d\s*(\d+)h\s*(\d+)m/);
    if (!matches) return 0;
    const [_, days, hours, minutes] = matches;
    return (parseInt(days) * 24 * 60) + (parseInt(hours) * 60) + parseInt(minutes);
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(assigneeInput.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  // Update permission checks
  const isManager = user?.role?.toLowerCase() === 'manager';
  const isCreator = task?.creator === user?.username;
  const isAssignee = task?.assignee === user?.username;
  
  const canEdit = (isManager || isCreator || isAssignee) && 
    !isPendingApproval && !isClosed;
  
  const canClose = isAssignee && 
    !isPendingApproval && !isClosed;

  const canApproveOrReopen = isManager && isPendingApproval;

  const canLogTime = isAssignee && !isClosed;

  // Format time display
  const formatTime = (minutes) => {
    if (!minutes) return '0h 0m';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  const handleApprove = async (taskKey) => {
    await onApprove(taskKey);
    onClose(); // Close the side panel after approval
  };

  return (
    <div className={styles.sidePanelOverlay}>
      <div className={styles.sidePanel}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        <h2>{task ? (isEditing ? 'Edit Task' : 'Task Details') : 'Create Task'}</h2>
        
        {task && canEdit && !isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className={styles.editButton}
          >
            <span className={styles.editIcon}>✎</span> Edit
          </button>
        )}

        <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
          <label>Title
            <input 
              name="title" 
              value={form.title} 
              onChange={handleChange} 
              required 
              disabled={!isEditing || isPendingApproval || isClosed}
            />
          </label>
          <label>Description
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              required 
              disabled={!isEditing || isPendingApproval || isClosed}
            />
          </label>
          <label>Priority
            <select 
              name="priority" 
              value={form.priority} 
              onChange={handleChange}
              disabled={!isEditing || isPendingApproval || isClosed}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </label>
          <label>Status
            <select 
              name="status" 
              value={form.status} 
              onChange={handleChange}
              disabled={!task || (!isEditing && task) || isPendingApproval || isClosed}
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
            </select>
          </label>
          <label style={{ position: 'relative' }}>
            Assignee
            {!task && (
              <div className={styles.assignToMyselfLink}>
                <button
                  type="button"
                  onClick={() => {
                    setForm({ ...form, assignee: user.username });
                    setAssigneeInput(user.username);
                  }}
                  className={styles.linkButton}
                >
                  Assign to myself
                </button>
              </div>
            )}
            <span style={{
              position: 'absolute',
              right: '10px',
              top: '70%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: '#1976d2',
              fontSize: '1.1em',
              zIndex: 2
            }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9" cy="9" r="7" stroke="#1976d2" strokeWidth="2"/>
                <line x1="14.4142" y1="14" x2="18" y2="17.5858" stroke="#1976d2" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
            <input
              name="assignee"
              value={assigneeInput}
              onChange={handleAssigneeInput}
              onFocus={() => setShowAssigneeDropdown(true)}
              onBlur={() => setTimeout(() => setShowAssigneeDropdown(false), 100)}
              autoComplete="off"
              required
              disabled={!isEditing || isPendingApproval || isClosed}
              style={{ paddingLeft: '3px' }}
            />
            {showAssigneeDropdown && assigneeInput.length >= 3 && filteredUsers.length > 0 && (
              <ul className={styles.typeaheadDropdown}>
                {filteredUsers.map(user => (
                  <li
                    key={user.username}
                    onMouseDown={() => handleAssigneeSelect(user.username)}
                    className={styles.typeaheadOption}
                  >
                    {user.username} ({user.role})
                  </li>
                ))}
              </ul>
            )}
          </label>
          <label>Type
            <select 
              name="type" 
              value={form.type} 
              onChange={handleChange}
              disabled={!isEditing || isPendingApproval || isClosed}
            >
              <option>Bug</option>
              <option>Task</option>
              <option>Feature</option>
            </select>
          </label>
          <label>Due Date
            <input 
              type="date" 
              name="dueDate" 
              value={form.dueDate} 
              onChange={handleChange} 
              min={today}
              disabled={!isEditing || isPendingApproval || isClosed}
            />
          </label>
          <label>Estimated Time (e.g. 2d 4h 3m)
            <input 
              name="estimatedTime" 
              value={form.estimatedTime} 
              onChange={handleChange}
              placeholder="Format: 1d 2h 30m"
              disabled={!isEditing || isPendingApproval || isClosed}
            />
          </label>

          {task && (
            <div className={styles.timeTrackingSection}>
              <div className={styles.timeInfo}>
                <div>
                  <span>Time Logged:</span>
                  <strong>{formatTime(form.loggedTime)}</strong>
                  {canLogTime && isEditing && (
                    <button 
                      type="button"
                      onClick={() => setShowTimeLoggingModal(true)}
                      className={styles.logTimeButton}
                    >
                      +
                    </button>
                  )}
                </div>
                {form.estimatedTime && (
                  <>
                    <div>
                      <span>Estimated:</span>
                      <strong>{form.estimatedTime}</strong>
                    </div>
                    <div>
                      <span>Remaining:</span>
                      <strong>
                        {formatTime(Math.max(0, parseEstimatedTime(form.estimatedTime) - (form.loggedTime || 0)))}
                      </strong>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className={styles.buttonContainer}>
            <div className={styles.leftButtons}>
              <button type="button" onClick={onClose} className={styles.cancelButton}>
                Cancel
              </button>
            </div>
            
            <div className={styles.rightButtons}>
              {isEditing && canClose && (
                <button 
                  type="button" 
                  onClick={() => onCloseTask(task.key)}
                  className={styles.closeTaskButton}
                >
                  Close
                </button>
              )}
              
              {canApproveOrReopen && (
                <>
                  <button 
                    type="button" 
                    onClick={() => handleApprove(task.key)}
                    className={styles.approveButton}
                  >
                    Approve
                  </button>
                  <button 
                    type="button" 
                    onClick={() => onReopen(task.key)}
                    className={styles.reopenButton}
                  >
                    Reopen
                  </button>
                </>
              )}
              
              {isEditing && !isPendingApproval && !isClosed && (
                <button type="submit" className={styles.submitButton}>
                  {task ? 'Save Changes' : 'Create Task'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {showTimeLoggingModal && (
        <TimeLoggingModal
          onClose={() => setShowTimeLoggingModal(false)}
          onSubmit={handleTimeLog}
          currentLoggedTime={form.loggedTime || 0}
          estimatedTime={parseEstimatedTime(form.estimatedTime)}
        />
      )}
    </div>
  );
} 