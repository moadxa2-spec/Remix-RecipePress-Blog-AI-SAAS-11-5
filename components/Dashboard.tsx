

import React, { useState, useEffect, useMemo } from 'react';
import { generateImage, handleGeneration, safeGenerate } from '../services/geminiService';
import { getPosts, getPostContent, importRecipe } from '../services/wordpressService';
import { Spinner } from './Spinner';
import { RecipeEditor } from './RecipeEditor';
import { CreatePost } from './CreatePost';
import { UpdatePost } from './UpdatePost';
import { Icons } from '../constants';
import type { GeneratedPost, WordPressSite, PostHistoryItem, ToastType, View, ToastMessage, SettingsTab, WordPressPost, PublishStatus, ArticleAgentSettings, ImageConfiguration, AdminSettings, RecipeData, PinterestSettings } from '../types';
import { CreatePin } from './CreatePin';

interface DashboardProps {
  sites: WordPressSite[];
  geminiApiKey: string;
  addItemsToQueue: (items: PostHistoryItem[]) => void;
  updatePostInHistory: (postId: string, updates: Partial<PostHistoryItem>) => void;
  showToast: (config: string | ToastMessage, type?: ToastType) => void;
  setView: (view: View, tab?: SettingsTab) => void;
  articleAgentSettings: ArticleAgentSettings;
  adminSettings: AdminSettings;
  refreshPostsTrigger: number;
  setRefreshPostsTrigger: React.Dispatch<React.SetStateAction<number>>;
  pinterestSettings: PinterestSettings;
}

const EditorModal: React.FC<{ 
    post: GeneratedPost; 
    targetPost: WordPressPost | null; 
    onSave: (postToSave: GeneratedPost, maybeTargetPost: WordPressPost | null, status: 'publish' | 'draft' | 'schedule', scheduledAt?: string | null) => void; 
    onClose: () => void; 
    isSaving: boolean; 
    onRegenerateImage: () => Promise<void>;
    isRegeneratingImage: boolean;
}> = ({ post, targetPost, onSave, onClose, isSaving, onRegenerateImage, isRegeneratingImage }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40 p-0 sm:p-4">
        <div className="bg-slate-100 rounded-none sm:rounded-lg shadow-xl w-full h-full max-w-5xl sm:h-[95vh] flex flex-col">
            <div className="p-4 border-b bg-white sm:rounded-t-lg flex justify-between items-center"><h2 className="text-lg font-bold text-slate-900 truncate pr-2"><span className="hidden sm:inline">Editing Recipe for: </span><span className="font-normal">{targetPost?.title || "New Recipe"}</span></h2><button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>
            <div className="flex-grow overflow-y-auto"><RecipeEditor post={post} targetPost={targetPost} onSave={onSave} onCancel={onClose} isSaving={isSaving} onRegenerateImage={onRegenerateImage} isRegeneratingImage={isRegeneratingImage} /></div>
        </div>
    </div>
);

const SelectionCard: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick: () => void; }> = ({ title, description, icon, onClick }) => (
    <button
        onClick={onClick}
        className="group w-full text-center p-8 border border-slate-200/80 rounded-xl hover:border-teal-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-xl"
    >
        <div className="flex flex-col items-center gap-4">
            <div className="flex-shrink-0 text-teal-600 bg-teal-100 rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <div>
                <h3 className="font-bold text-slate-800 text-xl">{title}</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">{description}</p>
            </div>
        </div>
    </button>
);

const NEW_POST_GENERATING_ID = 0;

