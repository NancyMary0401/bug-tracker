import React, { useState, useCallback, useMemo, useEffect } from 'react';
import styles from './SidePanel.module.css';
import { users } from '../../models/users';
import { useUser } from '../../context/UserContext';
import TimeLoggingModal from '../../components/ui/TimeLoggingModal';
import Toast from '../../components/ui/Toast';

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];
const STATUS_OPTIONS = ['Open', 'In Progress', 'Closed'];
const TYPE_OPTIONS = ['Bug', 'Task', 'Feature'];

const PRIORITY_ICONS = {
  Low: '🔵',
  Medium: '🟡',
  High: '🟠',
  Critical: '🔴'
};

const TYPE_ICONS = {
  Bug: '🐞',
  Task: '📋',
  Feature: '✨'
};

const initialFormState = {
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
};

const parseEstimatedTime = (timeStr) => {
  if (!timeStr) return 0;
  
  // Normalize the string by adding spaces between numbers and letters if missing
  let normalizedStr = timeStr.trim().replace(/(\d+)([dhm])/gi, '$1 $2');
  
  // Try to match the format "Xd Yh Zm"
  const matches = normalizedStr.match(/(\d+)\s*d(?:ays?)?\s*(?:(\d+)\s*h(?:ours?)?)?\s*(?:(\d+)\s*m(?:inutes?)?)?/i);
  
  if (matches) {
    const days = parseInt(matches[1]) || 0;
    const hours = parseInt(matches[2]) || 0;
    const minutes = parseInt(matches[3]) || 0;
    return (days * 24 * 60) + (hours * 60) + minutes;
  }
  
  // Try to match just hours and minutes "Yh Zm"
  const hoursMinMatches = normalizedStr.match(/(\d+)\s*h(?:ours?)?\s*(?:(\d+)\s*m(?:inutes?)?)?/i);
  if (hoursMinMatches) {
    const hours = parseInt(hoursMinMatches[1]) || 0;
    const minutes = parseInt(hoursMinMatches[2]) || 0;
    return (hours * 60) + minutes;
  }
  
  // Try to match just minutes "Zm"
  const minMatches = normalizedStr.match(/(\d+)\s*m(?:inutes?)?/i);
  if (minMatches) {
    return parseInt(minMatches[1]) || 0;
  }
  
  // If it's just a number, assume it's minutes
  if (!isNaN(parseInt(timeStr))) {
    return parseInt(timeStr);
  }
  
  return 0;
};

const calculateProgress = (loggedTime, estimatedTime) => {
  if (!estimatedTime || estimatedTime === 0) return 0;
  
  // Parse estimatedTime if it's a string
  let estimatedMinutes;
  if (typeof estimatedTime === 'string') {
    // Check if it has the format "0d 0h 0m" or just a number
    if (estimatedTime.includes('d') || estimatedTime.includes('h') || estimatedTime.includes('m')) {
      estimatedMinutes = parseEstimatedTime(estimatedTime);
    } else {
      estimatedMinutes = parseInt(estimatedTime) || 0;
    }
  } else {
    estimatedMinutes = estimatedTime;
  }
    
  if (estimatedMinutes === 0) return 0;
  
  // Ensure loggedTime is a number
  const loggedMinutes = typeof loggedTime === 'string' ? parseInt(loggedTime) : loggedTime;
  
  const progress = (loggedMinutes / estimatedMinutes) * 100;
  return Math.min(progress, 100); // Cap at 100%
};

const formatTime = (minutes) => {
  if (!minutes) return '0h 0m';
  
  // Calculate days, hours, and minutes
  const days = Math.floor(minutes / (24 * 60));
  const remainingMinutes = minutes % (24 * 60);
  const hours = Math.floor(remainingMinutes / 60);
  const mins = remainingMinutes % 60;
  
  // Create output string with days, hours, and minutes
  let result = '';
  if (days > 0) result += `${days}d `;
  if (hours > 0 || days > 0) result += `${hours}h `;
  result += `${mins}m`;
  
  return result;
};

