"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../../styles/login.module.css';
import { authenticateUser } from '../../../controllers/authController';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = authenticateUser(username, password);
    if (user) {
      router.push(`/dashboard?role=${user.role}`);
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <h2 className={styles.title}>BUG TRACKER</h2>
        {error && <p className={styles.error}>{error}</p>}
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}