export const Dashboard: React.FC<DashboardProps> = ({ sites, geminiApiKey, addItemsToQueue, updatePostInHistory, showToast, setView, articleAgentSettings, adminSettings, refreshPostsTrigger, setRefreshPostsTrigger, pinterestSettings }) => {
  const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id || '');
  const [editorData, setEditorData] = useState<{ post: GeneratedPost, targetPost: WordPressPost | null, generationType: 'full' | 'intro', historyId?: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
  const [viewState, setViewState] = useState<'selection' | 'create' | 'update' | 'createPin'>('selection');
  const [wpPosts, setWpPosts] = useState<WordPressPost[]>([]);
  const [isFetchingPosts, setIsFetchingPosts] = useState(true);

  useEffect(() => {
    const selectedSiteExists = sites.some(s => s.id === selectedSiteId);
    if (sites.length > 0 && (!selectedSiteId || !selectedSiteExists)) {
      setSelectedSiteId(sites[0].id);
    } 
    else if (sites.length === 0 && selectedSiteId !== '') {
      setSelectedSiteId('');
    }
  }, [sites, selectedSiteId]);

  useEffect(() => {
    const fetchPosts = async () => {
        if (!selectedSiteId) { setWpPosts([]); return; }
        const site = sites.find(s => s.id === selectedSiteId);
        if (!site) return;
        setIsFetchingPosts(true);
        try {
            const fetchedPosts = await getPosts(site);
            setWpPosts(fetchedPosts);
        } catch (error) {
            showToast({ message: error instanceof Error ? error.message : 'Failed to fetch posts', type: 'error', persistent: true });
            setWpPosts([]);
        } finally {
            setIsFetchingPosts(false);
        }
    };
    if (selectedSiteId) {
        fetchPosts();
    } else {
        setIsFetchingPosts(false);
    }
  }, [selectedSiteId, sites, showToast, refreshPostsTrigger]);
  
  const existingPostsForLinking = useMemo(() => wpPosts.map(p => ({ title: p.title, link: p.link })), [wpPosts]);
  
  const handleSaveToPost = (postToSave: GeneratedPost, maybeTargetPost: WordPressPost | null, status: 'publish' | 'draft' | 'schedule', scheduledAt?: string | null) => {
    if (!postToSave.post_title?.trim() || !postToSave.recipe_data.name?.trim() || postToSave.recipe_data.ingredients.length === 0 || postToSave.recipe_data.instructions.length === 0) {
        showToast({ message: "Title, Recipe Name, Ingredients, and Instructions are required.", type: 'error' }); return;
    }
    const site = sites.find(s => s.id === selectedSiteId);
    if (!site) { showToast({ message: "Selected site not found!", type: 'error' }); return; }
    
    const isNewPost = !maybeTargetPost;
    const historyId = editorData?.historyId || crypto.randomUUID();
    const targetPostId = maybeTargetPost?.id ? Number(maybeTargetPost.id) : 0;
    const targetPostTitle = isNewPost ? postToSave.post_title : (maybeTargetPost?.title || 'Unknown Post');

    const item: PostHistoryItem = {
      ...postToSave,
      id: historyId,
      siteId: site.id,
      siteName: site.name,
      targetPostId: targetPostId,
      targetPostTitle: targetPostTitle,
      status: 'queued',
      publishedAt: new Date().toISOString(),
      intendedStatus: status,
      scheduledAt: scheduledAt,
      generationType: editorData?.generationType || 'full',
    };
    
    // For new posts, we were in the editor, so we need to update the existing history item.
    if(isNewPost && editorData?.historyId){
      updatePostInHistory(editorData.historyId, item);
    }
    addItemsToQueue([item]);
    
    showToast('Post added to queue. Check History for progress.', 'success');
    setEditorData(null);
    setView('history');
  };

  const handleRegenerate = (targetPost: WordPressPost, generationType: 'full' | 'intro', imageStrategy: 'keep' | 'regenerate' = 'regenerate') => {
    if (!geminiApiKey) {
      showToast({ message: 'Please set your Gemini API Key in settings.', type: 'error' });
      setView('settings', 'gemini');
      return;
    }
    const site = sites.find(s => s.id === selectedSiteId);
    if (!site) return;

    const placeholderRecipeData: RecipeData = { name: '...', description: '...', ingredients: [], instructions: [], keywords: [], prep_time: '', cook_time: '', total_time: '', yield: '', cuisine: '', category: '' };
    const queueItem: PostHistoryItem = {
        id: crypto.randomUUID(),
        siteId: site.id,
        siteName: site.name,
        targetPostId: targetPost.id,
        targetPostTitle: targetPost.title,
        status: 'queued', 
        publishedAt: new Date().toISOString(),
        post_title: `Queued: ${targetPost.title}`,
        post_content: 'Waiting in queue...',
        recipe_data: placeholderRecipeData,
        generationType,
        imageStrategy,
    };
    
    addItemsToQueue([queueItem]); 
    showToast(`'${targetPost.title}' added to the generation queue.`, 'success');
    setView('history');
  };
  
  const handleNewPostGeneration = async (generationType: 'full' | 'intro', generationTab: 'keyword' | 'text', primaryKeyword: string, recipeText: string, imageConfig: ImageConfiguration) => {
    if (!geminiApiKey) {
      showToast({ message: 'Please set your Gemini API Key in settings.', type: 'error' });
      setView('settings', 'gemini');
      return;
    }
    const site = sites.find(s => s.id === selectedSiteId);
    if(!site){
        showToast('Selected site not found!', 'error');
        return;
    }
    
    const historyId = crypto.randomUUID();
    const placeholderRecipeData: RecipeData = { name: 'AI is creating a recipe...', description: '...', ingredients: [], instructions: [], keywords: [], prep_time: '', cook_time: '', total_time: '', yield: '', cuisine: '', category: '' };
    const initialTitle = `Generating: ${generationTab === 'keyword' && primaryKeyword ? primaryKeyword : 'from text'}`;

    const queueItem: PostHistoryItem = {
        id: historyId,
        siteId: selectedSiteId,
        siteName: site.name,
        targetPostId: NEW_POST_GENERATING_ID,
        targetPostTitle: initialTitle,
        status: 'queued',
        publishedAt: new Date().toISOString(),
        post_title: initialTitle,
        post_content: 'AI is generating new content...',
        recipe_data: placeholderRecipeData,
        sourceData: { generationType, generationTab, primaryKeyword, recipeText, imageConfig },
    };

    addItemsToQueue([queueItem]);
    showToast('New post generation added to queue. Check History for progress.', 'success');
    setView('history');
  };

  const handleRegenerateImage = async () => {
    if (!geminiApiKey) {
        showToast({ message: 'Please set your Gemini API Key in settings.', type: 'error' });
        return;
    }
    if (!editorData) return;
    setIsRegeneratingImage(true);
    try {
        const recipeName = editorData.post.recipe_data.name;
        const cuisine = editorData.post.recipe_data.cuisine;
        if (!recipeName) {
            showToast({ message: 'Recipe name is missing, cannot generate image.', type: 'error' });
            return;
        }
        const imagePrompt = `Photorealistic food photography of ${recipeName}, ${cuisine || ''} style, beautifully plated, bright lighting, high detail, delicious looking.`;
        const newImageBase64 = await safeGenerate(generateImage(geminiApiKey, imagePrompt));
        setEditorData(prev => {
            if (!prev) return null;
            const newPost = { ...prev.post, recipe_data: { ...prev.post.recipe_data, image: newImageBase64 }};
            return { ...prev, post: newPost };
        });
        showToast('New image generated!', 'success');
    } catch (err) {
        showToast({ message: err instanceof Error ? err.message : 'Failed to regenerate image', type: 'error', persistent: true });
    } finally {
        setIsRegeneratingImage(false);
    }
  };
  
  const renderCurrentView = () => {
    const commonProps = { sites, selectedSiteId, showToast, setView };
    switch (viewState) {
        case 'create':
            return <div className="animate-fadeInUp"><CreatePost {...commonProps} isGenerating={false} handleGenerate={handleNewPostGeneration} /></div>;
        case 'update':
            return <div className="animate-fadeInUp"><UpdatePost {...commonProps} wpPosts={wpPosts} setSelectedSiteId={setSelectedSiteId} addItemsToQueue={addItemsToQueue} handleRegenerate={handleRegenerate} refreshPostsTrigger={refreshPostsTrigger} isFetchingPosts={isFetchingPosts} /></div>;
        case 'createPin':
            return <div className="animate-fadeInUp"><CreatePin showToast={showToast} pinterestSettings={pinterestSettings} geminiApiKey={geminiApiKey} /></div>;
        case 'selection':
        default:
            return (
                 <div className="bg-white p-6 sm:p-10 rounded-xl shadow-lg border border-slate-200/80 animate-fadeInUp max-w-4xl mx-auto">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Let's Get Cooking!</h2>
                        <p className="text-slate-500 mt-3 max-w-lg mx-auto">What are we creating today? Choose an option below to start crafting your next delicious recipe post.</p>
                    </div>
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <SelectionCard 
                            title="Create New Post"
                            description="Generate a brand new, SEO-optimized recipe post from scratch using a keyword or your own text."
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                            onClick={() => setViewState('create')}
                        />
                         <SelectionCard 
                            title="Update Existing Post"
                            description="Add a recipe card to one of your existing blog posts or regenerate content for a post that already has one."
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
                            onClick={() => setViewState('update')}
                        />
                         <SelectionCard 
                            title="Create Pinterest Pin"
                            description="Generate and publish a new Pinterest Pin directly from the app."
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>}
                            onClick={() => setViewState('createPin')}
                        />
                    </div>
                 </div>
            );
    }
  };

  return (
    <div>
        {viewState !== 'selection' && (
             <button onClick={() => setViewState('selection')} className="mb-4 text-sm font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Back to Generator Options
            </button>
        )}
        {renderCurrentView()}
        {editorData && <EditorModal post={editorData.post} targetPost={editorData.targetPost} onSave={handleSaveToPost} onClose={() => setEditorData(null)} isSaving={isSaving} onRegenerateImage={handleRegenerateImage} isRegeneratingImage={isRegeneratingImage} />}
    </div>
  );
};
