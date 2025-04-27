"use client";
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
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
      notifyTasksUpdated();
      return updated;
    });
    setShowSidePanel(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = (taskKey) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => {
        const updated = prev.filter(task => task.key !== taskKey);
        localStorage.setItem('tasks', JSON.stringify(updated));
        notifyTasksUpdated();
        return updated;
      });
      setShowSidePanel(false);
      setSelectedTask(null);
    }
  };

  const handleCloseTask = (taskKey) => {
    setTasks(prev => {
      const updated = prev.map(task => 
        task.key === taskKey 
          ? { ...task, status: 'Pending Approval', previousStatus: task.status }
          : task
      );
      localStorage.setItem('tasks', JSON.stringify(updated));
      notifyTasksUpdated();
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
      notifyTasksUpdated();
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
      notifyTasksUpdated();
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
      notifyTasksUpdated();
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
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  // Add parseEstimatedTime helper function
  const parseEstimatedTime = (timeStr) => {
    if (!timeStr) return 0;
    const matches = timeStr.match(/(\d+)d\s*(\d+)h\s*(\d+)m/);
    if (!matches) return 0;
    const [_, days, hours, minutes] = matches;
    return (parseInt(days) * 24 * 60) + (parseInt(hours) * 60) + parseInt(minutes);
  };

  if (!user) {
    return null;
  }

  return (
    <div>
      <Header onLogout={handleLogout} onCreate={handleCreate} />
      <DashboardStats onFilterChange={handleStatsFilter} />
      {tasks.length > 0 && (
        <div className={styles.trendLineSection}>
          <TaskTrendLine tasks={tasks} role={user.role} username={user.username} />
        </div>
      )}
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

      <div style={{ marginTop: 32 }}>
        <h2 className={styles.taskOverviewHeading}>Task Overview</h2>
        <div className={styles.taskTableWrapper}>
          <table className={styles.taskTable}>
            <thead>
              <tr>
                <th onClick={() => {
                  if (sortField === 'title') {
                    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('title');
                    setSortOrder('asc');
                  }
                }}>Title {sortField === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th>Key</th>
                <th onClick={() => {
                  if (sortField === 'priority') {
                    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('priority');
                    setSortOrder('asc');
                  }
                }}>Priority {sortField === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => {
                  if (sortField === 'status') {
                    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('status');
                    setSortOrder('asc');
                  }
                }}>Status {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th>Assignee</th>
                <th>Time Tracking</th>
              </tr>
            </thead>
            <tbody>
              {sortedTasks.length === 0 ? (
                <tr><td colSpan={6} style={{textAlign:'center',color:'#888'}}>No tasks found.</td></tr>
              ) : (
                sortedTasks.map((task) => (
                  <tr key={task.key}>
                    <td>{task.title}</td>
                    <td>
                      <button 
                        className={styles.taskKeyLink}
                        onClick={() => handleTaskClick(task)}
                      >
                        {task.key}
                      </button>
                    </td>
                    <td>
                      <span className={styles[task.priority?.toLowerCase() || 'priority']}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      <span className={styles[task.status?.toLowerCase().replace(/\s/g,'') || 'status']}>
                        {task.status}
                      </span>
                    </td>
                    <td>{task.assignee}</td>
                    <td>
                      <div className={styles.timeTracking}>
                        <div className={styles.timeProgress}>
                          {task.estimatedTime && (
                            <div 
                              className={styles.progressBar}
                              style={{
                                width: `${Math.min(100, ((task.loggedTime || 0) / parseEstimatedTime(task.estimatedTime)) * 100)}%`
                              }}
                            />
                          )}
                        </div>
                        <div className={styles.timeDetails}>
                          <span>{formatTime(task.loggedTime || 0)}</span>
                          {task.estimatedTime && (
                            <span>/ {task.estimatedTime}</span>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showSidePanel && (
        <SidePanel 
          onClose={handleClosePanel} 
          onSubmit={handleSubmitTask}
          onDelete={handleDeleteTask}
          onCloseTask={handleCloseTask}
          onApprove={handleApproveTask}
          onReopen={handleReopenTask}
          onLogTime={handleLogTime}
          task={selectedTask}
        />
      )}
    </div>
  );
}
