/*
 * This component has been replaced with react-hot-toast library.
 * See implementation in SidePanel.js and other components using toast notifications.
 * This file is kept for reference but no longer used in the application.
 */

/*
"use client";
import React, { useEffect } from 'react';
import styles from './Toast.module.css';

const Toast = ({ show, message, type = 'success', onHide }) => {
  useEffect(() => {
    if (show) {
      console.log('Toast shown:', { message, type });
      const timer = setTimeout(() => {
        if (onHide) onHide();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onHide, message, type]);

  if (!show) return null;

  return (
    <div className={`${styles.toast} ${styles[type]}`} style={{ zIndex: 9999 }}>
      <div className={styles.toastContent}>
        {type === 'success' && (
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {type === 'error' && (
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {type === 'info' && (
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {message}
      </div>
      <button 
        onClick={onHide ? onHide : undefined}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          padding: '4px'
        }}
        aria-label="Close notification"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};

export default Toast; 
*/ 