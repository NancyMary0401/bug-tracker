"use client";
import { useState, useEffect, lazy, Suspense,useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../context/UserContext';
import Header from '../common/Header';
import DashboardStats from './DashboardStats';
import TaskTrendLine from './TaskTrendLine';
import SidePanel from './SidePanel';
import styles from './Dashboard.module.css';

const TaskTable = lazy(() => import('./TaskTable'));

export default function DashboardContent() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [activeStatusPopover, setActiveStatusPopover] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  
  const popoverRef = useRef(null);

  const STATUS_OPTIONS = ['Open', 'In Progress', 'Closed'];
  
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
    if (!user?.username) return {
      totalBugs: 0,
      inProgressBugs: 0,
      pendingApprovalBugs: 0,
      approvedBugs: 0,
      recentActivity: []
    };

    const filteredTasks = tasks.filter(task => {
      if (user?.role?.toLowerCase() === 'manager') {
        return true;
      }
      return task.assignee === user.username;
    });

    const totalBugs = filteredTasks.length;
    const inProgressBugs = filteredTasks.filter(task => task.status === 'In Progress').length;
    const pendingApprovalBugs = filteredTasks.filter(task => task.status === 'Pending Approval').length;
    const approvedBugs = filteredTasks.filter(task => task.status === 'Closed').length;

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
    setTasks([]);
    setSelectedTask(null);
    setShowSidePanel(false);
    setActiveStatusPopover(null);
    
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
        updated = prev.map(task => 
          task.key === selectedTask.key ? { ...task, ...data } : task
        );
      } else {
        const highestId = prev.reduce((max, task) => {
          const idNumber = parseInt(task.key.split('-')[1]);
          return isNaN(idNumber) ? max : Math.max(max, idNumber);
        }, 0);
        
        const nextKey = `TASK-${highestId + 1}`;
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

  useEffect(() => {
    window.dispatchEvent(new Event('tasksUpdated'));
  }, [tasks]);

  const handleDeleteTask = (taskKey) => {
    setTaskToDelete(taskKey);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTask = () => {
    if (taskToDelete) {
      setTasks(prev => {
        const updated = prev.filter(task => task.key !== taskToDelete);
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
          ? { 
              ...task, 
              status: 'Pending Approval', 
              previousStatus: task.status,
              closeReason: 'Task completed',
              lastUpdated: new Date().toISOString()
            }
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
      const updated = prev.map(t => {
        if (t.key === taskKey) {
          return { ...t, status: 'Closed' };
        }
        return t;
      });
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
    setFilterPriority('all');
  };

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
  
  const handleStatusChange = (taskKey, newStatus) => {
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.key === taskKey) {
          if (newStatus === 'Done' || newStatus === 'Close') {
            return { 
              ...t, 
              status: 'Pending Approval', 
              previousStatus: t.status, 
              lastUpdated: new Date().toISOString(),
              closeReason: newStatus === 'Close' ? 'Closed without completion' : 'Task completed'
            };
          }
          
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
      </div>
      <div className={styles.taskListContainer}>
        <Suspense fallback={
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}>Loading...</div>
          </div>
        }>
          <TaskTable 
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onStatusChange={handleStatusChange}
            onApproveTask={handleApproveTask}
            onReopenTask={handleReopenTask}
            user={user}
            filterStatus={filterStatus}
            filterPriority={filterPriority}
            filterType={filterType}
            sortField={sortField}
            sortOrder={sortOrder}
            onSortChange={(field, order) => {
              setSortField(field);
              setSortOrder(order);
            }}
            onFilterChange={(type, value) => {
              switch(type) {
                case 'status':
                  setFilterStatus(value);
                  break;
                case 'priority':
                  setFilterPriority(value);
                  break;
                case 'type':
                  setFilterType(value);
                  break;
              }
            }}
          />
        </Suspense>
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