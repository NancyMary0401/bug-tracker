"use client";
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../context/UserContext';
import Header from '../../components/Header';
import DashboardStats from '../../components/DashboardStats';
import TaskTrendLine from '../../components/TaskTrendLine';
import SidePanel from './SidePanel';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [activeStatusPopover, setActiveStatusPopover] = useState(null);
  
  // Reference for tracking click outside
  const popoverRef = useRef(null);

  // Define status options for the status popover
  const STATUS_OPTIONS = ['Open', 'In Progress', 'Done', 'Closed'];
  
  // Add click outside handler to close popover
  useEffect(() => {
    function handleClickOutside(event) {
      if (activeStatusPopover && 
          popoverRef.current && 
          !popoverRef.current.contains(event.target)) {
        setActiveStatusPopover(null);
      }
    }
    
    // Add the event listener only when a popover is active
    if (activeStatusPopover) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [activeStatusPopover]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const stored = localStorage.getItem('tasks');
    if (stored) {
      setTasks(JSON.parse(stored));
    }
  }, [user, router]);

  const calculateStats = () => {
    const filteredTasks = tasks.filter(task => {
      if (user?.role?.toLowerCase() === 'developer') {
        return task.assignee === user.username;
      }
      return true;
    });

    const totalBugs = filteredTasks.length;
    const inProgressBugs = filteredTasks.filter(task => task.status === 'In Progress').length;
    const pendingApprovalBugs = filteredTasks.filter(task => task.status === 'Pending Approval').length;
    const approvedBugs = filteredTasks.filter(task => task.status === 'Closed').length;

    // Get recent activity
    const recentActivity = filteredTasks
      .filter(task => task.lastUpdated)
      .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
      .slice(0, 5)
      .map(task => {
        let type = 'update';
        let text = '';

        if (task.status === 'Closed') {
          type = 'resolve';
          text = `${task.key} was resolved by ${task.assignee}`;
        } else if (task.createdAt === task.lastUpdated) {
          type = 'create';
          text = `${task.key} was created by ${task.reporter || task.creator}`;
        } else {
          type = 'comment';
          text = `${task.key} was updated by ${task.assignee}`;
        }

        return {
          type,
          text,
          time: new Date(task.lastUpdated).toLocaleDateString()
        };
      });

    return {
      totalBugs,
      inProgressBugs,
      pendingApprovalBugs,
      approvedBugs,
      recentActivity
    };
  };

  const handleLogout = () => {
    setUser(null);
    router.push('/login');
  };

  const handleCreate = () => {
    setSelectedTask(null);
    setShowSidePanel(true);
  };

  const handleClosePanel = () => {
    setShowSidePanel(false);
    setSelectedTask(null);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowSidePanel(true);
  };

  const notifyTasksUpdated = () => {
    window.dispatchEvent(new Event('tasksUpdated'));
  };

  const handleSubmitTask = (data) => {
    setTasks(prev => {
      let updated;
      if (selectedTask) {
        // Editing existing task
        updated = prev.map(task => 
          task.key === selectedTask.key ? { ...task, ...data } : task
        );
      } else {
        // Creating new task
        const nextKey = `TASK-${prev.length + 1}`;
        const newTask = { 
          ...data, 
          key: nextKey,
          creator: user.username,
          createdAt: new Date().toISOString()
        };
        updated = [...prev, newTask];
      }
      localStorage.setItem('tasks', JSON.stringify(updated));
      return updated;
    });

    setShowSidePanel(false);
    setSelectedTask(null);
  };

  // Effect to notify task updates
  useEffect(() => {
    window.dispatchEvent(new Event('tasksUpdated'));
  }, [tasks]);

  const handleDeleteTask = (taskKey) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => {
        const updated = prev.filter(task => task.key !== taskKey);
        localStorage.setItem('tasks', JSON.stringify(updated));
        return updated;
      });
      setShowSidePanel(false);
      setSelectedTask(null);
    }
  };

  const handleMarkAsDone = (taskKey) => {
    setTasks(prev => {
      const updated = prev.map(task => 
        task.key === taskKey 
          ? { ...task, status: 'Pending Approval', previousStatus: task.status }
          : task
      );
      localStorage.setItem('tasks', JSON.stringify(updated));
      return updated;
    });
    setShowSidePanel(false);
    setSelectedTask(null);
  };

  const handleApproveTask = (taskKey) => {
    setTasks(prev => {
      const updated = prev.map(task => 
        task.key === taskKey ? { ...task, status: 'Closed' } : task
      );
      localStorage.setItem('tasks', JSON.stringify(updated));
      return updated;
    });
  };

  const handleReopenTask = (taskKey) => {
    setTasks(prev => {
      const updated = prev.map(task => 
        task.key === taskKey 
          ? { ...task, status: task.previousStatus || 'Open' }
          : task
      );
      localStorage.setItem('tasks', JSON.stringify(updated));
      return updated;
    });
  };

  const handleLogTime = (taskKey, newLoggedTime) => {
    setTasks(prev => {
      const updated = prev.map(task => 
        task.key === taskKey 
          ? { 
              ...task, 
              loggedTime: newLoggedTime,
              lastUpdated: new Date().toISOString()
            } 
          : task
      );
      localStorage.setItem('tasks', JSON.stringify(updated));
      return updated;
    });
    
    // Update the selected task if it's currently being viewed
    if (selectedTask && selectedTask.key === taskKey) {
      setSelectedTask(prev => ({
        ...prev,
        loggedTime: newLoggedTime,
        lastUpdated: new Date().toISOString()
      }));
    }
  };

  const handleStatsFilter = ({ status, type }) => {
    setFilterStatus(status);
    setFilterType(type);
    setFilterPriority('all'); // Reset priority filter when clicking stats
  };

  // Update the filter logic
  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    const typeMatch = filterType === 'all' || task.type === filterType;
    const roleMatch = user?.role?.toLowerCase() === 'developer' 
      ? task.assignee === user.username
      : true;
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

  // Add formatTime helper function
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

  // Add parseEstimatedTime helper function
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

  // Function to check if user can update status
  const canUpdateStatus = (task) => {
    const isManager = user?.role?.toLowerCase() === 'manager';
    const isAssignee = task.assignee === user?.username;
    const isPendingApproval = task.status === 'Pending Approval';
    const isClosed = task.status === 'Closed';
    
    // Only managers can approve tasks that are pending approval
    if (isPendingApproval) {
      return isManager;
    }
    
    // No one can update closed tasks
    if (isClosed) {
      return false;
    }
    
    // In other cases, either manager or assignee can change status
    return isManager || isAssignee;
  };
  
  // Function to handle status change
  const handleStatusChange = (taskKey, newStatus) => {
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.key === taskKey) {
          // If the new status is 'Done', change it to 'Pending Approval'
          if (newStatus === 'Done') {
            return { 
              ...t, 
              status: 'Pending Approval', 
              previousStatus: t.status, 
              lastUpdated: new Date().toISOString()
            };
          }
          
          // For other statuses, apply them directly
          return { 
            ...t, 
            status: newStatus, 
            lastUpdated: new Date().toISOString() 
          };
        }
        return t;
      });
      localStorage.setItem('tasks', JSON.stringify(updated));
      return updated;
    });
    setActiveStatusPopover(null);
  };

  // Add calculateProgress helper function
  const calculateProgress = (loggedTime, estimatedTime) => {
    if (!estimatedTime) return 0;
    
    // Parse estimatedTime if it's a string
    let estimatedMinutes;
    if (typeof estimatedTime === 'string') {
      estimatedMinutes = parseEstimatedTime(estimatedTime);
    } else {
      estimatedMinutes = estimatedTime;
    }
    
    if (estimatedMinutes === 0) return 0;
    
    // Ensure loggedTime is properly parsed to minutes
    let loggedMinutes;
    if (typeof loggedTime === 'string') {
      loggedMinutes = parseEstimatedTime(loggedTime);
    } else {
      loggedMinutes = loggedTime || 0;
    }
    
    return Math.min(100, (loggedMinutes / estimatedMinutes) * 100);
  };

  if (!user) {
    return null;
  }

  return (
    <div className={styles.dashboardContainer}>
      <Header onLogout={handleLogout} onCreate={handleCreate} />
      <div className={styles.dashboardTopSection}>
        <DashboardStats stats={calculateStats()} onFilterChange={handleStatsFilter} />
        {tasks.length > 0 && (
          <div className={styles.trendLineSection}>
            <h2 className={styles.sectionTitle}>Task Trend</h2>
            <TaskTrendLine tasks={tasks} role={user.role} username={user.username} />
          </div>
        )}
      </div>
      <div className={styles.taskOverviewSection}>
        <div className={styles.taskOverviewHeader}>
          <h2 className={styles.taskOverviewHeading}>Task Overview</h2>
        </div>
        <div className={styles.filterSection}>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
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
            onChange={(e) => setFilterPriority(e.target.value)}
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
            onChange={(e) => setFilterType(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Types</option>
            <option value="Bug">Bug</option>
            <option value="Task">Task</option>
            <option value="Feature">Feature</option>
          </select>
        </div>
      </div>
      
      <div className={styles.taskListContainer}>
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
                  setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortField('title');
                  setSortOrder('asc');
                }
              }}>
                Title {sortField === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
              </div>
              <div className={styles.taskColumnKey}>ID</div>
              <div className={styles.taskColumnPriority} onClick={() => {
                if (sortField === 'priority') {
                  setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortField('priority');
                  setSortOrder('asc');
                }
              }}>
                Priority {sortField === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
              </div>
              <div className={styles.taskColumnStatus} onClick={() => {
                if (sortField === 'status') {
                  setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortField('status');
                  setSortOrder('asc');
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
                <div className={styles.taskColumnPriority}>
                  <div className={`${styles.priorityBadge} ${styles[task.priority?.toLowerCase() || 'priority']}`}>
                    {task.priority}
                  </div>
                </div>
                <div className={styles.taskColumnStatus}>
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
                    >
                      {task.status}
                      {canUpdateStatus(task) && <span className={styles.statusCaret}>▼</span>}
                    </div>
                    
                    {activeStatusPopover === task.key && (
                      <div className={styles.statusPopover}>
                        {user?.role?.toLowerCase() === 'manager' && task.status === 'Pending Approval' ? (
                          // Manager options for pending approval tasks
                          <>
                            <div 
                              className={styles.statusOption}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApproveTask(task.key);
                              }}
                            >
                              Approve & Close
                            </div>
                            <div 
                              className={styles.statusOption}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReopenTask(task.key);
                              }}
                            >
                              Reject & Reopen
                            </div>
                          </>
                        ) : (
                          // Regular options for other task statuses
                          STATUS_OPTIONS.filter(status => 
                            // Don't show 'Done' or 'Closed' in the dropdown
                            status !== 'Done' && status !== 'Closed'
                          ).map(status => (
                            <div 
                              key={status} 
                              className={styles.statusOption}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(task.key, status);
                              }}
                            >
                              {status}
                            </div>
                          ))
                        )}
                        {/* Add "Mark as Done" option for tasks that are not Pending Approval or Closed */}
                        {task.status !== 'Pending Approval' && task.status !== 'Closed' && (
                          <div 
                            className={styles.statusOption}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(task.key, 'Done');
                            }}
                          >
                            Mark as Done
                          </div>
                        )}
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
                      handleTaskClick(task);
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
      </div>

      {showSidePanel && (
        <SidePanel 
          onClose={handleClosePanel} 
          onSubmit={handleSubmitTask}
          onDelete={handleDeleteTask}
          onMarkAsDone={handleMarkAsDone}
          onApprove={handleApproveTask}
          onReopen={handleReopenTask}
          onLogTime={handleLogTime}
          task={selectedTask}
        />
      )}
    </div>
  );
}
