import React, { useState } from 'react';
import type { BrandingSettings, ToastType } from '../../types';
import { Icons } from '../../constants';

interface BrandingManagerProps {
    settings: BrandingSettings;
    onSave: (settings: BrandingSettings) => void;
    showToast: (message: string, type?: ToastType) => void;
}

export const BrandingManager: React.FC<BrandingManagerProps> = ({ settings, onSave, showToast }) => {
    const [appName, setAppName] = useState(settings.appName);
    const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
    const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
    const [logoPreview, setLogoPreview] = useState<string | null>(settings.logoUrl);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 500) { // 500KB limit
                showToast('Logo file size should not exceed 500KB.', 'error');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setLogoPreview(result);
                setLogoUrl(result); 
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleRemoveLogo = () => {
        setLogoUrl(null);
        setLogoPreview(null);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!appName.trim()) {
            showToast('Application Name cannot be empty.', 'error');
            return;
        }
        onSave({ appName, logoUrl, primaryColor });
        showToast('Branding settings saved successfully!', 'success');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">Branding & Customization</h2>
            <p className="text-sm text-slate-500 mt-1 mb-6">Change the look and feel of the application.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="appName" className="block text-sm font-medium text-slate-700">Application Name</label>
                    <input
                        type="text"
                        id="appName"
                        value={appName}
                        onChange={(e) => setAppName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Application Logo</label>
                    <div className="mt-2 flex items-center gap-4">
                        <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center border">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                            ) : (
                                <span className="text-slate-400">{Icons.photo}</span>
                            )}
                        </div>
                        <div className="space-y-2">
                           <label htmlFor="logo-upload" className="cursor-pointer px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
                                Upload Logo
                           </label>
                           <input id="logo-upload" type="file" accept="image/png, image/jpeg, image/svg+xml" className="sr-only" onChange={handleLogoChange}/>
                           {logoUrl && (
                               <button type="button" onClick={handleRemoveLogo} className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100">
                                   Remove Logo
                               </button>
                           )}
                           <p className="text-xs text-slate-500">Recommended: PNG or SVG, max 500KB.</p>
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="primaryColor" className="block text-sm font-medium text-slate-700">Primary Color</label>
                    <div className="mt-1 flex items-center gap-3">
                        <input
                            type="color"
                            id="primaryColor"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="p-1 h-10 w-10 block bg-white border border-slate-300 rounded-lg cursor-pointer"
                        />
                         <input
                            type="text"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="w-32 px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 font-mono text-sm"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <button type="submit" className="inline-flex justify-center py-2 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                        Save Branding
                    </button>
                </div>
            </form>
        </div>
    );
};
