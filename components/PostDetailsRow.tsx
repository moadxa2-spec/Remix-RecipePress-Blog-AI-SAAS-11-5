
import React, { useState } from 'react';
import type { WordPressPost, WordPressSite, ToastType } from '../types';
import { getPostContent } from '../services/wordpressService';
import { Spinner } from './Spinner';
import { ArticleViewerModal } from './ArticleViewerModal';

interface PostDetailsRowProps {
  post: WordPressPost;
  site: WordPressSite | undefined;
  showToast: (message: string, type?: ToastType) => void;
}

const DetailItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="p-3 bg-white rounded-lg border border-slate-200/80">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <div className="mt-1 text-sm font-semibold text-slate-800 break-words">{children}</div>
    </div>
);

const BooleanDisplay: React.FC<{ value: boolean }> = ({ value }) => (
    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${value ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'}`}>
        {value ? 'Yes' : 'No'}
    </span>
);

export const PostDetailsRow: React.FC<PostDetailsRowProps> = ({ post, site, showToast }) => {
    const [isLoadingContent, setIsLoadingContent] = useState(false);
    const [articleData, setArticleData] = useState<{ title: string; content: string } | null>(null);

    const handleViewContent = async () => {
        if (!site) {
            showToast('Site information is missing.', 'error');
            return;
        }
        setIsLoadingContent(true);
        try {
            const data = await getPostContent(site, post.id);
            setArticleData(data);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch post content.';
            showToast(message, 'error');
        } finally {
            setIsLoadingContent(false);
        }
    };
    
    // This component renders as a sibling to the main post row and becomes visible on expand.
    // It contains separate layouts for desktop (full-width row) and mobile (content block).
    
    const desktopView = (
        <div className="hidden xl:block col-span-full p-4 bg-slate-100/70 border-x border-b border-slate-200 animate-fadeInUp">
            <div className="grid grid-cols-5 gap-4">
                 <DetailItem label="Word Count">{post.word_count.toLocaleString()}</DetailItem>
                 <DetailItem label="Image Count">{post.image_count}</DetailItem>
                 <DetailItem label="Focus Keyword">{post.focus_keyword || 'N/A'}</DetailItem>
                 <DetailItem label="Language">{post.language}</DetailItem>
                 <DetailItem label="Meta Desc."><BooleanDisplay value={post.has_meta_description} /></DetailItem>
                 <DetailItem label="Recipe Schema"><BooleanDisplay value={post.has_recipe_schema} /></DetailItem>
                 <DetailItem label="FAQ Schema"><BooleanDisplay value={post.has_faq_schema} /></DetailItem>
                 <DetailItem label="Headlines">
                     <div className="flex gap-2 flex-wrap">
                        {Object.keys(post.headline_counts).length > 0 ? Object.entries(post.headline_counts).map(([tag, count]) => (
                            <span key={tag} className="text-xs font-mono bg-slate-200 px-1.5 py-0.5 rounded">{tag.toUpperCase()}: {count}</span>
                        )) : 'None'}
                     </div>
                 </DetailItem>
                 <div className="col-span-full sm:col-span-2 flex items-center justify-start">
                     <button 
                        onClick={handleViewContent} 
                        disabled={isLoadingContent}
                        className="px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-lg hover:bg-slate-700 disabled:bg-slate-400 flex items-center gap-2"
                     >
                        {isLoadingContent ? <Spinner size="h-4 w-4" /> : 'View Article Content'}
                     </button>
                 </div>
            </div>
        </div>
    );
    
    const mobileView = (
         <div className="xl:hidden block p-4 bg-slate-50 border-b border-slate-200 animate-fadeInUp">
            <h4 className="font-bold text-slate-800 mb-3">Post Details</h4>
            <div className="grid grid-cols-2 gap-3">
                 <DetailItem label="Word Count">{post.word_count.toLocaleString()}</DetailItem>
                 <DetailItem label="Image Count">{post.image_count}</DetailItem>
                 <DetailItem label="Focus Keyword">{post.focus_keyword || 'N/A'}</DetailItem>
                 <DetailItem label="Language">{post.language}</DetailItem>
                 <DetailItem label="Meta Desc."><BooleanDisplay value={post.has_meta_description} /></DetailItem>
                 <DetailItem label="Recipe Schema"><BooleanDisplay value={post.has_recipe_schema} /></DetailItem>
                 <DetailItem label="FAQ Schema"><BooleanDisplay value={post.has_faq_schema} /></DetailItem>
                 <DetailItem label="Headlines">
                     <div className="flex gap-1.5 flex-wrap">
                        {Object.keys(post.headline_counts).length > 0 ? Object.entries(post.headline_counts).map(([tag, count]) => (
                            <span key={tag} className="text-xs font-mono bg-slate-200 px-1.5 py-0.5 rounded">{tag.toUpperCase()}: {count}</span>
                        )) : 'None'}
                     </div>
                 </DetailItem>
                 <div className="col-span-2 mt-2">
                     <button 
                        onClick={handleViewContent} 
                        disabled={isLoadingContent}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-lg hover:bg-slate-700 disabled:bg-slate-400 flex items-center justify-center gap-2"
                     >
                        {isLoadingContent ? <Spinner size="h-4 w-4" /> : 'View Article Content'}
                     </button>
                 </div>
            </div>
         </div>
    );

    return (
        <>
            {desktopView}
            {mobileView}
            {articleData && (
                <ArticleViewerModal
                    title={articleData.title}
                    content={articleData.content}
                    onClose={() => setArticleData(null)}
                />
            )}
        </>
    );
};
