import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { 
  FiUpload, 
  FiFileText, 
  FiCheckCircle,
  FiX,
  FiArchive,
  FiEye,
  FiClock,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiDownload,
  FiMoreVertical,
  FiEdit,
  FiTrash2
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import useTheme from '../../hooks/useTheme';

const FileManager = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    employee: '',
    category: '',
    file: null,
    issue_date: '',
    expiry_date: '',
    status: 'draft'
  });

  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [isLoading, setIsLoading] = useState({
    page: true,
    form: false,
    signing: false,
    updating: false
  });
  const [activeTab, setActiveTab] = useState('browse');
  const [showNotification, setShowNotification] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    employee: '',
    is_signed: '',
    status: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [documentVersions, setDocumentVersions] = useState([]);
  const [expandedMenuId, setExpandedMenuId] = useState(null);

  const dataCache = useRef({
    categories: null,
    employees: null
  });

  // Menu toggle with click outside handler
  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setExpandedMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchDocuments = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.employee) params.append('employee', filters.employee);
      if (filters.is_signed) params.append('is_signed', filters.is_signed);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const res = await axiosInstance.get(`/documents/documents/?${params.toString()}`);
      setDocuments(res.data);
    } catch (err) {
      console.error('❌ Failed to fetch documents:', err);
      showToast('Failed to load documents', 'error');
    }
  };

  const fetchDocumentVersions = async (documentId) => {
    try {
      const res = await axiosInstance.get(`/documents/documents/${documentId}/versions/`);
      setDocumentVersions(res.data);
    } catch (err) {
      console.error('❌ Failed to fetch document versions:', err);
      showToast('Failed to load document history', 'error');
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(prev => ({ ...prev, page: true }));
      
      try {
        if (!dataCache.current.categories || !dataCache.current.employees) {
          const [categoriesRes, employeesRes] = await Promise.all([
            axiosInstance.get('/documents/categories/'),
            axiosInstance.get('/employees/employees/')
          ]);

          dataCache.current.categories = categoriesRes.data;
          dataCache.current.employees = employeesRes.data;

          setCategories(categoriesRes.data);
          setEmployees(employeesRes.data);
        } else {
          setCategories(dataCache.current.categories);
          setEmployees(dataCache.current.employees);
        }

        await fetchDocuments();
      } catch (err) {
        console.error('❌ Failed to fetch data:', err);
        showToast('Failed to load initial data', 'error');
      } finally {
        setIsLoading(prev => ({ ...prev, page: false }));
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const filterDocuments = () => {
      let result = [...documents];
      
      if (filters.category) {
        result = result.filter(doc => String(doc.category) === String(filters.category));
      }
      if (filters.employee) {
        result = result.filter(doc => doc.employee === filters.employee);
      }
      if (filters.is_signed) {
        result = result.filter(doc => doc.is_signed === (filters.is_signed === 'true'));
      }
      if (filters.status) {
        result = result.filter(doc => doc.status === filters.status);
      }
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        result = result.filter(doc => 
          doc.title.toLowerCase().includes(searchTerm) ||
          (doc.description && doc.description.toLowerCase().includes(searchTerm))
        );
      }

      setFilteredDocs(result);
    };

    filterDocuments();
  }, [filters, documents]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      employee: '',
      is_signed: '',
      status: '',
      search: ''
    });
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const showToast = (message, type = 'success') => {
    setShowNotification({ message, type });
    setTimeout(() => setShowNotification(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(prev => ({ ...prev, form: true }));

    const data = new FormData();
    for (let key in formData) {
      if (formData[key]) data.append(key, formData[key]);
    }

    try {
      await axiosInstance.post('/documents/documents/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      showToast('Document uploaded successfully');
      
      setFormData({
        title: '',
        description: '',
        employee: '',
        category: '',
        file: null,
        issue_date: '',
        expiry_date: '',
        status: 'draft'
      });
      
      await fetchDocuments();
      setActiveTab('browse');
    } catch (err) {
      console.error('Upload failed:', err.response?.data || err.message);
      showToast(`Upload failed: ${err.response?.data?.message || err.message}`, 'error');
    } finally {
      setIsLoading(prev => ({ ...prev, form: false }));
    }
  };

  const handleSign = async (id) => {
    if (!window.confirm('Are you sure you want to sign this document?')) return;
    
    setIsLoading(prev => ({ ...prev, signing: true }));
    
    try {
      await axiosInstance.patch(`/documents/documents/${id}/`, {
        is_signed: true,
        signature_date: new Date().toISOString(),
        status: 'active'
      });
      
      await fetchDocuments();
      showToast('Document signed successfully');
    } catch (err) {
      console.error(err);
      showToast('Signing failed', 'error');
    } finally {
      setIsLoading(prev => ({ ...prev, signing: false }));
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    
    setIsLoading(prev => ({ ...prev, updating: true }));
    
    try {
      await axiosInstance.patch(`/documents/documents/${id}/`, {
        status: newStatus
      });
      
      await fetchDocuments();
      showToast(`Document status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      showToast('Status update failed', 'error');
    } finally {
      setIsLoading(prev => ({ ...prev, updating: false }));
    }
  };

  const downloadDocument = async (documentId, versionId = null) => {
    try {
      let url;
      if (versionId) {
        url = `/documents/versions/${versionId}/download/`;
      } else {
        url = `/documents/documents/${documentId}/download/`;
      }
      
      const response = await axiosInstance.get(url, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `document_${documentId}${versionId ? `_v${versionId}` : ''}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showToast('Download started');
    } catch (err) {
      console.error('Download failed:', err);
      showToast('Download failed', 'error');
    }
  };

  const openDocumentViewer = (doc) => {
    setSelectedDoc(doc);
    setViewerOpen(true);
  };

  const openDocumentHistory = async (doc) => {
    setSelectedDoc(doc);
    await fetchDocumentVersions(doc.id);
    setHistoryOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'pending_signature': return 'bg-yellow-500';
      case 'active': return 'bg-green-500';
      case 'expired': return 'bg-red-500';
      case 'archived': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const toggleMenu = (id) => {
    setExpandedMenuId(expandedMenuId === id ? null : id);
  };

  const themeStyles = {
    container: theme === 'dark' 
      ? 'bg-gray-900 text-gray-100' 
      : 'bg-gray-50 text-gray-900',
    card: theme === 'dark' 
      ? 'bg-gray-800 border-gray-700 shadow-lg' 
      : 'bg-white border-gray-200 shadow-md',
    input: theme === 'dark' 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    select: theme === 'dark' 
      ? 'bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-blue-500' 
      : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500',
    buttonPrimary: theme === 'dark' 
      ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-400' 
      : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-400',
    buttonSecondary: theme === 'dark' 
      ? 'bg-gray-700 hover:bg-gray-600 text-white focus:ring-2 focus:ring-gray-500' 
      : 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-2 focus:ring-gray-400',
    tableHeader: theme === 'dark' 
      ? 'bg-gray-800 text-gray-300' 
      : 'bg-gray-100 text-gray-700',
    tableRow: theme === 'dark' 
      ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' 
      : 'bg-white hover:bg-gray-50 border-gray-200',
    textMuted: theme === 'dark' 
      ? 'text-gray-400' 
      : 'text-gray-600',
    textPrimary: theme === 'dark' 
      ? 'text-gray-100' 
      : 'text-gray-900',
    border: theme === 'dark' 
      ? 'border-gray-700' 
      : 'border-gray-300',
    uploadBorder: theme === 'dark' 
      ? 'border-gray-600 hover:border-blue-500 bg-gray-800' 
      : 'border-gray-300 hover:border-blue-500 bg-white',
    uploadText: theme === 'dark' 
      ? 'text-gray-300' 
      : 'text-gray-600',
    tabActive: theme === 'dark' 
      ? 'bg-blue-600 text-white' 
      : 'bg-blue-600 text-white',
    tabInactive: theme === 'dark' 
      ? 'text-gray-300 hover:bg-gray-700' 
      : 'text-gray-700 hover:bg-gray-300',
    tabContainer: theme === 'dark' 
      ? 'bg-gray-800' 
      : 'bg-gray-200',
    notificationSuccess: theme === 'dark' 
      ? 'bg-green-800 text-white shadow-lg' 
      : 'bg-green-100 text-green-800 shadow-md',
    notificationError: theme === 'dark' 
      ? 'bg-red-800 text-white shadow-lg' 
      : 'bg-red-100 text-red-800 shadow-md',
    dropdownBg: theme === 'dark' 
      ? 'bg-gray-800 border-gray-700' 
      : 'bg-white border-gray-200',
    dropdownItem: theme === 'dark' 
      ? 'hover:bg-gray-700 text-gray-200' 
      : 'hover:bg-gray-100 text-gray-700'
  };

  // Document Viewer Modal Component
  const DocumentViewerModal = ({ document, onClose, onDownload, theme }) => {
    const themeStyles = {
      modal: theme === 'dark' 
        ? 'bg-gray-800 text-gray-100' 
        : 'bg-white text-gray-900',
      button: theme === 'dark' 
        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
    };

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div 
              className="absolute inset-0 bg-gray-500 opacity-75" 
              onClick={onClose}
            ></div>
          </div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full ${themeStyles.modal}`}
          >
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg leading-6 font-medium">
                  {document.title}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mt-4">
                <div className="aspect-w-16 aspect-h-9">
                  <iframe 
                    src={document.file_url} 
                    className="w-full h-96 border rounded-md"
                    title="Document Preview"
                  />
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Details</h4>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>Category: {document.category_name}</li>
                      <li>Employee: {document.employee_name}</li>
                      <li>Status: {document.status}</li>
                      {document.issue_date && <li>Issue Date: {document.issue_date}</li>}
                      {document.expiry_date && <li>Expiry Date: {document.expiry_date}</li>}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Actions</h4>
                    <div className="mt-2 flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onDownload(document.id)}
                        className={`px-4 py-2 rounded-md ${themeStyles.button} transition-all`}
                      >
                        <FiDownload className="inline mr-2" />
                        Download
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  // Document History Modal Component
  const DocumentHistoryModal = ({ document, onClose, onDownloadVersion, theme }) => {
    const themeStyles = {
      modal: theme === 'dark' 
        ? 'bg-gray-800 text-gray-100' 
        : 'bg-white text-gray-900',
      button: theme === 'dark' 
        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
        : 'bg-gray-200 hover:bg-gray-300 text-gray-800',
      tableHeader: theme === 'dark' 
        ? 'bg-gray-700 text-gray-300' 
        : 'bg-gray-100 text-gray-700',
      tableRow: theme === 'dark' 
        ? 'bg-gray-800 hover:bg-gray-700' 
        : 'bg-white hover:bg-gray-50'
    };

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div 
              className="absolute inset-0 bg-gray-500 opacity-75" 
              onClick={onClose}
            ></div>
          </div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full ${themeStyles.modal}`}
          >
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg leading-6 font-medium">
                  Version History: {document.title}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mt-4">
                {documentVersions.length === 0 ? (
                  <p className="text-center py-4 text-sm text-gray-500">
                    No previous versions found
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className={themeStyles.tableHeader}>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Version
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Modified At
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Modified By
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {documentVersions.map(version => (
                          <tr key={version.id} className={themeStyles.tableRow}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              v{version.version_number}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {new Date(version.created_at).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {version.modified_by_name || 'System'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onDownloadVersion(document.id, version.id)}
                                className={`px-3 py-1 rounded-md text-sm ${themeStyles.button} transition-all`}
                              >
                                <FiDownload className="inline mr-1" />
                                Download
                              </motion.button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`p-4 md:p-6 max-w-full mx-auto ${themeStyles.container}`}>
      {/* Notification Toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 25 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center justify-between ${
              showNotification.type === 'error' 
                ? themeStyles.notificationError 
                : themeStyles.notificationSuccess
            }`}
          >
            <span>{showNotification.message}</span>
            <button 
              onClick={() => setShowNotification(null)}
              className="ml-4 transition-colors hover:text-gray-300"
            >
              <FiX />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document Viewer Modal */}
      <AnimatePresence>
        {viewerOpen && selectedDoc && (
          <DocumentViewerModal
            document={selectedDoc}
            onClose={() => setViewerOpen(false)}
            theme={theme}
            onDownload={downloadDocument}
          />
        )}
      </AnimatePresence>

      {/* Document History Modal */}
      <AnimatePresence>
        {historyOpen && selectedDoc && (
          <DocumentHistoryModal
            document={selectedDoc}
            onClose={() => setHistoryOpen(false)}
            theme={theme}
            onDownloadVersion={downloadDocument}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center">
            <FiFileText className="inline mr-3 text-blue-500" />
            Document Manager
          </h1>
          <p className={`text-sm mt-1 ${themeStyles.textMuted}`}>
            {activeTab === 'upload' ? 'Upload new documents' : 'Browse and manage documents'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`flex space-x-1 p-1 rounded-lg ${themeStyles.tabContainer}`}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('browse')}
              className={`px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-md transition-colors ${
                activeTab === 'browse' 
                  ? themeStyles.tabActive 
                  : themeStyles.tabInactive
              }`}
            >
              Browse
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-md transition-colors ${
                activeTab === 'upload' 
                  ? themeStyles.tabActive 
                  : themeStyles.tabInactive
              }`}
            >
              Upload
            </motion.button>
          </div>
        </div>
      </div>

      {isLoading.page ? (
        <div className="flex justify-center items-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className={`rounded-full h-12 w-12 border-t-2 border-b-2 ${
              theme === 'dark' ? 'border-blue-400' : 'border-blue-500'
            }`}
          ></motion.div>
        </div>
      ) : (
        <>
          {activeTab === 'upload' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-4 md:p-6 rounded-xl border ${themeStyles.card} ${themeStyles.border}`}
            >
              <h2 className={`text-lg md:text-xl font-semibold mb-4 md:mb-6 flex items-center ${themeStyles.textPrimary}`}>
                <FiUpload className="mr-2 text-blue-500" />
                Upload New Document
              </h2>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div className="col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${themeStyles.textPrimary}`}>Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className={`w-full p-2.5 rounded-lg border ${themeStyles.input} transition-all focus:ring-2 focus:ring-blue-500`}
                    placeholder="Document title"
                  />
                </div>

                <div className="col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${themeStyles.textPrimary}`}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className={`w-full p-2.5 rounded-lg border ${themeStyles.input} transition-all focus:ring-2 focus:ring-blue-500`}
                    placeholder="Brief description of the document"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeStyles.textPrimary}`}>Employee *</label>
                  <select
                    name="employee"
                    value={formData.employee}
                    onChange={handleChange}
                    required
                    className={`w-full p-2.5 rounded-lg border ${themeStyles.select} transition-all focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.first_name} {emp.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeStyles.textPrimary}`}>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className={`w-full p-2.5 rounded-lg border ${themeStyles.select} transition-all focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeStyles.textPrimary}`}>Issue Date</label>
                  <input
                    type="date"
                    name="issue_date"
                    value={formData.issue_date}
                    onChange={handleChange}
                    className={`w-full p-2.5 rounded-lg border ${themeStyles.input} transition-all focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeStyles.textPrimary}`}>Expiry Date</label>
                  <input
                    type="date"
                    name="expiry_date"
                    value={formData.expiry_date}
                    onChange={handleChange}
                    className={`w-full p-2.5 rounded-lg border ${themeStyles.input} transition-all focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div className="col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${themeStyles.textPrimary}`}>Document File *</label>
                  <motion.div 
                    whileHover={{ borderColor: theme === 'dark' ? '#3B82F6' : '#3B82F6' }}
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg ${themeStyles.uploadBorder} transition-all`}
                  >
                    <div className="space-y-1 text-center">
                      <div className="flex text-sm">
                        <label
                          htmlFor="file-upload"
                          className={`relative cursor-pointer rounded-md font-medium focus-within:outline-none ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} transition-colors`}
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file"
                            type="file"
                            onChange={handleChange}
                            required
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className={`text-xs ${themeStyles.uploadText}`}>
                        PDF, DOC, DOCX up to 10MB
                      </p>
                    </div>
                  </motion.div>
                  {formData.file && (
                    <p className={`mt-2 text-sm ${themeStyles.textMuted}`}>
                      Selected file: {formData.file.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeStyles.textPrimary}`}>Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className={`w-full p-2.5 rounded-lg border ${themeStyles.select} transition-all focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="draft">Draft</option>
                    <option value="pending_signature">Pending Signature</option>
                    <option value="active">Active</option>
                  </select>
                </div>

                <div className="col-span-2 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading.form}
                    className={`flex items-center justify-center px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed min-w-[150px] ${themeStyles.buttonPrimary}`}
                  >
                    {isLoading.form ? (
                      <>
                        <svg className={`animate-spin -ml-1 mr-3 h-4 w-4 md:h-5 md:w-5 text-white`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FiUpload className="mr-2" />
                        Upload Document
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'browse' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className={`p-4 md:p-6 rounded-xl border ${themeStyles.card} ${themeStyles.border}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div className="relative flex-grow max-w-md">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <FiSearch className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      placeholder="Search documents..."
                      className={`pl-10 w-full p-2.5 rounded-lg border ${themeStyles.input} transition-all focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg ${themeStyles.buttonSecondary} transition-all`}
                  >
                    <FiFilter className="w-4 h-4" />
                    Filters
                    {showFilters ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                  </motion.button>
                </div>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`overflow-hidden ${themeStyles.border} ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                    >
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${themeStyles.textPrimary}`}>Category</label>
                          <select
                            name="category"
                            value={filters.category}
                            onChange={handleFilterChange}
                            className={`w-full p-2.5 rounded-lg border ${themeStyles.select} transition-all focus:ring-2 focus:ring-blue-500`}
                          >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${themeStyles.textPrimary}`}>Employee</label>
                          <select
                            name="employee"
                            value={filters.employee}
                            onChange={handleFilterChange}
                            className={`w-full p-2.5 rounded-lg border ${themeStyles.select} transition-all focus:ring-2 focus:ring-blue-500`}
                          >
                            <option value="">All Employees</option>
                            {employees.map(emp => (
                              <option key={emp.employee_id} value={emp.employee_id}>
                                {emp.first_name} {emp.last_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${themeStyles.textPrimary}`}>Signed Status</label>
                          <select
                            name="is_signed"
                            value={filters.is_signed}
                            onChange={handleFilterChange}
                            className={`w-full p-2.5 rounded-lg border ${themeStyles.select} transition-all focus:ring-2 focus:ring-blue-500`}
                          >
                            <option value="">All</option>
                            <option value="true">Signed</option>
                            <option value="false">Unsigned</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${themeStyles.textPrimary}`}>Document Status</label>
                          <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className={`w-full p-2.5 rounded-lg border ${themeStyles.select} transition-all focus:ring-2 focus:ring-blue-500`}
                          >
                            <option value="">All Statuses</option>
                            <option value="draft">Draft</option>
                            <option value="pending_signature">Pending Signature</option>
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex justify-end p-4 pt-0">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={resetFilters}
                          className={`px-4 py-2 rounded-lg mr-2 ${themeStyles.buttonSecondary} transition-all`}
                        >
                          Reset
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={fetchDocuments}
                          className={`px-4 py-2 rounded-lg ${themeStyles.buttonPrimary} transition-all`}
                        >
                          Apply Filters
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className={`p-4 md:p-6 rounded-xl border ${themeStyles.card} ${themeStyles.border}`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-lg md:text-xl font-semibold flex items-center ${themeStyles.textPrimary}`}>
                    <FiFileText className="mr-2 text-blue-500" />
                    Documents
                    <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {filteredDocs.length} found
                    </span>
                  </h2>
                  
                  <div className={`text-sm ${themeStyles.textMuted}`}>
                    Showing {filteredDocs.length} of {documents.length} documents
                  </div>
                </div>

                {filteredDocs.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 md:py-12"
                  >
                    <FiFileText className={`mx-auto text-3xl md:text-4xl ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    } mb-3 md:mb-4`} />
                    <h3 className={`text-base md:text-lg font-medium ${themeStyles.textPrimary}`}>No documents found</h3>
                    <p className={`mt-1 text-sm md:text-base ${themeStyles.textMuted}`}>
                      {filters.search || filters.category || filters.employee || filters.is_signed || filters.status 
                        ? 'Try adjusting your filters' 
                        : 'Upload your first document'}
                    </p>
                  </motion.div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y">
                      <thead className={themeStyles.tableHeader}>
                        <tr>
                          <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Document
                          </th>
                          <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Details
                          </th>
                          <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {filteredDocs.map(doc => (
                          <motion.tr 
                            key={doc.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`${themeStyles.tableRow} transition-colors hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                          >
                            <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`flex-shrink-0 h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center ${
                                  theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'
                                }`}>
                                  <FiFileText className="text-sm md:text-base" />
                                </div>
                                <div className="ml-3">
                                  <div className={`text-sm font-medium ${themeStyles.textPrimary} line-clamp-1`}>
                                    {doc.title}
                                    {doc.is_signed && (
                                      <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                                        theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                                      }`}>
                                        Signed
                                      </span>
                                    )}
                                  </div>
                                  <div className={`text-xs ${themeStyles.textMuted}`}>
                                    {doc.category_name} • {new Date(doc.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 md:px-6 md:py-4">
                              <div className={`text-sm ${themeStyles.textPrimary} line-clamp-1`}>
                                {doc.employee_name || 'Unknown'}
                              </div>
                              <div className={`text-xs ${themeStyles.textMuted} line-clamp-1`}>
                                {doc.issue_date && `Issued: ${doc.issue_date}`}
                                {doc.expiry_date && ` • Expires: ${doc.expiry_date}`}
                              </div>
                            </td>
                            <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                theme === 'dark' ? 'text-white' : 'text-white'
                              } ${getStatusColor(doc.status)}`}>
                                {doc.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => openDocumentViewer(doc)}
                                  className={`p-1.5 rounded-md ${
                                    theme === 'dark' ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-gray-200'
                                  } transition-colors`}
                                  title="View"
                                >
                                  <FiEye className="w-4 h-4" />
                                </motion.button>
                                
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => downloadDocument(doc.id)}
                                  className={`p-1.5 rounded-md ${
                                    theme === 'dark' ? 'text-green-400 hover:bg-gray-700' : 'text-green-600 hover:bg-gray-200'
                                  } transition-colors`}
                                  title="Download"
                                >
                                  <FiDownload className="w-4 h-4" />
                                </motion.button>
                                
                                {doc.versions?.length > 0 && (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => openDocumentHistory(doc)}
                                    className={`p-1.5 rounded-md ${
                                      theme === 'dark' ? 'text-purple-400 hover:bg-gray-700' : 'text-purple-600 hover:bg-gray-200'
                                    } transition-colors`}
                                    title="Version History"
                                  >
                                    <FiClock className="w-4 h-4" />
                                  </motion.button>
                                )}
                                
                                {!doc.is_signed && (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSign(doc.id)}
                                    disabled={isLoading.signing}
                                    className={`p-1.5 rounded-md ${
                                      theme === 'dark' ? 'text-yellow-400 hover:bg-gray-700' : 'text-yellow-600 hover:bg-gray-200'
                                    } transition-colors disabled:opacity-50`}
                                    title="Sign Document"
                                  >
                                    {isLoading.signing ? (
                                      <svg className={`animate-spin h-4 w-4 ${
                                        theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                                      }`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                    ) : (
                                      <FiCheckCircle className="w-4 h-4" />
                                    )}
                                  </motion.button>
                                )}
                                
                                <div className="relative" ref={menuRef}>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => toggleMenu(doc.id)}
                                    className={`p-1.5 rounded-md ${
                                      theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'
                                    } transition-colors`}
                                  >
                                    <FiMoreVertical className="w-4 h-4" />
                                  </motion.button>
                                  
                                  <AnimatePresence>
                                    {expandedMenuId === doc.id && (
                                      <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.15 }}
                                        className={`absolute right-0 mt-1 w-48 rounded-md shadow-lg py-1 z-10 ${themeStyles.dropdownBg} border ${themeStyles.border}`}
                                      >
                                        {doc.status !== 'archived' && (
                                          <button
                                            onClick={() => {
                                              handleStatusChange(doc.id, 'archived');
                                              setExpandedMenuId(null);
                                            }}
                                            className={`flex items-center px-4 py-2 text-sm w-full text-left ${themeStyles.dropdownItem} transition-colors`}
                                          >
                                            <FiArchive className="mr-2 w-4 h-4" />
                                            Archive
                                          </button>
                                        )}
                                        {doc.status === 'active' && (
                                          <button
                                            onClick={() => {
                                              handleStatusChange(doc.id, 'expired');
                                              setExpandedMenuId(null);
                                            }}
                                            className={`flex items-center px-4 py-2 text-sm w-full text-left ${themeStyles.dropdownItem} transition-colors`}
                                          >
                                            <FiX className="mr-2 w-4 h-4" />
                                            Mark as Expired
                                          </button>
                                        )}
                                        {doc.status === 'draft' && (
                                          <button
                                            onClick={() => {
                                              handleStatusChange(doc.id, 'pending_signature');
                                              setExpandedMenuId(null);
                                            }}
                                            className={`flex items-center px-4 py-2 text-sm w-full text-left ${themeStyles.dropdownItem} transition-colors`}
                                          >
                                            <FiCheckCircle className="mr-2 w-4 h-4" />
                                            Submit for Signature
                                          </button>
                                        )}
                                        <button
                                          onClick={() => {
                                            // Add edit functionality here
                                            setExpandedMenuId(null);
                                          }}
                                          className={`flex items-center px-4 py-2 text-sm w-full text-left ${themeStyles.dropdownItem} transition-colors`}
                                        >
                                          <FiEdit className="mr-2 w-4 h-4" />
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => {
                                            // Add delete functionality here
                                            setExpandedMenuId(null);
                                          }}
                                          className={`flex items-center px-4 py-2 text-sm w-full text-left ${themeStyles.dropdownItem} transition-colors`}
                                        >
                                          <FiTrash2 className="mr-2 w-4 h-4" />
                                          Delete
                                        </button>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default FileManager;