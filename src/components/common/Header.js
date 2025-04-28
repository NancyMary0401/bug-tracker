"use client";
import React, { useState, useRef, useEffect } from 'react';
import styles from './Header.module.css';
import { useUser } from '../../context/UserContext';

const Header = ({ onLogout, onCreate }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user } = useUser();
  const dropdownRef = useRef(null);
  
  // Get initials from username
  const userInitials = user?.username 
    ? user.username.slice(0, 2).toUpperCase() 
    : 'NN';

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <svg className={styles.logoIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Bug Tracker</span>
          </div>
        </div>

        <nav className={styles.nav}>
          <div className={styles.actions}>
            <button 
              className={styles.createButton}
              onClick={onCreate}
              aria-label="Create new bug report"
            >
              <svg className={styles.createIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Create</span>
            </button>
          </div>

          <div className={styles.profileSection} ref={dropdownRef}>
            <button 
              className={styles.profileButton}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              aria-expanded={isProfileOpen}
              aria-label="User profile menu"
            >
              <div className={styles.avatarInitials}>
                {userInitials}
              </div>
            </button>

            {isProfileOpen && (
              <div className={styles.profileDropdown}>
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{user?.username || 'User'}</div>
                  <div className={styles.userRole}>{user?.role || 'Guest'}</div>
                </div>
                <div className={styles.dropdownMenu}>
                  <button className={styles.dropdownItem} onClick={onLogout}>
                    <svg className={styles.menuIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header; 