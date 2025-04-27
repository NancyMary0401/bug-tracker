"use client";
import styles from './Header.module.css';
import { useState } from 'react';
import { useUser } from '../context/UserContext';

export default function Header({ onLogout, onCreate }) {
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const { user } = useUser();
  
  // Get initials from username
  const userInitials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'NN';

  const toggleProfileDetails = () => {
    setShowProfileDetails(!showProfileDetails);
  };

  return (
    <header className={styles.header}>
      <div className={styles.appName}>BTrack </div>
      <button className={styles.createButton} onClick={onCreate}>Create</button>
      <div className={styles.profile}>
        <div className={styles.profileIcon} onClick={toggleProfileDetails}>
          {userInitials}
        </div>
        <button className={styles.logoutButton} onClick={onLogout}>Logout</button>
        {showProfileDetails && (
          <div className={styles.profileDropdown}>
            <p>{user ? `${user.username} (${user.role})` : 'Guest'}</p>
          </div>
        )}
      </div>
    </header>
  );
} 