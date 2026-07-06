import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import Loading from '../components/Loading.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatRelativeTime, getExamStatus } from '../utils/helpers';

const TeacherDashboard = () => {
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAttempts: 0,
    averageScore: 0,
  });

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigningExam, setAssigningExam] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await api.get('/exams/teacher');
      const fetchedExams = response.data.exams || [];
      setExams(fetchedExams);

      const apiStats = response.data.stats || {};
      setStats({
        totalStudents: apiStats.totalStudents || 0,
        totalAttempts: apiStats.totalAttempts || fetchedExams.reduce((sum, exam) => sum + (exam.participantCount || 0), 0),
        averageScore: apiStats.averageScore || 0,
      });
    } catch (error) {
      toast.error('Failed to fetch exams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyExamKey = (examKey) => {
    const tempInput = document.createElement('input');
    tempInput.value = examKey;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    toast.success('Exam key copied to clipboard!');
  };

  const publishExam = async (examId) => {
    try {
      const res = await api.post(`/exams/${examId}/publish`);
      toast.success(res.data?.message || 'Published successfully');
      fetchExams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to publish exam');
    }
  };

  const closeAssignModal = () => {
    setAssignModalOpen(false);
    setAssigningExam(null);
    setSelectedOptions([]);
  };

  if (loading) {
    return <Loading />;
  }

  const totalExams = exams.length;
  const draftCount = exams.filter((exam) => (exam.status || '').toLowerCase() === 'draft').length;
  const publishedCount = exams.filter((exam) => (exam.status || '').toLowerCase() === 'published').length;

  return (
    <div className="min-h-screen bg-[#F4F1EA] dark:bg-[#1A1815]">
      <div className="flex min-h-screen">


        {/* Main Content */}
        <main className="flex-1 px-4 py-4 md:px-6 md:py-6">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#3D3929] dark:text-[#F4F1EA]">Welcome back, {user?.name}</h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-[#83786a] dark:text-[#c2b8a3]">Manage exams, study materials, papers, and student access.</p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            <div className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-xl p-4">
              <p className="text-xs font-medium text-[#83786a] dark:text-[#c2b8a3]">Total Exams</p>
              <p className="text-2xl font-bold text-[#3D3929] dark:text-[#F4F1EA] mt-2">{totalExams}</p>
            </div>
            <div className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-xl p-4">
              <p className="text-xs font-medium text-[#83786a] dark:text-[#c2b8a3]">Draft Exams</p>
              <p className="text-2xl font-bold text-[#3D3929] dark:text-[#F4F1EA] mt-2">{draftCount}</p>
            </div>
            <button
              onClick={() => navigate('/published-exams')}
              className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-xl p-4 text-left w-full hover:border-[#2563EB] transition-all cursor-pointer"
            >
              <p className="text-xs font-medium text-[#83786a] dark:text-[#c2b8a3]">Published Exams</p>
              <p className="text-2xl font-bold text-[#3D3929] dark:text-[#F4F1EA] mt-2">{publishedCount}</p>
            </button>
            <div className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-xl p-4">
              <p className="text-xs font-medium text-[#83786a] dark:text-[#c2b8a3]">Total Students</p>
              <p className="text-2xl font-bold text-[#3D3929] dark:text-[#F4F1EA] mt-2">{stats.totalStudents}</p>
            </div>
            <div className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-xl p-4">
              <p className="text-xs font-medium text-[#83786a] dark:text-[#c2b8a3]">Total Attempts</p>
              <p className="text-2xl font-bold text-[#3D3929] dark:text-[#F4F1EA] mt-2">{stats.totalAttempts}</p>
            </div>
          </div>

          {/* Grid Quick Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
            <button
              onClick={() => navigate('/create-exam')}
              className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-xl p-4 hover:border-[#2563EB] transition-all text-left"
            >
              <div className="flex items-center gap-3">
                
                <div>
                  <h3 className="text-sm font-bold text-[#3D3929] dark:text-[#F4F1EA]">Create Exam</h3>
                  <p className="text-xs text-[#83786a] dark:text-[#c2b8a3]">Create or publish an exam</p>
                </div>
              </div>
            </button>

            {/* Added: Upload Study Material Quick Button */}
            <button
              onClick={() => navigate('/study-materials')}
              className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-xl p-4 hover:border-[#2563EB] transition-all text-left"
            >
              <div className="flex items-center gap-3">
                
                <div>
                  <h3 className="text-sm font-bold text-[#3D3929] dark:text-[#F4F1EA]">Study Material</h3>
                  <p className="text-xs text-[#83786a] dark:text-[#c2b8a3]">Upload study documents</p>
                </div>
              </div>
            </button>

            {/* Added: Previous Year Paper Quick Button */}
            <button
              onClick={() => navigate('/previous-papers')}
              className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-xl p-4 hover:border-[#2563EB] transition-all text-left"
            >
              <div className="flex items-center gap-3">
                
                <div>
                  <h3 className="text-sm font-bold text-[#3D3929] dark:text-[#F4F1EA]">Previous Papers</h3>
                  <p className="text-xs text-[#83786a] dark:text-[#c2b8a3]">Upload past year papers</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/drafts')}
              className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-xl p-4 hover:border-[#2563EB] transition-all text-left"
            >
              <div className="flex items-center gap-3">
                
                <div>
                  <h3 className="text-sm font-bold text-[#3D3929] dark:text-[#F4F1EA]">Draft Exams</h3>
                  <p className="text-xs text-[#83786a] dark:text-[#c2b8a3]">Continue editing drafts</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/results')}
              className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-xl p-4 hover:border-[#2563EB] transition-all text-left"
            >
              <div className="flex items-center gap-3">
                
                <div>
                  <h3 className="text-sm font-bold text-[#3D3929] dark:text-[#F4F1EA]">Results & Analytics</h3>
                  <p className="text-xs text-[#83786a] dark:text-[#c2b8a3]">View performance data</p>
                </div>
                
              </div>
            </button>
          </div>

          {/* Recent Exams List */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-[#3D3929] dark:text-[#F4F1EA]">Recent Exams</h2>
              <Link to="/create-exam" className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-[#2563EB] text-white font-semibold rounded-full hover:bg-[#1D4ED8] active:bg-[#1E40AF] transition-all text-center touch-manipulation">Create New Exam</Link>
            </div>

            {exams.length === 0 ? (
              <div className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-xl sm:rounded-2xl text-center py-8 sm:py-12 px-4">
                <h3 className="text-base sm:text-lg font-medium text-[#3D3929] dark:text-[#F4F1EA] mb-2">No exams yet</h3>
                <p className="text-sm text-[#83786a] dark:text-[#c2b8a3] mb-4">Create your first exam to get started</p>
                <Link to="/create-exam" className="inline-block px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-[#2563EB] text-white font-semibold rounded-full hover:bg-[#1D4ED8] active:bg-[#1E40AF] transition-all touch-manipulation">Create Your First Exam</Link>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-xl sm:rounded-2xl divide-y divide-[#E6E0D4] dark:divide-[#3a362f] overflow-hidden">
                {exams.slice(0, 6).map((exam) => {
                  const statusInfo = getExamStatus(exam);
                  return (
                    <div key={exam._id} className="px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-[#F4F1EA] dark:hover:bg-[#1A1815] transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 lg:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold text-[#3D3929] dark:text-[#F4F1EA] truncate">{exam.title}</h3>
                            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full whitespace-nowrap flex-shrink-0 ${statusInfo.color}`}>{statusInfo.status}</span>
                            <span className="text-xs font-medium text-[#2563EB] dark:text-[#93C5FD] flex-shrink-0">{exam.subject}</span>
                          </div>
                          <p className="text-xs text-[#83786a] dark:text-[#c2b8a3] truncate mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1">
                              Key:
                              <span className="font-mono bg-[#F4F1EA] dark:bg-[#3a362f] px-1.5 py-0.5 rounded text-[10px] text-[#3D3929] dark:text-[#F4F1EA] font-semibold">{exam.examKey}</span>
                              <button onClick={() => copyExamKey(exam.examKey)} className="p-0.5 rounded hover:bg-[#E6E0D4] dark:hover:bg-[#4a453c] text-[#a89d89] hover:text-[#3D3929] dark:hover:text-[#F4F1EA] active:scale-95 transition-all touch-manipulation">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </span>
                            <span>· 👥 {exam.participantCount || 0} participants</span>
                            <span>· 📊 {exam.averageScore ? `${parseFloat(exam.averageScore).toFixed(2)}%` : 'N/A'} avg</span>
                            <span className="hidden sm:inline">· 🕒 {formatRelativeTime(exam.createdAt)}</span>
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                          {exam.status !== 'published' && (
                            <>
                              <button
                                onClick={() => navigate(`/create-exam/${exam._id}`)}
                                className="px-3 py-1.5 text-xs font-medium text-[#3D3929] dark:text-[#F4F1EA] border border-[#E6E0D4] dark:border-[#3a362f] rounded-lg hover:bg-[#F4F1EA] dark:hover:bg-[#1A1815] transition-all touch-manipulation"
                              >
                                Edit
                              </button>
                              {Array.isArray(exam.allowedStudents) && exam.allowedStudents.length > 0 ? (
                                <button
                                  onClick={() => publishExam(exam._id)}
                                  className="px-3 py-1.5 text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 rounded-lg transition-all touch-manipulation"
                                >
                                  Publish
                                </button>
                              ) : (
                                <Link
                                  to="/drafts"
                                  className="px-3 py-1.5 text-xs font-medium text-white bg-[#1E40AF] hover:bg-[#1e3a8a] active:bg-[#172554] rounded-lg transition-all touch-manipulation"
                                >
                                  Assign Students
                                </Link>
                              )}
                            </>
                          )}
                          <Link to={`/results/${exam._id}`} className="px-3 py-1.5 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] active:text-[#1E40AF] dark:text-[#93C5FD] dark:hover:text-[#BFDBFE] whitespace-nowrap text-center border border-[#2563EB] rounded-lg hover:bg-[#EFF6FF] dark:hover:bg-[#1e2a4a]/40 transition-all touch-manipulation">View Results →</Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;