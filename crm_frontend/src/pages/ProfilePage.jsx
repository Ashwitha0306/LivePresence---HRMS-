import React, { useState, useEffect,useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../api/axiosInstance';
import {
  StarIcon as SolidStarIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  EnvelopeIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon,
  UserCircleIcon,
  PhoneIcon,
  CakeIcon,
  HeartIcon,
  HomeIcon,
  ShieldExclamationIcon,
  BriefcaseIcon,
  IdentificationIcon,
  BuildingOfficeIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  TrophyIcon,
  // ArrowDownTrayIcon,
  XCircleIcon,
  BanknotesIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/solid';
import {
  LoadingOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import DocumentCard from '../components/DocumentCard.jsx';
import DocumentUploadForm from '../components/DocumentUploadForm';
import { StarIcon as OutlineStarIcon } from '@heroicons/react/24/outline';
const API_BASE_URL = '/employees';
  const showToast = (message, type = 'success') => {
  const toastOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };

  if (type === 'success') {
    toast.success(message, toastOptions);
  } else if (type === 'error') {
    toast.error(message, toastOptions);
  } else if (type === 'info') {
    toast.info(message, toastOptions);
  }
};


const DefaultAvatar = ({ firstName, lastName, className }) => {
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}` || 'US';
  const colors = ['bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-red-600', 'bg-yellow-600', 'bg-pink-600'];
  const getColor = () => {
    const storedColor = sessionStorage.getItem('avatarColor');
    if (storedColor) return storedColor;
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    sessionStorage.setItem('avatarColor', randomColor);
    return randomColor;
  };

  return (
    <div className={`${className} ${getColor()} rounded-lg border-4 border-gray-300 dark:border-gray-800 flex items-center justify-center text-white font-bold`}>
      {initials}
    </div>
  );
};

const EducationPopup = ({ education, onClose, onSave, onDelete, mode = 'edit' }) => {
  const [formData, setFormData] = useState(education || {
    institution: '',
    degree: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    is_current: false,
    grade: '',
    activities: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-300 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {mode === 'add' ? 'Add Education' : 'Edit Education'}
          </h3>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Institution*</label>
              <input
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Degree*</label>
              <input
                type="text"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Field of Study*</label>
              <input
                type="text"
                name="field_of_study"
                value={formData.field_of_study}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Grade</label>
              <input
                type="text"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date*</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                disabled={formData.is_current}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input 
              type="checkbox"
              name="is_current"
              checked={formData.is_current}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              id="is_current"
            />
            <label htmlFor="is_current" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Currently studying here
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Activities</label>
            <textarea
              name="activities"
              rows={2}
              value={formData.activities}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-between pt-4">
            {mode === 'edit' && (
              <button
                onClick={() => onDelete(formData.id)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <TrashIcon className="h-4 w-4 inline mr-1" />
                Delete
              </button>
            )}
            <div className="flex space-x-3 ml-auto">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => onSave(formData)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExperiencePopup = ({ experience, onClose, onSave, onDelete, mode = 'edit' }) => {
  const [formData, setFormData] = useState(experience || {
    company: '',
    title: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-300 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {mode === 'add' ? 'Add Experience' : 'Edit Experience'}
          </h3>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company*</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title*</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date*</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                disabled={formData.is_current}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_current"
              checked={formData.is_current}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              id="is_current_exp"
            />
            <label htmlFor="is_current_exp" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              I currently work here
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-between pt-4">
            {mode === 'edit' && (
              <button
                onClick={() => onDelete(formData.id)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <TrashIcon className="h-4 w-4 inline mr-1" />
                Delete
              </button>
            )}
            <div className="flex space-x-3 ml-auto">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => onSave(formData)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SkillPopup = ({ skill, onClose, onSave, onDelete, mode = 'edit' }) => {
  const [formData, setFormData] = useState(skill || {
    skill: '',
    proficiency_level: "2"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-300 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {mode === 'add' ? 'Add Skill' : 'Edit Skill'}
          </h3>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Skill*</label>
            <input
              type="text"
              name="skill"
              value={formData.skill}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Proficiency Level*</label>
            <select
              name="proficiency_level"
              value={formData.proficiency_level}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="1">Beginner</option>
              <option value="2">Intermediate</option>
              <option value="3">Advanced</option>
              <option value="4">Expert</option>
            </select>
          </div>

          <div className="flex justify-between pt-4">
            {mode === 'edit' && (
              <button
                onClick={() => onDelete(formData.id)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <TrashIcon className="h-4 w-4 inline mr-1" />
                Delete
              </button>
            )}
            <div className="flex space-x-3 ml-auto">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => onSave(formData)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, icon, children, fullWidth = false }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 ${fullWidth ? 'w-full' : ''}`}>
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 bg-gray-50 dark:bg-gray-900">
      {icon}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const Field = ({ label, value, icon }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
      {icon}
      <span className="ml-2">{label}</span>
    </label>
    <p className="text-gray-900 dark:text-white font-medium mt-1">{value}</p>
  </div>
);

const ProfilePage = () => {
  const [employee, setEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  // const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [educations, setEducations] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [skills, setSkills] = useState([]);
  const [showEducationPopup, setShowEducationPopup] = useState(false);
  const [showExperiencePopup, setShowExperiencePopup] = useState(false);
  const [showSkillPopup, setShowSkillPopup] = useState(false);
  const [currentEducation, setCurrentEducation] = useState(null);
  const [currentExperience, setCurrentExperience] = useState(null);
  const [currentSkill, setCurrentSkill] = useState(null);
  const employeeId = localStorage.getItem('employeeId');
  const token = localStorage.getItem('access');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employee?.id || null);
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [employeeBio, setEmployeeBio] = useState('');
const [editedBio, setEditedBio] = useState('');
const [isEditingBio, setIsEditingBio] = useState(false);
const [editRequestStatus, setEditRequestStatus] = useState(null);
const [showEditRequestModal, setShowEditRequestModal] = useState(false);
const [selectedField, setSelectedField] = useState('');
const [editReason, setEditReason] = useState('');
const [oldFieldValue, setOldFieldValue] = useState('');
const [newFieldValue, setNewFieldValue] = useState('');
const [changesSaved, setChangesSaved] = useState(false);
const [editableFields, setEditableFields] = useState([]);

useEffect(() => {
  const fetchEditRequestStatus = async () => {
    try {
      const res = await axiosInstance.get(`/employees/change-requests/?employee=${employeeId}`);
      const approvedRequests = res.data?.filter((req) => req.status === 'approved') || [];
      const pendingRequest = res.data?.find((req) => req.status === 'pending');

      if (approvedRequests.length > 0) {
        const approvedFields = approvedRequests.map((req) => req.field_name);
        setEditRequestStatus('approved');
        setEditableFields(approvedFields);

        // Reload the page only once after approval
        const hasReloaded = localStorage.getItem('hasReloadedAfterApproval');
        if (!hasReloaded) {
          localStorage.setItem('hasReloadedAfterApproval', 'true');
          setTimeout(() => window.location.reload(), 500);
        }

      } else if (pendingRequest) {
        setEditRequestStatus('pending');
        setEditableFields([]);
        localStorage.removeItem('hasReloadedAfterApproval'); // Reset if status is not approved
      } else {
        setEditRequestStatus(null);
        setEditableFields([]);
        localStorage.removeItem('hasReloadedAfterApproval');
      }
    } catch (err) {
      console.error('Failed to fetch edit request status:', err);
    }
  };

  if (employeeId) fetchEditRequestStatus();
}, [employeeId]);


// const employeeId = localStorage.getItem('employeeId');

  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [documentFormData, setDocumentFormData] = useState({
    title: '',
    description: '',
    category: '',
    template: '',
    tags: '',
    issue_date: '',
    expiry_date: '',
    file: null
  });

  useEffect(() => {
    if (employee) {
      setSelectedEmployeeId(employee.id);
    }
  }, [employee]);

const fetchDocuments = useCallback(async () => {
  try {
    const res = await axiosInstance.get(`/documents/?employee_id=${employeeId}`);
    setDocuments(res.data);
  } catch (err) {
    console.error('Error fetching documents:', err);
  }
}, [employeeId]); 

useEffect(() => {
  fetchDocuments();
}, [fetchDocuments]); // ✅ No warning now


  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/documents/categories/');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await axiosInstance.get('/documents/templates/');
      setTemplates(res.data);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTemplates();
  }, []);

  useEffect(() => {
    const fetchDocumentData = async () => {
      try {
        const [docsRes, catsRes, tempsRes] = await Promise.all([
          axiosInstance.get('/documents/documents/', {
            params: { employee: employeeId }
          }),
          axiosInstance.get('/documents/categories/'),
          axiosInstance.get('/documents/templates/')
        ]);

        setCategories(catsRes.data);
        setTemplates(tempsRes.data);

        const enrichedDocs = docsRes.data.map(doc => {
          const templateId = typeof doc.template === 'object' ? doc.template?.id : doc.template;
          const matchedTemplate = tempsRes.data.find(t => String(t.id) === String(templateId));

          const categoryId = typeof doc.category === 'object' ? doc.category?.id : doc.category;
          const matchedCategory = catsRes.data.find(c => String(c.id) === String(categoryId));

          return {
            ...doc,
            template_name: matchedTemplate ? matchedTemplate.name : 'No template',
            category_name: matchedCategory ? matchedCategory.name : 'Unknown',
            file: doc.file?.startsWith('http') ? doc.file : `${process.env.REACT_APP_BACKEND_URL || ''}${doc.file}`
          };
        });

        setDocuments(enrichedDocs);
      } catch (err) {
        console.error('Error fetching documents:', err);
      }
    };

    if (employeeId) fetchDocumentData();
  }, [employeeId]);

  const fetchEmployeeBio = async () => {
  try {
    const res = await axiosInstance.get(`employees/employees/${employeeId}/`);
    setEmployeeBio(res.data.bio || '');
  } catch (err) {
    console.error('Error fetching bio:', err);
  }
};

