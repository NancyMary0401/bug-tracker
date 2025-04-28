"use client";

const users = [
  { username: 'devuser', password: 'devpass', role: 'Developer' },
  { username: 'manageruser', password: 'managerpass', role: 'Manager' },
  { username: 'alice', password: 'alicepass', role: 'Developer' },
  { username: 'bob', password: 'bobpass', role: 'Developer' },
  { username: 'carol', password: 'carolpass', role: 'Developer' },
  { username: 'dave', password: 'davepass', role: 'Developer' },
  { username: 'eve', password: 'evepass', role: 'Manager' }
];

export function authenticateUser(username, password) {
  const user = users.find(u => 
    u.username === username && u.password === password
  );
  if (user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
}

export function isAuthenticated(user) {
  return !!user && !!user.username;
}

export function isManager(user) {
  return !!user && user.role === 'Manager';
} 