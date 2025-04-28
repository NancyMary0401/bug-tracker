"use client";
import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import styles from './TaskTrendLine.module.css';

const TaskTrendLine = ({ tasks = [], role = '', username = '' }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!tasks || tasks.length === 0 || !username) {
      return;
    }

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    const today = new Date();
    const last7Days = Array.from({length: 7}, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const filteredTasks = tasks.filter(task => {
      if (!role || !username) return false;
      if (role.toLowerCase() === 'manager') {
        return true;
      }
      return task.assignee?.toLowerCase() === username.toLowerCase();
    });

    const totalTasksByDay = [];
    const completedTasksByDay = [];
    const inProgressTasksByDay = [];

    last7Days.forEach(date => {
      const tasksUpToDate = filteredTasks.filter(task => {
        const creationDate = new Date(task.createdAt || task.created_at);
        if (isNaN(creationDate.getTime())) return false;
        return creationDate.toISOString().split('T')[0] <= date;
      });
      totalTasksByDay.push(tasksUpToDate.length);
      const completedTasks = tasksUpToDate.filter(task => {
        if (task.status === 'Closed' || task.status === 'Pending Approval') {
          const completionDate = new Date(task.lastUpdated || task.updatedAt || task.updated_at);
          if (isNaN(completionDate.getTime())) return false;
          return completionDate.toISOString().split('T')[0] <= date;
        }
        return false;
      });
      completedTasksByDay.push(completedTasks.length);
      const inProgressTasks = tasksUpToDate.filter(task => {
        return task.status === 'In Progress';
      });
      inProgressTasksByDay.push(inProgressTasks.length);
    });

    const formattedDates = last7Days.map(date => {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    });

    const data = {
      labels: formattedDates,
      datasets: [
        {
          label: 'Total Tasks',
          data: totalTasksByDay,
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          borderColor: 'rgba(79, 70, 229, 1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgba(79, 70, 229, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          order: 3
        },
        {
          label: 'In Progress',
          data: inProgressTasksByDay,
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderColor: 'rgba(245, 158, 11, 1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgba(245, 158, 11, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          order: 2
        },
        {
          label: 'Completed',
          data: completedTasksByDay,
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgba(16, 185, 129, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          order: 1
        }
      ]
    };

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 20,
            right: 20,
            bottom: 10,
            left: 25
          }
        },
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'center',
            labels: {
              boxWidth: 12,
              font: {
                size: window.innerWidth < 768 ? 10 : 11
              },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#111',
            bodyColor: '#333',
            borderColor: 'rgba(200, 200, 200, 0.5)',
            borderWidth: 1,
            padding: 8,
            displayColors: true,
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
            },
            ticks: {
              padding: 5,
              color: '#555',
              font: {
                size: window.innerWidth < 768 ? 9 : 10
              },
              maxRotation: window.innerWidth < 576 ? 45 : 0
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              precision: 0,
              color: '#555',
              font: {
                size: window.innerWidth < 768 ? 10 : 12,
                weight: 'bold'
              },
              padding: window.innerWidth < 768 ? 5 : 8,
              maxTicksLimit: window.innerWidth < 576 ? 5 : 8,
              callback: function(value) {
                return value.toString();
              }
            },
            grid: {
              color: 'rgba(200, 200, 200, 0.2)',
              drawBorder: false
            },
            title: {
              display: true,
              text: 'Tasks',
              font: {
                size: window.innerWidth < 768 ? 10 : 12,
                weight: 'bold'
              },
              color: '#555',
              padding: {
                bottom: window.innerWidth < 768 ? 2 : 5
              }
            },
            suggestedMax: Math.max(...totalTasksByDay) + 2,
            suggestedMin: 0
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [tasks, role, username]);

  if (!tasks || tasks.length === 0) {
    return (
      <div className={styles.noData}>
        No data available. Create some tasks to see trends.
      </div>
    );
  }

  return (
    <div className={styles.chartWrapper} style={{ height: '500px' }}>
      <canvas ref={chartRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default TaskTrendLine; 