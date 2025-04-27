import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import styles from './TaskTrendLine.module.css';

export default function TaskTrendLine({ tasks = [], role = '', username = '' }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

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

    // Filter and group tasks based on role
    const filteredTasks = tasks.filter(task => {
      if (!role || !username) return false; // Don't show any tasks if no role or username
      if (role.toLowerCase() === 'manager') {
        return true; // Manager sees all tasks
      }
      return task.assignee?.toLowerCase() === username.toLowerCase();
    });

    const tasksByDate = last7Days.map(date => {
      return filteredTasks.filter(task => {
        const taskDate = new Date(task.createdAt || task.created_at).toISOString().split('T')[0];
        return taskDate === date;
      }).length;
    });

    // Count tasks by status for the pie chart
    const openTasks = filteredTasks.filter(task => task.status === 'Open').length;
    const inProgressTasks = filteredTasks.filter(task => task.status === 'In Progress').length;
    const pendingApprovalTasks = filteredTasks.filter(task => task.status === 'Pending Approval').length;
    const closedTasks = filteredTasks.filter(task => task.status === 'Closed').length;

    // Create chart with role-specific configuration
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: last7Days.map(date => {
          const [year, month, day] = date.split('-');
          return `${month}/${day}`;
        }),
        datasets: [{
          label: role?.toLowerCase() === 'developer' ? 'My Tasks' : 'All Tasks',
          data: tasksByDate,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointRadius: 4,
          pointHoverRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: false,
          },
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(17, 24, 39, 0.8)',
            padding: 12,
            bodyFont: {
              size: 13
            },
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            callbacks: {
              title: (tooltipItems) => {
                return `Tasks on ${tooltipItems[0].label}`;
              },
              label: (context) => {
                return ` ${context.parsed.y} task(s)`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              callback: (value) => Math.floor(value),
              color: '#64748b',
              font: {
                size: 11
              }
            },
            title: {
              display: true,
              text: 'Number of Tasks',
              color: '#64748b',
              font: {
                size: 12,
                weight: '500'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
              drawBorder: false
            }
          },
          x: {
            title: {
              display: false
            },
            ticks: {
              color: '#64748b',
              font: {
                size: 11
              }
            },
            grid: {
              display: false
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

  return (
    <div className={styles.chartContainer}>
      <canvas ref={chartRef} />
    </div>
  );
} 