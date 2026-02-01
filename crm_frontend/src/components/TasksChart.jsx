import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const TasksChart = ({ taskSummary = { completed: 0, inProgress: 0, pendingReview: 0 } }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');

  const data = {
    labels: ['Completed', 'In Progress', 'Pending Review'],
    datasets: [
      {
        label: 'Tasks',
        data: [taskSummary.completed, taskSummary.inProgress, taskSummary.pendingReview],
        backgroundColor: ['#10b981', '#facc15', '#ef4444'],
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: isDarkMode ? '#fff' : '#111827',
        },
      },
    },
    scales: {
      x: {
        ticks: { 
          color: isDarkMode ? '#fff' : '#111827',
        },
        grid: { 
          color: isDarkMode ? '#334155' : '#e5e7eb',
        },
      },
      y: {
        ticks: { 
          color: isDarkMode ? '#fff' : '#111827',
        },
        grid: { 
          color: isDarkMode ? '#334155' : '#e5e7eb',
        },
      },
    },
  };

  return (
    <div className="h-full w-full">
      <Bar data={data} options={options} />
    </div>
  );
};

export default TasksChart;