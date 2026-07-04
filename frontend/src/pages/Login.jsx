import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Loading from '../components/Loading.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ChevronDown } from "lucide-react";

// Animated "khatarnak" hero SVG — glowing rotating rings, pulsing core, orbiting nodes.
// Pure SVG/SMIL animation so it works with zero extra deps.
const KhatarnakHeroSVG = () => (
  <svg
    viewBox="0 0 400 400"
    xmlns="http://www.w3.org/2000/svg"
    className="w-40 h-40 md:w-56 md:h-56 mx-auto"
  >
    <defs>
      <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
        <stop offset="35%" stopColor="#BFE0FF" stopOpacity="0.9" />
        <stop offset="70%" stopColor="#4C9BFF" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#4C9BFF" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="ringGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#93C5FD" />
        <stop offset="50%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#60A5FA" />
      </linearGradient>
      <linearGradient id="ringGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#DBEAFE" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
      <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Ambient pulse behind everything */}
    <circle cx="200" cy="200" r="140" fill="url(#coreGlow)" opacity="0.5">
      <animate attributeName="r" values="120;150;120" dur="4s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.35;0.6;0.35" dur="4s" repeatCount="indefinite" />
    </circle>

    {/* Outer dashed ring, slow rotate */}
    <g filter="url(#glow)">
      <circle
        cx="200" cy="200" r="150"
        fill="none" stroke="url(#ringGrad1)" strokeWidth="2"
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
        fill="none" stroke="url(#ringGrad2)" strokeWidth="3"
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
          <circle cx="200" cy="65" r="7" fill="#FFFFFF" filter="url(#glow)">
            <animate attributeName="r" values="5;9;5" dur="2s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
          </circle>
        </g>
      </g>
    ))}

    {/* Core lock glyph */}
    <g filter="url(#glow)">
      <rect x="172" y="192" width="56" height="46" rx="10" fill="#FFFFFF">
        <animate attributeName="opacity" values="0.85;1;0.85" dur="3s" repeatCount="indefinite" />
      </rect>
      <path
        d="M182 192 v-14 a18 18 0 0 1 36 0 v14"
        fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round"
      />
      <circle cx="200" cy="212" r="6" fill="#3B82F6" />
      <rect x="197" y="214" width="6" height="12" rx="3" fill="#3B82F6" />
    </g>

    {/* Sparkle accents */}
    <g fill="#FFFFFF">
      <circle cx="90" cy="120" r="2.5">
        <animate attributeName="opacity" values="0;1;0" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <circle cx="320" cy="150" r="2" >
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

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    if (location.state?.verificationMessage) {
      setErrors((prev) => ({
        ...prev,
        verification: location.state.verificationMessage,
      }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    const result = await login(formData.email, formData.password);

    if (!result.success) {
      setErrors({ submit: result.message });
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Signing you in..." />;
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
            0%, 100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.35); }
            50% { box-shadow: 0 0 0 6px rgba(37, 99, 235, 0); }
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
          .pop-in { animation: pop-in 0.35s ease-out both; }
          .animated-gradient {
            background-size: 200% 200%;
            animation: gradient-pan 10s ease infinite;
          }
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
          @media (prefers-reduced-motion: reduce) {
            .blob-a, .blob-b, .blob-c, .drift-dot, .fade-in-up, .fade-in-left,
            .pop-in, .animated-gradient, .btn-shine::after, .focus-ring:focus-within, .glow-orb {
              animation: none !important;
            }
          }
        `}</style>

      {/* Left: Illustration and Welcome */}
      <div className="animated-gradient md:w-1/2 min-h-[40vh] md:min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-800 via-blue-600 to-indigo-500 p-8 sm:p-12 md:p-16 text-white relative overflow-hidden">

        {/* Ambient background blobs */}
        <div className="glow-orb blob-a pointer-events-none absolute -top-24 -left-16 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="glow-orb blob-b pointer-events-none absolute -bottom-28 -right-10 w-80 h-80 rounded-full bg-blue-300/20 blur-3xl" />
        <div className="glow-orb blob-c pointer-events-none absolute top-1/3 right-0 w-56 h-56 rounded-full bg-white/5 blur-3xl" style={{ animationDelay: '3s' }} />
        <div className="glow-orb blob-a pointer-events-none absolute bottom-1/4 left-1/4 w-40 h-40 rounded-full bg-indigo-300/20 blur-2xl" style={{ animationDelay: '1.5s' }} />

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
          <KhatarnakHeroSVG />
        </div>

        <div className="fade-in-up relative flex flex-col justify-center items-center max-w-sm" style={{ animationDelay: '0.15s' }}>
          <h2 className="font-serif text-3xl sm:text-[2.25rem] leading-tight font-semibold mb-4 text-center tracking-tight">New Here?</h2>

          <div className="flex flex-col items-center gap-2">
            <ChevronDown className="w-8 h-8 text-white animate-bounce" />

            <Link
              to="/register"
              className="relative overflow-hidden px-8 py-2.5 bg-white text-blue-700 font-semibold rounded-full shadow-lg hover:bg-blue-50 hover:shadow-blue-300/50 hover:shadow-xl active:scale-95 transition-all text-center tracking-wide"
            >
              <span className="relative z-10">Create Account / Sign Up</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="md:w-1/2 min-h-[60vh] md:min-h-screen flex flex-col justify-center items-center p-8 sm:p-12 md:p-16 bg-white dark:bg-[#262421]">
        <div className="w-full max-w-md">
          <h1 className="fade-in-up font-serif text-3xl sm:text-4xl font-semibold text-[#3D3929] dark:text-[#F4F1EA] mb-1 text-center tracking-tight">Welcome back</h1>
          <p className="fade-in-up text-sm text-[#83786a] dark:text-[#c2b8a3] text-center mb-8" style={{ animationDelay: '0.08s' }}>Sign in to continue to your dashboard</p>

          <div className="flex flex-col gap-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {errors.verification && (
                <div className="pop-in bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3.5">
                  <p className="text-sm text-blue-700 dark:text-blue-300">{errors.verification}</p>
                </div>
              )}
              {errors.submit && (
                <div className="pop-in bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3.5">
                  <p className="text-sm text-red-700 dark:text-red-400">{errors.submit}</p>
                </div>
              )}

              {/* Email Field */}
              <div className="fade-in-left" style={{ animationDelay: '0.12s' }}>
                <label htmlFor="email" className="block text-sm font-medium text-[#3D3929] dark:text-[#c2b8a3] mb-2">
                  Email
                </label>
                <div className={`focus-ring rounded-xl ${focusedField === 'email' ? 'ring-2 ring-blue-500' : ''}`}>
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
                    className={`w-full px-4 py-3 border rounded-xl text-[15px] bg-[#F4F1EA] dark:bg-[#1A1815] text-[#3D3929] dark:text-[#F4F1EA] placeholder-[#a89d89] dark:placeholder-[#6b6353] focus:outline-none transition-all duration-200 ${errors.email ? 'border-red-500' : 'border-[#E6E0D4] dark:border-[#3a362f]'
                      }`}
                    placeholder="you@college.edu"
                  />
                </div>
                {errors.email && (
                  <p className="pop-in mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="fade-in-left" style={{ animationDelay: '0.2s' }}>
                <label htmlFor="password" className="block text-sm font-medium text-[#3D3929] dark:text-[#c2b8a3] mb-2">
                  Password
                </label>
                <div className={`focus-ring relative rounded-xl ${focusedField === 'password' ? 'ring-2 ring-blue-500' : ''}`}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3 pr-11 border rounded-xl text-[15px] bg-[#F4F1EA] dark:bg-[#1A1815] text-[#3D3929] dark:text-[#F4F1EA] placeholder-[#a89d89] dark:placeholder-[#6b6353] focus:outline-none transition-all duration-200 ${errors.password ? 'border-red-500' : 'border-[#E6E0D4] dark:border-[#3a362f]'
                      }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a89d89] dark:text-[#6b6353] hover:text-[#83786a] dark:hover:text-[#c2b8a3] p-1.5 rounded-lg transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="pop-in mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-shine fade-in-up relative overflow-hidden w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full font-semibold text-[15px] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation mt-1 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98]"
                style={{ animationDelay: '0.3s' }}
              >
                <span className="relative z-10">{loading ? 'Signing in...' : 'Sign in'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

    </div>
  );
};

export default React.memo(Login);