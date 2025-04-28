/**
 * Format a date to a readable string
 * @param {Date|string|number} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj);
}

/**
 * Format a date to a time string
 * @param {Date|string|number} date - The date to format
 * @returns {string} Formatted time string
 */
export function formatTime(date) {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Calculate the difference between two dates in days
 * @param {Date|string|number} dateA - First date
 * @param {Date|string|number} dateB - Second date
 * @returns {number} Difference in days
 */
export function daysBetween(dateA, dateB) {
  const date1 = dateA instanceof Date ? dateA : new Date(dateA);
  const date2 = dateB instanceof Date ? dateB : new Date(dateB);
  
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Check if a date is in the past
 * @param {Date|string|number} date - The date to check
 * @returns {boolean} True if the date is in the past
 */
export function isInPast(date) {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj < new Date();
}

/**
 * Get a relative time string (e.g., "2 days ago", "in 3 hours")
 * @param {Date|string|number} date - The date to format
 * @returns {string} Relative time string
 */
export function getRelativeTimeString(date) {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  return new Intl.RelativeTimeFormat('en', { 
    numeric: 'auto' 
  }).format(
    getRelativeTime(dateObj),
    getRelativeTimeUnit(dateObj)
  );
}

/**
 * Helper function for getRelativeTimeString
 * @private
 */
function getRelativeTime(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((date - now) / 1000);
  
  return diffInSeconds;
}

/**
 * Helper function for getRelativeTimeString
 * @private
 */
function getRelativeTimeUnit(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((date - now) / 1000);
  const absSeconds = Math.abs(diffInSeconds);
  
  if (absSeconds < 60) return 'seconds';
  if (absSeconds < 3600) return 'minutes';
  if (absSeconds < 86400) return 'hours';
  if (absSeconds < 2592000) return 'days';
  if (absSeconds < 31536000) return 'months';
  return 'years';
} 