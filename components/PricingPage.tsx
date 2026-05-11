
import React from 'react';
import { Icons } from '../constants';
import type { User, View } from '../types';

interface PricingPageProps {
  setView: (view: View) => void;
  currentUser: User;
}

const CheckItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start">
        <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
        </div>
        <p className="ml-3 text-base text-slate-700">{children}</p>
    </li>
);

export const PricingPage: React.FC<PricingPageProps> = ({ setView, currentUser }) => {

  const handleChoosePlan = () => {
    // In a real app, this would redirect to a payment processor like Stripe.
    // For now, it will just show a confirmation.
    alert('Plan selection is a placeholder. You would integrate a payment provider here.');
  };

  return (
    <div className="bg-slate-100">
      <div className="pt-12 sm:pt-16 lg:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">Simple, transparent pricing</h2>
            <p className="mt-4 text-xl text-slate-600">Choose the plan that's right for you and your food blog.</p>
          </div>
        </div>
      </div>
      <div className="mt-8 bg-white pb-16 sm:mt-12 sm:pb-20 lg:pb-28">
        <div className="relative">
          <div className="absolute inset-0 h-1/2 bg-slate-100"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg mx-auto rounded-lg shadow-lg overflow-hidden lg:max-w-none lg:flex">
              <div className="flex-1 bg-white px-6 py-8 lg:p-12">
                <h3 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Free Plan</h3>
                <p className="mt-6 text-base text-slate-500">Perfect for getting started and trying out the core features of RecipePress AI.</p>
                <div className="mt-8">
                  <div className="flex items-center">
                    <h4 className="flex-shrink-0 pr-4 bg-white text-sm tracking-wider font-semibold uppercase text-teal-600">What's included</h4>
                    <div className="flex-1 border-t-2 border-slate-200"></div>
                  </div>
                  <ul role="list" className="mt-8 space-y-5 lg:space-y-4">
                    <CheckItem><strong>5</strong> Full Article Generations per month</CheckItem>
                    <CheckItem><strong>1</strong> Connected WordPress Site</CheckItem>
                    <CheckItem>Generate Recipe Cards from existing posts</CheckItem>
                    <CheckItem>AI Featured Image Generation</CheckItem>
                  </ul>
                </div>
              </div>
              <div className="py-8 px-6 text-center bg-slate-50 lg:flex-shrink-0 lg:flex lg:flex-col lg:justify-center lg:p-12">
                <p className="text-lg leading-6 font-medium text-slate-900">Your Current Plan</p>
                <div className="mt-4 flex items-center justify-center text-5xl font-extrabold text-slate-900">
                  <span>$0</span>
                  <span className="ml-3 text-xl font-medium text-slate-500">/ mo</span>
                </div>
                <div className="mt-6">
                    <div className="rounded-md shadow">
                        <button onClick={() => setView('dashboard')} className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-slate-800 hover:bg-slate-900">
                          Back to Dashboard
                        </button>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 pb-16 sm:mt-12 sm:pb-20 lg:pb-28">
        <div className="relative">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg mx-auto rounded-lg shadow-lg overflow-hidden lg:max-w-none lg:flex">
              <div className="flex-1 bg-white px-6 py-8 lg:p-12">
                <h3 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Pro Plan</h3>
                <p className="mt-6 text-base text-slate-500">Unlock the full power of RecipePress AI with unlimited generations and advanced features.</p>
                <div className="mt-8">
                  <div className="flex items-center">
                    <h4 className="flex-shrink-0 pr-4 bg-white text-sm tracking-wider font-semibold uppercase text-teal-600">Everything in Free, plus</h4>
                    <div className="flex-1 border-t-2 border-slate-200"></div>
                  </div>
                  <ul role="list" className="mt-8 space-y-5 lg:space-y-4">
                    <CheckItem><strong>Unlimited</strong> Full Article Generations</CheckItem>
                    <CheckItem><strong>Unlimited</strong> Connected WordPress Sites</CheckItem>
                    <CheckItem>Article Agent with custom knowledge base</CheckItem>
                    <CheckItem>Bulk Regeneration Tools</CheckItem>
                    <CheckItem>Priority Support</CheckItem>
                  </ul>
                </div>
              </div>
              <div className="py-8 px-6 text-center bg-slate-50 lg:flex-shrink-0 lg:flex lg:flex-col lg:justify-center lg:p-12">
                <p className="text-lg leading-6 font-medium text-slate-900">The Ultimate Toolkit</p>
                <div className="mt-4 flex items-center justify-center text-5xl font-extrabold text-slate-900">
                  <span>$29</span>
                  <span className="ml-3 text-xl font-medium text-slate-500">/ mo</span>
                </div>
                <div className="mt-6">
                    <div className="rounded-md shadow">
                        <button onClick={handleChoosePlan} className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700">
                            Upgrade to Pro
                        </button>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
