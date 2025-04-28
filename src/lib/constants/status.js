/**
 * Bug status constants
 */
export const STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  READY_FOR_REVIEW: 'ready_for_review',
  REVIEW_IN_PROGRESS: 'review_in_progress',
  CLOSED: 'closed',
  REOPENED: 'reopened',
};

/**
 * Bug priority constants
 */
export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

/**
 * Status display names
 */
export const STATUS_DISPLAY = {
  [STATUS.OPEN]: 'Open',
  [STATUS.IN_PROGRESS]: 'In Progress',
  [STATUS.READY_FOR_REVIEW]: 'Ready for Review',
  [STATUS.REVIEW_IN_PROGRESS]: 'Review in Progress',
  [STATUS.CLOSED]: 'Closed',
  [STATUS.REOPENED]: 'Reopened',
};

/**
 * Priority display names
 */
export const PRIORITY_DISPLAY = {
  [PRIORITY.LOW]: 'Low',
  [PRIORITY.MEDIUM]: 'Medium',
  [PRIORITY.HIGH]: 'High',
  [PRIORITY.CRITICAL]: 'Critical',
};

/**
 * Status colors for UI elements
 */
export const STATUS_COLORS = {
  [STATUS.OPEN]: '#1890ff',
  [STATUS.IN_PROGRESS]: '#722ed1',
  [STATUS.READY_FOR_REVIEW]: '#fa8c16',
  [STATUS.REVIEW_IN_PROGRESS]: '#13c2c2',
  [STATUS.CLOSED]: '#52c41a',
  [STATUS.REOPENED]: '#eb2f96',
};

/**
 * Priority colors for UI elements
 */
export const PRIORITY_COLORS = {
  [PRIORITY.LOW]: '#52c41a',
  [PRIORITY.MEDIUM]: '#faad14',
  [PRIORITY.HIGH]: '#fa541c',
  [PRIORITY.CRITICAL]: '#f5222d',
}; 