export default function SidePanel({ 
  onClose, 
  onSubmit, 
  onDelete, 
  onMarkAsDone, 
  onApprove, 
  onReopen,
  onLogTime,
  task
}) {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(!task?.status?.includes('Closed') && !task?.status?.includes('Pending Approval'));
  const [showTimeLoggingModal, setShowTimeLoggingModal] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [formErrors, setFormErrors] = useState({
    title: false,
    description: false,
    assignee: false
  });
  
  const [form, setForm] = useState(task ? {
    ...initialFormState,
    ...task,
    estimatedTime: task.estimatedTime || '',
    loggedTime: task.loggedTime || 0,
  } : initialFormState);

  const [assigneeInput, setAssigneeInput] = useState(task?.assignee || '');
  const [closeReason, setCloseReason] = useState(task?.closeReason || 'Closed without completion');

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return form.title?.trim() && form.description?.trim() && form.assignee?.trim();
  }, [form.title, form.description, form.assignee]);

  // Check for form errors
  useEffect(() => {
    setFormErrors({
      title: isEditing && form.title?.trim() === '',
      description: isEditing && form.description?.trim() === '',
      assignee: isEditing && form.assignee?.trim() === ''
    });
  }, [form.title, form.description, form.assignee, isEditing]);

  // Memoized permission checks
  const permissions = useMemo(() => {
    const isManager = user?.role?.toLowerCase() === 'manager';
    const isCreator = task?.creator === user?.username;
    const isAssignee = task?.assignee === user?.username;
    const isPendingApproval = task?.status === 'Pending Approval';
    const isClosed = task?.status === 'Closed';
    const isDone = task?.status === 'Done';

    return {
      canEdit: (isManager || isCreator || isAssignee) && !isPendingApproval && !isClosed,
      canMarkAsDone: isAssignee && !isPendingApproval && !isClosed,
      canCloseTask: isAssignee && !isPendingApproval && !isClosed,
      canApproveOrReopen: isManager && isPendingApproval,
      canLogTime: isAssignee && !isClosed,
      isPendingApproval,
      isClosed
    };
  }, [user, task]);

  // Memoized filtered users for assignee dropdown
  const filteredUsers = useMemo(() => 
    users.filter(u => u.username.toLowerCase().includes(assigneeInput.toLowerCase())),
    [assigneeInput]
  );

  // Show toast message
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleAssigneeInput = useCallback((e) => {
    const value = e.target.value;
    setAssigneeInput(value);
    setForm(prev => ({ ...prev, assignee: value }));
    setShowAssigneeDropdown(true);
  }, []);

  const handleAssigneeSelect = useCallback((username) => {
    setForm(prev => ({ ...prev, assignee: username }));
    setAssigneeInput(username);
    setShowAssigneeDropdown(false);
  }, []);

  const handleTimeLog = useCallback((timeInMinutes) => {
    const newLoggedTime = (form.loggedTime || 0) + timeInMinutes;
    setForm(prev => ({ ...prev, loggedTime: newLoggedTime }));
    onLogTime?.(task?.key, newLoggedTime);
    setShowTimeLoggingModal(false);
    
    if (isEditing) {
      onSubmit({ ...form, loggedTime: newLoggedTime });
    }
  }, [form, isEditing, onLogTime, onSubmit, task?.key]);

  const validateForm = () => {
    const errors = {
      title: !form.title?.trim(),
      description: !form.description?.trim(),
      assignee: !form.assignee?.trim()
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    
    onSubmit(form);
    showToast(task ? 'Task updated successfully' : 'Task created successfully');
  }, [form, onSubmit, task]);

  const handleCloseTask = useCallback(() => {
    if (!validateForm()) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    onSubmit({
      ...form,
      status: 'Pending Approval',
      previousStatus: form.status,
      closeReason: 'Closed without completion',
      lastUpdated: new Date().toISOString()
    });
    
    showToast('Task closed and sent for approval');
  }, [form, onSubmit]);

  const handleApprove = useCallback(async () => {
    await onApprove(task.key);
    showToast('Task approved and closed');
    onClose();
  }, [onApprove, task?.key, onClose]);

  const handleReopen = useCallback(() => {
    onReopen(task.key);
    showToast('Task reopened');
  }, [onReopen, task?.key]);

  const handleDelete = useCallback(() => {
    onDelete(task.key);
    showToast('Task deleted', 'warning');
  }, [onDelete, task?.key]);

  const assignToMyself = useCallback(() => {
    if (!user?.username) return;
    setForm(prev => ({ ...prev, assignee: user.username }));
    setAssigneeInput(user.username);
  }, [user?.username]);

  return (
    <div 
      className={styles.sidePanelOverlay} 
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.sidePanel}>
        {toast.show && <Toast message={toast.message} type={toast.type} />}
        
        <div className={styles.panelHeader}>
          <div className={styles.panelHeaderLeft}>
            {task && <span className={styles.taskKey}>{task.key}</span>}
            <h2>{task ? 'Task Details' : 'Create Task'}</h2>
          </div>
          
          <div className={styles.panelHeaderActions}>
            <button 
              className={styles.closeButton} 
              onClick={onClose}
              aria-label="Close panel"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>
              Title <span className={styles.requiredStar}>*</span>
            </label>
            <input 
              name="title" 
              value={form.title} 
              onChange={handleChange} 
              required 
              disabled={!isEditing || permissions.isPendingApproval || permissions.isClosed}
              className={`${styles.textInput} ${isEditing ? styles.editable : ''} ${formErrors.title ? styles.error : ''}`}
              aria-label="Task title"
              placeholder="Enter task title"
            />
            {formErrors.title && isEditing && (
              <p className={styles.errorText}>Title is required</p>
            )}
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>
              Description <span className={styles.requiredStar}>*</span>
            </label>
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              required 
              disabled={!isEditing || permissions.isPendingApproval || permissions.isClosed}
              className={`${styles.textArea} ${isEditing ? styles.editable : ''} ${formErrors.description ? styles.error : ''}`}
              aria-label="Task description"
              placeholder="Describe the task in detail"
              rows={6}
            />
            {formErrors.description && isEditing && (
              <p className={styles.errorText}>Description is required</p>
            )}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label className={styles.fieldLabel}>
                Priority
              </label>
              <select 
                name="priority" 
                value={form.priority} 
                onChange={handleChange}
                disabled={!isEditing || permissions.isPendingApproval || permissions.isClosed}
                className={`${styles.select} ${isEditing ? styles.editable : ''}`}
                aria-label="Task priority"
              >
                {PRIORITY_OPTIONS.map(priority => (
                  <option key={priority} value={priority}>
                    {PRIORITY_ICONS[priority]} {priority}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formField}>
              <label className={styles.fieldLabel}>
                Type
              </label>
              <select 
                name="type" 
                value={form.type} 
                onChange={handleChange}
                disabled={!isEditing || permissions.isPendingApproval || permissions.isClosed}
                className={`${styles.select} ${isEditing ? styles.editable : ''}`}
                aria-label="Task type"
              >
                {TYPE_OPTIONS.map(type => (
                  <option key={type} value={type}>
                    {TYPE_ICONS[type]} {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>
              Status
            </label>
            <select 
              name="status" 
              value={form.status} 
              onChange={handleChange}
              disabled={!task || (!isEditing && task) || permissions.isPendingApproval || permissions.isClosed}
              className={`${styles.select} ${isEditing ? styles.editable : ''}`}
              aria-label="Task status"
            >
              {STATUS_OPTIONS
                .filter(status => !(status === 'Closed' && user?.role?.toLowerCase() !== 'manager'))
                .map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
            </select>
            {task && permissions.isPendingApproval && (
              <div className={styles.statusInfo}>
                <span className={styles.pendingTag}>Pending Approval</span>
                <p>This task is awaiting manager approval.</p>
                {task.closeReason && (
                  <p className={styles.closeReason}>
                    <strong>Close reason:</strong> {task.closeReason}
                  </p>
                )}
              </div>
            )}
            {task && permissions.isClosed && (
              <div className={styles.statusInfo}>
                <span className={styles.closedTag}>Closed</span>
                <p>This task has been closed and can no longer be edited.</p>
              </div>
            )}
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>
              Assignee <span className={styles.requiredStar}>*</span>
            </label>
            <div className={styles.assigneeInputWrapper}>
              <input
                type="text"
                value={assigneeInput}
                onChange={handleAssigneeInput}
                onFocus={() => setShowAssigneeDropdown(true)}
                onBlur={() => setTimeout(() => setShowAssigneeDropdown(false), 200)}
                disabled={!isEditing || permissions.isPendingApproval || permissions.isClosed}
                className={`${styles.textInput} ${isEditing ? styles.editable : ''} ${formErrors.assignee ? styles.error : ''}`}
                placeholder="Enter assignee username"
                aria-label="Assignee"
                required
              />
              {formErrors.assignee && isEditing && (
                <p className={styles.errorText}>Assignee is required</p>
              )}
              {isEditing && !permissions.isPendingApproval && !permissions.isClosed && (
                <button
                  type="button"
                  onClick={assignToMyself}
                  className={styles.assignToMeButton}
                >
                  Assign to me
                </button>
              )}
              {showAssigneeDropdown && assigneeInput && isEditing && (
                <ul className={styles.assigneeDropdown}>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(u => (
                      <li 
                        key={u.username}
                        onClick={() => handleAssigneeSelect(u.username)}
                        className={styles.assigneeOption}
                      >
                        <div className={styles.assigneeAvatar}>
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.assigneeDetails}>
                          <span className={styles.assigneeName}>{u.username}</span>
                          <span className={styles.assigneeRole}>{u.role}</span>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className={styles.noResults}>No matching users found</li>
                  )}
                </ul>
              )}
            </div>
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>
              Estimated Time (0d 0h 0m format)
            </label>
            <input
              name="estimatedTime"
              value={form.estimatedTime}
              onChange={handleChange}
              disabled={!isEditing || permissions.isPendingApproval || permissions.isClosed}
              className={`${styles.textInput} ${isEditing ? styles.editable : ''}`}
              placeholder="e.g. 1d 4h 30m"
              aria-label="Estimated time"
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              disabled={!isEditing || permissions.isPendingApproval || permissions.isClosed}
              className={`${styles.textInput} ${isEditing ? styles.editable : ''}`}
              aria-label="Due date"
            />
          </div>

          {task && (
            <div className={styles.formField}>
              <div className={styles.timeTrackingInfo}>
                <div className={styles.timeTrackingHeader}>
                  <h4>Time Tracking</h4>
                  {permissions.canLogTime && (
                    <button
                      type="button"
                      onClick={() => setShowTimeLoggingModal(true)}
                      className={styles.logTimeButton}
                    >
                      Log Time
                    </button>
                  )}
                </div>
                
                <div className={styles.timeProgressContainer}>
                  <div
                    className={styles.timeProgressBar}
                    style={{
                      width: `${calculateProgress(task.loggedTime, task.estimatedTime)}%`
                    }}
                  />
                </div>
                
                <div className={styles.timeDetails}>
                  <span className={styles.loggedTime}>
                    {formatTime(task.loggedTime || 0)}
                  </span>
                  <span>logged of</span>
                  <span className={styles.estimatedTime}>
                    {task.estimatedTime 
                      ? formatTime(parseEstimatedTime(task.estimatedTime)) 
                      : '0h 0m'} estimated
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Task action buttons */}
          <div className={styles.actionsContainer}>
            {isEditing ? (
              <div className={styles.editActions}>
                <button 
                  type="submit" 
                  className={styles.saveButton}
                  disabled={!isFormValid}
                >
                  Save
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    if (task) {
                      setIsEditing(false);
                      setForm({
                        ...initialFormState,
                        ...task,
                        estimatedTime: task.estimatedTime || '',
                        loggedTime: task.loggedTime || 0,
                      });
                      setAssigneeInput(task.assignee || '');
                    } else {
                      onClose();
                    }
                  }}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                {task && permissions.canMarkAsDone && (
                  <button 
                    type="button" 
                    onClick={() => {
                      onMarkAsDone(task.key);
                      showToast('Task marked as done and sent for approval');
                    }}
                    className={styles.closeTaskButton}
                  >
                    Mark as Done
                  </button>
                )}
                
                {task && permissions.canCloseTask && (
                  <button 
                    type="button" 
                    onClick={handleCloseTask}
                    className={styles.closeTaskButton}
                  >
                    Close Task
                  </button>
                )}
                
                {task && permissions.canApproveOrReopen && (
                  <div className={styles.approvalActions}>
                    <button 
                      type="button" 
                      onClick={handleApprove}
                      className={styles.approveButton}
                    >
                      Approve
                    </button>
                    <button 
                      type="button" 
                      onClick={handleReopen}
                      className={styles.reopenButton}
                    >
                      Reopen
                    </button>
                  </div>
                )}
                
                {task && permissions.canEdit && !permissions.isPendingApproval && !permissions.isClosed && (
                  <button 
                    type="button" 
                    onClick={handleDelete}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        </form>

        {showTimeLoggingModal && (
          <TimeLoggingModal
            onSubmit={handleTimeLog}
            onCancel={() => setShowTimeLoggingModal(false)}
          />
        )}
      </div>
    </div>
  );
} 