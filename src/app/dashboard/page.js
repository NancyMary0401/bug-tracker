"use client";
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '../../components/Header';

import DashboardStats from '../../components/DashboardStats';
import SidePanel from './SidePanel';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('tasks');
    if (stored) {
      setTasks(JSON.parse(stored));
    }
  }, []);

  const handleLogout = () => {
    // Implement logout functionality
    console.log('User logged out');
  };

  const handleCreate = () => {
    setShowSidePanel(true);
  };

  const handleClosePanel = () => {
    setShowSidePanel(false);
  };

  const handleSubmitTask = (data) => {
    setTasks(prev => {
      const updated = [...prev, data];
      localStorage.setItem('tasks', JSON.stringify(updated));
      return updated;
    });
    setShowSidePanel(false);
  };

  return (
    <div>
      <Header onLogout={handleLogout} onCreate={handleCreate} />
      <DashboardStats />
      {showSidePanel && (
        <SidePanel onClose={handleClosePanel} onSubmit={handleSubmitTask} />
      )}
      <div style={{ marginTop: 32 }}>
        <h2>All Tasks (JSON)</h2>
        <pre style={{ background: '#fff', padding: 16, borderRadius: 8, maxHeight: 300, overflow: 'auto' }}>
          {JSON.stringify(tasks, null, 2)}
        </pre>
      </div>
    </div>
  );
}
