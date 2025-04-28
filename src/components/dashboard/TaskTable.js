"use client";
import { useState, useRef, useEffect } from 'react';
import styles from './Dashboard.module.css';

// Add status icons
const STATUS_ICONS = {
  'Open': '🔵',
  'In Progress': '🔄',
  'Pending Approval': '⏳',
  'Closed': '✅',
  'Done': '✨'
};

export default function TaskTable({ 
  tasks, 
  onTaskClick, 
  onStatusChange, 
  onApproveTask, 
  onReopenTask,
  user,
  filterStatus,
  filterPriority,
  filterType,
  sortField,
  sortOrder,
  onSortChange,
  onFilterChange
}) {
  const [activeStatusPopover, setActiveStatusPopover] = useState(null);
  
  // Reference for tracking click outside
  const popoverRef = useRef(null);

  // Define status options for the status popover
  const STATUS_OPTIONS = ['Open', 'In Progress'];

  // Add click outside handler to close popover
  useEffect(() => {
    function handleClickOutside(event) {
      if (activeStatusPopover && 
          popoverRef.current && 
          !popoverRef.current.contains(event.target)) {
        setActiveStatusPopover(null);
      }
    }
    
    if (activeStatusPopover) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [activeStatusPopover]);

  // Helper functions
  const formatTime = (minutes) => {
    if (!minutes) return '0h 0m';
    
    const days = Math.floor(minutes / (24 * 60));
    const remainingMinutes = minutes % (24 * 60);
    const hours = Math.floor(remainingMinutes / 60);
    const mins = remainingMinutes % 60;
    
    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0 || days > 0) result += `${hours}h `;
    result += `${mins}m`;
    
    return result;
  };

  const parseEstimatedTime = (timeStr) => {
    if (!timeStr) return 0;
    
    let normalizedStr = timeStr.trim().replace(/(\d+)([dhm])/gi, '$1 $2');
    
    const matches = normalizedStr.match(/(\d+)\s*d(?:ays?)?\s*(?:(\d+)\s*h(?:ours?)?)?\s*(?:(\d+)\s*m(?:inutes?)?)?/i);
    
    if (matches) {
      const days = parseInt(matches[1]) || 0;
      const hours = parseInt(matches[2]) || 0;
      const minutes = parseInt(matches[3]) || 0;
      return (days * 24 * 60) + (hours * 60) + minutes;
    }
    
    const hoursMinMatches = normalizedStr.match(/(\d+)\s*h(?:ours?)?\s*(?:(\d+)\s*m(?:inutes?)?)?/i);
    if (hoursMinMatches) {
      const hours = parseInt(hoursMinMatches[1]) || 0;
      const minutes = parseInt(hoursMinMatches[2]) || 0;
      return (hours * 60) + minutes;
    }
    
    const minMatches = normalizedStr.match(/(\d+)\s*m(?:inutes?)?/i);
    if (minMatches) {
      return parseInt(minMatches[1]) || 0;
    }
    
    if (!isNaN(parseInt(timeStr))) {
      return parseInt(timeStr);
    }
    
    return 0;
  };

  const calculateProgress = (loggedTime, estimatedTime) => {
    if (!estimatedTime) return 0;
    
    let estimatedMinutes;
    if (typeof estimatedTime === 'string') {
      estimatedMinutes = parseEstimatedTime(estimatedTime);
    } else {
      estimatedMinutes = estimatedTime;
    }
    
    if (estimatedMinutes === 0) return 0;
    
    let loggedMinutes;
    if (typeof loggedTime === 'string') {
      loggedMinutes = parseEstimatedTime(loggedTime);
    } else {
      loggedMinutes = loggedTime || 0;
    }
    
    return Math.min(100, (loggedMinutes / estimatedMinutes) * 100);
  };

  const canUpdateStatus = (task) => {
    const isManager = user?.role?.toLowerCase() === 'manager';
    const isAssignee = task.assignee === user?.username;
    const isPendingApproval = task.status === 'Pending Approval';
    const isClosed = task.status === 'Closed';
    
    if (isPendingApproval) {
      return isManager;
    }
    
    if (isClosed) {
      return false;
    }
    
    return isManager || isAssignee;
  };

  const getStatusOptions = (task) => {
    const isManager = user?.role?.toLowerCase() === 'manager';
    
    if (task.status === 'Pending Approval') {
      if (isManager) {
        return [
          { label: 'Approve & Close', action: () => onApproveTask(task.key) },
          { label: 'Reject & Reopen', action: () => onReopenTask(task.key) }
        ];
      }
      return [];
    }
    
    if (task.status === 'Closed') {
      return [];
    }
    
    const options = STATUS_OPTIONS.map(status => ({
      label: status,
      action: () => onStatusChange(task.key, status)
    }));
    
    if (task.status !== 'Pending Approval') {
      options.push(
        { label: 'Mark as Done', action: () => onStatusChange(task.key, 'Done') },
        { label: 'Close Task', action: () => onStatusChange(task.key, 'Close') }
      );
    }
    
    return options;
  };

  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    if (!user?.username) return false;
    
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    const typeMatch = filterType === 'all' || task.type === filterType;
    const roleMatch = user?.role?.toLowerCase() === 'manager' 
      ? true 
      : task.assignee === user.username;
    return statusMatch && priorityMatch && typeMatch && roleMatch;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField];
    const bValue = b[sortField];
    return sortOrder === 'asc' 
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  return (
    <>
      <div className={styles.filterSection}>
        <select 
          value={filterStatus} 
          onChange={(e) => onFilterChange('status', e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Pending Approval">Pending Approval</option>
          <option value="Closed">Closed</option>
        </select>
        <select 
          value={filterPriority} 
          onChange={(e) => onFilterChange('priority', e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
        <select 
          value={filterType} 
          onChange={(e) => onFilterChange('type', e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Types</option>
          <option value="Bug">Bug</option>
          <option value="Task">Task</option>
          <option value="Feature">Feature</option>
        </select>
      </div>
      {sortedTasks.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>🔍</div>
          <h3>No tasks found</h3>
          <p>Try adjusting your filters or create a new task</p>
        </div>
      ) : (
        <div className={styles.taskList}>
          <div className={styles.taskListHeader}>
            <div className={styles.taskColumnTitle} onClick={() => {
              if (sortField === 'title') {
                onSortChange('title', sortOrder === 'asc' ? 'desc' : 'asc');
              } else {
                onSortChange('title', 'asc');
              }
            }}>
              Title {sortField === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
            </div>
            <div className={styles.taskColumnKey}>ID</div>
            <div className={styles.taskColumnPriority + ' ' + styles.mobileShow} onClick={() => {
              if (sortField === 'priority') {
                onSortChange('priority', sortOrder === 'asc' ? 'desc' : 'asc');
              } else {
                onSortChange('priority', 'asc');
              }
            }}>
              Priority {sortField === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
            </div>
            <div className={styles.taskColumnStatus + ' ' + styles.desktopShow} onClick={() => {
              if (sortField === 'status') {
                onSortChange('status', sortOrder === 'asc' ? 'desc' : 'asc');
              } else {
                onSortChange('status', 'asc');
              }
            }}>
              Status {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
            </div>
            <div className={styles.taskColumnAssignee}>Assignee</div>
            <div className={styles.taskColumnTime}>Time Tracking</div>
            <div className={styles.taskColumnActions}>Actions</div>
          </div>
          
          {sortedTasks.map((task) => (
            <div key={task.key} className={styles.taskCard} onClick={(e) => e.stopPropagation()}>
              <div className={styles.taskColumnTitle} title={task.title}>
                <div className={styles.taskTitleWrapper}>
                  <span className={styles.taskTypeIcon}>
                    {task.type === 'Bug' ? '🐞' : task.type === 'Feature' ? '✨' : '📋'}
                  </span>
                  {task.title}
                </div>
              </div>
              <div className={styles.taskColumnKey}>
                <div className={styles.taskKey}>{task.key}</div>
              </div>
              <div className={styles.taskColumnPriority + ' ' + styles.mobileShow}>
                <div className={`${styles.priorityBadge} ${styles[task.priority?.toLowerCase() || 'priority']}`}>
                  {task.priority}
                </div>
              </div>
              <div className={styles.taskColumnStatus + ' ' + styles.desktopShow}>
                <div 
                  className={styles.statusPopoverWrapper} 
                  ref={activeStatusPopover === task.key ? popoverRef : null}
                >
                  <div 
                    className={`${styles.statusBadge} ${styles[task.status?.toLowerCase().replace(/\s/g,'') || 'status']}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (canUpdateStatus(task)) {
                        setActiveStatusPopover(activeStatusPopover === task.key ? null : task.key);
                      }
                    }}
                    title={task.status === 'Pending Approval' && task.closeReason ? `${task.status} - ${task.closeReason}` : task.status}
                  >
                    {task.status}
                    {canUpdateStatus(task) && <span className={styles.statusCaret}>▼</span>}
                  </div>
                  
                  {activeStatusPopover === task.key && (
                    <div className={styles.statusPopover}>
                      {getStatusOptions(task).map((option, index) => (
                        <div 
                          key={index}
                          className={styles.statusOption}
                          onClick={(e) => {
                            e.stopPropagation();
                            option.action();
                            setActiveStatusPopover(null);
                          }}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.taskColumnAssignee}>
                <div className={styles.assigneeAvatar}>
                  {task.assignee ? task.assignee.charAt(0).toUpperCase() : '-'}
                </div>
                <span className={styles.assigneeName}>{task.assignee || 'Unassigned'}</span>
              </div>
              <div className={styles.taskColumnTime}>
                <div className={styles.timeTracking}>
                  <div className={styles.timeProgressContainer}>
                    {task.estimatedTime && (
                      <div 
                        className={styles.timeProgressBar}
                        style={{
                          width: `${calculateProgress(task.loggedTime, task.estimatedTime)}%`
                        }}
                      />
                    )}
                  </div>
                  <div className={styles.timeDetails}>
                    <span>{formatTime(task.loggedTime || 0)}</span>
                    {task.estimatedTime && (
                      <span className={styles.estimatedTime}>/ {formatTime(parseEstimatedTime(task.estimatedTime))}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.taskColumnActions}>
                <button 
                  className={styles.editTaskButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick(task);
                  }}
                  title="Edit Task"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 2L14 6M13 7L7 13H3V9L9 3L13 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className={styles.editButtonText}>Edit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
} 