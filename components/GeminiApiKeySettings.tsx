
import React, { useState } from 'react';
import type { ToastType } from '../types';

interface GeminiApiKeySettingsProps {
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  showToast: (message: string, type?: ToastType) => void;
  isQueuePaused: boolean;
}

export const GeminiApiKeySettings: React.FC<GeminiApiKeySettingsProps> = ({ geminiApiKey, setGeminiApiKey, showToast, isQueuePaused }) => {
  const [key, setKey] = useState(geminiApiKey);
  const [isRevealed, setIsRevealed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) {
      showToast('API Key cannot be empty.', 'error');
      return;
    }
    setGeminiApiKey(key);
    showToast('Gemini API Key saved successfully!');
    if (isQueuePaused) {
      showToast('API key updated. You can now resume the generation queue.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Gemini API Key</h2>
            <p className="text-slate-500 mt-1">
                Enter your Google AI Gemini API key to enable recipe generation.
            </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="gemini-api-key" className="block text-sm font-medium text-slate-700">Your API Key</label>
            <div className="mt-1 relative rounded-lg shadow-sm">
                <input
                  type={isRevealed ? 'text' : 'password'}
                  id="gemini-api-key"
                  value={key}
                  onChange={e => setKey(e.target.value)}
                  placeholder="Enter your Gemini API Key"
                  className="block w-full px-3 py-2 pr-10 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm"
                />
                 <button 
                    type="button" 
                    onClick={() => setIsRevealed(!isRevealed)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    aria-label={isRevealed ? "Hide API key" : "Show API key"}
                 >
                    {isRevealed 
                        ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                        : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074L3.707 2.293zM10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /><path d="M2 10s3.939 7 8 7a9.958 9.958 0 004.512-1.074l-1.473-1.473a3.997 3.997 0 01-5.204-5.204L2 10z" /></svg>
                    }
                 </button>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              You can get your free key from the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="font-medium text-teal-600 hover:underline">Google AI Studio</a>.
            </p>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors">
              Save Key
            </button>
          </div>
        </form>
    </div>
  );
};
