import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = ({ errorCode = "404", title = "Oops! Page Not Found", fullScreen = true }) => {
  
  
  const containerClasses = fullScreen 
    ? "min-h-screen w-full bg-slate-50 dark:bg-[#0f172a] flex flex-col items-center justify-center px-4 overflow-hidden relative z-50"
    : "w-full py-12 bg-slate-50 dark:bg-[#0f172a] flex flex-col items-center justify-center px-4 overflow-hidden relative";

  return (
    <div className={containerClasses} role="alert" aria-live="assertive">
      
      {/* Background Decorative Large Floating Question Marks */}
      <div className="absolute top-10 left-10 text-gray-200/60 dark:text-slate-800/30 text-8xl sm:text-9xl font-black select-none pointer-events-none animate-bounce">
        ?
      </div>
      <div className="absolute bottom-10 right-10 text-gray-200/60 dark:text-slate-800/30 text-8xl sm:text-9xl font-black select-none pointer-events-none animate-bounce [animation-delay:1s]">
        ?
      </div>

      <div className="text-center max-w-lg w-full z-10 space-y-6 sm:space-y-8">
        
        {/* Giant Bold Text (बड़े-बड़े अक्षर) */}
        <div className="relative inline-block select-none">
          <h1 className="text-[120px] sm:text-[180px] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 leading-none drop-shadow-2xl animate-pulse">
            {errorCode}
          </h1>
          {/* Wrong Answer Floating Badge */}
          <div className="absolute -top-2 -right-6 bg-red-500 text-white text-xs sm:text-sm font-bold px-3 py-1 rounded-full shadow-lg rotate-12 animate-bounce">
            Wrong Answer!
          </div>
        </div>

        {/* Message Headings */}
        <div className="space-y-3 px-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white uppercase tracking-wide">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
            यह रास्ता हमारे क्वेश्चन बैंक में नहीं है। लगता है आप क्विज़ ज़ोन से बाहर भटक गए हैं!
          </p>
        </div>

        <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-5 border border-gray-200 dark:border-slate-700 shadow-md max-w-sm mx-auto transform hover:scale-[1.02] transition-transform duration-300">
          <div className="text-left space-y-3">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Quick Quiz Riddle:
            </span>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Where do you go when you are totally lost?
            </p>
            <div className="space-y-2 pt-1">
              <div className="p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-medium text-gray-400 select-none">
                A) Stay here forever
              </div>
              <Link 
                to="/" 
                className="block p-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                B) Go Back to Home Page (Correct Answer ✔)
              </Link>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base rounded-full shadow-lg shadow-indigo-500/20 transform active:scale-95 transition-all uppercase tracking-wider"
          >
            🏠 Back To Safety
          </Link>
        </div>

      </div>
    </div>
  );
};

export default React.memo(NotFound);