useEffect(() => {
  if (employeeId) fetchEmployeeBio();
}, [employeeId]);
const handleBioUpdate = async () => {
  try {
    await axiosInstance.patch(`employees/employees/${employeeId}/`, {
      bio: editedBio,
    });
    setEmployeeBio(editedBio);
    setIsEditingBio(false);
  showToast('Bio updated successfully!');
  } catch (err) {
    console.error('Error updating bio:', err);
   showToast('Failed to update bio.', 'error');
  }
};


  const handleDownloadDocument = async (doc) => {
    try {
      const res = await axiosInstance.get(`/documents/documents/${doc.id}/`);
      const filePath = res.data.file;

      if (!filePath) {
        showToast('File not available');
        return;
      }

      const fileUrl = filePath.startsWith('http')
        ? filePath
        : `http://localhost:8000/${filePath.startsWith('/') ? filePath.slice(1) : filePath}`;

      const response = await axiosInstance.get(fileUrl, { responseType: 'blob' });

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.title || 'document'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      showToast('Download failed.');
    }
  };



  const handleDocumentSubmit = async (e) => {
    e.preventDefault();

    const formatDate = (dateStr) => {
      if (!dateStr || !dateStr.includes("-")) return dateStr;
      const [dd, mm, yyyy] = dateStr.split("-");
      return `${yyyy}-${mm}-${dd}`;
    };

    const formData = new FormData();

    if (documentFormData.title) formData.append("title", documentFormData.title);
    if (documentFormData.category) formData.append("category", documentFormData.category);
    if (documentFormData.description) formData.append("description", documentFormData.description);
    if (documentFormData.tags) formData.append("tags", documentFormData.tags);
    if (documentFormData.issue_date) formData.append("issue_date", formatDate(documentFormData.issue_date));
    if (documentFormData.expiry_date) formData.append("expiry_date", formatDate(documentFormData.expiry_date));

    if (documentFormData.template) {
      formData.append("template", parseInt(documentFormData.template));
    }

    if (documentFormData.file instanceof File) {
      formData.append("file", documentFormData.file);
    } else {
      showToast("Please choose a valid file before submitting.");
      return;
    }

    formData.append("requires_signature", documentFormData.requires_signature ? "true" : "false");

    if (!employeeId) {
      showToast("Employee ID missing.");
      return;
    }
    formData.append("employee", employeeId);

    try {
      let response;

      if (currentDocument) {
        response = await axiosInstance.patch(
          `documents/documents/${currentDocument.id}/`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        response = await axiosInstance.post(
          `documents/documents/`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      if (documentFormData.requires_signature) {
        await axiosInstance.post(
          `documents/documents/${response.data.id}/request_signature/`,
          {}
        );

        const updatedDoc = await axiosInstance.get(`documents/documents/${response.data.id}/`);
        response.data = updatedDoc.data;
      }

      setDocuments((prevDocs) => {
        const safeDocs = Array.isArray(prevDocs) ? prevDocs : [];

        if (currentDocument) {
          return safeDocs.map((doc) =>
            doc.id === currentDocument.id ? response.data : doc
          );
        } else {
          return [...safeDocs, response.data];
        }
      });

      setShowDocumentModal(false);
      showToast(documentFormData.requires_signature
        ? "Document uploaded and signature requested!"
        : "Document uploaded successfully!"
      );
    } catch (err) {
      console.error("Upload failed:", err);
      const backendMsg = err.response?.data?.message || JSON.stringify(err.response?.data || {}, null, 2);
      showToast(`Upload failed:\n${backendMsg}`);
    }
  };

  const handleGeneratePdf = async (docId) => {
    try {
      const res = await axiosInstance.get(`documents/documents/${docId}/`);
      const filePath = res.data.file;

      if (!filePath) {
        showToast('PDF not found');
        return;
      }

      const fileUrl = filePath.startsWith('http')
        ? filePath
        : `http://localhost:8000/${filePath.startsWith('/') ? filePath.slice(1) : filePath}`;

      window.open(fileUrl, '_blank');
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      showToast('PDF generation failed.');
    }
  };

  const handleViewDocument = async (doc) => {
    try {
      const res = await axiosInstance.get(`documents/documents/${doc.id}/`);
      const filePath = res.data.file;

      if (!filePath) {
        showToast('File not found');
        return;
      }

      const fileUrl = filePath.startsWith('http')
        ? filePath
        : `http://localhost:8000/${filePath.startsWith('/') ? filePath.slice(1) : filePath}`;

      window.open(fileUrl, '_blank');
    } catch (err) {
      console.error('Failed to view document:', err);
      showToast('Could not open document.');
    }
  };

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const employeeRes = await axiosInstance.get(
          `${API_BASE_URL}/employees/${employeeId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEmployee(employeeRes.data);
        setFormData(employeeRes.data);
        
        const [educationRes, experienceRes, skillRes] = await Promise.all([
          axiosInstance.get(`${API_BASE_URL}/education/?employee=${employeeId}`),
          axiosInstance.get(`${API_BASE_URL}/experience/?employee=${employeeId}`),
          axiosInstance.get(`${API_BASE_URL}/skills/?employee=${employeeId}`)
        ]);
        
        setEducations(educationRes.data);
        setExperiences(experienceRes.data);
        setSkills(skillRes.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
      setLoading(false);
    };

    if (employeeId && token) fetchEmployeeData();
  }, [employeeId, token]);

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  // };
// const handleSave = async () => {
//   setSaving(true);
//   try {
//     await axiosInstance.patch(
//       `${API_BASE_URL}/employees/${employeeId}/`,
//       formData,
//       {
//         headers: { Authorization: `Bearer ${token}` }
//       }
//     );

//     const updatedRes = await axiosInstance.get(`${API_BASE_URL}/employees/${employeeId}/`);
//     setEmployee(updatedRes.data);

//     setEditing(false);
//     setEditableFields([]);
//     setEditRequestStatus('used');
//     setChangesSaved(true); // Add this line
//   } catch (err) {
//     console.error('Error saving profile:', err);
//     alert("Error saving profile. Please try again.");
//   } finally {
//     setSaving(false);
//   }
// };

const handleEditRequest = async () => {
  const employeeId = localStorage.getItem('employeeId');
  if (!employeeId || !selectedField || !newFieldValue) {
    showToast("Please fill all required fields.");
    return;
  }

  const payload = {
    employee: employeeId,
    field_name: selectedField,
    old_value: oldFieldValue,
    new_value: newFieldValue,
    reason: editReason,
  };

  try {
    const response = await axiosInstance.post(`/employees/change-requests/`, payload);
    console.log("✅ Edit request sent:", response.data);
     showToast("Edit Request Sent!");
    setEditRequestStatus("pending");
    setShowEditRequestModal(false);
  } catch (error) {
    console.error("❌ Request failed:", error);
    showToast("Failed to request edit access. Check console.");
  }
};


  // const handleCancel = () => {
  //   setFormData(employee);
  //   setEditing(false);
  // };

  const handleSaveEducation = async (data) => {
    try {
      const educationData = { ...data, employee: employeeId };
      let response;
      
      if (data.id) {
        response = await axiosInstance.patch(
          `${API_BASE_URL}/education/${data.id}/`,
          educationData
        );
        setEducations(educations.map(edu => edu.id === data.id ? response.data : edu));
      } else {
        response = await axiosInstance.post(
          `${API_BASE_URL}/education/`,
          educationData
        );
        setEducations([...educations, response.data]);
      }
      setShowEducationPopup(false);
    } catch (err) {
      console.error("Error saving education:", err);
    }
  };

  const handleDeleteEducation = async (id) => {
    try {
      await axiosInstance.delete(`${API_BASE_URL}/education/${id}/`);
      setEducations(educations.filter(edu => edu.id !== id));
      setShowEducationPopup(false);
    } catch (err) {
      console.error('Error deleting education:', err);
    }
  };

  const handleSaveExperience = async (data) => {
    try {
      const experienceData = { ...data, employee: employeeId };
      let response;
      
      if (data.id) {
        response = await axiosInstance.patch(
          `${API_BASE_URL}/experience/${data.id}/`,
          experienceData
        );
        setExperiences(experiences.map(exp => exp.id === data.id ? response.data : exp));
      } else {
        response = await axiosInstance.post(
          `${API_BASE_URL}/experience/`,
          experienceData
        );
        setExperiences([...experiences, response.data]);
      }
      setShowExperiencePopup(false);
    } catch (err) {
      console.error("Error saving experience:", err);
    }
  };

  const handleDeleteExperience = async (id) => {
    try {
      await axiosInstance.delete(`${API_BASE_URL}/experience/${id}/`);
      setExperiences(experiences.filter(exp => exp.id !== id));
      setShowExperiencePopup(false);
    } catch (err) {
      console.error('Error deleting experience:', err);
    }
  };

  const handleSaveSkill = async (data) => {
    try {
      const skillData = {
        skill: data.skill,
        proficiency_level: Number(data.proficiency_level),
        employee: employeeId
      };
      let response;
      
      if (data.id) {
        response = await axiosInstance.patch(
          `${API_BASE_URL}/skills/${data.id}/`,
          skillData
        );
        setSkills(skills.map(skill => skill.id === data.id ? response.data : skill));
      } else {
        response = await axiosInstance.post(
          `${API_BASE_URL}/skills/`,
          skillData
        );
        setSkills([...skills, response.data]);
      }
      setShowSkillPopup(false);
    } catch (err) {
      console.error("Error saving skill:", err);
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await axiosInstance.delete(`${API_BASE_URL}/skills/${id}/`);
      setSkills(skills.filter(skill => skill.id !== id));
      setShowSkillPopup(false);
    } catch (err) {
      console.error('Error deleting skill:', err);
    }
  };

 const renderField = ({ label, name, icon }) => {
  const value = formData[name] || '';

  // Convert code values into readable text
  const displayValue = (() => {
    if (name === 'gender') {
      if (value === 'M') return 'Male';
      if (value === 'F') return 'Female';
      if (value === 'O') return 'Other';
      return '-';
    }
    if (name === 'marital_status') {
      if (value === 'S') return 'Single';
      if (value === 'M') return 'Married';
      if (value === 'D') return 'Divorced';
      if (value === 'W') return 'Widowed';
      return '-';
    }
    return value || '-';
  })();

  return (
    <div key={name} className="space-y-1">
      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
        {icon}
        <span className="ml-2">{label}</span>
      </label>
      <p className="text-gray-900 dark:text-white font-medium mt-1">{displayValue}</p>
    </div>
  );
};


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 text-center space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <LoadingOutlined className="text-4xl text-blue-600 dark:text-blue-400" />
        </motion.div>
        <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
          Loading your Profile Page..
        </p>
      </div>
    );
  }
  if (!employee) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Employee not found or unauthorized.</p>
      </div>
    );
  }

  const renderPersonalTab = () => (
     <div className="max-w-[1500px] mx-auto space-y-8 ml-20">
    <div className="grid grid-cols-1 gap-6">
      <Card title="Basic Information" icon={<UserCircleIcon className="h-5 w-5 text-blue-500" />} fullWidth>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'First Name', name: 'first_name', icon: <UserCircleIcon className="h-5 w-5 text-gray-500" /> },
            { label: 'Last Name', name: 'last_name', icon: <UserCircleIcon className="h-5 w-5 text-gray-500" /> },
            { label: 'Email', name: 'email', icon: <EnvelopeIcon className="h-5 w-5 text-gray-500" /> },
            { label: 'Phone Number', name: 'phone', icon: <PhoneIcon className="h-5 w-5 text-gray-500" /> },
            { label: 'Date of Birth', name: 'date_of_birth', icon: <CakeIcon className="h-5 w-5 text-gray-500" />, type: 'date' },
            { label: 'Gender', name: 'gender', icon: <UserCircleIcon className="h-5 w-5 text-gray-500" /> },
            { label: 'Blood Group', name: 'blood_group', icon: <HeartIcon className="h-5 w-5 text-gray-500" /> },
            { label: 'Marital Status', name: 'marital_status', icon: <UserGroupIcon className="h-5 w-5 text-gray-500" /> },
          ].map(renderField)}
        </div>
      </Card>

      <Card title="Contact Information" icon={<HomeIcon className="h-5 w-5 text-blue-500" />} fullWidth>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
              <MapPinIcon className="h-5 w-5 text-gray-500" />
              <span className="ml-2">Present Address</span>
            </label> */}
            {/* Present Address */}
<div className="space-y-1">
  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
    <MapPinIcon className="h-5 w-5 text-gray-500" />
    <span className="ml-2">Present Address</span>
  </label>
  <p className="text-gray-900 dark:text-white font-medium mt-1">
    {formData.present_address || '-'}
  </p>
</div>


          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
              <MapPinIcon className="h-5 w-5 text-gray-500" />
              <span className="ml-2">Permanent Address</span>
            </label>
            <p className="text-gray-900 dark:text-white font-medium mt-1">
  {formData.present_address || '-'}
</p>

          </div>

          {/* Other Fields using renderField */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {[
    {
      label: 'Alternative Phone',
      name: 'alternative_phone',
      icon: <PhoneIcon className="h-5 w-5 text-gray-500" />,
    },
    {
      label: 'Nationality',
      name: 'nationality',
      icon: <UserGroupIcon className="h-5 w-5 text-gray-500" />,
    },
  ].map(({ label, name, icon }) => (
    <div key={name} className="space-y-1">
      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
        {icon}
        <span className="ml-2">{label}</span>
      </label>
      <p className="text-gray-900 dark:text-white font-medium mt-1">
        {formData[name] || '-'}
      </p>
    </div>
  ))}
</div>
        </div>
      </Card>

      {/* Emergency Contact */}
<Card title="Emergency Contact" icon={<ShieldExclamationIcon className="h-5 w-5 text-blue-500" />} fullWidth>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {[
      { label: 'Emergency Contact Name', name: 'emergency_contact_name', icon: <UserCircleIcon className="h-5 w-5 text-gray-500" /> },
      { label: 'Emergency Contact Number', name: 'emergency_contact_phone', icon: <PhoneIcon className="h-5 w-5 text-gray-500" /> },
      { label: 'Relationship', name: 'emergency_contact_relation', icon: <UserGroupIcon className="h-5 w-5 text-gray-500" /> },
    ].map(({ label, name, icon }) => (
      <div key={name} className="space-y-1">
        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
          {icon}
          <span className="ml-2">{label}</span>
        </label>
        <p className="text-gray-900 dark:text-white font-medium mt-1">
          {formData[name] || '-'}
        </p>
      </div>
    ))}
  </div>
</Card>
     {/* Bank Details */}
<Card title="Bank Details" icon={<BanknotesIcon className="h-5 w-5 text-blue-500" />} fullWidth>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {[
      { label: 'Bank Name', name: 'bank_name', icon: <BuildingOfficeIcon className="h-5 w-5 text-gray-500" /> },
      { label: 'Account Number', name: 'account_number', icon: <IdentificationIcon className="h-5 w-5 text-gray-500" /> },
      { label: 'Branch Name', name: 'branch_name', icon: <MapPinIcon className="h-5 w-5 text-gray-500" /> },
      { label: 'IFSC Code', name: 'ifsc_code', icon: <IdentificationIcon className="h-5 w-5 text-gray-500" /> },
    ].map(({ label, name, icon }) => (
      <div key={name} className="space-y-1">
        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
          {icon}
          <span className="ml-2">{label}</span>
        </label>
        <p className="text-gray-900 dark:text-white font-medium mt-1">
          {formData[name] || '-'}
        </p>
      </div>
    ))}
  </div>
</Card>


      {/* {editing && (
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )} */}
    </div>
    </div>
  );

  const renderProfessionalTab = () => (
     <div className="max-w-[1500px] mx-auto space-y-8 ml-20">
    <div className="grid grid-cols-1 gap-6">
      <Card title="Employment Details" icon={<BriefcaseIcon className="h-5 w-5 text-blue-500" />} fullWidth>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Field label="Employee ID" value={employee.company_id || 'N/A'} icon={<IdentificationIcon className="h-5 w-5 text-gray-500" />} />
          <Field label="Department" value={employee.department_name || 'N/A'} icon={<BuildingOfficeIcon className="h-5 w-5 text-gray-500" />} />
          <Field label="Designation" value={employee.designation_title || 'N/A'} icon={<ChartBarIcon className="h-5 w-5 text-gray-500" />} />
          <Field label="Date of Joining" value={employee.date_of_joining || 'N/A'} icon={<CalendarIcon className="h-5 w-5 text-gray-500" />} />
          <Field label="Employment Type" value={employee.employment_type || 'N/A'} icon={<ClockIcon className="h-5 w-5 text-gray-500" />} />
          <Field label="Employment Status" value={employee.employment_status || 'N/A'} icon={<UserCircleIcon className="h-5 w-5 text-gray-500" />} />
          <Field label="Reporting Manager" value={employee.reporting_manager_name || 'N/A'} icon={<UserCircleIcon className="h-5 w-5 text-gray-500" />} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <Card title="Timeline Details" icon={<ClockIcon className="h-5 w-5 text-blue-500" />} fullWidth>
          {Array.isArray(employee.timeline) && employee.timeline.length > 0 && (
            <div className="mt-8">
              <div className="border-l-2 border-blue-500 pl-4 space-y-4">
                {employee.timeline.map((event, index) => (
                  <div key={index} className="relative">
                    <div className="absolute -left-2 top-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="ml-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{event.title || 'Untitled Event'}</p>
                      <p className="text-xs text-gray-500">{event.event_date ? new Date(event.event_date).toLocaleDateString() : 'No date'}</p>
                      {event.description && (
                        <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

   <Card title="Experience" icon={<BriefcaseIcon className="h-5 w-5 text-blue-500" />}>
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {experiences.map(exp => (
      <div key={exp.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-600 p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{exp.title}</h3>
            <p className="text-blue-600 dark:text-blue-400">{exp.company}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {new Date(exp.start_date).toLocaleDateString()} - 
              {exp.is_current ? ' Present' : ` ${new Date(exp.end_date).toLocaleDateString()}`}
            </p>
            {exp.location && (
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {exp.location}
              </p>
            )}
          </div>
          <button 
            onClick={() => {
              setCurrentExperience(exp);
              setShowExperiencePopup(true);
            }}
            className="text-blue-500 hover:text-blue-400 p-1"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        </div>
        {exp.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            {exp.description}
          </p>
        )}
      </div>
    ))}
    <button
      onClick={() => {
        setCurrentExperience(null);
        setShowExperiencePopup(true);
      }}
      className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
    >
      <PlusIcon className="h-6 w-6 mb-1" />
      <span>Add Experience</span>
    </button>
  </div>
</Card>

    <Card title="Education" icon={<AcademicCapIcon className="h-5 w-5 text-blue-500" />}>
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {educations.map(edu => (
      <div key={edu.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-600 p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{edu.degree}</h3>
            <p className="text-blue-600 dark:text-blue-400">{edu.institution}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {new Date(edu.start_date).toLocaleDateString()} - 
              {edu.is_current ? ' Present' : ` ${new Date(edu.end_date).toLocaleDateString()}`}
            </p>
            {edu.field_of_study && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Field: {edu.field_of_study}
              </p>
            )}
            {edu.grade && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Grade: {edu.grade}
              </p>
            )}
          </div>
          <button 
            onClick={() => {
              setCurrentEducation(edu);
              setShowEducationPopup(true);
            }}
            className="text-blue-500 hover:text-blue-400 p-1"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        </div>
        {(edu.activities || edu.description) && (
          <div className="mt-2 space-y-1">
            {edu.activities && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Activities:</span> {edu.activities}
              </p>
            )}
            {edu.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {edu.description}
              </p>
            )}
          </div>
        )}
      </div>
    ))}
    <button
      onClick={() => {
        setCurrentEducation(null);
        setShowEducationPopup(true);
      }}
      className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
    >
      <PlusIcon className="h-6 w-6 mb-1" />
      <span>Add Education</span>
    </button>
  </div>
</Card>

<Card title="Skills" icon={<TrophyIcon className="h-5 w-5 text-blue-500" />}>
  <div className="space-y-4">
    <div className="flex flex-wrap gap-3">
      {skills.map(skill => {
        const filledStars = parseInt(skill.proficiency_level) || 0;
        const totalStars = 4;

        return (
          <div
            key={skill.id}
            className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800 rounded-full px-4 py-2 flex items-center shadow-md hover:shadow-lg transition-shadow"
          >
            <span className="text-blue-800 dark:text-blue-100 font-semibold">{skill.skill}</span>
            <div className="flex items-center ml-3">
              {[...Array(totalStars)].map((_, i) =>
                i < filledStars ? (
                  <SolidStarIcon key={i} className="h-4 w-4 text-yellow-400" />
                ) : (
                  <OutlineStarIcon key={i} className="h-4 w-4 text-yellow-300 opacity-70" />
                )
              )}
            </div>
            <button
              onClick={() => {
                setCurrentSkill(skill);
                setShowSkillPopup(true);
              }}
              className="text-blue-500 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-200 ml-3 transition-colors"
              title="Edit Skill"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>

    <button
      onClick={() => {
        setCurrentSkill(null);
        setShowSkillPopup(true);
      }}
      className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
    >
      <PlusIcon className="h-5 w-5 mr-1" />
      Add Skill
    </button>
  </div>
</Card>
<Card title="Bio" icon={<UserIcon className="h-5 w-5 text-blue-500" />}>
  <div className="space-y-4">
    {!isEditingBio ? (
      <div className="flex justify-between items-start bg-gray-50 dark:bg-gray-800  dark:border-gray-700 p-4 rounded-md shadow-sm">
        <p className="text-gray-800 dark:text-gray-100 max-w-xl whitespace-pre-wrap font-semibold">
          {employeeBio || 'No bio available.'}
        </p>
        <button
          onClick={() => {
            setEditedBio(employeeBio);
            setIsEditingBio(true);
          }}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200 ml-4 transition-colors"
          title="Edit Bio"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
      </div>
    ) : (
      <div className="space-y-3">
        <textarea
          value={editedBio}
          onChange={(e) => setEditedBio(e.target.value)}
          rows={4}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        />
        <div className="flex gap-4">
          <button
            onClick={handleBioUpdate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
          >
            💾 Save Bio
          </button>
          <button
            onClick={() => setIsEditingBio(false)}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    )}
  </div>
</Card>
</div>
    </div>
  );

  const renderDocumentsTab = () => (
     <div className="max-w-[1500px] mx-auto space-y-8 ml-20">
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 p-10">
      <Card title="Documents" icon={<DocumentTextIcon className="h-5 w-5 text-blue-500" />} fullWidth>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Documents</h3>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.isArray(documents) && documents.map(doc => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onDownload={handleDownloadDocument}
              onGeneratePdf={handleGeneratePdf}
              onView={handleViewDocument}
            />
          ))}
          
          {Array.isArray(documents) && documents.length === 0 && (
            <div className="col-span-full text-center py-10">
              <DocumentTextIcon className="h-10 w-10 text-gray-400 mx-auto" />
              <h4 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No documents found</h4>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                You haven't received any documents yet.
              </p>
            </div>
          )}
        </div>
      </Card>

      {showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {currentDocument ? 'Edit Document' : 'Add New Document'}
              </h3>
              <button 
                onClick={() => {
                  setShowDocumentModal(false);
                  setCurrentDocument(null);
                }} 
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <DocumentUploadForm
              employeeId={employeeId}
              currentDocument={currentDocument}
              categories={categories}
              templates={templates}
              onSuccess={(newDoc) => {
                setDocuments((prevDocs) => {
                  const safeDocs = Array.isArray(prevDocs) ? prevDocs : [];
                  const enrichedDoc = {
                    ...newDoc,
                    template_name: templates.find(t => t.id === newDoc.template)?.name || 'None',
                    category_name: categories.find(c => c.id === newDoc.category)?.name || 'Unknown',
                    versions: [],
                    signatures: [],
                  };

                  if (currentDocument) {
                    return safeDocs.map(doc => doc.id === currentDocument.id ? enrichedDoc : doc);
                  } else {
                    return [enrichedDoc, ...safeDocs];
                  }
                });

                setShowDocumentModal(false);
                setCurrentDocument(null);
              }}
              onCancel={() => {
                setShowDocumentModal(false);
                setCurrentDocument(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
    </div>
  );

  return (
    <div className="max-w-full px-4 py-8 space-y-10 bg-white dark:bg-gray-900 max-h-f">
       <div className="max-w-[1500px] mx-auto space-y-8 ml-20">
      <div className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white rounded-xl shadow-lg p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
       
        <div className="relative">
          {employee?.profile_picture ? (
            <img
              src={employee.profile_picture}
              alt="Profile"
              className="w-32 h-32 object-cover rounded-lg border-4 border-gray-300 dark:border-gray-800"
            />
          ) : (
            <DefaultAvatar 
              firstName={employee?.first_name} 
              lastName={employee?.last_name} 
              className="w-32 h-32 text-4xl"
            />
          )}
          {/* {editing && activeTab === 'personal' && (
            <button className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full shadow hover:bg-blue-700 transition">
              <PencilIcon className="h-4 w-4 text-white" />
            </button>
          )} */}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                {employee.first_name} {employee.last_name}
              </h1>
              <p className="flex items-center gap-2 mt-1 text-blue-200">
                <BriefcaseIcon className="h-5 w-5" />
                {employee.designation_title || 'N/A'}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="bg-white/10 px-3 py-1 rounded-full text-xs flex items-center">
                  <IdentificationIcon className="h-4 w-4 mr-1" />
                  {employee.company_id || 'N/A'}
                </span>
                <span className="bg-white/10 px-3 py-1 rounded-full text-xs flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                  {employee.department_name || 'N/A'}
                </span>
                <span className="bg-green-900/50 text-green-300 px-3 py-1 rounded-full text-xs flex items-center">
                  <span className="h-2 w-2 rounded-full mr-2 bg-green-400" />
                  Active
                </span>
              </div>
            </div>

        
       {activeTab === 'personal' && (
  <div className="flex space-x-2">
    {editRequestStatus === 'pending' ? (
      <button
        className="bg-gray-400 cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium"
        disabled
      >
        <ShieldExclamationIcon className="h-4 w-4 mr-1" />
        Request Pending
      </button>
    ) : (
      <button
        onClick={() => setShowEditRequestModal(true)}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition flex items-center text-sm font-medium"
      >
        <ShieldExclamationIcon className="h-4 w-4 mr-1" />
        Request Edit Access
      </button>
    )}
  </div>
)}


          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 text-sm text-blue-200">
            <div className="flex items-center">
              <EnvelopeIcon className="h-4 w-4 mr-2" />
              {employee.email || 'N/A'}
            </div>
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 mr-2" />
              {formData.present_address || ''}
            </div>
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Joined {employee.date_of_joining || 'N/A'}
            </div>
          </div>
        </div>
      </div>
      </div>

      <div className="flex p-1 bg-gray-200 dark:bg-gray-800 rounded-full max-w-md mx-auto">
        {[
          { id: 'personal', label: 'Personal', icon: <UserCircleIcon className="h-5 w-5" /> },
          { id: 'professional', label: 'Professional', icon: <BriefcaseIcon className="h-5 w-5" /> },
          { id: 'documents', label: 'Documents', icon: <DocumentTextIcon className="h-5 w-5" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-full text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      <div className="pb-10">
        {activeTab === 'personal' ? renderPersonalTab() : 
         activeTab === 'professional' ? renderProfessionalTab() : 
         renderDocumentsTab()}
      </div>

      {showEducationPopup && (
        <EducationPopup
          education={currentEducation}
          onClose={() => setShowEducationPopup(false)}
          onSave={handleSaveEducation}
          onDelete={handleDeleteEducation}
          mode={currentEducation ? 'edit' : 'add'}
        />
      )}

      {showExperiencePopup && (
        <ExperiencePopup
          experience={currentExperience}
          onClose={() => setShowExperiencePopup(false)}
          onSave={handleSaveExperience}
          onDelete={handleDeleteExperience}
          mode={currentExperience ? 'edit' : 'add'}
        />
      )}

      {showSkillPopup && (
        <SkillPopup
          skill={currentSkill}
          onClose={() => setShowSkillPopup(false)}
          onSave={handleSaveSkill}
          onDelete={handleDeleteSkill}
          mode={currentSkill ? 'edit' : 'add'}
        />
      )}
     

{showEditRequestModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-out">
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 w-full max-w-md transform transition-all duration-300 ease-out scale-100 opacity-100">
      <h2 className="text-lg font-bold mb-4 text-black dark:text-white">Request Edit Access</h2>

      <label className="text-sm font-medium text-black dark:text-white">Select Field</label>
      <select
        className="w-full rounded px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e293b] text-black dark:text-white"
        value={selectedField}
        onChange={(e) => {
          const field = e.target.value;
          setSelectedField(field);
          setOldFieldValue(employee?.[field] || '');
        }}
      >
        <option value="">-- Select Field --</option>
        {/* <option value="bio">Bio</option> */}
        <option value="phone">Phone</option>
        <option value="email">Email</option>
        <option value="present_address">Present Address</option>
      </select>

      <label className="text-sm font-medium text-black dark:text-white">Old Value</label>
      <input
        className="w-full rounded px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e293b] text-black dark:text-white"
        type="text"
        value={oldFieldValue}
        disabled
      />

      <label className="text-sm font-medium text-black dark:text-white">New Value</label>
      <input
        className="w-full rounded px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e293b] text-black dark:text-white"
        type="text"
        value={newFieldValue}
        onChange={(e) => setNewFieldValue(e.target.value)}
      />

      <label className="text-sm font-medium text-black dark:text-white">Reason</label>
      <textarea
        className="w-full rounded px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e293b] text-black dark:text-white"
        value={editReason}
        onChange={(e) => setEditReason(e.target.value)}
        placeholder="Why do you need to update this?"
      />

      <div className="flex justify-end gap-2">
        <button
          onClick={handleEditRequest}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Request
        </button>
        <button
          onClick={() => setShowEditRequestModal(false)}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
        >
          Cancel
        </button>
      </div>
    </div>
    
  </div>
)}

<ToastContainer />
    </div>
  );
};

export default ProfilePage;