
import React from 'react';
import type { PostHistoryItem } from '../types';
import { Icons } from '../constants';

const StatusBadge: React.FC<{ status: PostHistoryItem['status'] }> = ({ status }) => {
    const baseClasses = "px-2.5 py-1 text-xs font-semibold rounded-full inline-block capitalize";
    const statusMap = {
        published: "bg-green-100 text-green-800",
        generating: "bg-blue-100 text-blue-800 animate-pulse",
        publishing: "bg-blue-100 text-blue-800 animate-pulse",
        failed: "bg-red-100 text-red-800",
        draft: "bg-slate-200 text-slate-800",
        queued: "bg-yellow-100 text-yellow-800",
        scheduled: "bg-purple-100 text-purple-800",
    };
    const isScheduled = status === 'queued' || status === 'scheduled';
    const displayStatus = status === 'queued' ? 'waiting' : status;
    return <span className={`${baseClasses} ${statusMap[status]}`}>{displayStatus}</span>;
}

function formatRelativeTime(isoDate: string): string {
    const date = new Date(isoDate);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) {
        return "just now";
    } else if (minutes < 60) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (days === 1) {
        return "Yesterday";
    } else if (days < 7) {
        return `${days} days ago`;
    } else {
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }
}


export const PostHistory: React.FC<{ 
    posts: PostHistoryItem[], 
    onViewDetails: (item: PostHistoryItem) => void,
    isQueuePaused: boolean,
    queueLength: number,
    onResumeQueue: () => void,
}> = ({ posts, onViewDetails, isQueuePaused, queueLength, onResumeQueue }) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200/80">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">Operations History</h2>
      
      {isQueuePaused && queueLength > 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeInUp">
              <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">{React.cloneElement(Icons.exclamationCircle, {className: "h-5 w-5 text-yellow-500"})}</div>
                  <div>
                    <p className="font-semibold text-yellow-800">Queue Paused</p>
                    <p className="text-sm text-yellow-700">The generation queue is paused, likely due to an API rate limit.</p>
                  </div>
              </div>
              <button onClick={onResumeQueue} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors shadow-sm">
                  Resume Queue
              </button>
          </div>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-16 text-slate-500 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-semibold text-slate-800">No Operations Logged</h3>
            <p className="mt-1 text-sm">Generate or update a post to see its history here.</p>
        </div>
      ) : (
        <div className="flow-root">
           <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200/80">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Post Title</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Site</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">WP Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pinterest</th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200/80">
                  {posts.map(post => (
                    <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900 max-w-xs truncate" title={post.targetPostTitle}>{post.targetPostTitle}</div>
                        <div className="text-sm text-slate-500 max-w-xs truncate" title={post.recipe_data?.name}>Recipe: {post.recipe_data?.name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{post.siteName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatRelativeTime(post.publishedAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={post.status} />
                        {post.status === 'failed' && <p className="text-xs text-red-500 mt-1 w-48 truncate" title={post.error}>{post.error}</p>}
                        {post.status === 'queued' && post.error && <p className="text-xs text-yellow-600 mt-1 w-48 truncate" title={post.error}>{post.error}</p>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {post.pinterestStatus === 'posted' ? (
                            <a href={post.pinterestUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345l-.288 1.148c-.046.182-.148.223-.335.136-1.252-.581-2.036-2.407-2.036-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.015 0-1.969-.527-2.296-1.148l-.626 2.384c-.226.864-.836 1.944-1.246 2.604 1.11.316 2.292.486 3.513.486 6.627 0 11.985-5.368 11.985-11.988C24.004 5.367 18.643 0 12.017 0z"/></svg>
                                Pinned
                            </a>
                        ) : post.pinterestStatus === 'failed' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Failed</span>
                        ) : post.pinterestStatus === 'skipped' ? (
                             <span className="text-xs text-slate-400">Skipped</span>
                        ) : (
                             <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                         <button onClick={() => onViewDetails(post)} className="text-teal-600 hover:text-teal-900 font-semibold">Details</button>
                        {post.status === 'published' && post.publishedUrl && (
                          <a href={post.publishedUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-800">View Post</a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
           <div className="md:hidden space-y-4">
              {posts.map(post => (
                <div key={post.id} className="p-4 bg-white rounded-lg shadow-md border border-slate-200/80">
                   <div className="flex justify-between items-start gap-4">
                      <div className="flex-grow min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{post.targetPostTitle}</p>
                          <p className="text-sm text-slate-500 truncate">Recipe: {post.recipe_data?.name || 'N/A'}</p>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <StatusBadge status={post.status} />
                        {post.pinterestStatus === 'posted' && (
                             <a href={post.pinterestUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800">Pinned</a>
                        )}
                        {post.pinterestStatus === 'failed' && (
                             <span className="text-xs font-medium text-red-600">Pin Failed</span>
                        )}
                      </div>
                   </div>
                   <div className="mt-2 text-sm text-slate-600 space-y-1">
                      <p><span className="font-medium text-slate-500">Site:</span> {post.siteName}</p>
                      <p><span className="font-medium text-slate-500">Date:</span> {formatRelativeTime(post.publishedAt)}</p>
                      {post.status === 'failed' && <p className="text-xs text-red-500 mt-1 truncate" title={post.error}><span className="font-medium">Error:</span> {post.error}</p>}
                       {post.status === 'queued' && post.error && <p className="text-xs text-yellow-600 mt-1 truncate" title={post.error}>{post.error}</p>}
                   </div>
                    <div className="mt-3 pt-3 border-t flex justify-end items-center gap-4 text-sm font-medium">
                        <button onClick={() => onViewDetails(post)} className="text-teal-600 hover:text-teal-900 font-semibold">Details</button>
                        {post.status === 'published' && post.publishedUrl && (
                          <a href={post.publishedUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-800">View Post</a>
                        )}
                    </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};
