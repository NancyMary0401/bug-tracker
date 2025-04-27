import React, { useState } from 'react';
import styles from './TimeLoggingModal.module.css';

export default function TimeLoggingModal({ onClose, onSubmit, currentLoggedTime = 0, estimatedTime = 0 }) {
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');

  const handleSubmit = (e) => {
    e.preventDefault();
    const timeInMinutes = parseInt(hours) * 60 + parseInt(minutes);
    onSubmit(timeInMinutes);
  };

  const formatTime = (totalMinutes) => {
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        <h2>Log Time</h2>
        
        <div className={styles.timeInfo}>
          <div>
            <span>Estimated Time:</span>
            <strong>{estimatedTime > 0 ? formatTime(estimatedTime) : 'Not set'}</strong>
          </div>
          <div>
            <span>Time Logged:</span>
            <strong>{formatTime(currentLoggedTime)}</strong>
          </div>
          {estimatedTime > 0 && (
            <div>
              <span>Remaining Time:</span>
              <strong>{formatTime(Math.max(0, estimatedTime - currentLoggedTime))}</strong>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.timeInputs}>
            <div className={styles.inputGroup}>
              <label>Hours</label>
              <input
                type="number"
                min="0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className={styles.timeInput}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Minutes</label>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className={styles.timeInput}
              />
            </div>
          </div>

          <div className={styles.buttons}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Log Time
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 