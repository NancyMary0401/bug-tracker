"use client";
import { useSearchParams } from 'next/navigation';
import Header from '../../components/Header';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');

  const handleLogout = () => {
    // Implement logout functionality
    console.log('User logged out');
  };

  return (
    <div>
      <Header onLogout={handleLogout} />
      <h1>Welcome to the Dashboard</h1>
      <p>Role: {role}</p>
    </div>
  );
}
