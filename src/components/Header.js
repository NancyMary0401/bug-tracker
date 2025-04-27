"use client";
import React, { useState } from 'react';
import styles from './Header.module.css';
import { useUser } from '../context/UserContext';

const Header = ({ onLogout, onCreate }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user } = useUser();
  
  // Get initials from username
  const userInitials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'NN';

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

        <nav className={styles.navigation}>
          {user?.role && (
            <div className={styles.userRole}>
              <svg className={styles.roleIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{user.role}</span>
            </div>
          )}

          <button className={styles.createButton} onClick={onCreate}>
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>New Task</span>
          </button>

          <div className={styles.profileSection}>
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
                  {user?.email && <div className={styles.userEmail}>{user.email}</div>}
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