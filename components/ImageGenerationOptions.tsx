
import React, { useState, useCallback } from 'react';
import { Icons } from '../constants';
import type { ImageConfiguration, ImageGenerationOption, ToastType } from '../types';

interface ImageGenerationOptionsProps {
    value: ImageConfiguration;
    onChange: (config: ImageConfiguration) => void;
    showToast: (message: string, type?: ToastType) => void;
}

const RadioCard: React.FC<{
    id: string;
    value: ImageGenerationOption;
    currentValue: ImageGenerationOption;
    onChange: (val: ImageGenerationOption) => void;
    title: string;
    description: string;
    icon: React.ReactNode;
}> = ({ id, value, currentValue, onChange, title, description, icon }) => (
    <label htmlFor={id} className={`block p-4 border rounded-lg cursor-pointer transition-all ${currentValue === value ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500' : 'bg-white border-slate-300 hover:border-slate-400'}`}>
        <input type="radio" id={id} name="imageOption" value={value} checked={currentValue === value} onChange={() => onChange(value)} className="sr-only" />
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 text-teal-600 mt-0.5">{icon}</div>
            <div>
                <h4 className="font-semibold text-slate-800">{title}</h4>
                <p className="text-sm text-slate-500 mt-1">{description}</p>
            </div>
        </div>
    </label>
);

export const ImageGenerationOptions: React.FC<ImageGenerationOptionsProps> = ({ value, onChange, showToast }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleOptionChange = (option: ImageGenerationOption) => {
        // Clear uploaded image if switching away from an option that uses it
        if (option === 'generate') {
            setPreviewUrl(null);
            onChange({ option, uploadedImage: null });
        } else {
            onChange({ ...value, option });
        }
    };
    
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 4 * 1024 * 1024) { // 4MB limit for Gemini
            showToast('Image file size cannot exceed 4MB.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            setPreviewUrl(reader.result as string);
            onChange({ ...value, uploadedImage: { base64: base64String, mimeType: file.type } });
        };
        reader.readAsDataURL(file);
    }, [onChange, value, showToast]);

    const showUploader = value.option === 'variation' || value.option === 'upload';

    return (
        <div className="border-t border-slate-200 pt-8">
            <h3 className="text-lg font-semibold text-slate-800">Featured Image</h3>
            <p className="text-sm text-slate-500 mb-4">Choose how to create the main image for your post and recipe card.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <RadioCard id="gen-new" value="generate" currentValue={value.option} onChange={handleOptionChange} title="Generate New Image" description="The AI will create a new image based on the recipe." icon={React.cloneElement(Icons.sparkles, { className: "h-5 w-5" })} />
                <RadioCard id="gen-var" value="variation" currentValue={value.option} onChange={handleOptionChange} title="Generate from Upload" description="Upload a photo and the AI will create a unique variation." icon={React.cloneElement(Icons.upload, { className: "h-5 w-5" })} />
                <RadioCard id="gen-upload" value="upload" currentValue={value.option} onChange={handleOptionChange} title="Use Uploaded Image" description="Upload the exact image you want to use for the post." icon={Icons.photo} />
            </div>

            {showUploader && (
                <div className={`mt-4 p-4 border-2 border-dashed rounded-lg transition-all duration-300 ${previewUrl ? 'border-teal-500 bg-teal-50/60' : 'border-slate-300 hover:border-slate-400'}`}>
                    {previewUrl ? (
                        <div className="flex items-center gap-4">
                             <img src={previewUrl} alt="Preview" className="w-24 h-24 object-cover rounded-md shadow-sm" />
                             <div className="flex-grow">
                                <p className="text-sm font-medium text-slate-700">Image selected.</p>
                                <button onClick={() => { setPreviewUrl(null); onChange({ ...value, uploadedImage: null }); }} className="text-sm text-red-600 hover:underline mt-1 font-semibold">Remove Image</button>
                             </div>
                        </div>
                    ) : (
                         <div>
                             <label htmlFor="image-upload" className="block text-sm font-medium text-slate-700 mb-2">Upload an image (max 4MB)</label>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200/80 transition-colors"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
