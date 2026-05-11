import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/auth/LandingPage';
import { AuthPage } from './components/auth/AuthPage';
import { PricingPage } from './components/PricingPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Settings } from './components/Settings';
import { PostHistory } from './components/PostHistory';
import { ImageCorrections } from './components/ImageCorrections';
import { Toast } from './components/Toast';
import { HistoryItemDetailsModal } from './components/HistoryItemDetailsModal';
import * as dataService from './services/dataService';
import * as authService from './services/authService';
import { importRecipe, getPostContent } from './services/wordpressService';
import { handleGeneration, safeGenerate } from './services/geminiService';
import { createPinterestPin, exchangePinterestCodeForToken } from './services/pinterestService';
import { runAutomations } from './services/automationService';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { User, Notification, WordPressSite, PostHistoryItem, View, ToastMessage, ToastType, SettingsTab, PublishStatus, ArticleAgentSettings, LicenseKey, AdminSettings, Referral, ActivityLog, SupportTicket, Feedback, QuickReplyTemplate } from './types';

// Helper function to convert hex to an RGB object
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
};

// Component to dynamically inject CSS for branding
const BrandingStyles: React.FC<{ color: string }> = ({ color }) => {
    const rgb = hexToRgb(color);

    const generateCssOverrides = () => {
        if (!rgb) return '';
        // A simple approach: use the main color for key elements.
        // A more advanced version could generate shades.
        return `
            .bg-teal-600 { background-color: ${color} !important; }
            .hover\\:bg-teal-700:hover { background-color: ${color} !important; filter: brightness(0.9); }
            .bg-teal-700 { background-color: ${color} !important; filter: brightness(0.9); }
            .hover\\:bg-teal-600\\/80:hover { background-color: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8) !important; }
            .text-teal-600 { color: ${color} !important; }
            .hover\\:text-teal-800:hover { color: ${color} !important; filter: brightness(0.8); }
            .hover\\:text-teal-900:hover { color: ${color} !important; filter: brightness(0.7); }
            .focus\\:ring-teal-500:focus { --tw-ring-color: ${color} !important; }
            .focus\\:border-teal-500:focus { border-color: ${color} !important; }
            .border-teal-500 { border-color: ${color} !important; }
            .text-teal-300 { color: ${color} !important; filter: brightness(1.5); }
             .ring-teal-700 { --tw-ring-color: ${color} !important; filter: brightness(0.9); }
             .bg-teal-100 { background-color: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1) !important; }
             .text-teal-800 { color: ${color} !important; filter: brightness(0.8); }
             .border-teal-200 { border-color: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2) !important; }
             .border-teal-300 { border-color: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3) !important; }
             .hover\\:border-teal-400:hover { border-color: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4) !important; }
             .bg-teal-50 { background-color: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05) !important; }
             .text-teal-700 { color: ${color} !important; filter: brightness(0.9); }
             .hover\\:bg-teal-50\\/50:hover { background-color: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.025) !important; }
             .hover\\:bg-teal-50\\/60:hover { background-color: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.06) !important; }
             .file\\:bg-teal-50 { background-color: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05) !important; }
             .file\\:text-teal-700 { color: ${color} !important; filter: brightness(0.9); }
        `;
    };
    
    return <style>{generateCssOverrides()}</style>;
};

const PlaceholderPage: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200/80 animate-fadeInUp">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">{title}</h2>
        <div className="prose prose-slate max-w-none">
            {children}
        </div>
    </div>
);

const AboutPage: React.FC = () => (
    <PlaceholderPage title="About Us">
        <p>Welcome to RecipePress Blog AI! We are dedicated to revolutionizing the way food bloggers and content creators manage their websites.</p>
        <p>Our mission is to provide powerful, AI-driven tools that streamline the recipe creation and publishing process, allowing you to focus on what you do best: creating delicious food and engaging content.</p>
        <p>Founded by a team of passionate developers, foodies, and SEO experts, we understand the challenges of running a successful food blog. That's why we built this platform—to save you time, enhance your SEO, and help you produce high-quality content effortlessly.</p>
    </PlaceholderPage>
);

