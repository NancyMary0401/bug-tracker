import React, { useEffect, useState } from 'react';
import styles from '../app/dashboard/Dashboard.module.css';
import { useUser } from '../context/UserContext';

export default function DashboardStats({ onFilterChange }) {
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalIssues: 0,
    inProgress: 0,
    bugsPending: 0,
    approvedBugs: 0
  });

  useEffect(() => {
    const calculateStats = () => {
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const isManager = user?.role?.toLowerCase() === 'manager';
      
      // Filter tasks based on user role
      const filteredTasks = isManager 
        ? tasks 
        : tasks.filter(task => task.assignee === user?.username);

      const newStats = {
        totalIssues: filteredTasks.length,
        inProgress: filteredTasks.filter(task => task.status === 'In Progress').length,
        bugsPending: filteredTasks.filter(task => 
          task.type === 'Bug' && task.status === 'Pending Approval'
        ).length,
        approvedBugs: filteredTasks.filter(task => 
          task.type === 'Bug' && task.status === 'Closed'
        ).length
      };

      setStats(newStats);
    };

    // Calculate initial stats
    calculateStats();

    // Set up event listener for localStorage changes
    const handleStorageChange = () => {
      calculateStats();
    };

    window.addEventListener('storage', handleStorageChange);

    // Custom event for local updates
    window.addEventListener('tasksUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tasksUpdated', handleStorageChange);
    };
  }, [user]);

  const handleStatClick = (filterType) => {
    switch (filterType) {
      case 'total':
        onFilterChange({ status: 'all', type: 'all' });
        break;
      case 'inProgress':
        onFilterChange({ status: 'In Progress', type: 'all' });
        break;
      case 'bugsPending':
        onFilterChange({ status: 'Pending Approval', type: 'Bug' });
        break;
      case 'approvedBugs':
        onFilterChange({ status: 'Closed', type: 'Bug' });
        break;
    }
  };

  return (
    <div className={styles.dashboardStats}>
      <div 
        className={`${styles.statBox} ${styles.totalIssues}`}
        onClick={() => handleStatClick('total')}
        role="button"
        tabIndex={0}
      >
        <h2>Total Issues</h2>
        <p>{stats.totalIssues}</p>
      </div>
      <div 
        className={`${styles.statBox} ${styles.inProgress}`}
        onClick={() => handleStatClick('inProgress')}
        role="button"
        tabIndex={0}
      >
        <h2>In Progress</h2>
        <p>{stats.inProgress}</p>
      </div>
      <div 
        className={`${styles.statBox} ${styles.bugsClosed}`}
        onClick={() => handleStatClick('bugsPending')}
        role="button"
        tabIndex={0}
      >
        <h2>Bugs Pending</h2>
        <p>{stats.bugsPending}</p>
      </div>
      <div 
        className={`${styles.statBox} ${styles.approvedBugs}`}
        onClick={() => handleStatClick('approvedBugs')}
        role="button"
        tabIndex={0}
      >
        <h2>Approved Bugs</h2>
        <p>{stats.approvedBugs}</p>
      </div>
    </div>
  );
} 