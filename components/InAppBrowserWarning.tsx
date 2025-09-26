import React, { useState } from 'react';

const InAppBrowserWarning: React.FC = () => {
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-400 dark:bg-amber-600 text-slate-900 dark:text-white p-3 text-center text-sm shadow-lg z-50 animate-fade-in">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
         <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="font-semibold">
                Voice features may not work in this browser. For the best experience, please open in Chrome or Safari.
            </p>
         </div>
        <button
          onClick={handleCopyLink}
          className="px-3 py-1 rounded-full bg-slate-800 bg-opacity-20 hover:bg-opacity-30 text-xs font-bold transition-colors duration-200 flex-shrink-0"
        >
          {linkCopied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
    </div>
  );
};

export default InAppBrowserWarning;
