import React, { useEffect, useState } from 'react';
import styles from './Toast.module.css';

const Toast = ({ message, type = 'success', duration = 3000 }) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration]);
  
  if (!visible) return null;
  
  const icons = {
    success: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="currentColor"/>
      </svg>
    ),
    error: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="currentColor"/>
      </svg>
    ),
    warning: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.61803 17.5H18.382C19.4394 17.5 20.0802 16.214 19.5511 15.3153L11.1691 1.5307C10.6399 0.631996 9.36015 0.631996 8.83093 1.5307L0.44886 15.3153C-0.0801954 16.214 0.560633 17.5 1.61803 17.5ZM10 11C9.44772 11 9 10.5523 9 10V8C9 7.44772 9.44772 7 10 7C10.5523 7 11 7.44772 11 8V10C11 10.5523 10.5523 11 10 11ZM11 15H9V13H11V15Z" fill="currentColor"/>
      </svg>
    ),
    info: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V9H11V15ZM11 7H9V5H11V7Z" fill="currentColor"/>
      </svg>
    )
  };
  
  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.icon}>
        {icons[type]}
      </div>
      <div className={styles.message}>{message}</div>
    </div>
  );
};

export default Toast; 