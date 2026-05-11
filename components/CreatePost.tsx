
import React, { useState } from 'react';
import { Spinner } from './Spinner';
import { GenerateOptionsModal } from './GenerateOptionsModal';
import { ImageGenerationOptions } from './ImageGenerationOptions';
import { Icons } from '../constants';
import type { ImageConfiguration, ToastType, ToastMessage, View, SettingsTab } from '../types';

interface CreatePostProps {
  isGenerating: boolean;
  selectedSiteId: string;
  handleGenerate: (generationType: 'full' | 'intro', generationTab: 'keyword' | 'text', primaryKeyword: string, recipeText: string, imageConfig: ImageConfiguration) => void;
  showToast: (config: string | ToastMessage, type?: ToastType) => void;
  setView: (view: View, tab?: SettingsTab) => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ isGenerating, selectedSiteId, handleGenerate, showToast, setView }) => {
  const [generationTab, setGenerationTab] = useState<'keyword' | 'text'>('keyword');
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [recipeText, setRecipeText] = useState('');
  const [imageConfig, setImageConfig] = useState<ImageConfiguration>({ option: 'generate', uploadedImage: null });
  const [showGenerateOptions, setShowGenerateOptions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiteId) {
        showToast({
            message: 'Please add and select a site before generating.',
            type: 'error',
            action: {
                label: 'Go to Site Settings',
                onClick: () => setView('settings', 'sites')
            }
        });
        return;
    }
    if (generationTab === 'keyword' && !primaryKeyword.trim()) {
      showToast('Please provide a recipe title / primary keyword.', 'error');
      return;
    }
    if (generationTab === 'text' && !recipeText.trim()) {
      showToast('Please provide recipe text.', 'error');
      return;
    }
    setShowGenerateOptions(true);
  };

  const triggerGeneration = (generationType: 'full' | 'intro') => {
    setShowGenerateOptions(false);
    handleGenerate(generationType, generationTab, primaryKeyword, recipeText, imageConfig);
  };

  const handleClear = () => {
    setPrimaryKeyword('');
    setRecipeText('');
    setImageConfig({ option: 'generate', uploadedImage: null });
    showToast('Form cleared.', 'success');
  };
  
  return (
    <>
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200/80">
          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Generate New Post</h2>
                    <p className="text-slate-500 mt-2">Start with a keyword for a fully AI-generated post, or provide your own text as a starting point.</p>
                </div>

                <div className="border-t border-slate-200 pt-8">
                    <div className="flex border-b border-slate-200">
                      <button type="button" onClick={() => setGenerationTab('keyword')} className={`px-4 py-3 text-sm font-semibold transition-colors ${generationTab === 'keyword' ? 'border-b-2 border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>From Keyword</button>
                      <button type="button" onClick={() => setGenerationTab('text')} className={`px-4 py-3 text-sm font-semibold transition-colors ${generationTab === 'text' ? 'border-b-2 border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>From Recipe Text</button>
                    </div>
                    <div className="pt-6">
                      {generationTab === 'keyword' && (
                        <div>
                            <label htmlFor="primary-keyword" className="block text-sm font-semibold text-slate-700">Recipe Title / Primary Keyword</label>
                            <input id="primary-keyword" type="text" value={primaryKeyword} onChange={e => setPrimaryKeyword(e.target.value)} placeholder="e.g., Sun-Dried Tomato and Spinach Pasta" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm" />
                        </div>
                      )}
                      {generationTab === 'text' && (
                        <div>
                            <label htmlFor="recipe-text" className="block text-sm font-semibold text-slate-700">Your Recipe Text</label>
                            <textarea id="recipe-text" value={recipeText} onChange={e => setRecipeText(e.target.value)} rows={6} placeholder="Paste your recipe title, ingredients, and instructions here..." className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm" />
                            <p className="mt-2 text-xs text-slate-500">The AI will automatically determine the recipe title and focus keyword from your text.</p>
                        </div>
                      )}
                    </div>
                </div>

                <ImageGenerationOptions value={imageConfig} onChange={setImageConfig} showToast={showToast} />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-8 border-t border-slate-200">
                    {!selectedSiteId ? (
                        <div className="p-3 bg-red-50 text-sm text-red-800 rounded-lg flex items-center gap-3 border border-red-200">
                            <div className="flex-shrink-0">{React.cloneElement(Icons.exclamationCircle, {className: "h-5 w-5 text-red-500"})}</div>
                            <p>Please <button type="button" onClick={() => setView('settings', 'sites')} className="font-bold underline hover:text-red-900 focus:outline-none">add and select a site</button> to enable generation.</p>
                        </div>
                    ) : <div />}
                    <div className="flex gap-4">
                        <button 
                            type="button" 
                            onClick={handleClear}
                            disabled={isGenerating}
                            className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 rounded-lg shadow-sm text-base font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                            Clear
                        </button>
                        <button type="submit" disabled={isGenerating || !selectedSiteId} className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors">
                            {isGenerating ? <Spinner size="h-5 w-5" /> : 'Generate'}
                        </button>
                    </div>
                </div>
            </div>
          </form>
      </div>
      {showGenerateOptions && <GenerateOptionsModal onGenerate={triggerGeneration} onClose={() => setShowGenerateOptions(false)} />}
    </>
  );
};
