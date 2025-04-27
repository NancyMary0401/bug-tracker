import React from 'react';
import styles from './DashboardStats.module.css';

const DashboardStats = ({ stats = {}, onFilterChange }) => {
  const {
    totalBugs = 0,
    inProgressBugs = 0,
    pendingApprovalBugs = 0,
    approvedBugs = 0,
    recentActivity = [],
  } = stats;

  const handleCardClick = (status, type = 'Bug') => {
    if (onFilterChange) {
      onFilterChange({ status, type });
    }
  };

  return (
    <div className={styles.dashboard}>
      <h2 className={styles.dashboardTitle}>Dashboard Statistics</h2>
      <div className={styles.statsGrid}>
        <div 
          className={styles.statCard} 
          onClick={() => handleCardClick('all', 'all')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.statHeader}>
            <h3>Total Issues</h3>
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className={styles.statValue}>{totalBugs}</p>
          <div className={styles.statFooter}>
            <span className={styles.label}>All Issues</span>
          </div>
        </div>

        <div 
          className={styles.statCard} 
          onClick={() => handleCardClick('In Progress')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.statHeader}>
            <h3>In Progress</h3>
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className={styles.statValue}>{inProgressBugs}</p>
          <div className={styles.statFooter}>
            <span className={`${styles.badge} ${styles.badgeWarning}`}>In Progress</span>
          </div>
        </div>

        <div 
          className={styles.statCard} 
          onClick={() => handleCardClick('Pending Approval')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.statHeader}>
            <h3>Pending Approval</h3>
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className={styles.statValue}>{pendingApprovalBugs}</p>
          <div className={styles.statFooter}>
            <span className={`${styles.badge} ${styles.badgeInfo}`}>Awaiting Approval</span>
          </div>
        </div>

        <div 
          className={styles.statCard} 
          onClick={() => handleCardClick('Closed')}
          role="button"
          tabIndex={0}
        >
          <div className={styles.statHeader}>
            <h3>Approved</h3>
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className={styles.statValue}>{approvedBugs}</p>
          <div className={styles.statFooter}>
            <span className={`${styles.badge} ${styles.badgeSuccess}`}>Approved</span>
          </div>
        </div>
      </div>

      <div className={styles.recentActivity}>
        <h3 className={styles.sectionTitle}>Recent Activity</h3>
        <div className={styles.activityList}>
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={index} className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  {activity.type === 'create' && (
                    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {activity.type === 'resolve' && (
                    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {activity.type === 'comment' && (
                    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className={styles.activityContent}>
                  <p className={styles.activityText}>{activity.text}</p>
                  <span className={styles.activityTime}>{activity.time}</span>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats; 