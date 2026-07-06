import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExcelJS from 'exceljs';
import Loading from '../components/Loading.jsx';
import Tabs from '../components/Tabs.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate } from '../utils/helpers';
import {
  FileCheck2,
  BarChart3,
  Clock,
  BookOpen,
  FileText,
  FileSpreadsheet,
  FileDown,
  KeyRound,
  ArrowRight,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [availableExams, setAvailableExams] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [summary, setSummary] = useState({ totalExamsTaken: 0, averageScore: 0 });
  const [loading, setLoading] = useState(true);
  const [examKey, setExamKey] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [examsRes, resultsRes, summaryRes] = await Promise.all([
          api.get('/exams/available'),
          api.get('/results/my-results'),
          api.get('/results/student/summary'),
        ]);

        setAvailableExams(examsRes.data);
        setMyResults(resultsRes.data);
        setSummary(summaryRes.data);

      } catch (error) {
        // Failed to fetch student data
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api]);

  const handleExamClick = (exam) => {
    const hasTaken = myResults.some(result => result.exam._id === exam._id);
    if (hasTaken) {
      alert('You have already submitted this exam.');
      return;
    }
    setSelectedExam(exam);
    setIsModalOpen(true);
  };

  const handleModalSubmit = () => {
    if (!examKey.trim()) {
      alert('Please enter the exam key.');
      return;
    }
    // Note: In a real app, you'd verify the key against the selectedExam on the backend
    // For this implementation, we assume the key is correct and navigate.
    // The joinExamByKey function already provides robust backend validation.
    joinExamByKey(selectedExam._id);
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedExam(null);
    setExamKey('');
  };

  const joinExamByKey = async () => {
    if (!examKey.trim()) {
      alert('Please enter an exam key.');
      return;
    }
    try {
      const res = await api.post('/exams/join', { examKey });
      navigate(`/exam/${res.data.examId}`);
    } catch (error) {
      // Error joining exam by key
      alert(error.response?.data?.message || 'An error occurred while trying to join the exam.');
    }
  };

  const downloadResultExcel = async (result) => {
    if (!result) return;

    const data = [{
      exam: result.exam?.title || 'N/A',
      subject: result.exam?.subject || 'N/A',
      score: `${result.obtainedMarks}/${result.totalMarks}`,
      percentage: `${result.percentage.toFixed(2)}%`,
      rank: result.rank || 'N/A',
      setNumber: result.setNumber || 1,
      timeTaken: `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s`,
      submittedAt: new Date(result.submittedAt).toLocaleString()
    }];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Result');

    worksheet.columns = [
      { header: 'Exam', key: 'exam', width: 30 },
      { header: 'Subject', key: 'subject', width: 20 },
      { header: 'Score', key: 'score', width: 12 },
      { header: 'Percentage', key: 'percentage', width: 12 },
      { header: 'Rank', key: 'rank', width: 10 },
      { header: 'Set Number', key: 'setNumber', width: 12 },
      { header: 'Time Taken', key: 'timeTaken', width: 18 },
      { header: 'Submitted At', key: 'submittedAt', width: 24 }
    ];

    worksheet.addRows(data);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `QuizMatrix_${result.exam?.title}_${user?.name}_Result.xlsx`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const downloadResultPDF = (result) => {
    if (!result) return;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(59, 130, 246);
    doc.text('Quiz Matrix - Exam Result', 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Student: ${user?.name || 'N/A'}`, 14, 35);
    doc.text(`Exam: ${result.exam?.title || 'N/A'}`, 14, 42);
    doc.text(`Subject: ${result.exam?.subject || 'N/A'}`, 14, 49);
    doc.text(`Score: ${result.obtainedMarks}/${result.totalMarks} (${result.percentage.toFixed(1)}%)`, 14, 56);
    doc.text(`Rank: ${result.rank || 'N/A'}`, 14, 63);
    doc.text(`Set Number: ${result.setNumber || 1}`, 14, 70);
    doc.text(`Time Taken: ${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s`, 14, 77);
    doc.text(`Submitted: ${new Date(result.submittedAt).toLocaleString()}`, 14, 84);

    const fileName = `${result.exam?.title}_${user?.name}_Result.pdf`;
    doc.save(fileName);
  };

  if (loading) {
    return <Loading />;
  }

  const activeExamsList = availableExams.filter(isExamActive);

  const tabs = [
    {
      name: 'Available Exams',
      content: (
        <section>
          {loading ? (
            <Loading text="Loading exams..." />
          ) : availableExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {availableExams.map((exam) => (
                <ExamCard key={exam._id} exam={exam} onStart={() => handleExamClick(exam)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-[#3D3929] dark:text-[#F4F1EA]">No available exams</h3>
              <p className="mt-1 text-sm text-[#83786a] dark:text-[#c2b8a3]">Check back later for new exams.</p>
            </div>
          )}
        </section>
      )
    },
    {
      name: 'My Results',
      content: (
        <section>
          {myResults.length > 0 ? (
            <div className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-xl sm:rounded-2xl divide-y divide-[#E6E0D4] dark:divide-[#3a362f] overflow-hidden">
              {myResults.map((result) => (
                <ResultItem
                  key={result._id}
                  result={result}
                  navigate={navigate}
                  onDownloadExcel={downloadResultExcel}
                  onDownloadPDF={downloadResultPDF}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-[#3D3929] dark:text-[#F4F1EA]">No results yet</h3>
              <p className="mt-1 text-sm text-[#83786a] dark:text-[#c2b8a3]">Your results will appear here after you take an exam.</p>
            </div>
          )}
        </section>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#F4F1EA] dark:bg-[#1A1815]">
      <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#3D3929] dark:text-[#F4F1EA]">Welcome, {user?.name}!</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-[#83786a] dark:text-[#c2b8a3]">Your learning journey starts here.</p>
        </div>

        {/* Stats Section — full width on every breakpoint */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <button
            onClick={() => setActiveTab(1)}
            className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-lg sm:rounded-xl p-2.5 sm:p-4 lg:p-5 text-left w-full hover:border-[#2563EB] hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <FileCheck2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#83786a] dark:text-[#c2b8a3] flex-shrink-0" />
              <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-[#83786a] dark:text-[#c2b8a3] truncate">Exams Taken</p>
            </div>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-[#3D3929] dark:text-[#F4F1EA] mt-1 sm:mt-2">{summary?.totalExamsTaken ?? 0}</p>
          </button>

          <button
            onClick={() => setActiveTab(1)}
            className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-lg sm:rounded-xl p-2.5 sm:p-4 lg:p-5 text-left w-full hover:border-[#2563EB] hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#83786a] dark:text-[#c2b8a3] flex-shrink-0" />
              <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-[#83786a] dark:text-[#c2b8a3] truncate">Average Score</p>
            </div>
            {(() => {
              const avg = Number(summary?.averageScore) || 0;
              const pct = Math.max(0, Math.min(100, avg));
              return (
                <div className="mt-1 sm:mt-2">
                  <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-[#3D3929] dark:text-[#F4F1EA]">{pct.toFixed(1)}%</p>
                  <div className="w-full bg-[#E6E0D4] dark:bg-[#3a362f] rounded-full h-1 mt-1.5 sm:mt-2 overflow-hidden">
                    <div className="bg-green-500 h-1" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })()}
          </button>

          <button
            onClick={() => setActiveTab(0)}
            className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-lg sm:rounded-xl p-2.5 sm:p-4 lg:p-5 text-left w-full hover:border-[#2563EB] hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#83786a] dark:text-[#c2b8a3] flex-shrink-0" />
              <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-[#83786a] dark:text-[#c2b8a3] truncate">Active Exams</p>
            </div>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-[#3D3929] dark:text-[#F4F1EA] mt-1 sm:mt-2">{activeExamsList.length}</p>
          </button>
        </div>

        {/* Main content: sidebar (quick access + join key) sits beside the tabs on desktop,
            and stacks above them on mobile/tablet */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-6 lg:items-start">

          {/* Sidebar */}
          <div className="lg:col-span-1 lg:order-2 space-y-3 sm:space-y-4 mb-4 sm:mb-6 lg:mb-0">

            {/* Quick Access */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
              <button
                onClick={() => navigate('/study-materials')}
                className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-lg p-2.5 sm:p-3 lg:p-4 hover:border-[#2563EB] hover:shadow-sm transition-all text-left"
              >
                <div className="flex items-center gap-2 lg:gap-3">
                  
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-[#3D3929] dark:text-[#F4F1EA] truncate">Study Materials</h3>
                    <p className="text-[10px] sm:text-xs text-[#83786a] dark:text-[#c2b8a3] truncate">Access notes & PDFs</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/previous-papers')}
                className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-lg p-2.5 sm:p-3 lg:p-4 hover:border-[#2563EB] hover:shadow-sm transition-all text-left"
              >
                <div className="flex items-center gap-2 lg:gap-3">
                  
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-[#3D3929] dark:text-[#F4F1EA] truncate">Previous Papers</h3>
                    <p className="text-[10px] sm:text-xs text-[#83786a] dark:text-[#c2b8a3] truncate">Practice past exams</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Join with Exam Key */}
            <div className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-lg p-3 sm:p-4 lg:p-5">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                
                <h3 className="text-sm sm:text-base font-bold text-[#3D3929] dark:text-[#F4F1EA]">Join with Exam Key</h3>
              </div>
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                <input
                  type="text"
                  value={examKey}
                  onChange={(e) => setExamKey(e.target.value)}
                  placeholder="Enter Exam Key"
                  className="flex-grow px-3 py-2 text-sm border border-[#E6E0D4] dark:border-[#3a362f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent bg-white dark:bg-[#1A1815] text-[#3D3929] dark:text-[#F4F1EA] placeholder-[#a89d89]"
                />
                <button
                  onClick={joinExamByKey}
                  className="px-4 py-2 bg-[#2563EB] text-white font-semibold text-sm rounded-full hover:bg-[#1D4ED8] active:bg-[#1E40AF] transition-colors touch-manipulation whitespace-nowrap"
                >
                  Join
                </button>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="lg:col-span-2 lg:order-1 bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <Tabs tabs={tabs} activeIndex={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white dark:bg-[#262421] rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl w-full max-w-md border border-[#E6E0D4] dark:border-[#3a362f]">
              <h2 className="text-lg sm:text-xl font-bold text-[#3D3929] dark:text-[#F4F1EA] mb-2 sm:mb-3">Enter Exam Key</h2>
              <p className="text-xs sm:text-sm text-[#83786a] dark:text-[#c2b8a3] mb-4 sm:mb-6">
                To start the exam "{selectedExam?.title}", please enter the unique key provided by your teacher.
              </p>
              <input
                type="text"
                value={examKey}
                onChange={(e) => setExamKey(e.target.value)}
                placeholder="Unique Exam Key"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-[#E6E0D4] dark:border-[#3a362f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent bg-white dark:bg-[#1A1815] text-[#3D3929] dark:text-[#F4F1EA] placeholder-[#a89d89]"
              />
              <div className="mt-4 sm:mt-6 flex gap-2 sm:gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-[#3D3929] dark:text-[#F4F1EA] font-semibold rounded-full hover:bg-[#F4F1EA] dark:hover:bg-[#1A1815] active:scale-95 transition-all border border-[#E6E0D4] dark:border-[#3a362f] touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  onClick={handleModalSubmit}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-[#2563EB] text-white font-semibold rounded-full hover:bg-[#1D4ED8] active:bg-[#1E40AF] transition-all touch-manipulation"
                >
                  Start Exam
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const ExamCard = ({ exam, onStart }) => (
  <div
    className="bg-white dark:bg-[#262421] border border-[#E6E0D4] dark:border-[#3a362f] rounded-xl sm:rounded-2xl p-4 sm:p-6 cursor-pointer hover:border-[#2563EB] hover:shadow-md active:scale-[0.98] transition-all flex flex-col justify-between touch-manipulation"
    onClick={() => onStart(exam)}
  >
    <div>
      <div className="flex justify-between items-start gap-2">
        <h3 className="text-base sm:text-lg font-bold text-[#3D3929] dark:text-[#F4F1EA] pr-2">{exam.title}</h3>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap flex-shrink-0 ${isExamActive(exam)
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-[#F4F1EA] text-[#3D3929] dark:bg-[#3a362f] dark:text-[#c2b8a3]'
          }`}>
          {isExamActive(exam) ? 'Active' : 'Upcoming'}
        </span>
      </div>
      <p className="text-xs sm:text-sm font-medium text-[#2563EB] dark:text-[#93C5FD] mt-1">{exam.subject}</p>
      <p className="text-[#83786a] dark:text-[#c2b8a3] mt-2 sm:mt-3 text-xs sm:text-sm line-clamp-2">{exam.description}</p>
    </div>
    <div className="mt-4 sm:mt-6 border-t border-[#E6E0D4] dark:border-[#3a362f] pt-3 sm:pt-4">
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm text-[#83786a] dark:text-[#c2b8a3]">
        <span>Duration: <strong className="text-[#3D3929] dark:text-[#F4F1EA]">{exam.duration} mins</strong></span>
        <span>Marks: <strong className="text-[#3D3929] dark:text-[#F4F1EA]">{exam.totalMarks}</strong></span>
      </div>
      <div className="text-xs sm:text-sm text-[#83786a] dark:text-[#c2b8a3] mt-1 sm:mt-2">
        Starts: <strong className="text-[#3D3929] dark:text-[#F4F1EA]">{formatDate(exam.startTime)}</strong>
      </div>
    </div>
  </div>
);

const ResultItem = ({ result, navigate, onDownloadExcel, onDownloadPDF }) => (
  <div className="px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-[#F4F1EA] dark:hover:bg-[#1A1815] transition-colors">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm sm:text-base text-[#3D3929] dark:text-[#F4F1EA] truncate">{result.exam.title}</p>
        <p className="text-xs sm:text-sm text-[#83786a] dark:text-[#c2b8a3] mt-0.5">
          Score: {result.obtainedMarks}/{result.totalMarks} ({((result.obtainedMarks / result.totalMarks) * 100).toFixed(1)}%)
        </p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => onDownloadExcel(result)}
          className="p-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-lg transition-colors touch-manipulation"
          title="Download Excel"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={() => onDownloadPDF(result)}
          className="p-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg transition-colors touch-manipulation"
          title="Download PDF"
        >
          <FileDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={() => navigate(`/results/${result.exam._id}`)}
          className="px-3 py-1.5 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] active:text-[#1E40AF] dark:text-[#93C5FD] dark:hover:text-[#BFDBFE] whitespace-nowrap text-center border border-[#2563EB] rounded-lg hover:bg-[#EFF6FF] dark:hover:bg-[#1e2a4a]/40 transition-all touch-manipulation flex items-center gap-1"
        >
          Details <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  </div>
);

// Helper function needs to be accessible by ExamCard
const isExamActive = (exam) => {
  const now = new Date();
  const startTime = new Date(exam.startTime);
  const endTime = new Date(exam.endTime);
  return now >= startTime && now <= endTime;
};

export default StudentDashboard;