

import React, { useState } from 'react';
import { HTACCESS_RULES, Icons, PLUGIN_PHP_CODE } from '../constants';
import type { ToastType } from '../types';

interface OnboardingProps {
    showToast: (message: string, type?: ToastType) => void;
}

const Step: React.FC<{ number: number; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
    <div className="flex gap-4 sm:gap-6">
        <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-600 text-white font-bold ring-8 ring-slate-100">{number}</div>
            <div className="w-px h-full bg-slate-200"></div>
        </div>
        <div className="pb-12 pt-1.5">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
            <div className="text-slate-600 space-y-3">{children}</div>
        </div>
    </div>
);

const CodeBlock: React.FC<{ code: string; onCopy: () => void; }> = ({ code, onCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code.trim());
        setCopied(true);
        onCopy();
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-slate-800 text-slate-100 rounded-lg p-4 my-2 relative font-mono text-sm">
            <pre className="whitespace-pre-wrap"><code>{code.trim()}</code></pre>
            <button 
                onClick={handleCopy}
                className="absolute top-2 right-2 p-2 rounded-md bg-slate-700 hover:bg-slate-600 transition text-white">
                {copied ? React.cloneElement(Icons.check, {className: "h-5 w-5 text-green-400"}) : Icons.copy}
            </button>
        </div>
    );
};

export const Onboarding: React.FC<OnboardingProps> = ({ showToast }) => {

    const handleDownloadPlugin = () => {
        const blob = new Blob([PLUGIN_PHP_CODE], { type: 'text/php;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recipepress-connector.php';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200/80">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome to RecipePress Blog AI!</h2>
                <p className="text-slate-500 mb-10 text-lg">Follow these steps to connect your WordPress site and start publishing recipes.</p>

                <div className="flow-root">
                     <div className="-mb-8">
                        <Step number={1} title="Download & Prepare the Connector Plugin">
                            <p>Click the button below to download the plugin file (<code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs">recipepress-connector.php</code>).</p>
                             <button onClick={handleDownloadPlugin} className="inline-flex items-center gap-2 mt-3 px-4 py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                                {React.cloneElement(Icons.upload, {className: "h-5 w-5"})}
                                <span>Download Plugin File</span>
                            </button>
                            <div className="mt-4 text-sm p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                <p className="font-semibold text-slate-700">Important: To upload to WordPress, you must:</p>
                                <ul className="list-disc list-inside space-y-1 mt-2">
                                    <li>Create a new folder on your computer named <code className="bg-slate-200 px-1.5 py-0.5 rounded text-xs">recipepress-connector</code>.</li>
                                    <li>Place the downloaded <code className="bg-slate-200 px-1.5 py-0.5 rounded text-xs">.php</code> file inside that folder.</li>
                                    <li>Zip the entire <code className="bg-slate-200 px-1.5 py-0.5 rounded text-xs">recipepress-connector</code> folder.</li>
                                </ul>
                                <p className="mt-2">Then, upload this new <code className="bg-slate-200 px-1.5 py-0.5 rounded text-xs">.zip</code> file via Plugins &rarr; Add New &rarr; Upload Plugin.</p>
                            </div>
                        </Step>
                        <Step number={2} title="Get Your Site Token & Set Author">
                            <p>In your WordPress dashboard, navigate to <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs">RecipePress Blog AI</code> in the sidebar. Copy your unique Site Token and select a Default Post Author (must be an Administrator or Editor). Save your changes.</p>
                        </Step>
                        <Step number={3} title="Connect Your Site">
                            <p>Go to the <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs">Settings</code> tab in this app. Click "Add New Site", and paste your website URL and the Site Token you just copied.</p>
                        </Step>
                        <Step number={4} title="Troubleshooting Connection Issues">
                            <p>The connector plugin is designed to automatically configure your server settings upon activation. However, if you still encounter "CORS" or "network" errors, you may need to add the rules manually if your host blocks automatic file edits.</p>
                            <p className="mt-2"><strong>Manual Fallback:</strong> Add these rules to the top of your <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs">.htaccess</code> file:</p>
                            <CodeBlock code={HTACCESS_RULES} onCopy={() => showToast('Copied .htaccess rules!')} />
                        </Step>
                        <div className="flex gap-4 sm:gap-6">
                            <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white font-bold ring-8 ring-slate-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                </div>
                            </div>
                            <div className="pt-1.5">
                                <h3 className="text-lg font-semibold text-slate-900">You're All Set!</h3>
                                <p className="text-slate-600">You can now head back to the Generator tab and start creating recipes.</p>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};