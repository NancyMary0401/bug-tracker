// Mock task data for testing and development
import { users } from '../../models/users';

// Generate dates between today and 30 days ago
const getRandomDate = (daysBack = 30) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString();
};

// Generate a random sample of tasks for each user
export const generateMockTasks = () => {
  const mockTasks = [];
  const taskTypes = ['Bug', 'Feature', 'Improvement', 'Documentation'];
  const priorities = ['High', 'Medium', 'Low'];
  const statuses = ['Open', 'In Progress', 'Pending Approval', 'Closed'];
  
  // Create tasks for each user
  users.forEach((user, userIndex) => {
    // Each developer gets 5-10 tasks
    const numTasks = user.role === 'Developer' ? 5 + Math.floor(Math.random() * 6) : 3;
    
    for (let i = 0; i < numTasks; i++) {
      const taskId = mockTasks.length + 1;
      const createdDate = getRandomDate(30);
      const lastUpdatedDate = new Date(createdDate);
      
      // Some tasks have updates after creation
      if (Math.random() > 0.3) {
        lastUpdatedDate.setDate(lastUpdatedDate.getDate() + Math.floor(Math.random() * 7) + 1);
      }
      
      // Randomly select assignee - either self or another developer
      const assignee = Math.random() > 0.5 ? user.username : 
        users.filter(u => u.role === 'Developer' && u.username !== user.username)
          [Math.floor(Math.random() * (users.filter(u => u.role === 'Developer').length - 1))].username;
      
      // Random reporter - could be any user
      const reporter = users[Math.floor(Math.random() * users.length)].username;
      
      // Random status with weighting
      const statusWeight = Math.random();
      let status;
      if (statusWeight < 0.3) status = 'Open';
      else if (statusWeight < 0.6) status = 'In Progress';
      else if (statusWeight < 0.8) status = 'Pending Approval';
      else status = 'Closed';
      
      // For completed tasks, add completion date
      let completedDate = null;
      if (status === 'Closed' || status === 'Pending Approval') {
        completedDate = new Date(lastUpdatedDate);
        completedDate.setDate(completedDate.getDate() - Math.floor(Math.random() * 3));
      }
      
      // Random estimated time (1h to 3 days)
      const estimatedTimeMin = 60 + Math.floor(Math.random() * (60 * 71));
      
      // Logged time based on status
      let loggedTime = 0;
      if (status === 'In Progress') {
        loggedTime = Math.floor(estimatedTimeMin * (0.1 + Math.random() * 0.5));
      } else if (status === 'Pending Approval' || status === 'Closed') {
        loggedTime = Math.floor(estimatedTimeMin * (0.8 + Math.random() * 0.3));
      }
      
      // Task descriptions
      const descriptions = [
        "Fix the issue with the login form not validating correctly.",
        "Update the dashboard to include the new metrics we discussed.",
        "Implement the new filter feature for the task list.",
        "Optimize the database queries for better performance.",
        "Add form validation for the user settings page.",
        "Fix the responsiveness issue on mobile devices.",
        "Update documentation for the API endpoints.",
        "Refactor the authentication service for better security.",
        "Add unit tests for the core services.",
        "Fix the styling inconsistencies in the dark mode theme."
      ];
      
      mockTasks.push({
        key: `TASK-${taskId}`,
        title: `${taskTypes[Math.floor(Math.random() * taskTypes.length)]}: ${descriptions[Math.floor(Math.random() * descriptions.length)]}`,
        description: `Detailed description for task ${taskId}. This is a ${status.toLowerCase()} task assigned to ${assignee}.`,
        assignee: assignee,
        reporter: reporter,
        status: status,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        type: taskTypes[Math.floor(Math.random() * taskTypes.length)],
        estimatedTime: estimatedTimeMin,
        loggedTime: loggedTime,
        createdAt: createdDate,
        lastUpdated: lastUpdatedDate.toISOString(),
        completedAt: completedDate ? completedDate.toISOString() : null,
        comments: []
      });
    }
  });
  
  // Add some comments to random tasks
  const comments = [
    "I've started working on this issue.",
    "Need some clarification on the requirements.",
    "This is taking longer than expected.",
    "Almost done with this task.",
    "Fixed the main issue, but found some edge cases.",
    "Can someone review my code?",
    "Waiting for QA approval.",
    "Will complete this by tomorrow.",
    "Found a better approach to solve this.",
    "This is blocked by another task."
  ];
  
  mockTasks.forEach(task => {
    if (Math.random() > 0.5) {
      const commentCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < commentCount; i++) {
        const commentDate = new Date(task.createdAt);
        commentDate.setDate(commentDate.getDate() + Math.floor(Math.random() * 5) + 1);
        
        task.comments.push({
          id: `comment-${task.key}-${i}`,
          author: users[Math.floor(Math.random() * users.length)].username,
          text: comments[Math.floor(Math.random() * comments.length)],
          timestamp: commentDate.toISOString()
        });
      }
      
      // Sort comments by date
      task.comments.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
  });
  
  return mockTasks;
};

// Initialize with sample data
export const initialMockTasks = generateMockTasks(); 