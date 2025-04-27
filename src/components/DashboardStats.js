import React from 'react';
import styles from '../app/dashboard/Dashboard.module.css';

export default function DashboardStats() {
  return (
    <div className={styles.dashboardStats}>
      <div className={`${styles.statBox} ${styles.totalIssues}`}>
        <h2>Total Issues</h2>
        <p>123</p>
      </div>
      <div className={`${styles.statBox} ${styles.inProgress}`}>
        <h2>In Progress</h2>
        <p>45</p>
      </div>
      <div className={`${styles.statBox} ${styles.bugsClosed}`}>
        <h2>Bugs Closed/Pending</h2>
        <p>67</p>
      </div>
      <div className={`${styles.statBox} ${styles.approvedBugs}`}>
        <h2>Approved Bugs</h2>
        <p>89</p>
      </div>
    </div>
  );
} 