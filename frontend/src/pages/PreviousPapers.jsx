import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaDownload, FaFilter, FaSearch, FaTimes, FaTrash, FaUpload } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const PAGE_SIZE = 24;

const PreviousPapers = () => {
  const { user, api } = useAuth();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showFilters, setShowFilters] = useState(true); // Auto-show filters for students
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [page, setPage] = useState(1);

  // Filter states
  const [filters, setFilters] = useState({
    country: '',
    state: '',
    college: '',
    branch: '',
    semester: '',
    subject: '',
    year: '',
    search: ''
  });
  
  // Available filter options
  const [filterOptions, setFilterOptions] = useState({
    countries: [],
    states: [],
    colleges: [],
    branches: [],
    semesters: [],
    subjects: [],
    years: []
  });

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    year: new Date().getFullYear().toString(),
    country: user?.country || '',
    state: user?.state || '',
    college: user?.college || '',
    branch: user?.branch || '',
    semester: user?.semester || ''
  });

  useEffect(() => {
    fetchFilterOptions();
    fetchPapers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Auto-populate form with user profile data
    if (user) {
      setFormData(prev => ({
        ...prev,
        country: user.country || '',
        state: user.state || '',
        college: user.college || '',
        branch: user.branch || '',
        semester: user.semester || ''
      }));
      
      // Auto-set filters for students based on their profile
      if (user.role === 'student') {
        setFilters({
          country: user.country || '',
          state: user.state || '',
          college: user.college || '',
          branch: user.branch || '',
          semester: user.semester || '',
          subject: '',
          year: '',
          search: ''
        });
      }
    }
  }, [user]);

  const fetchFilterOptions = async () => {
    try {
      const response = await api.get('/previous-papers/filters');
      setFilterOptions(response.data);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await api.get(`/previous-papers?${queryParams.toString()}`);
      setPapers(response.data);
      setPage(1);
    } catch (error) {
      toast.error('Failed to fetch papers');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      if (!file.type.includes('pdf')) {
        toast.error('Only PDF files are allowed');
        return;
      }
      setSelectedFile(file);
      toast.success(`Selected: ${file.name}`);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select a PDF file');
      return;
    }

    if (!formData.title || !formData.subject || !formData.year || 
        !formData.country || !formData.state || !formData.college || 
        !formData.branch || !formData.semester) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('subject', formData.subject);
      uploadFormData.append('year', formData.year);
      uploadFormData.append('country', formData.country);
      uploadFormData.append('state', formData.state);
      uploadFormData.append('college', formData.college);
      uploadFormData.append('branch', formData.branch);
      uploadFormData.append('semester', formData.semester);

      await api.post('/previous-papers/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Paper uploaded successfully!');
      setShowUploadForm(false);
      setFormData({
        title: '',
        subject: '',
        year: new Date().getFullYear().toString(),
        country: user?.country || '',
        state: user?.state || '',
        college: user?.college || '',
        branch: user?.branch || '',
        semester: user?.semester || ''
      });
      setSelectedFile(null);
      fetchPapers();
      fetchFilterOptions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

const handleDownload = async (paper) => {
  try {
    toast.loading('Preparing your PDF...');

    const response = await api.get(`/previous-papers/download/${paper._id}`);
    const { downloadUrl } = response.data;

    // Direct fetch karein, type check hata dein
    const fileFetch = await fetch(downloadUrl);
    if (!fileFetch.ok) throw new Error("Cloudinary file not accessible");

    const blob = await fileFetch.blob();
    
    // Yahan sirf blob ka content download karein, type check ki zarurat nahi
    const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${paper.title || 'paper'}.pdf`);
    document.body.appendChild(link);
    link.click();
    
    link.remove();
    window.URL.revokeObjectURL(url);
    toast.dismiss();
    toast.success('Download started!');
  } catch (error) {
    toast.dismiss();
    console.error("Download error:", error);
    toast.error("Download failed. The file format might be incorrect.");
  }
};
  const handleDelete = async (paperId) => {
    if (!window.confirm('Are you sure you want to delete this paper?')) {
      return;
    }

    try {
      await api.delete(`/previous-papers/${paperId}`);
      toast.success('Paper deleted successfully');
      fetchPapers();
    } catch (error) {
      toast.error('Delete failed');
      console.error('Delete error:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      country: user?.role === 'student' ? user.country || '' : '',
      state: user?.role === 'student' ? user.state || '' : '',
      college: user?.role === 'student' ? user.college || '' : '',
      branch: user?.role === 'student' ? user.branch || '' : '',
      semester: user?.role === 'student' ? user.semester || '' : '',
      subject: '',
      year: '',
      search: ''
    });
  };

  const totalPages = Math.max(1, Math.ceil(papers.length / PAGE_SIZE));
  const pagedPapers = papers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading && papers.length === 0) {
    return <Loading />;
  }

  const inputCls = "px-3 py-2 border border-[#E6E0D4] dark:border-[#3a362f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white dark:bg-[#1A1815] text-[#3D3929] dark:text-[#F4F1EA] placeholder-[#a89d89] text-xs sm:text-sm";

  return (
    <div className="min-h-screen bg-[#F4F1EA] dark:bg-[#1A1815]">
      <div className="flex min-h-screen">
        <main className="flex-1 px-4 py-4 md:px-6 md:py-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#3D3929] dark:text-[#F4F1EA]">
                Previous Year Question Papers
              </h1>
              <p className="text-sm sm:text-base text-[#83786a] dark:text-[#c2b8a3] mt-1">
                {user?.role === 'teacher' ? 'Upload and manage' : 'Search and download'} previous papers
              </p>
            </div>

            {user?.role === 'teacher' && (
              <button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 text-sm bg-[#2563EB] text-white rounded-full hover:bg-[#1D4ED8] active:bg-[#1E40AF] transition-all font-semibold touch-manipulation"
              >
                <FaUpload />
                {showUploadForm ? 'Cancel' : 'Upload Paper'}
              </button>
            )}
          </div>

          {/* Upload Form (Teacher Only) */}
          {showUploadForm && user?.role === 'teacher' && (
            <div className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-[#3D3929] dark:text-[#F4F1EA] mb-4">
                Upload Previous Paper
              </h2>
              <form onSubmit={handleUpload} className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Paper Title *"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className={inputCls}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Subject *"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className={inputCls}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Year *"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    className={inputCls}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Country *"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className={inputCls}
                    required
                  />
                  <input
                    type="text"
                    placeholder="State/Province *"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className={inputCls}
                    required
                  />
                  <input
                    type="text"
                    placeholder="College/University *"
                    value={formData.college}
                    onChange={(e) => setFormData({...formData, college: e.target.value})}
                    className={inputCls}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Branch (e.g., CSE, ECE) *"
                    value={formData.branch}
                    onChange={(e) => setFormData({...formData, branch: e.target.value})}
                    className={inputCls}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Semester (e.g., 1, 2, 3) *"
                    value={formData.semester}
                    onChange={(e) => setFormData({...formData, semester: e.target.value})}
                    className={inputCls}
                    required
                  />
                </div>

                <div className="border-2 border-dashed border-[#E6E0D4] dark:border-[#3a362f] rounded-lg p-4 sm:p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center touch-manipulation"
                  >
                    <FaUpload className="text-2xl sm:text-3xl text-[#a89d89] mb-2" />
                    <span className="text-xs sm:text-sm text-[#83786a] dark:text-[#c2b8a3]">
                      {selectedFile ? selectedFile.name : 'Click to select PDF file (Max 10MB)'}
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="w-full py-2.5 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] active:bg-[#1E40AF] disabled:bg-[#93C5FD] disabled:cursor-not-allowed transition-colors text-sm font-medium touch-manipulation"
                >
                  {uploading ? 'Uploading...' : 'Upload Paper'}
                </button>
              </form>
            </div>
          )}

          {/* Filters Section */}
          <div className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <h2 className="text-sm sm:text-base font-semibold text-[#3D3929] dark:text-[#F4F1EA] flex items-center gap-2">
                
                Search & Filter Papers
              </h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-xs sm:text-sm text-[#2563EB] hover:underline touch-manipulation self-start sm:self-auto"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            {/* Auto-filter indicator for students */}
            {user?.role === 'student' && (user?.country || user?.state || user?.college || user?.branch || user?.semester) && (
              <div className="mb-3 p-2 sm:p-3 bg-[#EFF6FF] dark:bg-[#1e2a4a] border border-[#BFDBFE] dark:border-[#2c3d63] rounded-lg">
                <p className="text-[10px] sm:text-xs text-[#1D4ED8] dark:text-[#93C5FD]">
                  <span className="font-semibold">✓ Auto-filtered:</span> Papers matching your profile ({user?.country}{user?.state ? `, ${user.state}` : ''}{user?.college ? `, ${user.college}` : ''}{user?.branch ? `, ${user.branch}` : ''}{user?.semester ? `, Semester ${user.semester}` : ''})
                </p>
              </div>
            )}

            {/* Search Bar */}
            <div className="relative mb-3">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a89d89] text-xs sm:text-sm" />
              <input
                type="text"
                placeholder="Search by title or subject..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className={`w-full pl-9 sm:pl-10 ${inputCls}`}
              />
            </div>

            {/* Filter Dropdowns */}
            {showFilters && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-2">
                <select
                  value={filters.country}
                  onChange={(e) => setFilters({...filters, country: e.target.value})}
                  className={inputCls}
                >
                  <option value="">All Countries</option>
                  {filterOptions.countries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <select
                  value={filters.state}
                  onChange={(e) => setFilters({...filters, state: e.target.value})}
                  className={inputCls}
                >
                  <option value="">All States</option>
                  {filterOptions.states.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <select
                  value={filters.college}
                  onChange={(e) => setFilters({...filters, college: e.target.value})}
                  className={inputCls}
                >
                  <option value="">All Colleges</option>
                  {filterOptions.colleges.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <select
                  value={filters.branch}
                  onChange={(e) => setFilters({...filters, branch: e.target.value})}
                  className={inputCls}
                >
                  <option value="">All Branches</option>
                  {filterOptions.branches.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>

                <select
                  value={filters.semester}
                  onChange={(e) => setFilters({...filters, semester: e.target.value})}
                  className={inputCls}
                >
                  <option value="">All Semesters</option>
                  {filterOptions.semesters.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <select
                  value={filters.subject}
                  onChange={(e) => setFilters({...filters, subject: e.target.value})}
                  className={inputCls}
                >
                  <option value="">All Subjects</option>
                  {filterOptions.subjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <select
                  value={filters.year}
                  onChange={(e) => setFilters({...filters, year: e.target.value})}
                  className={inputCls}
                >
                  <option value="">All Years</option>
                  {filterOptions.years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>

                <button
                  onClick={clearFilters}
                  className="px-3 py-2 bg-[#F4F1EA] dark:bg-[#1A1815] text-[#3D3929] dark:text-[#c2b8a3] border border-[#E6E0D4] dark:border-[#3a362f] rounded-lg hover:bg-[#E6E0D4] dark:hover:bg-[#3a362f] transition-colors flex items-center justify-center gap-1.5 text-xs sm:text-sm touch-manipulation"
                >
                  <FaTimes className="text-xs" />
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Result count */}
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs sm:text-sm text-[#83786a] dark:text-[#c2b8a3]">
              Found {papers.length.toLocaleString()} paper{papers.length !== 1 ? 's' : ''}
              {totalPages > 1 && ` — page ${page} of ${totalPages}`}
            </p>
          </div>

          {papers.length === 0 ? (
            <div className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
              <p className="text-sm sm:text-base text-[#83786a] dark:text-[#c2b8a3]">
                No papers found matching your filters.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 px-5 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors text-xs sm:text-sm touch-manipulation"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* Compact list rows — dense, scannable, scales to large result sets */}
              <div className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-xl sm:rounded-2xl divide-y divide-[#E6E0D4] dark:divide-[#3a362f] overflow-hidden">
                {pagedPapers.map(paper => (
                  <div
                    key={paper._id}
                    className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-[#F4F1EA] dark:hover:bg-[#1A1815] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-[#3D3929] dark:text-[#F4F1EA] truncate">
                          {paper.title}
                        </h3>
                        <span className="px-1.5 py-0.5 bg-[#EFF6FF] dark:bg-[#1e2a4a] text-[#1D4ED8] dark:text-[#93C5FD] rounded text-[10px] font-medium flex-shrink-0">
                          {paper.subject}
                        </span>
                        <span className="px-1.5 py-0.5 bg-[#ECFDF5] dark:bg-[#0f2e22] text-[#047857] dark:text-[#6ee7b7] rounded text-[10px] font-medium flex-shrink-0">
                          {paper.year}
                        </span>
                        <span className="px-1.5 py-0.5 bg-[#F5F3FF] dark:bg-[#241b3a] text-[#6D28D9] dark:text-[#c4b5fd] rounded text-[10px] font-medium flex-shrink-0">
                          Sem {paper.semester}
                        </span>
                      </div>
                      <p className="text-xs text-[#83786a] dark:text-[#c2b8a3] truncate mt-0.5">
                        {paper.branch} · {paper.college} · {paper.state}, {paper.country} · by {paper.teacher.name} · {paper.downloadCount} downloads
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleDownload(paper)}
                        title="Download PDF"
                        className="p-2 rounded-lg bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:bg-[#1E40AF] transition-colors touch-manipulation"
                      >
                        <FaDownload className="text-xs sm:text-sm" />
                      </button>
                      {user?.role === 'teacher' && (paper.teacher?._id === user.id || paper.teacher === user.id) && (
                        <button
                          onClick={() => handleDelete(paper._id)}
                          title="Delete"
                          className="p-2 rounded-lg border border-[#E6E0D4] dark:border-[#3a362f] text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 active:text-red-800 transition-colors touch-manipulation"
                        >
                          <FaTrash className="text-xs sm:text-sm" />
                        </button>
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
        </main>
      </div>
    </div>
  );
};

export default PreviousPapers;