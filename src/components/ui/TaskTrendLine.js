import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import styles from './TaskTrendLine.module.css';
import ConfirmDialog from './ConfirmDialog';

export default function TaskTrendLine({ tasks = [], role = '', username = '' }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmCallback, setConfirmCallback] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  // Function to show a confirmation dialog
  const showConfirm = (message, action) => {
    setConfirmMessage(message);
    setConfirmCallback(() => action);
    setShowConfirmDialog(true);
  };

  useEffect(() => {
    // Don't create chart if no tasks or no username
    if (!tasks || tasks.length === 0 || !username) {
      return;
    }

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    // Process tasks based on role
    const today = new Date();
    const last7Days = Array.from({length: 7}, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    // Filter tasks based on role
    const filteredTasks = tasks.filter(task => {
      if (!role || !username) return false; // Don't show any tasks if no role or username
      if (role.toLowerCase() === 'manager') {
        return true; // Manager sees all tasks
      }
      return task.assignee?.toLowerCase() === username.toLowerCase();
    });

    // Calculate total tasks and completed/closed tasks for each day
    const totalTasksByDay = [];
    const completedTasksByDay = [];

    last7Days.forEach(date => {
      // Get tasks that existed on or before this date
      const tasksUpToDate = filteredTasks.filter(task => {
        const creationDate = new Date(task.createdAt || task.created_at);
        if (isNaN(creationDate.getTime())) return false;
        return creationDate.toISOString().split('T')[0] <= date;
      });
      
      totalTasksByDay.push(tasksUpToDate.length);
      
      // Completed/closed tasks count
      const completedTasks = tasksUpToDate.filter(task => {
        if (task.status === 'Closed' || task.status === 'Pending Approval') {
          const completionDate = new Date(task.lastUpdated || task.updatedAt || task.updated_at);
          if (isNaN(completionDate.getTime())) return false;
          return completionDate.toISOString().split('T')[0] <= date;
        }
        return false;
      });
      
      completedTasksByDay.push(completedTasks.length);
    });

    // Format dates for display
    const formattedDates = last7Days.map(date => {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    });

    // Create simple chart
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: formattedDates,
        datasets: [
          {
            label: 'Total',
            data: totalTasksByDay,
            backgroundColor: '#3b82f6',
            barPercentage: 0.6,
            order: 2
          },
          {
            label: 'Completed',
            data: completedTasksByDay,
            backgroundColor: '#10b981',
            barPercentage: 0.6,
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              boxWidth: 12,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: ${context.parsed.y}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              precision: 0
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [tasks, role, username]);

  // Example function that would use a confirmation dialog
  const handleResetData = () => {
    showConfirm(
      "Are you sure you want to reset the chart data?",
      () => {
        console.log("Data reset action would happen here");
        // Your reset logic would go here
      }
    );
  };

  return (
    <div className={styles.chartContainer}>
      <canvas ref={chartRef} />
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmCallback}
        message={confirmMessage}
        title="Confirm Action"
      />
    </div>
  );
} 