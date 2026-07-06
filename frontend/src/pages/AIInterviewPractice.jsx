import { AnimatePresence, motion } from 'framer-motion';
import {
  BrainCircuit,
  ChevronRight,
  Code2, Cpu,
  Edit3,
  History, Loader2,
  Microchip, Network,
  Terminal,
  TerminalSquare,
  UploadCloud
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// 1. Data Structure with Branches and Roles
const branchData = [
  {
    id: 'cse',
    label: 'CSE',
    icon: <Code2 size={16} />,
    roles: [
      { value: 'software-engineer', label: 'Software Engineer', icon: <Terminal size={14} />, desc: 'Full-stack & App development' },
      { value: 'backend-developer', label: 'Backend Developer', icon: <Terminal size={14} />, desc: 'System architecture & APIs' },
      { value: 'cybersecurity', label: 'Security Analyst', icon: <Terminal size={14} />, desc: 'Network & Info security' },
    ]
  },
  {
    id: 'aiml',
    label: 'AI-ML',
    icon: <BrainCircuit size={16} />,
    roles: [
      { value: 'ml-engineer', label: 'ML Engineer', icon: <BrainCircuit size={14} />, desc: 'Model training & Deployment' },
      { value: 'data-scientist', label: 'Data Scientist', icon: <BrainCircuit size={14} />, desc: 'Statistical analysis & Insights' },
      { value: 'ai-researcher', label: 'AI Researcher', icon: <BrainCircuit size={14} />, desc: 'Deep Learning & Neural Nets' },
    ]
  },
  {
    id: 'ece',
    label: 'ECE',
    icon: <Cpu size={16} />,
    roles: [
      { value: 'embedded-engineer', label: 'Embedded Engineer', icon: <Microchip size={14} />, desc: 'Hardware-Software systems' },
      { value: 'vlsi-design', label: 'VLSI Designer', icon: <Microchip size={14} />, desc: 'Chip design & Fabrication' },
      { value: 'network-engineer', label: 'Network Engineer', icon: <Network size={14} />, desc: 'Telecom & Wireless systems' },
    ]
  },
];

const difficulties = [
  { value: 'easy', label: 'Easy', color: 'text-green-400', bg: 'bg-green-500/10' },
  { value: 'medium', label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { value: 'hard', label: 'Hard', color: 'text-rose-400', bg: 'bg-rose-500/10' },
];

const interviewTypes = [
  { value: 'technical', label: 'Technical', desc: 'DSA, system design & core concepts' },
  { value: 'hr', label: 'HR Round', desc: 'Soft skills, culture fit & motivation' },
  { value: 'pi', label: 'PI Round', desc: 'Personal interview, mix of all types' },
];

// Quotes about success, growth & hard work
const quotes = [
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The expert in anything was once a beginner who refused to quit.", author: "Helen Hayes" },
  { text: "Growth begins at the edge of your comfort zone.", author: "Unknown" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "Every interview is a rehearsal for the version of you that gets the offer.", author: "Unknown" },
];

// Ambient animated background — Claude Code style dark terminal, blue accent
const AmbientBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute inset-0 bg-[#0a0a0a]" />

    {/* faint code-editor grid */}
    <div
      className="absolute inset-0 opacity-[0.06]"
      style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    />

    <motion.div
      className="absolute w-[36rem] h-[36rem] rounded-full blur-3xl"
      style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.30) 0%, transparent 70%)' }}
      animate={{ x: [-80, 60, -80], y: [-40, 80, -40] }}
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute right-0 bottom-0 w-[30rem] h-[30rem] rounded-full blur-3xl"
      style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)' }}
      animate={{ x: [60, -60, 60], y: [40, -60, 40] }}
      transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute left-1/3 top-1/4 w-72 h-72 rounded-full blur-3xl"
      style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.20) 0%, transparent 70%)' }}
      animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
    />

    {/* subtle grain overlay for texture */}
    <div
      className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  </div>
);

