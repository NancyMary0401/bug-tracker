"use client";

/**
 * User authentication service
 */

// Sample users for demonstration
const users = [
  { username: 'devuser', password: 'devpass', role: 'Developer' },
  { username: 'manageruser', password: 'managerpass', role: 'Manager' },
  { username: 'alice', password: 'alicepass', role: 'Developer' },
  { username: 'bob', password: 'bobpass', role: 'Developer' },
  { username: 'carol', password: 'carolpass', role: 'Developer' },
  { username: 'dave', password: 'davepass', role: 'Developer' },
  { username: 'eve', password: 'evepass', role: 'Manager' }
];

/**
 * Authenticate a user with username and password
 * @param {string} username 
 * @param {string} password 
 * @returns {Object|null} User object if authenticated, null otherwise
 */
export function authenticateUser(username, password) {
  const user = users.find(u => 
    u.username === username && u.password === password
  );
  
  if (user) {
    // Return a copy without the password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  return null;
}

/**
 * Check if a user is authenticated
 * @param {Object} user User object
 * @returns {boolean} True if authenticated, false otherwise
 */
export function isAuthenticated(user) {
  return !!user && !!user.username;
}

/**
 * Check if a user has manager role
 * @param {Object} user User object
 * @returns {boolean} True if user is a manager
 */
export function isManager(user) {
  return !!user && user.role === 'Manager';
} 