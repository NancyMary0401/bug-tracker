import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import styles from './TaskTrendLine.module.css';

export default function TaskTrendLine({ tasks = [], role = '', username = '' }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      return; // Don't create chart if no tasks
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
      if (role?.toLowerCase() === 'developer') {
        return task.assignee?.toLowerCase() === username?.toLowerCase();
      }
      return true; // Manager sees all tasks
    });

    const tasksByDate = last7Days.map(date => {
      return filteredTasks.filter(task => {
        const taskDate = new Date(task.createdAt || task.created_at).toISOString().split('T')[0];
        return taskDate === date;
      }).length;
    });

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
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#1976d2',
          pointRadius: 4,
          pointHoverRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: role?.toLowerCase() === 'developer' ? 'My Task Trend (Last 7 Days)' : 'Overall Task Trend (Last 7 Days)',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: 20
          },
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
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
              callback: (value) => Math.floor(value)
            },
            title: {
              display: true,
              text: 'Number of Tasks'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
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