
import React from 'react';
import type { View } from '../../types';
import { Icons } from '../../constants';

interface LandingPageProps {
  setView: (view: View) => void;
  appName: string;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200/80 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-teal-100 text-teal-600 mb-5">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900">{title}</h3>
    <p className="mt-2 text-slate-600">{children}</p>
  </div>
);

const StepCard: React.FC<{ number: string; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
    <div className="flex">
        <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-teal-600 text-white font-bold text-2xl">
                {number}
            </div>
        </div>
        <div className="ml-4">
            <h4 className="text-lg leading-6 font-bold text-slate-900">{title}</h4>
            <p className="mt-2 text-base text-slate-600">{children}</p>
        </div>
    </div>
);

const FAQItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
        <div className="border-b border-slate-200 py-6">
            <dt>
                <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-start text-left text-slate-400">
                    <span className="font-medium text-slate-900">{question}</span>
                    <span className="ml-6 h-7 flex items-center">
                        <svg className={`h-6 w-6 transform ${isOpen ? '-rotate-180' : 'rotate-0'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </span>
                </button>
            </dt>
            {isOpen && (
                <dd className="mt-2 pr-12">
                    <p className="text-base text-slate-600">{children}</p>
                </dd>
            )}
        </div>
    );
};

export const LandingPage: React.FC<LandingPageProps> = ({ setView, appName }) => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
         <div className="absolute inset-0">
          <div className="absolute inset-0 bg-white" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)' }}></div>
          <div 
            className="absolute inset-x-0 top-0 h-[800px] bg-white"
            style={{
              backgroundImage: 'radial-gradient(circle at top, rgba(13, 148, 136, 0.05), transparent 40%)',
            }}
          />
        </div>
        <div className="relative pt-16 pb-24 sm:pt-24 sm:pb-32 lg:pt-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
                    <span className="block">Automate Your Recipe Blogging</span>
                    <span className="block bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent mt-2">with the Power of AI</span>
                </h1>
                <p className="mt-6 max-w-md mx-auto text-lg text-slate-600 sm:text-xl md:mt-8 md:max-w-3xl">
                    Go from a simple idea to a fully-published, SEO-optimized recipe post on your WordPress site in minutes, not hours.
                </p>
                <div className="mt-8 max-w-md mx-auto sm:flex sm:justify-center">
                    <button
                        onClick={() => setView('signup')}
                        className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 md:py-4 md:text-lg md:px-10 shadow-lg hover:shadow-teal-500/40 transform hover:-translate-y-1 transition-all duration-300"
                    >
                        Join Now - It's Free!
                    </button>
                </div>
                 <p className="mt-4 text-sm text-slate-500">Free to use while in beta. Manage your blog from anywhere with our mobile-friendly web app.</p>
            </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-teal-600 font-semibold tracking-wide uppercase">Why Choose {appName}</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              The Ultimate Toolkit for Food Bloggers
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon={React.cloneElement(Icons.sparkles, {className:"w-8 h-8"})} title="Effortless Content Creation">
              Turn a simple keyword or your rough notes into a complete, well-structured article with our advanced Article Agent.
            </FeatureCard>
            <FeatureCard icon={React.cloneElement(Icons.trendingUp, {className:"w-8 h-8"})} title="Built-in SEO Mastery">
              Automatically generate SEO-friendly titles, meta descriptions, slugs, and schema markup (Recipe & FAQ) to rank higher on Google.
            </FeatureCard>
            <FeatureCard icon={React.cloneElement(Icons.globe, {className:"w-8 h-8"})} title="Direct WordPress Integration">
              Connect your sites and publish new posts or update existing ones with a single click. No more copy-pasting.
            </FeatureCard>
            <FeatureCard icon={React.cloneElement(Icons.photo, {className:"w-8 h-8"})} title="AI-Powered Imagery">
              Create beautiful, unique, and royalty-free featured images for your recipes automatically, or generate variations from your own photos.
            </FeatureCard>
            <FeatureCard icon={React.cloneElement(Icons.server, {className:"w-8 h-8"})} title="Multi-Site Management">
              Manage all of your WordPress food blogs from a single, intuitive dashboard. Perfect for creators with multiple sites.
            </FeatureCard>
            <FeatureCard icon={React.cloneElement(Icons.cog, {className:"w-8 h-8"})} title="Mobile-First Design">
              Use our app on any device. Add it to your phone's home screen for a native app-like experience to manage your blog on the go.
            </FeatureCard>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
                <h2 className="text-base text-teal-600 font-semibold tracking-wide uppercase">How It Works</h2>
                <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                    Publish in 4 Simple Steps
                </p>
            </div>
            <div className="mt-12">
                <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 lg:grid-cols-4">
                    <StepCard number="1" title="Connect Your Site">
                        Install our lightweight WordPress plugin to securely link your website.
                    </StepCard>
                    <StepCard number="2" title="Provide Your Idea">
                        Start with a recipe title, a keyword, or paste in your existing recipe notes.
                    </StepCard>
                    <StepCard number="3" title="Generate & Edit">
                        Our AI agents craft a complete article. Fine-tune any detail in our powerful editor.
                    </StepCard>
                    <StepCard number="4" title="Publish Instantly">
                        Send your masterpiece directly to your WordPress site as a draft or published post.
                    </StepCard>
                </dl>
            </div>
        </div>
      </div>
      
      {/* FAQ Section */}
       <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
            </div>
            <dl className="mt-12 max-w-3xl mx-auto">
                <FAQItem question="Is this really free?">
                    Yes! During our beta period, {appName} is completely free to use. We want to gather feedback and make this the best tool possible for food bloggers. We may introduce paid plans with additional premium features in the future.
                </FAQItem>
                 <FAQItem question="How does the AI work?">
                    We use Google's powerful Gemini API. Our specialized "agents" (for SEO, content, and linking) work together to create a comprehensive and high-quality blog post based on your initial input and settings.
                </FAQItem>
                 <FAQItem question="Is the content unique and SEO-friendly?">
                    Absolutely. The content is generated uniquely for you each time. Our SEO agent is specifically designed to include all the necessary elements for ranking well, including keywords, meta tags, and structured data (schema).
                </FAQItem>
                 <FAQItem question="Can I use this on my existing blog posts?">
                    Yes! One of the key features is the ability to update existing posts. You can easily add a recipe card to a post that's missing one, or even regenerate the entire article text while keeping your existing images.
                </FAQItem>
            </dl>
        </div>
    </div>
      
      {/* Final CTA Section */}
      <div className="bg-slate-50">
        <div className="max-w-4xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                <span className="block">Ready to supercharge your blog?</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-slate-600">
                Start creating amazing recipe content in a fraction of the time. No credit card required.
            </p>
            <button
                onClick={() => setView('signup')}
                className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 sm:w-auto"
            >
                Sign Up Now
            </button>
        </div>
      </div>
      
       {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
            <div className="flex justify-center space-x-6 md:order-2">
                <button onClick={() => setView('about')} className="text-slate-500 hover:text-slate-600">About Us</button>
                <button onClick={() => setView('privacy')} className="text-slate-500 hover:text-slate-600">Privacy Policy</button>
            </div>
            <div className="mt-8 md:mt-0 md:order-1">
                <p className="text-center text-base text-slate-400">&copy; 2024 {appName}. All rights reserved.</p>
            </div>
        </div>
      </footer>
    </div>
  );
};