const QuotePanel = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const active = quotes[index];

  return (
    <div className="relative h-full flex flex-col items-center justify-center text-center overflow-hidden px-6 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-16 text-white">
      <AmbientBackground />

      <div className="relative z-10 inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-widest text-blue-300/80 mb-4 sm:mb-8 lg:mb-10">
        <TerminalSquare size={13} className="text-blue-400" />
        ai-interview-lab
      </div>

      <div className="relative z-10 hidden sm:flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 rounded-lg bg-white/[0.04] border border-white/10 mb-4 lg:mb-8">
        <span className="font-mono text-blue-400 text-xl">{'>'}_</span>
      </div>

      <div className="relative z-10 max-w-xs sm:max-w-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <p className="text-base sm:text-xl lg:text-2xl font-semibold leading-snug text-white">
              "{active.text}"
            </p>
            <p className="mt-3 lg:mt-4 text-xs sm:text-sm font-mono text-blue-300/70">
              // {active.author}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-2 mt-5 lg:mt-8">
          {quotes.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === index ? 'w-7 bg-blue-400' : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 hidden lg:flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-14 pt-8 border-t border-white/10 max-w-sm">
        {[
          "Branch-specific questions",
          "Industry rubric scoring",
          "Real-time AI feedback",
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-white/50">
            <span className="w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" />
            <span className="text-xs font-mono">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AIInterviewPractice = () => {
  const { api } = useAuth();
  const navigate = useNavigate();

  // State
  const [activeBranch, setActiveBranch] = useState(branchData[0]);
  const [selectedRole, setSelectedRole] = useState(branchData[0].roles[0].value);
  const [customRole, setCustomRole] = useState('');
  const [interviewType, setInterviewType] = useState('technical');
  const [difficulty, setDifficulty] = useState('medium');
  const [interviewMode, setInterviewMode] = useState('without-resume');
  const [resumeFile, setResumeFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const requiresResume = interviewMode === 'with-resume';
  const isOtherSelected = selectedRole === 'other';

  const handleBranchChange = (branch) => {
    setActiveBranch(branch);
    setSelectedRole(branch.roles[0].value);
    setCustomRole('');
  };

  const handleStartInterview = async () => {
    const roleToSubmit = isOtherSelected ? customRole : selectedRole;

    if (isOtherSelected && !customRole.trim()) {
      return toast.error('Please enter your custom job role');
    }
    if (requiresResume && !resumeFile) {
      return toast.error('Please upload a resume first');
    }

    try {
      setIsStarting(true);
      let resumePayload = { resumeInsights: '', resumeText: '', resumeOriginalName: '' };

      if (requiresResume) {
        setIsScanning(true);
        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('jobRole', roleToSubmit);
        formData.append('difficulty', difficulty);

        const { data } = await api.post('/ai-interviews/resume-scan', formData);
        resumePayload = {
          resumeInsights: data.resumeInsights,
          resumeText: data.resumeText,
          resumeOriginalName: data.fileName || resumeFile.name,
        };
      }

      navigate('/ai-interview/session', {
        state: { jobRole: roleToSubmit, difficulty, interviewMode, interviewType, ...resumePayload },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Preparation failed');
    } finally {
      setIsScanning(false);
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#0a0a0a] text-white selection:bg-blue-500/30">
      <main className="lg:h-full grid grid-cols-1 lg:grid-cols-2">

        {/* Left Half — Quotes + Ambient Animation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="h-[260px] sm:h-[320px] lg:h-full"
        >
          <QuotePanel />
        </motion.div>

        {/* Right Half — Interview Setup */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:h-full lg:overflow-y-auto bg-[#111111] [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.700)_transparent]"
        >
          <div className="lg:min-h-full flex justify-center px-4 sm:px-6 lg:px-16">
            <div className="w-full max-w-lg py-6 sm:py-8">

              <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-16 px-4 sm:px-6 lg:px-16 pt-0 pb-4 sm:pb-5 mb-5 sm:mb-6 bg-[#111111]/90 backdrop-blur-sm border-b border-white/10 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white font-mono">Set up your interview</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">Configure your session and get started</p>
                </div>
                <button onClick={() => navigate('/ai-interview/history')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 hover:border-blue-500 transition-all text-xs font-semibold text-slate-300 hover:text-white flex-shrink-0">
  
                  <span className="hidden sm:inline">Past Sessions</span>
                </button>
              </div>

              {/* 1. Branch Selector */}
              <section className="mb-7">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2 font-mono text-sm">
                  Select Your Branch
                </h3>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {branchData.map((branch) => (
                    <button
                      key={branch.id}
                      onClick={() => handleBranchChange(branch)}
                      className={`py-3 px-2 rounded-lg border transition-all flex flex-col items-center gap-2 ${activeBranch.id === branch.id
                          ? 'border-blue-500 bg-blue-500/10 text-white shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                          : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-blue-500/40'
                        }`}
                    >
                      
                      <span className="text-[11px] font-bold uppercase tracking-wider">{branch.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* 2. Role Selector */}
              <section className="mb-7">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2 font-mono text-sm">
                  Target Post
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4">
                  <AnimatePresence mode="wait">
                    {activeBranch.roles.map((role) => (
                      <motion.button
                        key={role.value}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setSelectedRole(role.value)}
                        className={`relative p-4 rounded-lg border transition-all text-left ${selectedRole === role.value
                            ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500'
                            : 'border-white/10 bg-white/[0.02] hover:border-blue-500/40'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-md ${selectedRole === role.value
                              ? 'bg-blue-500 text-white'
                              : 'bg-white/5 text-slate-400'
                            }`}>
                            
                          </div>

                          <div>
                            <p className="font-bold text-white text-sm">
                              {role.label}
                            </p>
                            
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </AnimatePresence>

                  {/* Other Option */}
                  <button
                    onClick={() => setSelectedRole('other')}
                    className={`p-4 rounded-lg border transition-all text-left flex items-center gap-3 ${selectedRole === 'other'
                        ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500'
                        : 'border-white/10 bg-white/[0.02] hover:border-blue-500/40'
                      }`}
                  >
                    <div className={`p-2 rounded-md ${selectedRole === 'other'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/5 text-slate-400'
                      }`}>
                      <Edit3 size={14} />
                    </div>

                    <span className="font-bold text-sm text-white">
                      Other / Custom
                    </span>
                  </button>
                </div>

                {/* Custom Role Input */}
                <AnimatePresence>
                  {isOtherSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="relative group">
                        <input
                          type="text"
                          placeholder="Ex: Cloud Architect, Product Designer..."
                          value={customRole}
                          onChange={(e) => setCustomRole(e.target.value)}
                          className="w-full bg-white/[0.02] border border-white/10 rounded-lg py-3 px-4 text-sm text-white outline-none focus:border-blue-500 transition-all placeholder-slate-500"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* 3. Interview Type */}
              <section className="mb-7">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2 font-mono text-sm">
                  Interview Type
                </h3>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {interviewTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setInterviewType(type.value)}
                      className={`p-3 sm:p-4 rounded-lg border transition-all text-left ${interviewType === type.value
                          ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500'
                          : 'border-white/10 bg-white/[0.02] hover:border-blue-500/40'
                        }`}
                    >
                      <p className="font-bold text-white text-sm">{type.label}</p>
                     
                    </button>
                  ))}
                </div>
              </section>

              {/* 4. Difficulty */}
              <section className="mb-7">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2 font-mono text-sm">
                  Difficulty Level
                </h3>
                <div className="flex items-center gap-2 bg-white/[0.02] border border-white/10 p-1.5 rounded-full">
                  {difficulties.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDifficulty(d.value)}
                      className={`w-full text-center py-2.5 rounded-full text-sm font-bold transition-all ${difficulty === d.value
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'text-slate-400 hover:bg-white/5'
                        }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* 5. Resume Mode */}
              <section className="mb-7">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2 font-mono text-sm">
                  Interview Mode
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    onClick={() => setInterviewMode('without-resume')}
                    className={`p-4 rounded-lg border transition-all text-left ${interviewMode === 'without-resume'
                        ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500'
                        : 'border-white/10 bg-white/[0.02] hover:border-blue-500/40'
                      }`}
                  >
                    <p className="font-bold text-white text-sm">Standard Mode</p>
                    <p className="text-[10px] text-slate-500 mt-1">General questions based on role.</p>
                  </button>
                  <button
                    onClick={() => setInterviewMode('with-resume')}
                    className={`p-4 rounded-lg border transition-all text-left ${interviewMode === 'with-resume'
                        ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500'
                        : 'border-white/10 bg-white/[0.02] hover:border-blue-500/40'
                      }`}
                  >
                    <p className="font-bold text-white text-sm">Resume-Based</p>
                    <p className="text-[10px] text-slate-500 mt-1">Questions tailored to your resume.</p>
                  </button>
                </div>
              </section>

              {/* Resume Upload */}
              <AnimatePresence>
                {requiresResume && (
                  <motion.section
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-10"
                  >
                    <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center bg-white/[0.02]">
                      <label htmlFor="resume-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                            <UploadCloud className="text-blue-400" />
                          </div>
                          {resumeFile ? (
                            <>
                              <p className="font-bold text-blue-400">{resumeFile.name}</p>
                              <p className="text-xs text-slate-500">({(resumeFile.size / 1024).toFixed(1)} KB) - Click to change</p>
                            </>
                          ) : (
                            <>
                              <p className="font-bold text-white">Upload Your Resume</p>
                              <p className="text-xs text-slate-500">PDF, DOCX up to 5MB</p>
                            </>
                          )}
                        </div>
                        <input
                          id="resume-upload"
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => setResumeFile(e.target.files[0])}
                        />
                      </label>
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>

              {/* Start Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleStartInterview}
                disabled={isStarting}
                className="w-full group bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-lg flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-[0_8px_20px_rgba(59,130,246,0.35)] disabled:opacity-60"
              >
                {isStarting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>{isScanning ? 'Scanning Resume...' : 'Preparing Session...'}</span>
                  </>
                ) : (
                  <>
                    <span>Start Your Interview</span>
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AIInterviewPractice;