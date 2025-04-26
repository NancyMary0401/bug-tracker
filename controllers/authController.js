import { users } from '../models/users';

export function authenticateUser(username, password) {
  return users.find(user => user.username === username && user.password === password);
}
