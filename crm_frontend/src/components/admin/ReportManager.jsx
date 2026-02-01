import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Download, Plus, Eye } from 'lucide-react';

const ReportManager = () => {
  const [reports, setReports] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [executionData, setExecutionData] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    report_type: '',
    format: 'PDF',
  });

  const loadReports = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/analytics/reports/');
      setReports(res.data);
    } catch (err) {
      console.error('Error loading reports:', err);
      alert('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTemplates = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/analytics/reports/templates/');
      setTemplates(res.data);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  }, []);

  useEffect(() => {
    loadReports();
    loadTemplates();
  }, [loadReports, loadTemplates]);

  const handleCreateReport = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/analytics/reports/', formData);
      setIsModalOpen(false);
      setFormData({ name: '', description: '', report_type: '', format: 'PDF' });
      loadReports();
    } catch (err) {
      console.error('Error creating report:', err);
      alert('Failed to create report.');
    }
  };

  const executeReport = async (id) => {
    try {
      const res = await axiosInstance.post(`/analytics/reports/${id}/execute/`);
      alert(res.data.message || 'Execution started');
      setTimeout(loadReports, 2000); // Refresh status after a short delay
    } catch (err) {
      console.error('Execution error:', err);
      alert('Failed to execute report.');
    }
  };

  const downloadReport = async (execId, reportName) => {
    if (!execId) return;
    try {
      const res = await axiosInstance.get(
        `/analytics/report-executions/${execId}/download/`,
        { responseType: 'blob' }
      );
      const blobUrl = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = blobUrl;

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      a.download = `${reportName || 'report'}-${execId}-${timestamp}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Download error:', err);
      alert('Download failed. File may not be ready.');
    }
  };

  const loadExecutionData = async (execId) => {
    if (!execId) return;
    try {
      const res = await axiosInstance.get(`/analytics/report-executions/${execId}/data/`);
      setExecutionData(res.data);
      setShowDataModal(true);
    } catch (err) {
      console.error('Data load error:', err);
      alert('Failed to load execution data (server error).');
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">📄 Reports</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
          <Plus size={18} /> Add
        </button>
      </div>

      {loading ? (
        <p>Loading reports…</p>
      ) : reports.length === 0 ? (
        <p>No reports yet.</p>
      ) : (
        <table className="min-w-full border text-sm overflow-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Format</th>
              <th className="p-2 border">Created By</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td className="p-2 border">{r.name}</td>
                <td className="p-2 border">{r.report_type}</td>
                <td className="p-2 border">{r.format}</td>
                <td className="p-2 border">{r.created_by?.username}</td>
                <td className="p-2 border flex gap-2">
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    onClick={() => executeReport(r.id)}
                  >
                    Run
                  </button>

                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    disabled={!r.last_execution || r.last_execution.status !== 'completed'}
                    onClick={() =>
                      downloadReport(
                        r.last_execution?.id,
                        r.name.replace(/\s+/g, '_')
                      )
                    }
                  >
                    <Download size={14} />
                  </button>

                  <button
                    className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                    disabled={!r.last_execution}
                    onClick={() => loadExecutionData(r.last_execution?.id)}
                  >
                    <Eye size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form
            onSubmit={handleCreateReport}
            className="bg-white p-6 rounded-lg w-full max-w-md space-y-4"
          >
            <h2 className="text-lg font-semibold">New Report</h2>
            <input
              className="w-full border px-3 py-2 rounded"
              placeholder="Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <textarea
              className="w-full border px-3 py-2 rounded"
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <select
              className="w-full border px-3 py-2 rounded"
              required
              value={formData.report_type}
              onChange={(e) =>
                setFormData({ ...formData, report_type: e.target.value })
              }
            >
              <option value="">Template</option>
              {templates.map((t) => (
                <option key={t.type} value={t.type}>
                  {t.name}
                </option>
              ))}
            </select>
            <select
              className="w-full border px-3 py-2 rounded"
              value={formData.format}
              onChange={(e) =>
                setFormData({ ...formData, format: e.target.value })
              }
            >
              <option>PDF</option>
              <option>CSV</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {showDataModal && executionData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowDataModal(false)}
              className="absolute top-4 right-6 text-gray-600 hover:text-black"
            >
              ✕
            </button>
            <h2 className="text-lg font-bold mb-4">Execution Details</h2>
            {executionData.meta && (
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                {Object.entries(executionData.meta).map(([k, v]) => (
                  <div key={k}>
                    <strong>{k.replace(/_/g,' ')}:</strong>{' '}
                    {k.endsWith('_at') ? new Date(v).toLocaleString() : v}
                  </div>
                ))}
              </div>
            )}

            {executionData.columns?.length ? (
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {executionData.columns.map((c) => (
                      <th key={c} className="p-2 border capitalize">
                        {c.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {executionData.rows.map((row, i) => (
                    <tr key={i}>
                      {executionData.columns.map((c) => (
                        <td key={c} className="p-2 border">
                          {row[c] ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No execution data.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManager;
