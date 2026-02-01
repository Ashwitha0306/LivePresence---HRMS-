import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useTheme from '../../hooks/useTheme';

const SalaryDetails = () => {
  const { id } = useParams();
  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchSalary = async () => {
      try {
        const response = await fetch(`/api/admin/salary/${id}/`);
        if (!response.ok) {
          throw new Error('Failed to fetch salary data');
        }
        const data = await response.json();
        setSalary(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSalary();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="alert alert-error shadow-lg">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header with theme toggle */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Salary Details</h1>
          <button 
            onClick={toggleTheme}
            className="btn btn-ghost btn-circle"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
        </div>

        {/* Salary Card */}
        <div className="card bg-base-200 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Salary Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="stat">
                  <div className="stat-title">Total Salary</div>
                  <div className="stat-value text-primary">{salary.total_salary}</div>
                </div>
                
                <div className="stat">
                  <div className="stat-title">Base Salary</div>
                  <div className="stat-value">{salary.base_salary}</div>
                </div>
                
                <div className="stat">
                  <div className="stat-title">Bonus</div>
                  <div className="stat-value text-secondary">{salary.bonus}</div>
                </div>
              </div>
              
              <div>
                <div className="stat">
                  <div className="stat-title">Deductions</div>
                  <div className="stat-value text-error">{salary.deductions}</div>
                </div>
                
                <div className="stat">
                  <div className="stat-title">Effective Period</div>
                  <div className="stat-desc">
                    {new Date(salary.effective_from).toLocaleDateString()} - {' '}
                    {new Date(salary.effective_to).toLocaleDateString()}
                  </div>
                  <div className="stat-desc">
                    {salary.is_current ? (
                      <span className="badge badge-success">Current</span>
                    ) : (
                      <span className="badge badge-warning">Historical</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card bg-base-200 shadow">
            <div className="card-body">
              <h3 className="card-title">Employee ID</h3>
              <p>{salary.employee}</p>
            </div>
          </div>
          
          <div className="card bg-base-200 shadow">
            <div className="card-body">
              <h3 className="card-title">Created At</h3>
              <p>{new Date(salary.created_at).toLocaleString()}</p>
            </div>
          </div>
          
          <div className="card bg-base-200 shadow">
            <div className="card-body">
              <h3 className="card-title">Last Updated</h3>
              <p>{new Date(salary.updated_at).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button className="btn btn-outline">Back</button>
          <button className="btn btn-primary">Edit</button>
        </div>
      </div>
    </div>
  );
};

export default SalaryDetails;