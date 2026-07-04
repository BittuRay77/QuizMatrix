import { useState } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { validatePassword } from '../utils/helpers';
import { ChevronDown } from 'lucide-react';

// Animated "khatarnak" hero SVG for the Register page — glowing rotating rings,
// pulsing core, orbiting nodes, with a graduation-cap glyph at the center.
// Pure SVG/SMIL animation so it works with zero extra deps.
const KhatarnakRegisterHeroSVG = () => (
  <svg
    viewBox="0 0 400 400"
    xmlns="http://www.w3.org/2000/svg"
    className="w-40 h-40 md:w-56 md:h-56 mx-auto"
  >
    <defs>
      <radialGradient id="regCoreGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
        <stop offset="35%" stopColor="#C7D2FE" stopOpacity="0.9" />
        <stop offset="70%" stopColor="#818CF8" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="regRingGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A5B4FC" />
        <stop offset="50%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#6366F1" />
      </linearGradient>
      <linearGradient id="regRingGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#E0E7FF" />
        <stop offset="100%" stopColor="#4F46E5" />
      </linearGradient>
      <filter id="regGlow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Ambient pulse behind everything */}
    <circle cx="200" cy="200" r="140" fill="url(#regCoreGlow)" opacity="0.5">
      <animate attributeName="r" values="120;150;120" dur="4s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.35;0.6;0.35" dur="4s" repeatCount="indefinite" />
    </circle>

    {/* Outer dashed ring, slow rotate */}
    <g filter="url(#regGlow)">
      <circle
        cx="200" cy="200" r="150"
        fill="none" stroke="url(#regRingGrad1)" strokeWidth="2"
        strokeDasharray="6 14" strokeLinecap="round" opacity="0.8"
      >
        <animateTransform
          attributeName="transform" type="rotate"
          from="0 200 200" to="360 200 200"
          dur="18s" repeatCount="indefinite"
        />
      </circle>

      {/* Middle ring, opposite rotation */}
      <circle
        cx="200" cy="200" r="115"
        fill="none" stroke="url(#regRingGrad2)" strokeWidth="3"
        strokeDasharray="90 210" strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform" type="rotate"
          from="360 200 200" to="0 200 200"
          dur="9s" repeatCount="indefinite"
        />
      </circle>

      {/* Inner ring, fast rotate */}
      <circle
        cx="200" cy="200" r="80"
        fill="none" stroke="#FFFFFF" strokeWidth="2"
        strokeDasharray="4 10" strokeLinecap="round" opacity="0.9"
      >
        <animateTransform
          attributeName="transform" type="rotate"
          from="0 200 200" to="360 200 200"
          dur="6s" repeatCount="indefinite"
        />
      </circle>
    </g>

    {/* Orbiting nodes */}
    {[0, 120, 240].map((angle, i) => (
      <g key={angle}>
        <g>
          <animateTransform
            attributeName="transform" type="rotate"
            from={`${angle} 200 200`} to={`${angle + 360} 200 200`}
            dur={`${10 + i * 2}s`} repeatCount="indefinite"
          />
          <circle cx="200" cy="65" r="7" fill="#FFFFFF" filter="url(#regGlow)">
            <animate attributeName="r" values="5;9;5" dur="2s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
          </circle>
        </g>
      </g>
    ))}

    {/* Core graduation-cap glyph */}
    <g filter="url(#regGlow)">
      <circle cx="200" cy="200" r="34" fill="#FFFFFF">
        <animate attributeName="opacity" values="0.85;1;0.85" dur="3s" repeatCount="indefinite" />
      </circle>
      <path
        d="M170 194 L200 180 L230 194 L200 208 Z"
        fill="#4F46E5"
      />
      <path
        d="M182 200 v14 c0 6 8 10 18 10 s18 -4 18 -10 v-14"
        fill="none" stroke="#4F46E5" strokeWidth="4" strokeLinecap="round"
      />
      <line x1="230" y1="196" x2="230" y2="216" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" />
      <circle cx="230" cy="219" r="2.5" fill="#4F46E5" />
    </g>

    {/* Sparkle accents */}
    <g fill="#FFFFFF">
      <circle cx="90" cy="120" r="2.5">
        <animate attributeName="opacity" values="0;1;0" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <circle cx="320" cy="150" r="2">
        <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" begin="0.6s" />
      </circle>
      <circle cx="300" cy="300" r="3">
        <animate attributeName="opacity" values="0;1;0" dur="2.6s" repeatCount="indefinite" begin="1.1s" />
      </circle>
      <circle cx="110" cy="290" r="2">
        <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.3s" />
      </circle>
    </g>
  </svg>
);

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    college: '',
    branch: '',
    section: '',
    department: '', // Teacher fields
    rollNumber: '', // Student fields
    semester: ''
  });

  // 'Other' कॉलेज चुनने पर कस्टम नाम स्टोर करने के लिए स्टेट
  const [isOtherCollege, setIsOtherCollege] = useState(false);
  const [customCollege, setCustomCollege] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // अगर कॉलेज ड्रॉपडाउन चेंज हो रहा है
    if (name === 'college') {
      if (value === 'Other') {
        setIsOtherCollege(true);
        setFormData(prev => ({ ...prev, college: '' })); // कस्टम इनपुट के लिए खाली करें
      } else {
        setIsOtherCollege(false);
        setCustomCollege('');
        setFormData(prev => ({ ...prev, college: value }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // कस्टम कॉलेज इनपुट हैंडलर
  const handleCustomCollegeChange = (e) => {
    const { value } = e.target;
    setCustomCollege(value);
    setFormData(prev => ({ ...prev, college: value }));
    if (errors.college) {
      setErrors(prev => ({ ...prev, college: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordCheck = validatePassword(formData.password);
      if (!passwordCheck.isValid) {
        newErrors.password = passwordCheck.errors.join(', ');
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Role-specific validation
    if (formData.role === 'teacher') {
      if (!formData.college.trim()) {
        newErrors.college = 'College is required for teachers';
      }
      if (!formData.branch.trim()) {
        newErrors.branch = 'Stream is required for teachers';
      }
    } else if (formData.role === 'student') {
      if (!formData.college.trim()) {
        newErrors.college = 'College is required for students';
      }
      if (!formData.branch.trim()) {
        newErrors.branch = 'Branch/stream is required for students';
      }
      if (!formData.section.trim()) {
        newErrors.section = 'Section is required for students';
      }
      if (!formData.rollNumber.trim()) {
        newErrors.rollNumber = 'Roll number is required for students';
      }
      if (!formData.semester.trim()) {
        newErrors.semester = 'Semester is required for students';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getMissingFields = () => {
    const missingFields = [];

    if (!formData.name.trim()) missingFields.push('name');
    if (!formData.email.trim()) missingFields.push('email');
    if (!formData.password) missingFields.push('password');
    if (!formData.confirmPassword) missingFields.push('confirm password');
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      missingFields.push('password match');
    }
    if (!formData.college.trim()) missingFields.push('college');
    if (!formData.branch.trim()) missingFields.push('branch');

    if (formData.role === 'student') {
      if (!formData.section.trim()) missingFields.push('section');
      if (!formData.rollNumber.trim()) missingFields.push('roll number');
      if (!formData.semester.trim()) missingFields.push('semester');
    }

    return missingFields;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const missingFields = getMissingFields();
    console.log('[Register] submit clicked', { role: formData.role, missingFields, formData });

    if (missingFields.length > 0) {
      setErrors({ submit: `Please fill: ${missingFields.join(', ')}` });
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      await register({
        ...formData,
        email: formData.email.trim().toLowerCase(),
      });
    } catch (err) {
      setErrors({
        submit: err.response?.data?.message || 'Registration failed',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Creating account..." />;
  }

  return (
    <div className="min-h-screen w-full bg-[#F4F1EA] dark:bg-[#1A1815] flex flex-col md:flex-row">
      <style>{`
          @keyframes float-slow {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(4%, -6%) scale(1.08); }
            66% { transform: translate(-3%, 4%) scale(0.95); }
          }
          @keyframes float-slower {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-6%, 5%) scale(1.1); }
          }
          @keyframes float-mid {
            0%, 100% { transform: translate(0,0) scale(1); }
            50% { transform: translate(5%, -4%) scale(1.05); }
          }
          @keyframes drift {
            0% { transform: translateY(0) translateX(0); opacity: 0; }
            10% { opacity: 0.5; }
            90% { opacity: 0.4; }
            100% { transform: translateY(-110vh) translateX(12px); opacity: 0; }
          }
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(14px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fade-in-left {
            from { opacity: 0; transform: translateX(-18px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes fade-in-down {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes expand-down {
            from { opacity: 0; transform: translateY(-8px) scaleY(0.9); }
            to { opacity: 1; transform: translateY(0) scaleY(1); }
          }
          @keyframes gradient-pan {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes shimmer {
            0% { transform: translateX(-150%) skewX(-15deg); }
            100% { transform: translateX(250%) skewX(-15deg); }
          }
          @keyframes pop-in {
            0% { opacity: 0; transform: scale(0.9) translateY(-6px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes ring-pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.35); }
            50% { box-shadow: 0 0 0 6px rgba(79, 70, 229, 0); }
          }
          @keyframes bg-glow-shift {
            0%, 100% { opacity: 0.35; }
            50% { opacity: 0.6; }
          }
          .blob-a { animation: float-slow 14s ease-in-out infinite; }
          .blob-b { animation: float-slower 18s ease-in-out infinite; }
          .blob-c { animation: float-mid 11s ease-in-out infinite; }
          .fade-in-up { animation: fade-in-up 0.7s ease-out both; }
          .fade-in-left { animation: fade-in-left 0.6s ease-out both; }
          .fade-in-down { animation: fade-in-down 0.5s ease-out both; }
          .expand-down { animation: expand-down 0.25s ease-out both; transform-origin: top; }
          .pop-in { animation: pop-in 0.35s ease-out both; }
          .animated-gradient {
            background-size: 200% 200%;
            animation: gradient-pan 10s ease infinite;
          }
          .btn-shine { position: relative; overflow: hidden; }
          .btn-shine::after {
            content: '';
            position: absolute;
            top: 0; left: 0;
            width: 40%; height: 100%;
            background: linear-gradient(120deg, transparent, rgba(255,255,255,0.55), transparent);
            animation: shimmer 2.8s ease-in-out infinite;
          }
          .focus-ring:focus-within {
            animation: ring-pulse 1.6s ease-out infinite;
          }
          .glow-orb { animation: bg-glow-shift 6s ease-in-out infinite; }
          .role-card { transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease; }
          .role-card:active { transform: scale(0.95); }
          .role-card.selected { box-shadow: 0 4px 18px -4px rgba(79, 70, 229, 0.35); }
          .role-emoji { display: inline-block; transition: transform 0.25s ease; }
          .role-card.selected .role-emoji { transform: scale(1.15) rotate(-4deg); }
          @media (prefers-reduced-motion: reduce) {
            .blob-a, .blob-b, .blob-c, .drift-dot, .fade-in-up, .fade-in-left, .fade-in-down,
            .expand-down, .pop-in, .animated-gradient, .btn-shine::after, .focus-ring:focus-within,
            .glow-orb, .role-card, .role-emoji {
              animation: none !important;
              transition: none !important;
            }
          }
        `}</style>

      {/* Left: Illustration and Welcome */}
      <div className="animated-gradient md:w-1/2 min-h-[32vh] md:min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-800 via-indigo-600 to-blue-500 p-8 sm:p-12 md:p-16 text-white relative overflow-hidden">

        {/* Ambient background blobs */}
        <div className="glow-orb blob-a pointer-events-none absolute -top-24 -left-16 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="glow-orb blob-b pointer-events-none absolute -bottom-28 -right-10 w-80 h-80 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="glow-orb blob-c pointer-events-none absolute top-1/3 right-0 w-56 h-56 rounded-full bg-white/5 blur-3xl" style={{ animationDelay: '3s' }} />
        <div className="glow-orb blob-a pointer-events-none absolute bottom-1/4 left-1/4 w-40 h-40 rounded-full bg-blue-300/20 blur-2xl" style={{ animationDelay: '1.5s' }} />

        {/* Drifting particles */}
        {[...Array(10)].map((_, i) => (
          <span
            key={i}
            className="drift-dot pointer-events-none absolute rounded-full bg-white/40"
            style={{
              width: `${4 + (i % 3) * 3}px`,
              height: `${4 + (i % 3) * 3}px`,
              left: `${6 + i * 9}%`,
              bottom: `-5%`,
              animation: `drift ${8 + i}s linear infinite`,
              animationDelay: `${i * 1.1}s`,
            }}
          />
        ))}

        <div className="fade-in-up relative">
          <KhatarnakRegisterHeroSVG />
        </div>

        <div className="fade-in-up relative flex flex-col justify-center items-center max-w-sm" style={{ animationDelay: '0.15s' }}>
          <h2 className="font-serif text-3xl sm:text-[2.25rem] leading-tight font-semibold mb-1 text-center tracking-tight">Already a Member?</h2>
          <p className="text-sm text-white/80 text-center mb-4">Sign in and jump back into your dashboard</p>

          <div className="flex flex-col items-center gap-2">
            <ChevronDown className="w-8 h-8 text-white animate-bounce" />

            <Link
              to="/login"
              className="relative overflow-hidden px-8 py-2.5 bg-white text-indigo-700 font-semibold rounded-full shadow-lg hover:bg-indigo-50 hover:shadow-indigo-300/50 hover:shadow-xl active:scale-95 transition-all text-center tracking-wide"
            >
              <span className="relative z-10">Sign In</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Right: Registration Form */}
      <div className="md:w-1/2 min-h-[68vh] md:min-h-screen flex flex-col justify-center items-center p-6 sm:p-10 md:p-16 bg-white dark:bg-[#262421] overflow-y-auto">
        <div className="w-full max-w-md py-4">
          <h1 className="fade-in-up font-serif text-3xl sm:text-4xl font-semibold text-[#3D3929] dark:text-[#F4F1EA] mb-1 text-center tracking-tight">Create your account</h1>
          <p className="fade-in-up text-sm text-[#83786a] dark:text-[#c2b8a3] text-center mb-6" style={{ animationDelay: '0.08s' }}>Join Quiz Platform in a few quick steps</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {errors.submit && (
              <div className="pop-in bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3.5">
                <p className="text-sm text-red-700 dark:text-red-400">{errors.submit}</p>
              </div>
            )}

            {/* Role Selection */}
            <div className="fade-in-left" style={{ animationDelay: '0.1s' }}>
              
              <div className="grid grid-cols-2 gap-3">
                <label className={`role-card cursor-pointer rounded-xl border-2 p-4 text-center touch-manipulation ${
                  formData.role === 'student'
                    ? 'selected border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-[#E6E0D4] dark:border-[#3a362f] hover:border-indigo-300'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={formData.role === 'student'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  
                  <span className="text-sm font-semibold text-[#3D3929] dark:text-[#F4F1EA]">Student</span>
                </label>
                <label className={`role-card cursor-pointer rounded-xl border-2 p-4 text-center touch-manipulation ${
                  formData.role === 'teacher'
                    ? 'selected border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-[#E6E0D4] dark:border-[#3a362f] hover:border-indigo-300'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="teacher"
                    checked={formData.role === 'teacher'}
                    onChange={handleChange}
                    className="sr-only"
                  />
             
                  <span className="text-sm font-semibold text-[#3D3929] dark:text-[#F4F1EA]">Teacher</span>
                </label>
              </div>
            </div>

            {/* Name */}
            <div className="fade-in-left" style={{ animationDelay: '0.14s' }}>
              <label htmlFor="name" className="block text-sm font-medium text-[#3D3929] dark:text-[#c2b8a3] mb-2">
                Name
              </label>
              <div className={`focus-ring rounded-xl ${focusedField === 'name' ? 'ring-2 ring-indigo-500' : ''}`}>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3 border rounded-xl text-[15px] bg-[#F4F1EA] dark:bg-[#1A1815] text-[#3D3929] dark:text-[#F4F1EA] placeholder-[#a89d89] dark:placeholder-[#6b6353] focus:outline-none transition-all duration-200 ${
                    errors.name ? 'border-red-500' : 'border-[#E6E0D4] dark:border-[#3a362f]'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <p className="pop-in mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="fade-in-left" style={{ animationDelay: '0.18s' }}>
              <label htmlFor="email" className="block text-sm font-medium text-[#3D3929] dark:text-[#c2b8a3] mb-2">
                Email
              </label>
              <div className={`focus-ring rounded-xl ${focusedField === 'email' ? 'ring-2 ring-indigo-500' : ''}`}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3 border rounded-xl text-[15px] bg-[#F4F1EA] dark:bg-[#1A1815] text-[#3D3929] dark:text-[#F4F1EA] placeholder-[#a89d89] dark:placeholder-[#6b6353] focus:outline-none transition-all duration-200 ${
                    errors.email ? 'border-red-500' : 'border-[#E6E0D4] dark:border-[#3a362f]'
                  }`}
                  placeholder="you@college.edu"
                />
              </div>
              {errors.email && (
                <p className="pop-in mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* College & Branch Section */}
            <div className="fade-in-left grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ animationDelay: '0.22s' }}>
              {/* College Dropdown */}
              <div>
                <label htmlFor="college" className="block text-sm font-medium text-[#3D3929] dark:text-[#c2b8a3] mb-2">
                  College
                </label>
                <div className={`focus-ring rounded-xl ${focusedField === 'college' ? 'ring-2 ring-indigo-500' : ''}`}>
                  <select
                    id="college"
                    name="college"
                    required
                    value={isOtherCollege ? 'Other' : formData.college}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('college')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3 border rounded-xl text-[15px] bg-[#F4F1EA] dark:bg-[#1A1815] text-[#3D3929] dark:text-[#F4F1EA] focus:outline-none transition-all duration-200 ${
                      errors.college ? 'border-red-500' : 'border-[#E6E0D4] dark:border-[#3a362f]'
                    }`}
                  >
                    <option value="">Select College</option>
                    <option value="Budge Budge Institute of Technology">Budge Budge Institute of Technology</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {errors.college && (
                  <p className="pop-in mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.college}</p>
                )}
              </div>

              {/* Stream / Branch Dropdown */}
              <div>
                <label htmlFor="branch" className="block text-sm font-medium text-[#3D3929] dark:text-[#c2b8a3] mb-2">
                  Stream / Branch
                </label>
                <div className={`focus-ring rounded-xl ${focusedField === 'branch' ? 'ring-2 ring-indigo-500' : ''}`}>
                  <select
                    id="branch"
                    name="branch"
                    required
                    value={formData.branch}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('branch')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3 border rounded-xl text-[15px] bg-[#F4F1EA] dark:bg-[#1A1815] text-[#3D3929] dark:text-[#F4F1EA] focus:outline-none transition-all duration-200 ${
                      errors.branch ? 'border-red-500' : 'border-[#E6E0D4] dark:border-[#3a362f]'
                    }`}
                  >
                    <option value="">Select Stream</option>
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="EE">EE</option>
                    <option value="EEE">EEE</option>
                    <option value="ME">ME</option>
                    <option value="CE">CE</option>
                    <option value="AI & ML">AI & ML</option>
                  </select>
                </div>
                {errors.branch && (
                  <p className="pop-in mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.branch}</p>
                )}
              </div>
            </div>

            {/* Custom College Input Box - Only opens when 'Other' is selected */}
            {isOtherCollege && (
              <div className="expand-down">
                <label htmlFor="customCollege" className="block text-sm font-medium text-[#3D3929] dark:text-[#c2b8a3] mb-2">
                  Enter College Name
                </label>
                <div className={`focus-ring rounded-xl ${focusedField === 'customCollege' ? 'ring-2 ring-indigo-500' : ''}`}>
                  <input
                    id="customCollege"
                    type="text"
                    required
                    value={customCollege}
                    onChange={handleCustomCollegeChange}
                    onFocus={() => setFocusedField('customCollege')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3 border rounded-xl text-[15px] bg-[#F4F1EA] dark:bg-[#1A1815] text-[#3D3929] dark:text-[#F4F1EA] placeholder-[#a89d89] dark:placeholder-[#6b6353] focus:outline-none transition-all duration-200 ${
                      errors.college ? 'border-red-500' : 'border-[#E6E0D4] dark:border-[#3a362f]'
                    }`}
                    placeholder="Type your college name"
                  />
                </div>
              </div>
            )}

            {/* Role Specific Fields */}
            {formData.role === 'teacher' ? (
              <div className="expand-down">
                <label htmlFor="department" className="block text-sm font-medium text-[#3D3929] dark:text-[#c2b8a3] mb-2">
                  Department (Optional)
                </label>
                <div className={`focus-ring rounded-xl ${focusedField === 'department' ? 'ring-2 ring-indigo-500' : ''}`}>
                  <input
                    id="department"
                    name="department"
                    type="text"
                    value={formData.department}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('department')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-4 py-3 border rounded-xl text-[15px] bg-[#F4F1EA] dark:bg-[#1A1815] text-[#3D3929] dark:text-[#F4F1EA] placeholder-[#a89d89] dark:placeholder-[#6b6353] focus:outline-none transition-all duration-200 border-[#E6E0D4] dark:border-[#3a362f]"
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>
            ) : (
              <div className="expand-down space-y-5">
                <div>
                  <label htmlFor="section" className="block text-sm font-medium text-[#3D3929] dark:text-[#c2b8a3] mb-2">
                    Section
                  </label>
                  <div className={`focus-ring rounded-xl ${focusedField === 'section' ? 'ring-2 ring-indigo-500' : ''}`}>
                    <input
                      id="section"
                      name="section"
                      type="text"
                      required
                      value={formData.section}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('section')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 border rounded-xl text-[15px] bg-[#F4F1EA] dark:bg-[#1A1815] text-[#3D3929] dark:text-[#F4F1EA] placeholder-[#a89d89] dark:placeholder-[#6b6353] focus:outline-none transition-all duration-200 ${
                        errors.section ? 'border-red-500' : 'border-[#E6E0D4] dark:border-[#3a362f]'
                      }`}
                      placeholder="e.g., A"
                    />
                  </div>
                  {errors.section && (
                    <p className="pop-in mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.section}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="rollNumber" className="block text-sm font-medium text-[#3D3929] dark:text-[#c2b8a3] mb-2">
                    Roll Number
                  </label>
                  <div className={`focus-ring rounded-xl ${focusedField === 'rollNumber' ? 'ring-2 ring-indigo-500' : ''}`}>
                    <input
                      id="rollNumber"
                      name="rollNumber"
                      type="text"
                      required
                      value={formData.rollNumber}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('rollNumber')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 border rounded-xl text-[15px] bg-[#F4F1EA] dark:bg-[#1A1815] text-[#3D3929] dark:text-[#F4F1EA] placeholder-[#a89d89] dark:placeholder-[#6b6353] focus:outline-none transition-all duration-200 ${
                        errors.rollNumber ? 'border-red-500' : 'border-[#E6E0D4] dark:border-[#3a362f]'
                      }`}
                      placeholder="e.g., 2021001"
                    />
                  </div>
                  {errors.rollNumber && (
                    <p className="pop-in mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.rollNumber}</p>
                  )}
                </div>

                {/* Semester Dropdown */}
                <div>
                  <label htmlFor="semester" className="block text-sm font-medium text-[#3D3929] dark:text-[#c2b8a3] mb-2">
                    Semester
                  </label>
                  <div className={`focus-ring rounded-xl ${focusedField === 'semester' ? 'ring-2 ring-indigo-500' : ''}`}>
                    <select
                      id="semester"
                      name="semester"
                      required
                      value={formData.semester}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('semester')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 border rounded-xl text-[15px] bg-[#F4F1EA] dark:bg-[#1A1815] text-[#3D3929] dark:text-[#F4F1EA] focus:outline-none transition-all duration-200 ${
                        errors.semester ? 'border-red-500' : 'border-[#E6E0D4] dark:border-[#3a362f]'
                      }`}
                    >
                      <option value="">Select Semester</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem.toString()}>
                          {sem}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.semester && (
                    <p className="pop-in mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.semester}</p>
                  )}
                </div>
              </div>
            )}

            {/* Password */}
            <div className="fade-in-left" style={{ animationDelay: '0.26s' }}>
              <label htmlFor="password" className="block text-sm font-medium text-[#3D3929] dark:text-[#c2b8a3] mb-2">
                Password
              </label>
              <div className={`focus-ring rounded-xl ${focusedField === 'password' ? 'ring-2 ring-indigo-500' : ''}`}>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3 border rounded-xl text-[15px] bg-[#F4F1EA] dark:bg-[#1A1815] text-[#3D3929] dark:text-[#F4F1EA] placeholder-[#a89d89] dark:placeholder-[#6b6353] focus:outline-none transition-all duration-200 ${
                    errors.password ? 'border-red-500' : 'border-[#E6E0D4] dark:border-[#3a362f]'
                  }`}
                  placeholder="Create a password (min 8 characters)"
                />
              </div>
              {errors.password && (
                <p className="pop-in mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="fade-in-left" style={{ animationDelay: '0.3s' }}>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#3D3929] dark:text-[#c2b8a3] mb-2">
                Confirm Password
              </label>
              <div className={`focus-ring rounded-xl ${focusedField === 'confirmPassword' ? 'ring-2 ring-indigo-500' : ''}`}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3 border rounded-xl text-[15px] bg-[#F4F1EA] dark:bg-[#1A1815] text-[#3D3929] dark:text-[#F4F1EA] placeholder-[#a89d89] dark:placeholder-[#6b6353] focus:outline-none transition-all duration-200 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-[#E6E0D4] dark:border-[#3a362f]'
                  }`}
                  placeholder="Confirm your password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="pop-in mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-shine fade-in-up relative overflow-hidden w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-full font-semibold text-[15px] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation mt-1 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98]"
              style={{ animationDelay: '0.34s' }}
            >
              <span className="relative z-10">{loading ? 'Creating Account...' : 'Create Account'}</span>
            </button>
          </form>

          {/* Sign in link */}
          <p className="fade-in-up text-center text-sm text-[#83786a] dark:text-[#c2b8a3] mt-6" style={{ animationDelay: '0.38s' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;