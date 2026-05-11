
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import type { ToastType } from '../types';

interface ApiSettingsProps {
    apiToken: string;
    showToast: (message: string, type?: ToastType) => void;
}

const CodeBlock: React.FC<{ code: string; onCopy: () => void; }> = ({ code, onCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code.trim());
        setCopied(true);
        onCopy();
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-slate-800 text-slate-100 rounded-md p-4 my-2 relative">
            <pre className="whitespace-pre-wrap text-sm"><code>{code.trim()}</code></pre>
            <button 
                onClick={handleCopy}
                className="absolute top-2 right-2 p-2 rounded-md bg-slate-700 hover:bg-slate-600 transition text-white">
                {copied ? Icons.check : Icons.copy}
            </button>
        </div>
    );
};


export const ApiSettings: React.FC<ApiSettingsProps> = ({ apiToken, showToast }) => {
    const [apiUrl, setApiUrl] = useState('');

    useEffect(() => {
        // Ensure this runs only on the client-side where window is available
        setApiUrl(`${window.location.origin}/api/generate`);
    }, []);

    return (
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-slate-200">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">API Website Settings</h2>
                <p className="text-slate-500 mb-8">
                    Enable the "Generate" button inside your WordPress posts list by connecting it to this application. This requires a deployed app and environment variables on your host.
                </p>

                <div className="space-y-8">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Step 1: Set Environment Variables on Hostinger</h3>
                        <p className="text-slate-600 mb-2">
                          In your Hostinger hPanel, you must set the following environment variables. The backend needs these to authenticate requests and generate recipes.
                        </p>
                        <div className="border rounded-md divide-y">
                            <div className="p-3">
                                <code className="font-mono font-bold">API_KEY</code>
                                <p className="text-sm text-slate-600 mt-1">Your Google AI Gemini API Key. The backend uses this for recipe generation.</p>
                            </div>
                            <div className="p-3">
                                 <code className="font-mono font-bold">RECIPEPRESS_APP_TOKEN</code>
                                <p className="text-sm text-slate-600 mt-1">A secret token to authenticate requests. Copy your unique token from below.</p>
                                <div className="mt-2">
                                     <CodeBlock code={apiToken} onCopy={() => showToast('Copied App Token!')} />
                                </div>
                            </div>
                             <div className="p-3 bg-slate-50">
                                <strong className="font-semibold text-slate-700">Optional: Enable API Logging</strong>
                                <p className="text-sm text-slate-600 mt-1">To use the "API Log" tab for debugging, you'll need a free Redis database from <a href="https://upstash.com/" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">Upstash</a>. Then, add these two variables:</p>
                                <div className="mt-2 space-y-2">
                                    <p className="text-sm"><code className="font-mono">UPSTASH_REDIS_REST_URL</code>: Your Upstash database URL.</p>
                                    <p className="text-sm"><code className="font-mono">UPSTASH_REDIS_REST_TOKEN</code>: Your Upstash database token.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Step 2: Configure WordPress Plugin</h3>
                        <p className="text-slate-600 mb-2">
                            In your WordPress admin dashboard, go to <code className="bg-slate-200 px-1 rounded">Settings &rarr; RecipePress AI</code>.
                        </p>
                        <ol className="list-decimal list-inside space-y-4 text-slate-600">
                            <li>Under "Generator", set the <strong>Mode</strong> to <strong>External App</strong>.</li>
                            <li>
                                <div>
                                    Set the <strong>App URL</strong> to the following endpoint:
                                    <CodeBlock code={apiUrl} onCopy={() => showToast('Copied API URL!')} />
                                </div>
                            </li>
                             <li>
                                <div>
                                    Set the <strong>App Token</strong> to the same unique token from above.
                                </div>
                            </li>
                        </ol>
                         <div className="text-sm text-teal-800 bg-teal-50 p-3 rounded-md mt-4">
                            <strong>Tip:</strong> After saving, use the "Test Connection" button in the Manage Sites tab to verify everything is working correctly.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
