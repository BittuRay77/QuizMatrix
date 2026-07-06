import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatRelativeTime, getExamStatus } from '../utils/helpers';

const Exams = () => {
  const { user, api } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      
      const response = await api.get('/exams/teacher');
      const fetchedExams = response.data.exams || [];
      setExams(fetchedExams);
    } catch (error) {
      console.error('Error fetching exams:', error);
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


  const filteredExams = exams.filter((exam) => {
    const matchesTitle = exam.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = exam.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTitle || matchesSubject;
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] dark:bg-[#1A1815]">
      <div className="flex min-h-screen">
        <main className="flex-1 px-4 py-4 md:px-6 md:py-6">

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-[#E6E0D4] dark:border-[#3a362f]">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#3D3929] dark:text-[#F4F1EA]">All Exams</h1>
              <p className="mt-1 text-sm text-[#83786a] dark:text-[#c2b8a3]">
                Manage, monitor, and view results for all your created examinations.
              </p>
            </div>
            <Link
              to="/create-exam"
              className="px-5 py-2.5 text-sm sm:text-base bg-[#2563EB] text-white font-semibold rounded-xl hover:bg-[#1D4ED8] active:bg-[#1E40AF] transition-all text-center shadow-sm"
            >
               Create New Exam
            </Link>
          </div>

          {/* Search and Filters Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              
              <input
                type="text"
                placeholder="Search exams by title or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-xl text-[#3D3929] dark:text-[#F4F1EA] placeholder-[#a89d89] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Result count */}
          <div className="mb-3">
            <p className="text-xs sm:text-sm text-[#83786a] dark:text-[#c2b8a3]">
              Found {filteredExams.length.toLocaleString()} exam{filteredExams.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Exams Content List */}
          {filteredExams.length === 0 ? (
            <div className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-2xl text-center py-12 px-4 shadow-sm">

              <h3 className="text-lg font-medium text-[#3D3929] dark:text-[#F4F1EA] mb-1">
                {searchTerm ? 'No matching exams found' : 'No exams available'}
              </h3>
              <p className="text-sm text-[#83786a] dark:text-[#c2b8a3] mb-5">
                {searchTerm ? 'Try adjusting your search keywords' : 'Get started by creating your very first exam.'}
              </p>
              {!searchTerm && (
                <Link
                  to="/create-exam"
                  className="inline-block px-5 py-2.5 text-sm bg-[#2563EB] text-white font-semibold rounded-xl hover:bg-[#1D4ED8] transition-all"
                >
                  Create Your First Exam
                </Link>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-xl sm:rounded-2xl divide-y divide-[#E6E0D4] dark:divide-[#3a362f] overflow-hidden">
              {filteredExams.map((exam) => {
                const statusInfo = getExamStatus(exam);
                return (
                  <div
                    key={exam._id}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-[#F4F1EA] dark:hover:bg-[#1A1815] transition-colors group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 lg:gap-4">
                      <div className="flex-1 min-w-0">

                        {/* Title & Status */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-[#3D3929] dark:text-[#F4F1EA] group-hover:text-[#2563EB] dark:group-hover:text-[#93C5FD] transition-colors truncate">
                            {exam.title}
                          </h3>
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full whitespace-nowrap flex-shrink-0 ${statusInfo.color}`}>
                            {statusInfo.status}
                          </span>
                          <span className="text-xs font-medium text-[#2563EB] dark:text-[#93C5FD] flex-shrink-0">
                            {exam.subject}
                          </span>
                        </div>

                        {/* Meta Information */}
                        <p className="text-xs text-[#83786a] dark:text-[#c2b8a3] truncate mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1">
                            Key:
                            <span className="font-mono bg-[#F4F1EA] dark:bg-[#3a362f] px-1.5 py-0.5 rounded text-[10px] text-[#3D3929] dark:text-[#F4F1EA] font-semibold">
                              {exam.examKey}
                            </span>
                            <button
                              onClick={() => copyExamKey(exam.examKey)}
                              title="Copy Key"
                              className="p-0.5 rounded hover:bg-[#E6E0D4] dark:hover:bg-[#4a453c] text-[#a89d89] hover:text-[#3D3929] dark:hover:text-[#F4F1EA] active:scale-95 transition-all"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </span>
                          <span>· 👥 {exam.participantCount || 0} students</span>
                          <span>· 📊 {exam.averageScore ? `${parseFloat(exam.averageScore).toFixed(2)}%` : 'N/A'} avg</span>
                          <span className="hidden sm:inline">· 🕒 {formatRelativeTime(exam.createdAt)}</span>
                        </p>

                      </div>

                      {/* Action Buttons */}
                      <div className="flex-shrink-0">
                        <Link
                          to={`/results/${exam._id}`}
                          className="inline-block px-3 py-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] dark:text-[#93C5FD] dark:hover:text-[#BFDBFE] border border-[#2563EB] rounded-lg hover:bg-[#EFF6FF] dark:hover:bg-[#1e2a4a]/40 text-center transition-all touch-manipulation"
                        >
                          View Results →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default Exams;