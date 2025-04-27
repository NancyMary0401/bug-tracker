import React, { useState } from 'react';
import styles from './TimeLoggingModal.module.css';

const TimeLoggingModal = ({ onSubmit, onCancel }) => {
  const [days, setDays] = useState('0');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Ensure values are valid numbers
    const daysValue = parseInt(days) || 0;
    const hoursValue = parseInt(hours) || 0;
    const minutesValue = parseInt(minutes) || 0;
    
    // Convert all to minutes
    const totalMinutes = (daysValue * 24 * 60) + (hoursValue * 60) + minutesValue;
    
    onSubmit(totalMinutes);
    setDays('0');
    setHours('0');
    setMinutes('0');
    setDescription('');
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Log Time</h2>
          <button className={styles.closeButton} onClick={onCancel}>
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.timeInputGroup}>
            <div className={styles.formGroup}>
              <label htmlFor="days">Days</label>
              <input
                type="number"
                id="days"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                min="0"
                className={styles.input}
                required
                placeholder="Days"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="hours">Hours</label>
              <input
                type="number"
                id="hours"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                min="0"
                max="23"
                className={styles.input}
                required
                placeholder="Hours"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="minutes">Minutes</label>
              <input
                type="number"
                id="minutes"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                min="0"
                max="59"
                className={styles.input}
                required
                placeholder="Minutes"
              />
            </div>
          </div>

          <div className={styles.timePreview}>
            Time to log: {days !== '0' ? `${days}d ` : ''}
            {hours !== '0' ? `${hours}h ` : ''}
            {minutes !== '0' ? `${minutes}m` : minutes === '0' && hours === '0' && days === '0' ? '0m' : ''}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
              required
              placeholder="What did you work on?"
              rows="4"
            />
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.secondaryButton} onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryButton}>
              Log Time
              <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimeLoggingModal; 