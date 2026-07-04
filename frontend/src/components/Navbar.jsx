import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import NotificationBell from './NotificationBell';

/**
 * APPLE SF SYMBOLS STYLE (Framework7 Icons) + iOS Switch
 * -------------------------------------------------------
 * - Framework7 Icons = web version of Apple's SF Symbols (iPhone system icons)
 * - Active nav item uses the "_fill" variant — exactly like iOS tab bars
 * - Theme toggle: iOS-style switch like iPhone Settings
 * - Requires the framework7-icons <link> in public/index.html
 */

// Reusable SF-style icon — pass `filled` for the iOS active state
const SFIcon = ({ name, filledName, filled = false, size = 20, className = '' }) => (
  <i
    aria-hidden="true"
    className={`f7-icons select-none leading-none ${className}`}
    style={{ fontSize: `${size}px` }}
  >
    {filled && filledName ? filledName : name}
  </i>
);

// iOS-style switch — pure Tailwind, like iPhone Settings
const IOSSwitch = ({ checked, onChange, ariaLabel }) => (
  <button
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    onClick={onChange}
    className={`relative inline-flex h-[26px] w-[46px] shrink-0 items-center rounded-full
               transition-colors duration-300 ease-in-out focus:outline-none
               focus-visible:ring-2 focus-visible:ring-[#0A84FF]/50 focus-visible:ring-offset-2 ${
                 checked ? 'bg-[#0A84FF]' : 'bg-black/[0.15] dark:bg-white/[0.2]'
               }`}
  >
    <span
      className={`pointer-events-none inline-block h-[22px] w-[22px] rounded-full bg-white
                 shadow-[0_2px_4px_rgba(0,0,0,0.2),0_0_1px_rgba(0,0,0,0.1)]
                 transform transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                   checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
                 }`}
    />
  </button>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Each link has an outlined + filled SF Symbol pair (iOS tab bar pattern)
  const navLinks =
    user?.role === 'teacher'
      ? [
          { name: 'Dashboard', path: '/teacher', icon: 'square_grid_2x2', iconFill: 'square_grid_2x2_fill' },
          { name: 'Create Exam', path: '/create-exam', icon: 'square_pencil', iconFill: 'square_pencil_fill' },
          { name: 'Forums', path: '/forums', icon: 'bubble_left_bubble_right', iconFill: 'bubble_left_bubble_right_fill' },
        ]
      : [
          { name: 'Dashboard', path: '/student', icon: 'square_grid_2x2', iconFill: 'square_grid_2x2_fill' },
          { name: 'AI Practice', path: '/ai-interview', icon: 'wand_stars', iconFill: 'wand_stars_inverse' },
          { name: 'Mock Tests', path: '/mock-test', icon: 'timer', iconFill: 'timer_fill' },
          { name: 'Forums', path: '/forums', icon: 'bubble_left_bubble_right', iconFill: 'bubble_left_bubble_right_fill' },
        ];

  return (
    <nav
      className={`sticky top-0 z-50 backdrop-blur-xl backdrop-saturate-150 border-b transition-colors duration-300 ${
        darkMode
          ? 'bg-[#161617]/80 border-white/[0.08] text-white'
          : 'bg-white/80 border-black/[0.08] text-[#1d1d1f]'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo — quiet wordmark */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-7 h-7 rounded-lg bg-[#0A84FF] flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <span className="text-white font-semibold text-sm leading-none">Q</span>
            </div>
            <span className="text-[15px] font-semibold tracking-tight">
              QuizMatrix
            </span>
          </Link>

          {/* Desktop nav — SF Symbols, filled when active (iOS tab bar behavior) */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[13px] font-medium
                             transition-all duration-200 ${
                               isActive
                                 ? darkMode
                                   ? 'bg-white/10 text-white'
                                   : 'bg-black/[0.06] text-[#1d1d1f]'
                                 : darkMode
                                   ? 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                                   : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.04]'
                             }`}
                >
                  <SFIcon
                    name={link.icon}
                    filledName={link.iconFill}
                    filled={isActive}
                    size={18}
                  />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Theme toggle — iOS switch with sun/moon SF Symbols */}
            <div className="hidden sm:flex items-center gap-2">
              <SFIcon
                name="sun_max"
                filledName="sun_max_fill"
                filled={!darkMode}
                size={16}
                className={darkMode ? 'text-white/40' : 'text-[#1d1d1f]'}
              />
              <IOSSwitch
                checked={darkMode}
                onChange={toggleDarkMode}
                ariaLabel={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              />
              <SFIcon
                name="moon"
                filledName="moon_fill"
                filled={darkMode}
                size={16}
                className={darkMode ? 'text-white' : 'text-black/30'}
              />
            </div>

            {/* Mobile theme toggle — compact icon button */}
            <button
              onClick={toggleDarkMode}
              className={`sm:hidden p-2 rounded-full transition-colors duration-200 ${
                darkMode
                  ? 'text-white/60 hover:text-white hover:bg-white/[0.08]'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.05]'
              }`}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <SFIcon
                name={darkMode ? 'sun_max_fill' : 'moon'}
                size={20}
              />
            </button>

            <NotificationBell />

            {/* Profile — circular avatar with hover ring */}
            <button
              onClick={() => navigate('/profile')}
              className="hidden md:flex items-center gap-2.5 pl-3 ml-1 border-l border-black/[0.08] dark:border-white/[0.08] group"
              aria-label="Go to profile"
            >
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#0A84FF]/40 transition-all duration-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#0A84FF] flex items-center justify-center ring-2 ring-transparent group-hover:ring-[#0A84FF]/40 transition-all duration-200">
                  <SFIcon name="person_fill" size={16} className="text-white" />
                </div>
              )}
              <span
                className={`text-[13px] font-medium hidden lg:block ${
                  darkMode ? 'text-white/80' : 'text-[#1d1d1f]'
                }`}
              >
                {user?.name}
              </span>
            </button>

            <button
              onClick={handleLogout}
              className={`hidden md:flex p-2 rounded-full transition-colors duration-200 ${
                darkMode
                  ? 'text-white/50 hover:text-white hover:bg-white/[0.08]'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.05]'
              }`}
              aria-label="Sign out"
              title="Sign out"
            >
              <SFIcon name="square_arrow_right" size={19} />
            </button>

            {/* Mobile toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-full transition-colors duration-200 ${
                darkMode
                  ? 'text-white hover:bg-white/[0.08]'
                  : 'text-[#1d1d1f] hover:bg-black/[0.05]'
              }`}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              <SFIcon
                name={isMobileMenuOpen ? 'xmark' : 'line_horizontal_3'}
                size={20}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div
          className={`md:hidden border-t px-3 pb-3 pt-2 ${
            darkMode ? 'border-white/[0.08]' : 'border-black/[0.08]'
          }`}
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium transition-colors duration-150 ${
                  isActive
                    ? darkMode
                      ? 'bg-white/10 text-white'
                      : 'bg-black/[0.05] text-[#1d1d1f]'
                    : darkMode
                      ? 'text-white/70 active:bg-white/[0.06]'
                      : 'text-[#3a3a3c] active:bg-black/[0.04]'
                }`}
              >
                <SFIcon
                  name={link.icon}
                  filledName={link.iconFill}
                  filled={isActive}
                  size={21}
                />
                {link.name}
              </Link>
            );
          })}

          {/* Theme row — iOS switch, iPhone Settings style */}
          <div
            className={`flex items-center justify-between px-3 py-3 rounded-xl text-[15px] font-medium ${
              darkMode ? 'text-white/70' : 'text-[#3a3a3c]'
            }`}
          >
            <span className="flex items-center gap-3">
              <SFIcon
                name={darkMode ? 'moon_fill' : 'sun_max_fill'}
                size={21}
              />
              Dark mode
            </span>
            <IOSSwitch
              checked={darkMode}
              onChange={toggleDarkMode}
              ariaLabel="Toggle dark mode"
            />
          </div>

          <Link
            to="/profile"
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium ${
              darkMode ? 'text-white/70' : 'text-[#3a3a3c]'
            }`}
          >
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#0A84FF] flex items-center justify-center">
                <SFIcon name="person_fill" size={13} className="text-white" />
              </div>
            )}
            Profile
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium text-[#0A84FF]"
          >
            <SFIcon name="square_arrow_right" size={21} />
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
};

export default React.memo(Navbar);