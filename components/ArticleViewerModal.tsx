
import React from 'react';

interface ArticleViewerModalProps {
    title: string;
    content: string;
    onClose: () => void;
}

export const ArticleViewerModal: React.FC<ArticleViewerModalProps> = ({ title, content, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fadeInUp" 
            aria-labelledby="article-modal-title" 
            role="dialog" 
            aria-modal="true"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <header className="p-4 border-b flex justify-between items-center flex-shrink-0">
                    <h2 id="article-modal-title" className="text-xl font-bold text-slate-900 truncate pr-4">
                        {title}
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full text-slate-400 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                        aria-label="Close article viewer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                <div className="flex-grow overflow-y-auto bg-slate-50">
                    <article 
                        className="prose prose-slate max-w-none p-6 sm:p-8"
                        dangerouslySetInnerHTML={{ __html: content }} 
                    />
                </div>
                 <footer className="p-4 border-t flex-shrink-0 flex justify-end bg-white rounded-b-xl">
                     <button 
                        onClick={onClose} 
                        className="px-6 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                    >
                        Close
                    </button>
                </footer>
            </div>
        </div>
    );
};
