import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const DocumentUploadForm = ({
  employeeId,
  currentDocument,
  categories,
  templates,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    issue_date: '',
    expiry_date: '',
    tags: '',
    file: null,
    category: '',
    template: '',
    requires_signature: false
  });

  useEffect(() => {
    if (currentDocument) {
      setFormData({
        ...currentDocument,
        template: currentDocument.template?.id || '',
        category: currentDocument.category?.id || '',
        requires_signature: currentDocument.requires_signature || false
      });
    }
  }, [currentDocument]);

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] :
              type === 'checkbox' ? checked : value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString || !dateString.includes('-')) return dateString;
    return dateString; // already yyyy-mm-dd from input type="date"
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData();
  data.append('title', formData.title);
  data.append('description', formData.description);
  data.append('issue_date', formatDate(formData.issue_date));
  data.append('expiry_date', formatDate(formData.expiry_date));
  data.append('tags', formData.tags);
  data.append('requires_signature', formData.requires_signature);
  data.append('employee', employeeId);

  if (formData.file instanceof File) data.append('file', formData.file);

  if (formData.category) {
    const categoryId = typeof formData.category === 'object' ? formData.category.id : formData.category;
    data.append('category', categoryId);
  }

  if (formData.template) {
    const templateId = typeof formData.template === 'object' ? formData.template.id : formData.template;
    data.append('template', templateId);
  }

  try {
    const url = currentDocument
      ? `/documents/documents/${currentDocument.id}/`
      : `/documents/documents/`;

    const method = currentDocument ? axiosInstance.patch : axiosInstance.post;

    const res = await method(url, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    let finalDocument = res.data;

if (formData.requires_signature && !currentDocument) {
  await axiosInstance.post(`/documents/documents/${res.data.id}/request_signature/`);
  const fullRes = await axiosInstance.get(`/documents/documents/${res.data.id}/`);
  finalDocument = fullRes.data;
}

onSuccess?.(finalDocument);
 // ✅ Use updated status here
  } catch (err) {
    console.error('Upload failed:', err.response?.data || err.message);
    alert("Upload failed:\n" + JSON.stringify(err.response?.data || err.message, null, 2));
  }
};


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Title*</label>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label>Category*</label>
        <select
  name="category"
  value={formData.category}
  onChange={e =>
    setFormData(prev => ({
      ...prev,
      category: parseInt(e.target.value) || '',
      template: '' // reset template when category changes
    }))
  }
  required
  className="w-full border p-2 rounded"
>
  <option value="">Select Category</option>
  {categories.map(cat => (
    <option key={cat.id} value={cat.id}>{cat.name}</option>
  ))}
</select>


      </div>

      {formData.category && (
  <select
  name="template"
  value={formData.template}
  onChange={e =>
    setFormData(prev => ({
      ...prev,
      template: parseInt(e.target.value) || ''
    }))
  }
  className="w-full border p-2 rounded"
>
  <option value="">None</option>
  {templates
    .filter(t => {
  const catId = typeof t.category === 'object' ? t.category.id : t.category;
  return Number(catId) === Number(formData.category);
})

    .map(template => (
      <option key={template.id} value={template.id}>
        {template.name} - {template.description}
      </option>
    ))}
</select>


)}


      <div>
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
      </div>

      <div className="flex gap-4">
        <div className="w-1/2">
          <label>Issue Date</label>
          <input
            type="date"
            name="issue_date"
            value={formData.issue_date}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="w-1/2">
          <label>Expiry Date</label>
          <input
            type="date"
            name="expiry_date"
            value={formData.expiry_date}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
      </div>

      <div>
        <label>Tags (comma-separated)</label>
        <input
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
      </div>
      {currentDocument?.file && (
  <p className="text-sm text-gray-600 mt-1">
    Current file:{' '}
    <a
      href={currentDocument.file}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline"
    >
      View existing file
    </a>
  </p>
)}


      <div>
        <label>File*</label>
        <input
          type="file"
          name="file"
          onChange={handleChange}
          required={!currentDocument}
          className="w-full border p-2 rounded"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="requires_signature"
          checked={formData.requires_signature}
          onChange={handleChange}
        />
        <label>Requires Signature</label>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {currentDocument ? 'Update' : 'Upload'}
        </button>
      </div>
    </form>
  );
};

export default DocumentUploadForm;