const PrivacyPolicyPage: React.FC = () => (
    <PlaceholderPage title="Privacy Policy">
        <p>Your privacy is important to us. It is RecipePress Blog AI's policy to respect your privacy regarding any information we may collect from you across our website.</p>
        <h3>1. Information we collect</h3>
        <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>
        <h3>2. Use of data</h3>
        <p>We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.</p>
        <h3>3. Data security</h3>
        <p>We don’t share any personally identifying information publicly or with third-parties, except when required to by law.</p>
        <p>Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies.</p>
        <p>Your continued use of our website will be regarded as acceptance of our practices around privacy and personal information. If you have any questions about how we handle user data and personal information, feel free to contact us.</p>
        <p>This policy is effective as of 1 September 2024.</p>
    </PlaceholderPage>
);


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentUser());
  const [view, setView] = useState<View>(currentUser ? 'dashboard' : 'landing');
  
  // User-specific states
  const [sites, setSites] = useState<WordPressSite[]>([]);
  const [posts, setPosts] = useState<PostHistoryItem[]>([]);
  const [geminiApiKey, setGeminiApiKey] = useLocalStorage<string>('geminiApiKey', '');
  const [articleAgentSettings, setArticleAgentSettings] = useState<ArticleAgentSettings>({ mainPrompt: '', internalLinks: 0, externalLinks: 0, knowledgeFiles: []});
  const [pinterestSettings, setPinterestSettings] = useState<import('./types').PinterestSettings>({ token: null, boardId: null, autoPost: false, descriptionTemplate: 'Check out this delicious {title}! {description} #recipe #cooking' });
  
  // Global/Admin states
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [licenseKeys, setLicenseKeys] = useState<LicenseKey[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(dataService.getAdminSettings());
  const [isAdminDataLoading, setIsAdminDataLoading] = useState(true);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [quickReplyTemplates, setQuickReplyTemplates] = useState<QuickReplyTemplate[]>([]);

  // Queue states
  const [generationQueue, setGenerationQueue] = useLocalStorage<PostHistoryItem[]>('generationQueue', []);
  const [isQueuePaused, setIsQueuePaused] = useLocalStorage('isQueuePaused', false);
  const [isQueueProcessing, setIsQueueProcessing] = useState(false);

  // UI State
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>('sites');
  const [detailedHistoryItem, setDetailedHistoryItem] = useState<PostHistoryItem | null>(null);
  const [refreshPostsTrigger, setRefreshPostsTrigger] = useState(0);

  const showToast = useCallback((config: string | ToastMessage, type: ToastType = 'success') => {
    if (typeof config === 'string') {
      setToast({ message: config, type });
    } else {
      setToast(config);
    }
  }, []);

  // Intercept Pinterest OAuth callback
  useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if (code) {
          if (window.opener && window.opener !== window) {
              window.opener.postMessage({ type: 'PINTEREST_OAUTH_CODE', code }, '*');
              window.close();
              return;
          }
      }
  }, []);

  useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
          if (event.data?.type === 'PINTEREST_OAUTH_CODE' && event.data.code && currentUser) {
              const code = event.data.code;
              exchangePinterestCodeForToken(code).then(token => {
                  const currentSettings = dataService.getPinterestSettings(currentUser.id);
                  const updatedSettings = { ...currentSettings, token };
                  setPinterestSettings(updatedSettings);
                  dataService.savePinterestSettings(currentUser.id, updatedSettings);
                  showToast('Pinterest connected successfully!', 'success');
                  handleSetView('settings', 'pinterest');
              }).catch(err => {
                  showToast(err instanceof Error ? err.message : 'Pinterest connection failed', 'error');
              });
          }
      };
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
  }, [currentUser, showToast]);

  const resumeQueue = useCallback(() => {
    setIsQueuePaused(false);
    showToast('Generation queue resumed.', 'success');
  }, [setIsQueuePaused, showToast]);

  const handleUpdatePostInHistory = useCallback((postId: string, updates: Partial<PostHistoryItem>) => {
      if (!currentUser) return;
      const newPosts = posts.map(p => p.id === postId ? { ...p, ...updates } : p);
      setPosts(newPosts);
      dataService.savePosts(currentUser.id, newPosts);

      // Also update item if it's in the queue
      setGenerationQueue(prevQueue => prevQueue.map(item => item.id === postId ? { ...item, ...updates } : item));
  }, [currentUser, posts, setGenerationQueue]);

  const handleDeleteHistoryItem = useCallback((postId: string) => {
      if (!currentUser) return;
      const newPosts = posts.filter(p => p.id !== postId);
      setPosts(newPosts);
      dataService.savePosts(currentUser.id, newPosts);
      
      // Also remove item if it's in the queue
      setGenerationQueue(prevQueue => prevQueue.filter(item => item.id !== postId));
      showToast('Post removed from history.', 'success');
  }, [currentUser, posts, setGenerationQueue, showToast]);

  const addItemsToQueue = useCallback((items: PostHistoryItem[]) => {
      if (!currentUser) return;
      setGenerationQueue(prev => [...prev, ...items]);
      const newPosts = [...items, ...posts];
      setPosts(newPosts);
      dataService.savePosts(currentUser.id, newPosts);
      authService.incrementPostsGenerated(currentUser.id).then(updatedUser => setCurrentUser(updatedUser));
  }, [currentUser, posts, setGenerationQueue]);


  // Main Queue Processor
  useEffect(() => {
    if (isQueueProcessing || isQueuePaused || generationQueue.length === 0 || !currentUser) {
        if (isQueuePaused && generationQueue.length > 0) {
            showToast({
                message: 'Queue paused due to API rate limit. Wait a moment, then resume.',
                type: 'error',
                persistent: true,
                action: { label: 'Resume', onClick: resumeQueue }
            });
        }
        return;
    }

    const processQueueItem = async () => {
        setIsQueueProcessing(true);
        const currentItem = generationQueue[0];
        
        // Handle Scheduled Items
        if (currentItem.intendedStatus === 'schedule' && currentItem.scheduledAt) {
            const now = new Date();
            const scheduledDate = new Date(currentItem.scheduledAt);
            if (now < scheduledDate) {
                if (currentItem.status !== 'scheduled') {
                    handleUpdatePostInHistory(currentItem.id, { status: 'scheduled' });
                }
                const waitTime = Math.min(scheduledDate.getTime() - now.getTime(), 60000); // Wait max 1 min
                const timeoutId = setTimeout(() => {
                    setIsQueueProcessing(false); // This will trigger re-evaluation
                }, waitTime);
                return () => clearTimeout(timeoutId);
            }
        }

        const site = sites.find(s => s.id === currentItem.siteId);

        if (!site) {
            handleUpdatePostInHistory(currentItem.id, { status: 'failed', error: `Site '${currentItem.siteName}' not found.` });
            setGenerationQueue(prev => prev.slice(1));
            setIsQueueProcessing(false);
            return;
        }

        // Check if we have a valid API key before processing
        if (!geminiApiKey) {
             setIsQueuePaused(true);
             showToast({
                message: 'Gemini API Key is missing. Please add it in settings to resume.',
                type: 'error',
                persistent: true,
                action: { label: 'Go to Settings', onClick: () => handleSetView('settings', 'gemini') }
            });
             setIsQueueProcessing(false);
             return;
        }

        try {
            handleUpdatePostInHistory(currentItem.id, { status: 'generating' });

            let generatedPost;
            if (currentItem.sourceData) { // New post generation
                generatedPost = await safeGenerate(handleGeneration({
                    apiKey: geminiApiKey,
                    primaryKeyword: currentItem.sourceData.primaryKeyword,
                    generationType: currentItem.sourceData.generationType,
                    source: currentItem.sourceData.generationTab === 'text' 
                        ? { type: 'text', value: currentItem.sourceData.recipeText } 
                        : { type: 'content', value: { title: currentItem.sourceData.primaryKeyword, content: '' }},
                    settings: articleAgentSettings,
                    adminSettings: adminSettings,
                    imageConfig: currentItem.sourceData.imageConfig,
                    existingPosts: [],
                    imageStrategy: 'regenerate'
                }));
            } else { // Existing post regeneration
                const contentData = await getPostContent(site, currentItem.targetPostId);
                const allPostsForLinking = dataService.getPosts(currentUser.id).map(p => ({ title: p.post_title, link: p.publishedUrl || ''})).filter(p => p.link);
                generatedPost = await safeGenerate(handleGeneration({
                    apiKey: geminiApiKey,
                    primaryKeyword: currentItem.focus_keyword || contentData.title,
                    generationType: currentItem.generationType || 'intro',
                    source: { type: 'content', value: contentData },
                    settings: articleAgentSettings,
                    adminSettings: adminSettings,
                    imageConfig: { option: 'generate', uploadedImage: null },
                    existingPosts: allPostsForLinking,
                    imageStrategy: currentItem.imageStrategy
                }));
            }
            
            handleUpdatePostInHistory(currentItem.id, { ...generatedPost, status: 'publishing' });

            const { message, post_url, post_id, featured_image_url } = await importRecipe(site, currentItem.targetPostId, generatedPost, currentItem.intendedStatus === 'draft' ? 'draft' : 'publish', currentItem.generationType || 'full');

            const finalStatus: PublishStatus = currentItem.targetPostId === 0 ? (currentItem.intendedStatus === 'publish' ? 'published' : 'draft') : 'published';
            
            let pinterestStatus: 'posted' | 'failed' | 'skipped' = 'skipped';
            let pinterestUrl: string | undefined = undefined;

            // Pinterest Auto-Post Logic
            if (pinterestSettings.autoPost && pinterestSettings.token && pinterestSettings.boardId && finalStatus === 'published' && post_url) {
                try {
                    const { generatePinterestDescription } = await import('./services/geminiService');
                    const pinDesc = await safeGenerate(generatePinterestDescription(geminiApiKey, generatedPost.recipe_data.name, generatedPost.recipe_data.description, pinterestSettings.descriptionTemplate));
                    
                    const pinResult = await createPinterestPin(
                        pinterestSettings.token, 
                        pinterestSettings.boardId,
                        generatedPost.recipe_data.name,
                        pinDesc,
                        post_url,
                        generatedPost.recipe_data.image || '',
                        featured_image_url // Pass the public WP image URL if we have it
                    );
                    pinterestStatus = 'posted';
                    pinterestUrl = `https://www.pinterest.com/pin/${pinResult.id}`;
                    console.log('Pinterest auto-post successful:', pinterestUrl);
                } catch (pinErr) {
                    console.error('Pinterest Auto-Post Failed:', pinErr);
                    pinterestStatus = 'failed';
                }
            }

            handleUpdatePostInHistory(currentItem.id, { 
                status: finalStatus, 
                publishedUrl: post_url, 
                targetPostId: post_id, 
                error: undefined,
                pinterestStatus,
                pinterestUrl
            });
            showToast(message, 'success');
            setRefreshPostsTrigger(c => c + 1);
            setGenerationQueue(prev => prev.slice(1));

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('rate limit')) {
                setIsQueuePaused(true);
                handleUpdatePostInHistory(currentItem.id, { status: 'queued', error: 'Rate limit hit. Queue paused.' });
            } else {
                handleUpdatePostInHistory(currentItem.id, { status: 'failed', error: errorMessage });
                setGenerationQueue(prev => prev.slice(1)); // Move to next item on other errors
            }
        } finally {
            setIsQueueProcessing(false);
        }
    };

    processQueueItem();
  }, [generationQueue, isQueueProcessing, isQueuePaused, currentUser, sites, geminiApiKey, articleAgentSettings, adminSettings, handleUpdatePostInHistory, resumeQueue, setGenerationQueue, showToast]);


  const fetchAdminData = useCallback(async () => {
      if (currentUser?.role && ['owner', 'admin', 'support'].includes(currentUser.role)) {
          setIsAdminDataLoading(true);
          try {
              const [fetchedUsers, fetchedKeys, fetchedReferrals, fetchedNotifications, fetchedLogs] = await Promise.all([
                  authService.getAllUsers(),
                  dataService.getLicenseKeys(),
                  dataService.getReferrals(),
                  dataService.getNotifications(),
                  dataService.getActivityLogs(),
              ]);

              const nonOwnerUsers = fetchedUsers.filter(u => u.role !== 'owner');
              const allButCurrentUser = fetchedUsers.filter(u => u.id !== currentUser.id);

              const displayUsers = currentUser.role === 'owner' ? allButCurrentUser : nonOwnerUsers;
              
              let keysNeedSaving = false;
              const enrichedKeys = fetchedKeys.map(key => {
                  if (key.assignedTo && !key.assignedEmail) {
                      const user = fetchedUsers.find(u => u.id === key.assignedTo);
                      if (user) {
                          key.assignedEmail = user.email;
                          keysNeedSaving = true;
                      }
                  }
                  return key;
              });
              
              if (keysNeedSaving) {
                  dataService.saveLicenseKeys(enrichedKeys);
              }

              setAllUsers(displayUsers);
              setLicenseKeys(fetchedKeys);
              setReferrals(fetchedReferrals);
              setNotifications(fetchedNotifications);
              setActivityLogs(fetchedLogs);
              setSupportTickets(dataService.getSupportTickets());
              setFeedback(dataService.getFeedback());
              setQuickReplyTemplates(dataService.getQuickReplyTemplates());
              setAdminSettings(dataService.getAdminSettings()); // Refresh admin settings
          } catch (error) {
              showToast('Failed to load admin data.', 'error');
          } finally {
              setIsAdminDataLoading(false);
          }
      } else {
        setIsAdminDataLoading(false);
      }
  }, [currentUser, showToast]);


  // Load data on user change
  useEffect(() => {
    // Global data
    const globalNotifications = dataService.getNotifications();
    
    if (currentUser) {
      setSites(dataService.getSites(currentUser.id));
      setPosts(dataService.getPosts(currentUser.id));
      // Try to load from data service if not in local storage (migration path)
      if (!geminiApiKey) {
          const storedKey = dataService.getGeminiApiKey(currentUser.id);
          if (storedKey) setGeminiApiKey(storedKey);
      }
      setArticleAgentSettings(dataService.getArticleAgentSettings(currentUser.id));
      setPinterestSettings(dataService.getPinterestSettings(currentUser.id));
      
      const welcomeMessage = `Welcome back, ${currentUser.name}!`;
      const welcomeNotification: Notification = { 
        id: `welcome-${currentUser.id}`, 
        message: welcomeMessage, 
        type: 'success', 
        read: false, 
        timestamp: new Date().toISOString(),
        title: 'Welcome!',
        status: 'sent',
        targetGroup: 'all',
        scheduledAt: null,
        stats: { sent: 1 }
      };

      // Combine global and user-specific notifications, avoiding duplicates
      const allNotifications = [...globalNotifications, welcomeNotification];
      const uniqueNotifications = Array.from(new Map(allNotifications.map(item => [item.id, item])).values());
      setNotifications(uniqueNotifications);

      if (currentUser.role && ['owner', 'admin', 'support'].includes(currentUser.role)) {
        fetchAdminData();
      }
      
      setView('dashboard');
    } else {
      // Clear data on logout
      setSites([]);
      setPosts([]);
      setArticleAgentSettings({ mainPrompt: '', internalLinks: 0, externalLinks: 0, knowledgeFiles: []});
      setNotifications([]);
      setAllUsers([]);
      setLicenseKeys([]);
      setReferrals([]);
      setActivityLogs([]);
      setSupportTickets([]);
      setFeedback([]);
      setQuickReplyTemplates([]);
      setView('landing');
    }
  }, [currentUser, fetchAdminData]);

  // Sync key to dataService for persistence across sessions if desired
  useEffect(() => {
      if (currentUser && geminiApiKey) {
          dataService.saveGeminiApiKey(currentUser.id, geminiApiKey);
      }
  }, [currentUser, geminiApiKey]);

  // Simulated Cron Job for Automations
  useEffect(() => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'owner')) {
        const intervalId = setInterval(async () => {
            console.log('Running automations...');
            const settings = dataService.getAdminSettings();
            
            const currentKeys = dataService.getLicenseKeys();
            const currentUsers = await authService.getAllUsers();
            
            const { updatedKeys, newNotifications, updatedUsers, settingsChanged } = await runAutomations(settings, currentUsers, currentKeys);

            if (updatedKeys) {
                setLicenseKeys(updatedKeys); // Update state for the admin dashboard
                dataService.saveLicenseKeys(updatedKeys);
            }
            if (updatedUsers) {
                 // The authService function saves to DB, we just need to update admin state
                 await fetchAdminData();
            }
            if (newNotifications.length > 0) {
                const allNotifs = [...dataService.getNotifications(), ...newNotifications];
                dataService.saveNotifications(allNotifs);
                setNotifications(allNotifs); // Update state for admin dashboard
            }
            if (settingsChanged) {
                setAdminSettings(dataService.getAdminSettings()); // Refresh settings state
            }

        }, 30000); // Run every 30 seconds for demonstration

        return () => clearInterval(intervalId);
    }
  }, [currentUser, fetchAdminData]);


  // Apply branding changes dynamically
  useEffect(() => {
    document.title = adminSettings.branding.appName;
  }, [adminSettings.branding.appName]);

  const handleSetView = (newView: View, tab?: SettingsTab) => {
    if (newView === 'settings' && tab) {
      setActiveSettingsTab(tab);
    }
    setView(newView);
    window.scrollTo(0, 0);
  };

  const handleLoginSuccess = (user: User) => {
      setCurrentUser(user);
      showToast(`Welcome back, ${user.name}!`, 'success');
  };
  
  const handleGoogleLogin = async () => {
    try {
      const user = await authService.loginWithGoogle();
      setCurrentUser(user);
      showToast(`Welcome back, ${user.name} with Google!`, 'success');
      setView('dashboard');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Login failed.', 'error');
    }
  };

  const handleSignup = async (name?: string, email?: string, password?: string, licenseKey?: string, referralCode?: string) => {
    try {
      const user = await authService.signup(name, email, password, licenseKey, referralCode);
      setCurrentUser(user);
      showToast(`Welcome, ${user.name}! Your account has been created.`, 'success');
      setView('dashboard');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Signup failed.', 'error');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setView('landing');
  };
  
  const handleAddSite = (site: Omit<WordPressSite, 'id'>) => {
    if (!currentUser) return;
    const newSite = { ...site, id: crypto.randomUUID() };
    const newSites = [...sites, newSite];
    setSites(newSites);
    dataService.saveSites(currentUser.id, newSites);
    showToast('Site added successfully!', 'success');
  };

  const handleRemoveSite = (id: string) => {
    if (!currentUser) return;
    setSites(prev => {
        const newSites = prev.filter(s => s.id !== id);
        dataService.saveSites(currentUser.id, newSites);
        return newSites;
    });
    showToast('Site removed.', 'success');
  };

  const handleUpdateSite = (updatedSite: WordPressSite) => {
    if (!currentUser) return;
    const newSites = sites.map(s => s.id === updatedSite.id ? updatedSite : s);
    setSites(newSites);
    dataService.saveSites(currentUser.id, newSites);
    showToast('Site updated successfully.', 'success');
  };
  
  const handleSetArticleAgentSettings = (settings: ArticleAgentSettings) => {
    if (!currentUser) return;
    setArticleAgentSettings(settings);
    dataService.saveArticleAgentSettings(currentUser.id, settings);
  };

  const handleSetPinterestSettings = (settings: import('./types').PinterestSettings) => {
    if (!currentUser) return;
    setPinterestSettings(settings);
    dataService.savePinterestSettings(currentUser.id, settings);
  };
  
  const handleRetryFailedPost = async (item: PostHistoryItem) => {
      handleUpdatePostInHistory(item.id, { status: 'queued', error: undefined });
      setGenerationQueue(prev => [...prev, item]);
      showToast('Post re-queued for generation.', 'success');
      setView('history');
  };

  const handleAddNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'stats' | 'read'>) => {
      const sentCount = notificationData.targetGroup === 'all' ? allUsers.length : allUsers.filter(u => u.plan === notificationData.targetGroup).length;
      
      const newNotification: Notification = {
          ...notificationData,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          stats: { sent: sentCount },
      };
      
      const newNotifications = [newNotification, ...notifications];
      setNotifications(newNotifications);
      dataService.saveNotifications(newNotifications);
      dataService.addActivityLog({ actorId: currentUser.id, actorName: currentUser.name, action: 'notification_sent', details: `Sent notification "${newNotification.title}" to ${newNotification.targetGroup} users.` });
      showToast(`Notification '${newNotification.title}' ${newNotification.status === 'scheduled' ? 'scheduled' : 'sent'}!`, 'success');
  };
  
  const handleDeleteNotification = (ids: string[]) => {
      const newNotifications = notifications.filter(n => !ids.includes(n.id));
      setNotifications(newNotifications);
      dataService.saveNotifications(newNotifications);
      dataService.addActivityLog({ actorId: currentUser.id, actorName: currentUser.name, action: 'notification_deleted', details: `Deleted ${ids.length} notification(s).` });
      showToast(`${ids.length} notification(s) deleted.`, 'success');
  };
  
  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
      try {
          await authService.updateUser(userId, updates);
          // If the current user is updated, refresh their state
          if (currentUser?.id === userId) {
            const updatedCurrentUser = await authService.getAllUsers().then(users => users.find(u => u.id === userId));
            if(updatedCurrentUser) setCurrentUser(updatedCurrentUser);
          }
          await fetchAdminData(); // Refresh the list for the admin panel
          showToast('User updated successfully.', 'success');
      } catch(err) {
          showToast(err instanceof Error ? err.message : 'Failed to update user.', 'error');
      }
  };

  const handleDeleteUsers = async (userIds: string[]) => {
      try {
          await Promise.all(userIds.map(id => authService.deleteUser(id)));
          await Promise.all(userIds.map(id => dataService.deleteUserData(id)));
          await fetchAdminData();
          showToast(`${userIds.length} user(s) deleted successfully.`, 'success');
      } catch (err) {
          showToast(err instanceof Error ? err.message : 'Failed to delete user(s).', 'error');
      }
  };
  
  const handleResetUserData = async (userId: string) => {
      try {
          dataService.deleteUserData(userId);
          await fetchAdminData();
          showToast('User data reset successfully.', 'success');
      } catch (err) {
          showToast(err instanceof Error ? err.message : 'Failed to reset user data.', 'error');
      }
  };
  
  const handleAdminCreateUser = async (userData: Partial<User>, password?: string) => {
      try {
          await authService.adminCreateUser(userData, password);
          await fetchAdminData();
          showToast(`User ${userData.name} created successfully.`, 'success');
      } catch(err) {
          showToast(err instanceof Error ? err.message : 'Failed to create user.', 'error');
          throw err; // Re-throw to keep modal open on error
      }
  };

  const renderContent = () => {
    if (!currentUser) {
      // Render public views when no user is logged in
      switch (view) {
        case 'login':
          return <AuthPage mode="login" setView={handleSetView} onLogin={authService.login} onGoogleLogin={handleGoogleLogin} onSignup={handleSignup} onLoginSuccess={handleLoginSuccess} />;
        case 'signup':
          return <AuthPage mode="signup" setView={handleSetView} onLogin={authService.login} onGoogleLogin={handleGoogleLogin} onSignup={handleSignup} onLoginSuccess={handleLoginSuccess}/>;
        case 'about':
          return <AboutPage />;
        case 'privacy':
          return <PrivacyPolicyPage />;
        case 'pricing': // Pricing page can be viewed when logged out
        case 'landing':
        default:
          return <LandingPage setView={handleSetView} appName={adminSettings.branding.appName}/>;
      }
    }

    // Render authenticated views
    // Special views that should not persist state
    if (view === 'admin') {
      return ['owner', 'admin', 'support'].includes(currentUser.role) ? 
        <AdminDashboard 
            showToast={showToast} 
            addNotification={handleAddNotification}
            deleteNotification={handleDeleteNotification}
            allNotifications={notifications} 
            allUsers={allUsers}
            licenseKeys={licenseKeys}
            referrals={referrals}
            activityLogs={activityLogs}
            adminSettings={adminSettings}
            setLicenseKeys={setLicenseKeys}
            setAdminSettings={setAdminSettings}
            handleUpdateUser={handleUpdateUser}
            handleDeleteUsers={handleDeleteUsers}
            handleResetUserData={handleResetUserData}
            handleAdminCreateUser={handleAdminCreateUser}
            currentUser={currentUser}
            refreshData={fetchAdminData}
            isLoading={isAdminDataLoading}
            supportTickets={supportTickets}
            feedback={feedback}
            quickReplyTemplates={quickReplyTemplates}
            setSupportTickets={setSupportTickets}
            setFeedback={setFeedback}
            setQuickReplyTemplates={setQuickReplyTemplates}
        /> : <div>Access Denied</div>;
    }
    if (view === 'pricing') {
        return <PricingPage setView={handleSetView} currentUser={currentUser} />;
    }

    // Main app views that should persist state
    return (
      <>
        <div style={{ display: view === 'dashboard' ? 'block' : 'none' }}>
          <Dashboard 
            sites={sites} 
            geminiApiKey={geminiApiKey}
            addItemsToQueue={addItemsToQueue}
            updatePostInHistory={handleUpdatePostInHistory}
            showToast={showToast} 
            setView={handleSetView} 
            articleAgentSettings={articleAgentSettings}
            adminSettings={adminSettings}
            refreshPostsTrigger={refreshPostsTrigger}
            setRefreshPostsTrigger={setRefreshPostsTrigger}
            pinterestSettings={pinterestSettings}
          />
        </div>
        <div style={{ display: view === 'history' ? 'block' : 'none' }}>
          <PostHistory 
            posts={posts} 
            onViewDetails={setDetailedHistoryItem} 
            isQueuePaused={isQueuePaused}
            queueLength={generationQueue.length}
            onResumeQueue={resumeQueue}
          />
        </div>
        <div style={{ display: view === 'corrections' ? 'block' : 'none' }}>
          <ImageCorrections
            sites={sites}
            showToast={showToast}
          />
        </div>
        <div style={{ display: view === 'settings' ? 'block' : 'none' }}>
          <Settings 
            sites={sites} 
            addSite={handleAddSite} 
            removeSite={handleRemoveSite}
            updateSite={handleUpdateSite}
            showToast={showToast} 
            geminiApiKey={geminiApiKey}
            setGeminiApiKey={setGeminiApiKey}
            articleAgentSettings={articleAgentSettings}
            setArticleAgentSettings={handleSetArticleAgentSettings}
            pinterestSettings={pinterestSettings}
            setPinterestSettings={handleSetPinterestSettings}
            activeTab={activeSettingsTab}
            setActiveTab={setActiveSettingsTab}
            currentUser={currentUser!}
            onUpdateUser={handleUpdateUser}
            isQueuePaused={isQueuePaused}
          />
        </div>
      </>
    );
  };

  return (
    <>
      <BrandingStyles color={adminSettings.branding.primaryColor} />
      <div className="min-h-screen bg-slate-100">
        <Header 
          currentView={view} 
          setView={handleSetView} 
          currentUser={currentUser} 
          logout={handleLogout} 
          notifications={notifications}
          setNotifications={setNotifications}
          appName={adminSettings.branding.appName}
          logoUrl={adminSettings.branding.logoUrl}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </main>
        <Toast message={toast} onClose={() => setToast(null)} />
        {detailedHistoryItem && (
            <HistoryItemDetailsModal 
                item={detailedHistoryItem} 
                onClose={() => setDetailedHistoryItem(null)} 
                onRetry={handleRetryFailedPost}
            />
        )}
      </div>
    </>
  );
};

export default App;