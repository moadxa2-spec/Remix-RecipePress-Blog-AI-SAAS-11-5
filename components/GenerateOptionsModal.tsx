
import React from 'react';
import { Icons } from '../constants';

interface GenerateOptionsModalProps {
    onClose: () => void;
    onGenerate: (type: 'full' | 'intro') => void;
}

const OptionCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
}> = ({ title, description, icon, onClick }) => (
    <button
        onClick={onClick}
        className="group w-full text-left p-6 border border-slate-200 rounded-xl hover:border-teal-500 hover:bg-teal-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
    >
        <div className="flex items-center gap-5">
            <div className="flex-shrink-0 text-teal-600 bg-teal-100 rounded-full p-3 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div>
                <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
                <p className="text-sm text-slate-500 mt-1">{description}</p>
            </div>
        </div>
    </button>
);


export const GenerateOptionsModal: React.FC<GenerateOptionsModalProps> = ({ onClose, onGenerate }) => {

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeInUp" onClick={onClose}>
            <div
                className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="text-center">
                    <h2 id="modal-title" className="text-2xl font-extrabold text-slate-900">Choose your Option</h2>
                    <p className="text-slate-500 mt-2">Select an AI agent to craft your recipe post.</p>
                </div>
                
                <div className="mt-8 space-y-4">
                     <OptionCard
                        title="Article & Card Recipes"
                        description="Creates a full, SEO-optimized article with a recipe. The most powerful option."
                        icon={React.cloneElement(Icons.academicCap, { className: "h-8 w-8" })}
                        onClick={() => onGenerate('full')}
                    />
                     <OptionCard
                        title="Only Intro & Card recipe"
                        description="Quickly creates a recipe card with a short, engaging introduction."
                        icon={Icons.sparkles}
                        onClick={() => onGenerate('intro')}
                    />
                </div>

                <div className="flex justify-center pt-8 mt-4">
                    <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-transparent rounded-full hover:bg-slate-200 transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
