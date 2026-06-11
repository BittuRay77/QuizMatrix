import React from 'react';

const Loading = ({ size = 'lg', text = 'Loading...', fullScreen = false }) => {

  const sizeClasses = {
    sm: 'w-10 h-14 text-xl',
    md: 'w-14 h-20 text-2xl',
    lg: 'w-20 h-28 text-4xl',
    xl: 'w-28 h-36 text-6xl'
  };

  const Container = fullScreen ? 'div' : React.Fragment;
  const containerProps = fullScreen ? {
    className: "fixed inset-0 bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center z-50",
    role: "status",
    "aria-live": "polite",
    "aria-label": text
  } : {};

  return (
    <Container {...containerProps}>
      <div className="flex flex-col items-center justify-center min-h-[250px] animate-fadeIn p-4">
        
        {/* 3D Quiz Container */}
        <div className="relative flex items-center justify-center">
          
          {/* 3D Flipping Quiz Card */}
          <div 
            className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl shadow-2xl flex items-center justify-center text-white font-black border-2 border-white/20 select-none`}
            role="img" 
            aria-label="Loading quiz indicator"
            style={{
              transformStyle: 'preserve-3d',
              perspective: '1000px',
              animation: 'quizCardAnim 2s infinite ease-in-out'
            }}
          >
            <span className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]">?</span>
          </div>

          {/* Dynamic Glow Shadow Underneath */}
          <div 
            className="absolute -bottom-4 w-12 h-2 bg-indigo-500/30 dark:bg-blue-400/20 rounded-full blur-sm"
            style={{
              animation: 'shadowAnim 2s infinite ease-in-out'
            }}
          ></div>
        </div>

        {/* Loading Text */}
        {text && (
          <div className="text-center mt-6 space-y-1">
            <p className="text-sm sm:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 tracking-wide uppercase">
              {text}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 animate-pulse">
              Please wait...
            </p>
          </div>
        )}
      </div>

      {/* CSS Keyframes for 3D Effects */}
      <style>{`
        @keyframes quizCardAnim {
          0% { transform: translateY(0px) rotateY(0deg) rotateX(10deg); }
          50% { transform: translateY(-20px) rotateY(180deg) rotateX(-10deg); }
          100% { transform: translateY(0px) rotateY(360deg) rotateX(10deg); }
        }
        @keyframes shadowAnim {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.6); opacity: 0.3; filter: blur(6px); }
        }
      `}</style>
    </Container>
  );
};

export default React.memo(Loading);