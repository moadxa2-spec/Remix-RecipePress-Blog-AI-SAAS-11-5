import React, { useState, useEffect } from 'react';
import { PinterestSettings, ToastMessage, ToastType } from '../types';
import { getPinterestBoards, createPinterestPin, PinterestBoard } from '../services/pinterestService';
import { generateImage, safeGenerate } from '../services/geminiService';
import { Spinner } from './Spinner';

interface CreatePinProps {
    showToast: (message: string | ToastMessage, type?: ToastType) => void;
    pinterestSettings: PinterestSettings;
    geminiApiKey: string;
}

export const CreatePin: React.FC<CreatePinProps> = ({ showToast, pinterestSettings, geminiApiKey }) => {
    const [boards, setBoards] = useState<PinterestBoard[]>([]);
    const [isLoadingBoards, setIsLoadingBoards] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    const [form, setForm] = useState({
        boardId: pinterestSettings.boardId || '',
        title: '',
        description: '',
        link: '',
        imagePrompt: '',
        imageUrl: ''
    });

    useEffect(() => {
        if (pinterestSettings.token) {
            setIsLoadingBoards(true);
            getPinterestBoards(pinterestSettings.token)
                .then(setBoards)
                .catch((e) => showToast({ message: 'Failed to fetch Pinterest boards: ' + e.message, type: 'error' }))
                .finally(() => setIsLoadingBoards(false));
        }
    }, [pinterestSettings.token, showToast]);

    const [generatedImageId, setGeneratedImageId] = useState<string>('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (name === 'imageUrl') {
            setGeneratedImageId(''); // Clear generated ID if user manually types URL
        }
    };

    const handleGenerateImage = async () => {
        if (!geminiApiKey) {
            showToast({ message: 'Please set your Gemini API Key in settings.', type: 'error' });
            return;
        }
        if (!form.imagePrompt.trim()) {
            showToast({ message: 'Please enter an image prompt.', type: 'error' });
            return;
        }
        setIsGeneratingImage(true);
        try {
            const res = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: form.imagePrompt, geminiApiKey })
            });
            if (!res.ok) {
                const err = await res.text();
                throw new Error(err);
            }
            const data = await res.json();
            setGeneratedImageId(data.imageId);
            setForm(prev => ({ ...prev, imageUrl: data.imageUrl }));
            showToast({ message: 'Image generated successfully!', type: 'success' });
        } catch (error) {
            showToast({ message: error instanceof Error ? error.message : 'Failed to generate image', type: 'error', persistent: true });
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handlePublish = async () => {
        if (!pinterestSettings.token) {
            showToast({ message: 'Please connect your Pinterest account in Settings first.', type: 'error' });
            return;
        }
        if (!form.boardId || !form.title || (!form.imageUrl && !generatedImageId)) {
            showToast({ message: 'Please fill in Board, Title, and generate/provide an Image URL.', type: 'error' });
            return;
        }

        setIsPublishing(true);
        try {
            // We pass the payload into createPinterestPin. 
            // If we generated the image, we pass { imageId: generatedImageId } to avoid base64 proxy WAF errors.
            // If the user provided a manual URL, we pass the URL string as usual.
            const imagePayload = generatedImageId ? { imageId: generatedImageId } : form.imageUrl;

            const response = await createPinterestPin(
                pinterestSettings.token,
                form.boardId,
                form.title,
                form.description,
                form.link,
                imagePayload as any
            );
            
            showToast({ message: `Pin published successfully! ID: ${response.id}`, type: 'success' });
            setForm({ boardId: form.boardId, title: '', description: '', link: '', imagePrompt: '', imageUrl: '' });
            setGeneratedImageId('');
        } catch (error) {
             showToast({ message: error instanceof Error ? error.message : 'Failed to publish pin', type: 'error', persistent: true });
        } finally {
            setIsPublishing(false);
        }
    };

    if (!pinterestSettings.token) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200/80 max-w-2xl mx-auto text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Connect to Pinterest</h2>
                <p className="text-slate-600 mb-6">You need to connect your Pinterest account in the Settings tab before you can create pins directly.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 sm:p-10 rounded-xl shadow-lg border border-slate-200/80 max-w-3xl mx-auto">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight border-b pb-4 mb-6">Create a Pinterest Pin</h2>
            <div className="space-y-6">
                <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Select Board <span className="text-red-500">*</span></label>
                     <select
                        name="boardId"
                        value={form.boardId}
                        onChange={handleInputChange}
                        disabled={isLoadingBoards}
                        className="w-full sm:max-w-md p-2 border border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    >
                        <option value="">-- Select a Board --</option>
                        {boards.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pin Title <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleInputChange}
                        placeholder="E.g., Delicious Vegan Chocolate Cake"
                        className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pin Description</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Tell everyone what this pin is about..."
                        className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Destination Link</label>
                    <input
                        type="url"
                        name="link"
                        value={form.link}
                        onChange={handleInputChange}
                        placeholder="https://yourblog.com/recipe-url"
                        className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    />
                </div>

                <div className="border-t pt-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Pin Image <span className="text-red-500">*</span></h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Generate with AI</label>
                                <textarea
                                    name="imagePrompt"
                                    value={form.imagePrompt}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Describe the image you want to generate..."
                                    className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 mb-2"
                                />
                                <button
                                    onClick={handleGenerateImage}
                                    disabled={isGeneratingImage || !form.imagePrompt.trim()}
                                    className="w-full flex justify-center items-center px-4 py-2 bg-slate-800 text-white font-medium rounded-md hover:bg-slate-700 transition disabled:opacity-50"
                                >
                                    {isGeneratingImage ? <><Spinner size="sm" /> Generating...</> : 'Generate Image'}
                                </button>
                            </div>
                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-slate-300"></div>
                                <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">Or Provide URL</span>
                                <div className="flex-grow border-t border-slate-300"></div>
                            </div>
                            <div>
                                 <input
                                    type="url"
                                    name="imageUrl"
                                    value={form.imageUrl}
                                    onChange={handleInputChange}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                        </div>
                        <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center h-64 md:h-auto min-h-[250px]">
                            {form.imageUrl ? (
                                <img src={form.imageUrl} alt="Pin Preview" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-slate-400 text-sm">Image Preview</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t pt-6 flex justify-end">
                    <button
                        onClick={handlePublish}
                        disabled={isPublishing || !form.boardId || !form.title || !form.imageUrl}
                        className="flex items-center px-6 py-3 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition disabled:opacity-50"
                    >
                        {isPublishing ? <><Spinner size="sm" color="white" className="mr-2" /> Publishing...</> : 'Publish to Pinterest'}
                    </button>
                </div>
            </div>
        </div>
    );
};
