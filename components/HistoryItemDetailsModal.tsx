

import React from 'react';
import type { PostHistoryItem } from '../types';
import { Spinner } from './Spinner';

const StatusBadge: React.FC<{ status: PostHistoryItem['status'] }> = ({ status }) => {
    const baseClasses = "px-2.5 py-1 text-xs font-semibold rounded-full inline-block capitalize";
    const statusMap = {
        published: "bg-green-100 text-green-800",
        publishing: "bg-blue-100 text-blue-800 animate-pulse",
        failed: "bg-red-100 text-red-800",
        draft: "bg-slate-200 text-slate-800",
    };
    return <span className={`${baseClasses} ${statusMap[status]}`}>{status}</span>;
}

interface HistoryItemDetailsModalProps {
    item: PostHistoryItem;
    onClose: () => void;
    onRetry: (item: PostHistoryItem) => void;
}

export const HistoryItemDetailsModal: React.FC<HistoryItemDetailsModalProps> = ({ item, onClose, onRetry }) => {
    
    const handleRetry = () => {
        onRetry(item);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fadeInUp" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start">
                    <h2 id="modal-title" className="text-xl font-bold text-slate-900 mb-4">Operation Details</h2>
                    <button onClick={onClose} className="-mt-2 -mr-2 p-2 rounded-full text-slate-400 hover:bg-slate-100 transition-colors">&times;</button>
                </div>

                <div className="space-y-4 text-sm">
                    <div className="p-3 bg-slate-50 rounded-lg">
                        <h3 className="font-medium text-slate-500">Recipe Title</h3>
                        <p className="font-semibold text-slate-800 mt-0.5">{item.recipe_data?.name || 'N/A'}</p>
                    </div>
                     <div className="p-3 bg-slate-50 rounded-lg">
                        <h3 className="font-medium text-slate-500">Target Post</h3>
                        <p className="text-slate-700 mt-0.5">{item.targetPostTitle}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-3 bg-slate-50 rounded-lg">
                            <h3 className="font-medium text-slate-500">Target Site</h3>
                            <p className="text-slate-700 mt-0.5">{item.siteName}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                            <h3 className="font-medium text-slate-500">Timestamp</h3>
                            <p className="text-slate-700 mt-0.5">{new Date(item.publishedAt).toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                            <h3 className="font-medium text-slate-500">Status</h3>
                            <p className="mt-1"><StatusBadge status={item.status} /></p>
                        </div>
                    </div>

                    {item.status === 'failed' && item.error && (
                         <div>
                            <h3 className="text-sm font-medium text-red-600">Error Details</h3>
                            <pre className="mt-1 p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg whitespace-pre-wrap text-xs font-mono overflow-x-auto">
                                {item.error}
                            </pre>
                        </div>
                    )}
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 mt-6 border-t">
                    <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                        Close
                    </button>
                    {item.status === 'failed' && (
                        <button 
                            type="button" 
                            onClick={handleRetry} 
                            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
                        >
                            Retry Save
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
