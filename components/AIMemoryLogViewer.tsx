

import React from 'react';
import type { AIMemoryLogEntry, ToastType } from '../types';
import { Icons } from '../constants';

interface AIMemoryLogViewerProps {
    memoryLog: AIMemoryLogEntry[];
    onClear: () => void;
    showToast: (message: string, type?: ToastType) => void;
}

const MemoryLogItem: React.FC<{ entry: AIMemoryLogEntry }> = ({ entry }) => {
    return (
        <div className="border border-slate-200 rounded-lg p-4 bg-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 flex-shrink-0">{entry.agent} Agent</span>
                    <span className="text-sm font-medium text-slate-800 truncate" title={entry.primaryKeyword}>
                        Context: "{entry.primaryKeyword}"
                    </span>
                </div>
                <span className="text-xs text-slate-500 flex-shrink-0 self-end sm:self-auto">{new Date(entry.timestamp).toLocaleString()}</span>
            </div>
            <div className="mt-3">
                <p className="mt-1 p-3 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700">
                    {entry.reasoning}
                </p>
            </div>
        </div>
    );
};

export const AIMemoryLogViewer: React.FC<AIMemoryLogViewerProps> = ({ memoryLog, onClear, showToast }) => {

    const handleClearLogs = () => {
        if (window.confirm('Are you sure you want to clear the AI\'s memory? This will erase all learned mistakes and cannot be undone.')) {
            onClear();
            showToast('AI Memory log cleared successfully.', 'success');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">AI Memory Log</h2>
                <p className="text-slate-500 mt-1">
                    This log shows past mistakes identified by the Checker Agent. This information is fed back to the agents to help them improve over time.
                </p>
            </div>

            <div className="flex justify-end">
                <button 
                    onClick={handleClearLogs}
                    disabled={memoryLog.length === 0}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                    {React.cloneElement(Icons.trash, {className: "h-4 w-4"})}
                    <span>Clear Memory</span>
                </button>
            </div>
            
            <div className="space-y-4">
                {memoryLog.length === 0 ? (
                    <div className="text-center py-16 text-slate-500 border-2 border-dashed rounded-lg">
                        <div className="inline-block p-4 bg-slate-100 rounded-full">{React.cloneElement(Icons.beaker, {className: "h-8 w-8 text-slate-400"})}</div>
                        <h3 className="mt-4 text-lg font-semibold text-slate-800">The AI's memory is clear.</h3>
                        <p className="mt-1 text-sm">No mistakes have been logged yet.</p>
                    </div>
                ) : (
                    memoryLog.map(log => <MemoryLogItem key={log.id} entry={log} />)
                )}
            </div>
        </div>
    );
};
