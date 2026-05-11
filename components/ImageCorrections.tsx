import React, { useMemo, useState, useEffect } from 'react';
import type { WordPressPost, WordPressSite, ToastType } from '../types';
import { getPosts } from '../services/wordpressService';
import { Icons } from '../constants';
import { Spinner } from './Spinner';

interface ImageUsage {
    imageUrl: string;
    posts: WordPressPost[];
}

interface ImageCorrectionsProps {
    sites: WordPressSite[];
    showToast: (msg: string, type?: ToastType) => void;
}

export const ImageCorrections: React.FC<ImageCorrectionsProps> = ({ sites, showToast }) => {
    const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id || '');
    const [wpPosts, setWpPosts] = useState<WordPressPost[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [selectedImage, setSelectedImage] = useState<ImageUsage | null>(null);

    useEffect(() => {
        if (!selectedSiteId && sites.length > 0) {
            setSelectedSiteId(sites[0].id);
        }
    }, [sites, selectedSiteId]);

    useEffect(() => {
        const fetchPosts = async () => {
            if (!selectedSiteId) { setWpPosts([]); return; }
            const site = sites.find(s => s.id === selectedSiteId);
            if (!site) return;
            
            setIsFetching(true);
            try {
                const fetchedPosts = await getPosts(site);
                setWpPosts(fetchedPosts);
                setSelectedImage(null);
            } catch (error) {
                showToast(error instanceof Error ? error.message : 'Failed to fetch posts', 'error');
                setWpPosts([]);
            } finally {
                setIsFetching(false);
            }
        };

        fetchPosts();
    }, [selectedSiteId, sites, showToast]);

    const imageMap = useMemo(() => {
        const map = new Map<string, WordPressPost[]>();

        wpPosts.forEach(post => {
            if (post.featured_image_url) {
                const existing = map.get(post.featured_image_url) || [];
                existing.push(post);
                map.set(post.featured_image_url, existing);
            }
        });

        return Array.from(map.entries())
            .map(([imageUrl, usedPosts]) => ({
                imageUrl,
                posts: usedPosts,
            }))
            .sort((a, b) => b.posts.length - a.posts.length);
    }, [wpPosts]);

    const getWpEditUrl = (postId: number) => {
        const site = sites.find(s => s.id === selectedSiteId);
        if (site) return `${site.url.replace(/\/$/, '')}/wp-admin/post.php?post=${postId}&action=edit`;
        return '#';
    };

    const getWpTrashUrl = (postId: number) => {
        const site = sites.find(s => s.id === selectedSiteId);
        if (site) return `${site.url.replace(/\/$/, '')}/wp-admin/post.php?post=${postId}&action=trash`;
        return '#';
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Blog Image Usage</h2>
                    <p className="text-slate-600 mt-2 font-medium">
                        Scan your live WordPress blog to see which images are assigned to posts. Click An image to see all posts using it.
                    </p>
                </div>
                {sites.length > 0 ? (
                    <select 
                        value={selectedSiteId} 
                        onChange={e => setSelectedSiteId(e.target.value)} 
                        className="w-full sm:w-64 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 sm:text-sm"
                    >
                        {sites.map(site => <option key={site.id} value={site.id}>{site.name}</option>)}
                    </select>
                ) : (
                    <div className="text-sm text-slate-500 font-semibold p-2 bg-slate-50 rounded">No sites available</div>
                )}
            </div>

            {isFetching ? (
                <div className="flex justify-center flex-col items-center py-20 animate-pulse">
                    <Spinner size="h-10 w-10 text-teal-600" />
                    <p className="text-slate-500 mt-4 font-medium">Scanning WordPress posts for images...</p>
                </div>
            ) : imageMap.length === 0 ? (
                <div className="text-center py-16 text-slate-500 border-2 border-dashed rounded-lg">
                    <h3 className="text-lg font-semibold text-slate-800">No Featured Images Found</h3>
                    <p className="mt-1 text-sm">Your posts don't seem to have featured images configured on this site.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-fadeInUp">
                    {imageMap.map((usage, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => setSelectedImage(usage)}
                            className="group relative rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 bg-slate-50 aspect-square flex items-center justify-center"
                        >
                            <img 
                                src={usage.imageUrl} 
                                alt="Cover image" 
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-[2px]">
                                <span className="bg-white/95 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                                    {React.cloneElement(Icons.code, { className: "h-3.5 w-3.5" })}
                                    Used {usage.posts.length}x
                                </span>
                            </div>
                            <div className="absolute top-2 right-2 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm drop-shadow-md">
                                {usage.posts.length}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedImage && (
                 <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeInUp backdrop-blur-sm" aria-labelledby="modal-title" role="dialog" aria-modal="true" onClick={() => setSelectedImage(null)}>
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
                            <h2 id="modal-title" className="text-xl font-bold text-slate-900">Image Usage & Corrections</h2>
                            <button onClick={() => setSelectedImage(null)} className="-mt-1 -mr-1 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">&times;</button>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-6 overflow-hidden flex-grow">
                            <div className="w-full md:w-1/3 flex-shrink-0 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center overflow-hidden h-64 md:h-auto shadow-inner p-2">
                                <img src={selectedImage.imageUrl} alt="Selected usage" className="max-w-full max-h-full object-contain rounded drop-shadow" />
                            </div>

                            <div className="w-full md:w-2/3 overflow-y-auto pr-3 space-y-4 custom-scrollbar">
                                <h3 className="font-semibold text-slate-700 bg-white z-10 text-sm uppercase tracking-wider">
                                    Found on {selectedImage.posts.length} Live Post{selectedImage.posts.length !== 1 && 's'}
                                </h3>
                                
                                <div className="space-y-3">
                                    {selectedImage.posts.map(post => (
                                        <div key={post.id} className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50/80 hover:border-slate-300 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)] bg-white group">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-slate-900 text-base leading-tight truncate" title={post.title}>{post.title}</h4>
                                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                                                        <span className="inline-flex items-center gap-1 text-slate-500 font-medium px-2 py-0.5 bg-slate-100 rounded-full">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${post.post_status === 'publish' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                                            {post.post_status}
                                                        </span>
                                                        <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700 font-semibold inline-flex items-center gap-1">
                                                            View Live <span>↗</span>
                                                        </a>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                                                    <a href={getWpEditUrl(post.id)} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center justify-center gap-1.5 px-3 py-1.5 min-w-[5rem] bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium border border-slate-200/60 shadow-sm opacity-80 group-hover:opacity-100">
                                                        {React.cloneElement(Icons.pencil, { className: "h-3.5 w-3.5" })} Edit
                                                    </a>
                                                    <a href={getWpTrashUrl(post.id)} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center justify-center gap-1.5 px-3 py-1.5 min-w-[5rem] bg-red-50 text-red-600 rounded-lg hover:bg-red-100/80 transition-colors font-medium border border-red-100/50 shadow-sm opacity-80 group-hover:opacity-100">
                                                        {React.cloneElement(Icons.trash, { className: "h-3.5 w-3.5" })} Delete
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
};
