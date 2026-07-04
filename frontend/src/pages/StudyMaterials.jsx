import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Loading from '../components/Loading.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Plus,
  X,
  Check,
  Paperclip,
  Download,
  BookOpen,
  FileText,
  StickyNote,
  ClipboardList,
  Eye,
  Pencil,
  Trash2,
  Lightbulb,
} from 'lucide-react';

const PAGE_SIZE = 24;

const StudyMaterials = () => {
  const { user, api } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterType, setFilterType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showContentModal, setShowContentModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    type: 'notes',
    targetCollegeScope: 'self',
    targetStream: '',
    targetSection: '',
    fileUrl: '',
    content: '',
    tags: ''
  });

  useEffect(() => {
    fetchMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const endpoint = user.role === 'teacher' ? '/study-materials/teacher' : '/study-materials';
      const response = await api.get(endpoint);
      setMaterials(response.data);
      console.log('Fetched materials:', response.data); // Debug log
    } catch (error) {
      toast.error('Failed to fetch study materials');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      const formDataFile = new FormData();
      formDataFile.append('file', selectedFile);

      const response = await api.post('/study-materials/upload', formDataFile, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData({ ...formData, fileUrl: response.data.fileUrl });
      toast.success('File uploaded successfully!');
      setSelectedFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // If file is selected but not uploaded yet, upload it first
      let finalFileUrl = formData.fileUrl;
      if (selectedFile && !uploading) {
        setUploading(true);
        const formDataFile = new FormData();
        formDataFile.append('file', selectedFile);

        const uploadResponse = await api.post('/study-materials/upload', formDataFile, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        finalFileUrl = uploadResponse.data.fileUrl;
        toast.success('File uploaded successfully!');
        setUploading(false);
      }

      const tagsArray = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];
      if (!formData.targetStream.trim()) {
        toast.error('Please enter target stream/branch');
        setUploading(false);
        return;
      }

      if (formData.targetCollegeScope === 'self' && !user?.college) {
        toast.error('Please add your college in profile before choosing "My College"');
        setUploading(false);
        return;
      }

      const payload = { ...formData, fileUrl: finalFileUrl, tags: tagsArray };

      if (editingId) {
        await api.put(`/study-materials/${editingId}`, payload);
        toast.success('Material updated successfully!');
      } else {
        await api.post('/study-materials', payload);
        toast.success('Material created successfully!');
      }

      resetForm();
      fetchMaterials();
      setSelectedFile(null);
    } catch (error) {
      setUploading(false);
      toast.error(error.response?.data?.message || 'Failed to save material');
    }
  };
  
  const handleEdit = (material) => {
    setFormData({
      title: material.title,
      description: material.description || '',
      subject: material.subject,
      type: material.type,
      targetCollegeScope: material.targetCollegeScope || 'self',
      targetStream: material.targetStream || '',
      targetSection: material.targetSection || '',
      fileUrl: material.fileUrl || '',
      content: material.content || '',
      tags: material.tags?.join(', ') || ''
    });
    setEditingId(material._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;

    try {
      await api.delete(`/study-materials/${id}`);
      toast.success('Material deleted successfully!');
      fetchMaterials();
    } catch (error) {
      toast.error('Failed to delete material');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subject: '',
      type: 'notes',
      targetCollegeScope: 'self',
      targetStream: '',
      targetSection: '',
      fileUrl: '',
      content: '',
      tags: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredMaterials = materials.filter(m => {
    const matchSubject = !filterSubject || m.subject.toLowerCase().includes(filterSubject.toLowerCase());
    const matchType = !filterType || m.type === filterType;
    return matchSubject && matchType;
  });

  useEffect(() => {
    setPage(1);
  }, [filterSubject, filterType]);

  const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / PAGE_SIZE));
  const pagedMaterials = filteredMaterials.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'notes':
        return <StickyNote className="w-4 h-4" />;
      case 'suggestion_paper':
        return <ClipboardList className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getTypeBadgeColor = (type) => {
    switch(type) {
      case 'pdf': return 'bg-[#FEF2F2] text-[#B91C1C] dark:bg-red-900/30 dark:text-red-300';
      case 'notes': return 'bg-[#EFF6FF] text-[#1D4ED8] dark:bg-[#1e2a4a] dark:text-[#93C5FD]';
      case 'suggestion_paper': return 'bg-[#F5F3FF] text-[#6D28D9] dark:bg-[#241b3a] dark:text-[#c4b5fd]';
      default: return 'bg-[#F4F1EA] text-[#3D3929] dark:bg-[#3a362f] dark:text-[#c2b8a3]';
    }
  };
const handleDownload = async (material) => {
  const toastId = toast.loading('Preparing your PDF...');
  try {
    const response = await api.get(`/study-materials/download/${material._id}`, {
      responseType: 'blob',
    });

    const filename = `${material.title || 'file'}.pdf`;
    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: 'application/pdf' })
    );

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 150);

    toast.dismiss(toastId);
    toast.success('Download started!');

  } catch (error) {
    toast.dismiss(toastId);
    console.error('Download error:', error);

    if (error.response?.data instanceof Blob) {
      const text = await error.response.data.text();
      try {
        const { message } = JSON.parse(text);
        toast.error(message || 'Download failed');
      } catch { toast.error('Download failed'); }
    } else {
      toast.error('Download failed');
    }
  }
};
  const handleReadContent = (material) => {
    setSelectedMaterial(material);
    setShowContentModal(true);
  };

  const closeContentModal = () => {
    setShowContentModal(false);
    setSelectedMaterial(null);
  };

  if (loading) {
    return <Loading fullScreen text="Loading study materials..." />;
  }

  const inputCls = "w-full px-3 sm:px-4 py-2 text-sm border border-[#E6E0D4] dark:border-[#3a362f] rounded-lg bg-white dark:bg-[#1A1815] text-[#3D3929] dark:text-[#F4F1EA] placeholder-[#a89d89] focus:outline-none focus:ring-2 focus:ring-[#2563EB]";

  return (
    <div className="min-h-screen bg-[#F4F1EA] dark:bg-[#1A1815]">
      <div className="flex min-h-screen">
        <main className="flex-1 px-4 py-4 md:px-6 md:py-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#3D3929] dark:text-[#F4F1EA] flex items-center gap-2">
                  <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />
                  Study Materials
                </h1>
                <p className="mt-1 text-sm sm:text-base text-[#83786a] dark:text-[#c2b8a3]">
                  {user.role === 'teacher' ? 'Manage and share study resources with students' : 'Access learning resources shared by teachers'}
                </p>
              </div>
              {user.role === 'teacher' && (
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-2.5 text-sm bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white rounded-full transition-all font-semibold touch-manipulation"
                >
                  {showForm ? (
                    <X className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  )}
                  {showForm ? 'Cancel' : 'Add Material'}
                </button>
              )}
            </div>
          </div>

          {/* Create/Edit Form */}
          {showForm && user.role === 'teacher' && (
            <div className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-[#3D3929] dark:text-[#F4F1EA] mb-4">
                {editingId ? 'Edit Material' : 'Create New Material'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3D3929] dark:text-[#c2b8a3] mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3D3929] dark:text-[#c2b8a3] mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3D3929] dark:text-[#c2b8a3] mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className={inputCls}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3D3929] dark:text-[#c2b8a3] mb-1">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className={inputCls}
                    >
                      <option value="notes">Notes</option>
                      <option value="pdf">PDF</option>
                      <option value="suggestion_paper">Suggestion Paper</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3D3929] dark:text-[#c2b8a3] mb-1">
                      College Audience
                    </label>
                    <select
                      value={formData.targetCollegeScope}
                      onChange={(e) => setFormData({ ...formData, targetCollegeScope: e.target.value })}
                      className={inputCls}
                    >
                      <option value="self">My College {user?.college ? `(${user.college})` : ''}</option>
                      <option value="all">All Colleges</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3D3929] dark:text-[#c2b8a3] mb-1">
                      Target Stream / Branch *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.targetStream}
                      onChange={(e) => setFormData({ ...formData, targetStream: e.target.value })}
                      placeholder="e.g., CSE"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3D3929] dark:text-[#c2b8a3] mb-1">
                      Target Section (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.targetSection}
                      onChange={(e) => setFormData({ ...formData, targetSection: e.target.value })}
                      placeholder="e.g., A (leave blank for all sections)"
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="border-2 border-dashed border-[#E6E0D4] dark:border-[#3a362f] rounded-lg p-4 bg-[#EFF6FF] dark:bg-[#1e2a4a]/40">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-[#3D3929] dark:text-[#c2b8a3] mb-2">
                    <Paperclip className="w-4 h-4" />
                    Upload File (So students can download) - Optional
                  </label>
                  <p className="text-xs text-[#83786a] dark:text-[#c2b8a3] mb-3">
                    Upload PDF, Excel, Word, PPT or images for students to download
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.xlsx,.xls"
                        className="block w-full text-sm text-[#83786a] dark:text-[#c2b8a3]
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-lg file:border-0
                          file:text-sm file:font-semibold
                          file:bg-[#DBEAFE] file:text-[#1D4ED8]
                          hover:file:bg-[#BFDBFE] dark:file:bg-[#1e2a4a] dark:file:text-[#93C5FD]"
                      />
                      <button
                        type="button"
                        onClick={handleFileUpload}
                        disabled={!selectedFile || uploading}
                        className="px-3 sm:px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white rounded-lg transition-colors disabled:bg-[#93C5FD] disabled:cursor-not-allowed whitespace-nowrap text-xs sm:text-sm touch-manipulation"
                      >
                        {uploading ? 'Uploading...' : 'Upload Now'}
                      </button>
                    </div>
                    {selectedFile && !formData.fileUrl && (
                      <p className="text-xs sm:text-sm text-[#1D4ED8] dark:text-[#93C5FD] bg-white dark:bg-[#262421] p-2 rounded">
                        <span className="inline-flex items-center gap-1">
                          <Paperclip className="w-3.5 h-3.5" />
                          Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(2)} KB)
                        </span>
                        <br />
                        <span className="inline-flex items-center gap-1 text-[#83786a] dark:text-[#c2b8a3]">
                          <Lightbulb className="w-3.5 h-3.5" />
                          Click "Upload Now" or directly click "Create" to upload
                        </span>
                      </p>
                    )}
                    {formData.fileUrl && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-green-700 dark:text-green-400">
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span>File uploaded successfully!</span>
                        <a 
                          href={`https://college-project-1-quch.onrender.com${formData.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#2563EB] hover:underline touch-manipulation"
                        >
                          View File
                        </a>
                      </div>
                    )}
                    <div className="text-center text-xs sm:text-sm text-[#83786a] dark:text-[#c2b8a3]">OR</div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#3D3929] dark:text-[#c2b8a3] mb-1">
                        Provide External File URL
                      </label>
                      <input
                        type="url"
                        value={formData.fileUrl}
                        onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                        placeholder="https://drive.google.com/..."
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#3D3929] dark:text-[#c2b8a3] mb-1">
                    Content (for text notes)
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={3}
                    placeholder="Enter your notes content here..."
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#3D3929] dark:text-[#c2b8a3] mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="important, revision, chapter1"
                    className={inputCls}
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={uploading}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-[#F4F1EA] dark:bg-[#3a362f] hover:bg-[#E6E0D4] dark:hover:bg-[#4a453c] text-[#3D3929] dark:text-[#F4F1EA] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm touch-manipulation"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white rounded-lg transition-colors disabled:bg-[#93C5FD] disabled:cursor-not-allowed text-sm touch-manipulation"
                  >
                    {uploading ? 'Uploading...' : editingId ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="lg:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-[#3D3929] dark:text-[#c2b8a3] mb-1">
                  Filter by Subject
                </label>
                <input
                  type="text"
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  placeholder="Enter subject name..."
                  className={inputCls}
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-[#3D3929] dark:text-[#c2b8a3] mb-1">
                  Filter by Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className={inputCls}
                >
                  <option value="">All Types</option>
                  <option value="notes">Notes</option>
                  <option value="pdf">PDF</option>
                  <option value="suggestion_paper">Suggestion Paper</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Result count */}
          <div className="mb-3">
            <p className="text-xs sm:text-sm text-[#83786a] dark:text-[#c2b8a3]">
              Found {filteredMaterials.length.toLocaleString()} material{filteredMaterials.length !== 1 ? 's' : ''}
              {totalPages > 1 && ` — page ${page} of ${totalPages}`}
            </p>
          </div>

          {/* Materials List — compact rows, scales to large result sets */}
          {filteredMaterials.length === 0 ? (
            <div className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
              <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-[#a89d89] mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="text-base sm:text-lg font-medium text-[#3D3929] dark:text-[#F4F1EA] mb-2">No Materials Found</h3>
              <p className="text-sm sm:text-base text-[#83786a] dark:text-[#c2b8a3]">
                {user.role === 'teacher' ? 'Create your first study material to get started.' : 'No study materials available yet.'}
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-xl sm:rounded-2xl divide-y divide-[#E6E0D4] dark:divide-[#3a362f] overflow-hidden">
                {pagedMaterials.map((material) => (
                  <div key={material._id} className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-[#F4F1EA] dark:hover:bg-[#1A1815] transition-colors">
                    <span className="flex-shrink-0 text-[#83786a] dark:text-[#c2b8a3]">{getTypeIcon(material.type)}</span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-[#3D3929] dark:text-[#F4F1EA] truncate">
                          {material.title}
                        </h3>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${getTypeBadgeColor(material.type)}`}>
                          {material.type.replace('_', ' ')}
                        </span>
                        {material.tags?.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-[#F4F1EA] dark:bg-[#3a362f] text-[#83786a] dark:text-[#c2b8a3] rounded text-[10px] flex-shrink-0">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-[#83786a] dark:text-[#c2b8a3] truncate mt-0.5 inline-flex items-center gap-1">
                        {material.subject} · {material.description || 'No description'} · by {material.teacher?.name} · {new Date(material.createdAt).toLocaleDateString()} ·
                        <Eye className="w-3 h-3 inline" /> {material.viewCount}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {material.fileUrl && material.fileUrl.trim() !== '' && (
                        <button
                          onClick={() => handleDownload(material)}
                          title="Download"
                          className="p-2 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white rounded-lg text-xs font-medium transition-colors touch-manipulation"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {material.content && material.content.trim() !== '' && (
                        <button
                          onClick={() => handleReadContent(material)}
                          title="Read"
                          className="p-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-lg text-xs font-medium transition-colors touch-manipulation"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {user.role === 'teacher' && material.teacher._id === user._id && (
                        <>
                          <button
                            onClick={() => handleEdit(material)}
                            title="Edit"
                            className="p-2 border border-[#E6E0D4] dark:border-[#3a362f] text-[#3D3929] dark:text-[#F4F1EA] rounded-lg text-xs font-medium hover:bg-[#F4F1EA] dark:hover:bg-[#1A1815] transition-colors touch-manipulation"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(material._id)}
                            title="Delete"
                            className="p-2 border border-[#E6E0D4] dark:border-[#3a362f] text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors touch-manipulation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination — keeps rendering light even with very large result sets */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-[#E6E0D4] dark:border-[#3a362f] text-[#3D3929] dark:text-[#F4F1EA] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-[#262421] transition-colors touch-manipulation"
                  >
                    Previous
                  </button>
                  <span className="text-xs sm:text-sm text-[#83786a] dark:text-[#c2b8a3] px-2">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-[#E6E0D4] dark:border-[#3a362f] text-[#3D3929] dark:text-[#F4F1EA] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-[#262421] transition-colors touch-manipulation"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* Content Modal */}
          {showContentModal && selectedMaterial && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
              <div className="bg-white dark:bg-[#262421] rounded-xl sm:rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="p-3 sm:p-4 md:p-6 border-b border-[#E6E0D4] dark:border-[#3a362f] flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base sm:text-lg md:text-2xl font-bold text-[#3D3929] dark:text-[#F4F1EA] truncate">
                      {selectedMaterial.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#83786a] dark:text-[#c2b8a3] mt-1">
                      {selectedMaterial.subject} • {selectedMaterial.type}
                    </p>
                  </div>
                  <button
                    onClick={closeContentModal}
                    className="text-[#83786a] hover:text-[#3D3929] dark:text-[#c2b8a3] dark:hover:text-[#F4F1EA] flex-shrink-0 p-1 touch-manipulation"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                <div className="p-3 sm:p-4 md:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                  {selectedMaterial.description && (
                    <div className="mb-4 p-3 md:p-4 bg-[#F4F1EA] dark:bg-[#1A1815] rounded-lg">
                      <p className="text-xs sm:text-sm text-[#3D3929] dark:text-[#c2b8a3]">
                        {selectedMaterial.description}
                      </p>
                    </div>
                  )}
                  <div className="prose dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-xs sm:text-sm md:text-base text-[#3D3929] dark:text-[#F4F1EA] font-sans">
                      {selectedMaterial.content}
                    </pre>
                  </div>
                </div>
                <div className="p-3 sm:p-4 md:p-6 border-t border-[#E6E0D4] dark:border-[#3a362f] bg-[#F4F1EA] dark:bg-[#1A1815]">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="text-xs sm:text-sm text-[#83786a] dark:text-[#c2b8a3]">
                      <p>By: {selectedMaterial.teacher?.name}</p>
                      <p>{new Date(selectedMaterial.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={closeContentModal}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white rounded-lg transition-colors text-sm touch-manipulation"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudyMaterials;