
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Spinner } from './Spinner';
import { PostDetailsRow } from './PostDetailsRow';
import { RegenerateOptionsModal } from './RegenerateOptionsModal';
import { Icons } from '../constants';
import type { WordPressSite, WordPressPost, ToastType, ToastMessage, PostHistoryItem, RecipeData } from '../types';

const POSTS_PER_PAGE = 50;

// New Private Modal Component for Image Handling Confirmation
const ImageUpdateConfirmationModal: React.FC<{
    onClose: () => void;
    onConfirm: (imageStrategy: 'keep' | 'regenerate') => void;
}> = ({ onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-start">
                    <h2 id="modal-title" className="text-xl font-bold text-slate-900 mb-4">Image Handling for Regeneration</h2>
                    <button onClick={onClose} className="-mt-2 -mr-2 p-2 rounded-full text-slate-400 hover:bg-slate-100">&times;</button>
                </div>
                <p className="text-slate-600 mb-6">You are about to regenerate the article and recipe card. How should existing images be handled?</p>
                
                <div className="space-y-4">
                     <button
                        onClick={() => onConfirm('keep')}
                        className="w-full text-left p-4 border border-slate-300 rounded-md hover:bg-teal-50 hover:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <h3 className="font-semibold text-slate-800">Update Text Only (Keep Images)</h3>
                        <p className="text-sm text-slate-500 mt-1">Regenerate the article text and recipe card data. The featured image and any images inside the article will remain unchanged.</p>
                    </button>
                     <button
                        onClick={() => onConfirm('regenerate')}
                        className="w-full text-left p-4 border border-slate-300 rounded-md hover:bg-teal-50 hover:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <h3 className="font-semibold text-slate-800">Regenerate Everything (Including Images)</h3>
                        <p className="text-sm text-slate-500 mt-1">Create a completely new article from scratch, including a new featured image. All existing images in the post will be removed.</p>
                    </button>
                </div>

                <div className="flex justify-end pt-6 mt-6 border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

// New Component: Bulk Selection Dropdown
const BulkSelectDropdown: React.FC<{
    onSelect: (count: number | 'all') => void;
    totalCount: number;
}> = ({ onSelect, totalCount }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectionOptions = [20, 100, 200, 300, 400, 500, 1000];
    const availableOptions = selectionOptions.filter(opt => opt < totalCount);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Don't render if there are not enough posts to warrant bulk selection
    if (totalCount < selectionOptions[0]) {
        return null;
    }

    const handleSelect = (count: number | 'all') => {
        onSelect(count);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="p-1 text-slate-400 hover:text-slate-700"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
            {isOpen && (
                <div className="origin-top-left absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        {availableOptions.map(opt => (
                            <a
                                href="#"
                                key={opt}
                                onClick={(e) => { e.preventDefault(); handleSelect(opt); }}
                                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                role="menuitem"
                            >
                                Select first {opt}
                            </a>
                        ))}
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); handleSelect('all'); }}
                            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            role="menuitem"
                        >
                            Select all ({totalCount})
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};


const FilterSelect: React.FC<{ id: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; name: string; options: Array<{ value: string; label: string }>; }> = ({ id, value, onChange, name, options }) => (
    <div className="relative">
        <select id={id} name={name} value={value} onChange={onChange} className="appearance-none block w-full pl-3 pr-8 py-1.5 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm">
            {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700"><svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div>
    </div>
);

const Pagination: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void; }> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-between mt-4">
             <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            <span className="text-sm text-slate-700">Page {currentPage} of {totalPages}</span>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
        </div>
    );
};

const PostStatusBadge: React.FC<{ status?: string }> = ({ status }) => {
    if (!status) return null;
    const isDraft = status === 'draft';
    const baseClasses = "px-2 py-0.5 text-xs font-medium rounded-full inline-block capitalize";
    const statusClasses = isDraft ? "bg-slate-200 text-slate-800" : "bg-green-100 text-green-800";
    return <span className={`${baseClasses} ${statusClasses}`}>{status}</span>;
}

const RecipeContentStatus: React.FC<{ post: WordPressPost }> = ({ post }) => {
    if (!post.has_recipe) return <span className="text-slate-500">N/A</span>;
    const { has_ingredients, has_instructions } = post.recipe_details;
    if (has_ingredients && has_instructions) return <span className="text-green-700 font-medium">Complete</span>;
    return <span className="text-yellow-700 font-medium">Incomplete</span>;
};

const tableHeaders = [
    { key: 'select', label: '' },
    { key: 'rank', label: '#' },
    { key: 'image', label: 'Image' },
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status' },
    { key: 'card', label: 'Recipe Card' },
    { key: 'content', label: 'Content' },
    { key: 'actions', label: 'Actions' },
    { key: 'details', label: 'Details' },
];

interface UpdatePostProps {
  sites: WordPressSite[];
  selectedSiteId: string;
  wpPosts: WordPressPost[];
  setSelectedSiteId: (id: string) => void;
  showToast: (config: string | ToastMessage, type?: ToastType) => void;
  setView: (view: any, tab?: any) => void;
  addItemsToQueue: (items: PostHistoryItem[]) => void;
  handleRegenerate: (targetPost: WordPressPost, generationType: 'full' | 'intro', imageStrategy?: 'keep' | 'regenerate') => void;
  refreshPostsTrigger: number;
  isFetchingPosts: boolean;
}

const decodeHtml = (html: string): string => {
    if (typeof document !== 'undefined') {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }
    return html;
};

export const UpdatePost: React.FC<UpdatePostProps> = ({ sites, selectedSiteId, wpPosts, setSelectedSiteId, showToast, setView, addItemsToQueue, handleRegenerate, refreshPostsTrigger, isFetchingPosts }) => {
  const [regenerateTarget, setRegenerateTarget] = useState<WordPressPost | null>(null);
  const [modalPosition, setModalPosition] = useState<{ top: number, right: number } | null>(null);
  const [postForImageConfirmation, setPostForImageConfirmation] = useState<WordPressPost | null>(null);
  const [showBulkImageConfirmation, setShowBulkImageConfirmation] = useState(false);
  const [filters, setFilters] = useState({ id: '', title: '', status: 'all', card: 'all', content: 'all', action: 'all', image: 'all' });
  const [selectedPostIds, setSelectedPostIds] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  const imageFilterOptions = [ { value: 'all', label: 'All' }, { value: 'yes', label: 'Has Image' }, { value: 'no', label: 'No Image' } ];
  const cardFilterOptions = [ { value: 'all', label: 'All' }, { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' } ];
  const contentFilterOptions = [ { value: 'all', label: 'All' }, { value: 'complete', label: 'Complete' }, { value: 'incomplete', label: 'Incomplete' }, { value: 'na', label: 'N/A' } ];
  const postStatusFilterOptions = [ { value: 'all', label: 'All' }, { value: 'publish', label: 'Published' }, { value: 'draft', label: 'Draft' } ];
  const actionFilterOptions = [ { value: 'all', label: 'All' }, { value: 'generate', label: 'Generate' }, { value: 'regenerate', label: 'Regenerate' } ];

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFilters(prev => ({...prev, [e.target.name]: e.target.value }));

  const normalizedPosts = useMemo(() => wpPosts.map(post => ({
      ...post,
      title: decodeHtml(post.title),
      recipe_details: post.recipe_details || { has_card: false, has_ingredients: false, has_instructions: false },
      has_recipe: typeof post.has_recipe === 'boolean' ? post.has_recipe : post.recipe_details?.has_card
  })), [wpPosts]);
  
  const filteredPosts = useMemo(() => normalizedPosts.filter(post => {
      if (filters.id && !String(post.id).includes(filters.id)) return false;
      if (filters.title && !post.title.toLowerCase().includes(filters.title.toLowerCase())) return false;
      if (filters.status !== 'all' && post.post_status !== filters.status) return false;
      if (filters.image !== 'all' && (filters.image === 'yes' ? !post.featured_image_url : post.featured_image_url)) return false;
      if (filters.card !== 'all' && (filters.card === 'yes' ? !post.has_recipe : post.has_recipe)) return false;
      if (filters.content === 'complete' && (!post.recipe_details.has_ingredients || !post.recipe_details.has_instructions)) return false;
      if (filters.content === 'incomplete' && (!post.has_recipe || (post.recipe_details.has_ingredients && post.recipe_details.has_instructions))) return false;
      if (filters.content === 'na' && post.has_recipe) return false;
      if (filters.action !== 'all' && (post.has_recipe ? 'regenerate' : 'generate') !== filters.action) return false;
      return true;
    }), [normalizedPosts, filters]);
  
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = useMemo(() => filteredPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE), [filteredPosts, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [filters]);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
        const pagePostIds = paginatedPosts.map(p => p.id);
        if (pagePostIds.length === 0) {
            selectAllCheckboxRef.current.checked = false;
            selectAllCheckboxRef.current.indeterminate = false;
            return;
        }
        const numSelectedOnPage = pagePostIds.filter(id => selectedPostIds.has(id)).length;
        const numOnPage = pagePostIds.length;
        
        selectAllCheckboxRef.current.checked = numSelectedOnPage === numOnPage;
        selectAllCheckboxRef.current.indeterminate = numSelectedOnPage > 0 && numSelectedOnPage < numOnPage;
    }
  }, [selectedPostIds, paginatedPosts]);
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pagePostIds = new Set(paginatedPosts.map(p => p.id));
    if (e.target.checked) {
        setSelectedPostIds(prev => new Set([...prev, ...pagePostIds]));
    } else {
        setSelectedPostIds(prev => {
            const newSet = new Set(prev);
            pagePostIds.forEach(id => newSet.delete(id));
            return newSet;
        });
    }
  };
  const handleSelectRow = (postId: number) => setSelectedPostIds(prev => { const newSet = new Set(prev); newSet.has(postId) ? newSet.delete(postId) : newSet.add(postId); return newSet; });
  const handleToggleExpand = (postId: number) => setExpandedPostId(prev => (prev === postId ? null : postId));
  
  const handleRegenerateClick = (post: WordPressPost, event: React.MouseEvent) => {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    setModalPosition({
      top: rect.top + window.scrollY,
      right: window.innerWidth - rect.right - window.scrollX,
    });
    setRegenerateTarget(post);
  };

  const handleConfirmImageStrategy = (imageStrategy: 'keep' | 'regenerate') => {
    if (postForImageConfirmation) {
        handleRegenerate(postForImageConfirmation, 'full', imageStrategy);
        setPostForImageConfirmation(null);
    }
  };

  const handleBulkRegenerate = (generationType: 'full' | 'intro', imageStrategy: 'keep' | 'regenerate') => {
    if (selectedPostIds.size === 0) {
        showToast('No posts selected for bulk action.', 'error');
        return;
    }
    const site = sites.find(s => s.id === selectedSiteId);
    if (!site) return;

    const postsToUpdate = wpPosts.filter(p => selectedPostIds.has(p.id));

    const placeholderRecipeData: RecipeData = { name: '...', description: '...', ingredients: [], instructions: [], keywords: [], prep_time: '', cook_time: '', total_time: '', yield: '', cuisine: '', category: '' };

    const queueItems: PostHistoryItem[] = postsToUpdate.map(post => ({
        id: crypto.randomUUID(),
        siteId: site.id,
        siteName: site.name,
        targetPostId: post.id,
        targetPostTitle: post.title,
        status: 'queued',
        publishedAt: new Date().toISOString(),
        post_title: `Queued: ${post.title}`,
        post_content: 'Waiting in queue...',
        recipe_data: placeholderRecipeData,
        generationType,
        imageStrategy,
        intendedStatus: post.post_status === 'draft' ? 'draft' : 'publish',
    }));

    addItemsToQueue(queueItems);
    showToast(`${queueItems.length} posts added to the queue. Check the History tab for progress.`, 'success');
    setView('history');
    setSelectedPostIds(new Set());
  };
  
  const handleBulkSelect = (count: number | 'all') => {
    const numToSelect = count === 'all' 
        ? filteredPosts.length 
        : Math.min(count, filteredPosts.length);
    
    const newSelectedIds = new Set(filteredPosts.slice(0, numToSelect).map(p => p.id));
    setSelectedPostIds(newSelectedIds);
  };

  return (
    <>
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200">
          <div className="mb-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Update Existing Posts</h2>
                    <p className="text-slate-500 mt-2">Add or regenerate recipes for your existing WordPress content.</p>
                </div>
                {sites.length > 0 ? (
                    <select value={selectedSiteId} onChange={e => setSelectedSiteId(e.target.value)} className="w-full sm:w-64 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 sm:text-sm">
                        {sites.map(site => <option key={site.id} value={site.id}>{site.name}</option>)}
                    </select>
                ) : ( <button onClick={() => setView('settings', 'sites')} className="text-sm text-teal-600 font-semibold hover:underline">Add a site to get started</button> )}
              </div>
          </div>
          
          <div className="mt-6">
              {isFetchingPosts ? <div className="flex justify-center items-center py-12"><Spinner /></div> : (
                  <div>
                    {/* Bulk Actions Menu */}
                    <div className="mb-4">
                        {selectedPostIds.size > 0 && (
                            <div className="p-3 bg-teal-50 border border-teal-200 rounded-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeInUp">
                            <span className="text-sm font-semibold text-teal-800">{selectedPostIds.size} post(s) selected</span>
                            <div className="flex items-center gap-2">
                                <button
                                onClick={() => handleBulkRegenerate('intro', 'regenerate')}
                                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50"
                                >
                                Regenerate Recipe Only
                                </button>
                                <button
                                onClick={() => setShowBulkImageConfirmation(true)}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700 disabled:opacity-50"
                                >
                                Regenerate Article & Recipe
                                </button>
                            </div>
                            </div>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="p-2 border-t border-x border-slate-200 rounded-t-md bg-slate-50 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-8 gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <label htmlFor="select-all-checkbox" className="flex items-center gap-1.5 font-medium text-sm text-slate-600">
                          <input id="select-all-checkbox" ref={selectAllCheckboxRef} type="checkbox" onChange={handleSelectAll} className="h-4 w-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500" />
                          <span>Page</span>
                        </label>
                        <BulkSelectDropdown onSelect={handleBulkSelect} totalCount={filteredPosts.length} />
                      </div>
                      <div><input id="filter-id" type="text" name="id" value={filters.id} onChange={handleFilterChange} placeholder="ID..." className="block w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 sm:text-sm" /></div>
                      <div className="col-span-2 sm:col-span-1 lg:col-span-2"><input id="filter-title" type="text" name="title" value={filters.title} onChange={handleFilterChange} placeholder="Title..." className="block w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 sm:text-sm" /></div>
                      <div><FilterSelect id="filter-status" name="status" value={filters.status} onChange={handleFilterChange} options={postStatusFilterOptions} /></div>
                      <div><FilterSelect id="filter-card" name="card" value={filters.card} onChange={handleFilterChange} options={cardFilterOptions} /></div>
                      <div><FilterSelect id="filter-content" name="content" value={filters.content} onChange={handleFilterChange} options={contentFilterOptions} /></div>
                      <div><FilterSelect id="filter-action" name="action" value={filters.action} onChange={handleFilterChange} options={actionFilterOptions} /></div>
                    </div>
                    {/* Post List */}
                    <div className="border border-slate-200 rounded-b-md overflow-x-auto">
                        {/* Desktop Header */}
                        <div className="hidden xl:grid items-center gap-x-4 px-2 py-2 border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wider xl:grid-cols-[40px_40px_70px_70px_1fr_100px_100px_100px_120px_60px]">
                           <div className="flex items-center"></div>
                           <div className="text-center">#</div>
                           <div>Image</div>
                           <div>ID</div>
                           <div>Title</div>
                           <div className="text-center">Status</div>
                           <div className="text-center">Recipe Card</div>
                           <div className="text-center">Content</div>
                           <div className="text-right">Actions</div>
                           <div className="text-center">Details</div>
                        </div>

                        {paginatedPosts.map((post, index) => (
                            <React.Fragment key={post.id}>
                                {/* Mobile Card View */}
                                <div className="p-4 block xl:hidden border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                      <input type="checkbox" checked={selectedPostIds.has(post.id)} onChange={() => handleSelectRow(post.id)} className="mt-1 h-4 w-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500" />
                                      <div className="flex-shrink-0 h-16 w-16 bg-slate-100 rounded-md flex items-center justify-center">{post.featured_image_url ? <img src={post.featured_image_url} alt={post.title} className="h-full w-full object-cover rounded-md" /> : <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}</div>
                                      <div>
                                        <p className="text-sm font-medium text-slate-800 truncate" title={post.title}>{post.title}</p>
                                        <p className="text-xs text-slate-500 mt-1">#{(currentPage - 1) * POSTS_PER_PAGE + index + 1} &bull; ID: {post.id}</p>
                                      </div>
                                    </div>
                                    <button onClick={() => handleToggleExpand(post.id)} className="p-2 -mt-1 -mr-2 text-slate-400 hover:text-teal-600 rounded-full"><svg className={`h-5 w-5 transition-transform ${expandedPostId === post.id ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
                                  </div>
                                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <div className="text-slate-500">Status: <PostStatusBadge status={post.post_status} /></div>
                                    <div className="text-slate-500">Recipe Card: <span className="font-medium text-slate-800">{post.has_recipe ? 'Yes' : 'No'}</span></div>
                                    <div className="text-slate-500 col-span-2">Content: <RecipeContentStatus post={post} /></div>
                                  </div>
                                  <div className="mt-4 flex justify-end">
                                     <button onClick={(e) => post.has_recipe ? handleRegenerateClick(post, e) : handleRegenerate(post, 'intro') } className="inline-flex items-center justify-center px-4 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400">
                                          {post.has_recipe ? 'Regenerate' : 'Generate'}
                                      </button>
                                  </div>
                                </div>
                                
                                {/* Desktop Table View */}
                                <div className="hidden xl:grid items-center gap-x-4 px-2 py-3 border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors xl:grid-cols-[40px_40px_70px_70px_1fr_100px_100px_100px_120px_60px]">
                                    <div className="flex justify-center"><input type="checkbox" checked={selectedPostIds.has(post.id)} onChange={() => handleSelectRow(post.id)} className="h-4 w-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500" /></div>
                                    <div className="text-sm text-slate-500 text-center">{(currentPage - 1) * POSTS_PER_PAGE + index + 1}</div>
                                    <div className="flex-shrink-0 h-12 w-full bg-slate-100 rounded-md flex items-center justify-center">{post.featured_image_url ? <img src={post.featured_image_url} alt={post.title} className="h-full w-full object-cover rounded-md" /> : <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}</div>
                                    <div className="whitespace-nowrap text-sm text-slate-500">{post.id}</div>
                                    <div className="text-sm font-medium text-slate-800 truncate min-w-0" title={post.title}>{post.title}</div>
                                    <div className="text-sm text-center"><PostStatusBadge status={post.post_status} /></div>
                                    <div className="text-sm text-center">{post.has_recipe ? 'Yes' : 'No'}</div>
                                    <div className="text-sm text-center"><RecipeContentStatus post={post} /></div>
                                    <div className="text-right">
                                        <button onClick={(e) => post.has_recipe ? handleRegenerateClick(post, e) : handleRegenerate(post, 'intro') } className="inline-flex items-center justify-center px-4 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400">
                                            {post.has_recipe ? 'Regenerate' : 'Generate'}
                                        </button>
                                    </div>
                                    <div className="text-center"><button onClick={() => handleToggleExpand(post.id)} className="p-2 text-slate-400 hover:text-teal-600 rounded-full"><svg className={`h-5 w-5 transition-transform ${expandedPostId === post.id ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button></div>
                                </div>
                                {expandedPostId === post.id && <PostDetailsRow post={post} site={sites.find(s => s.id === selectedSiteId)} showToast={showToast} />}
                            </React.Fragment>
                        ))}
                        {filteredPosts.length === 0 && (
                             <div className="text-center py-16">
                                <div className="inline-block text-slate-400">
                                    {Icons.documentSearch}
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-slate-800">No Posts Found</h3>
                                <p className="mt-1 text-sm text-slate-500">No posts match your current filters. Try adjusting your search.</p>
                            </div>
                        )}
                    </div>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                  </div>
              )}
          </div>
      </div>
      {regenerateTarget && modalPosition && (
        <RegenerateOptionsModal
            position={modalPosition}
            onClose={() => {
                setRegenerateTarget(null);
                setModalPosition(null);
            }} 
            onRegenerateArticle={() => {
                setPostForImageConfirmation(regenerateTarget);
                setRegenerateTarget(null);
                setModalPosition(null);
            }} 
            onRegenerateRecipe={() => {
                handleRegenerate(regenerateTarget, 'intro');
                setRegenerateTarget(null);
                setModalPosition(null);
            }} 
        />
      )}
      {postForImageConfirmation && (
        <ImageUpdateConfirmationModal
            onClose={() => setPostForImageConfirmation(null)}
            onConfirm={handleConfirmImageStrategy}
        />
      )}
       {showBulkImageConfirmation && (
        <ImageUpdateConfirmationModal
            onClose={() => setShowBulkImageConfirmation(false)}
            onConfirm={(strategy) => {
                handleBulkRegenerate('full', strategy);
                setShowBulkImageConfirmation(false);
            }}
        />
      )}
    </>
  );
};
