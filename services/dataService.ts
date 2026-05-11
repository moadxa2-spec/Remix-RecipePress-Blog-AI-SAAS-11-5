

import type { WordPressSite, PostHistoryItem, ArticleAgentSettings, LicenseKey, Notification, Referral, AdminSettings, ActivityLog, SupportTicket, Feedback, QuickReplyTemplate } from '../types';

const SITES_KEY = 'recipepress-sites';
const POSTS_KEY = 'recipepress-posts';
const API_KEY_KEY = 'recipepress-gemini-api-key';
const AGENT_SETTINGS_KEY = 'recipepress-article-agent-settings';
const LICENSE_KEYS_KEY = 'recipepress-license-keys'; // Global key
const NOTIFICATIONS_KEY = 'recipepress-notifications'; // Global key
const REFERRALS_KEY = 'recipepress-referrals'; // Global key
const ADMIN_SETTINGS_KEY = 'recipepress-admin-settings'; // Global key
const ACTIVITY_LOG_KEY = 'recipepress-activity-log'; // Global key
const SUPPORT_TICKETS_KEY = 'recipepress-support-tickets';
const FEEDBACK_KEY = 'recipepress-feedback';
const QUICK_REPLY_TEMPLATES_KEY = 'recipepress-quick-reply-templates';
const MAX_ACTIVITY_LOGS = 500;

function getNamespacedKey(key: string, userId: string): string {
    return `${key}-${userId}`;
}

function getItem<T>(key: string, defaultValue: T): T {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        return defaultValue;
    }
}

function setItem<T>(key: string, value: T): void {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
    }
}

// Sites
export const getSites = (userId: string): WordPressSite[] => {
    const key = getNamespacedKey(SITES_KEY, userId);
    // One-time migration for users from secretKey to siteToken
    const sitesRaw = window.localStorage.getItem(key);
    if (sitesRaw) {
        try {
            const storedSites = JSON.parse(sitesRaw);
            if (Array.isArray(storedSites) && storedSites.length > 0 && storedSites[0].hasOwnProperty('secretKey') && !storedSites[0].hasOwnProperty('siteToken')) {
                const migratedSites = storedSites.map((site: any) => ({
                    id: site.id,
                    name: site.name,
                    url: site.url,
                    siteToken: site.secretKey,
                }));
                setItem(key, migratedSites);
                return migratedSites;
            }
        } catch (e) {
            console.error("Error during site migration check:", e);
        }
    }
    return getItem<WordPressSite[]>(key, []);
};
export const saveSites = (userId: string, sites: WordPressSite[]): void => setItem(getNamespacedKey(SITES_KEY, userId), sites);

// Posts
export const getPosts = (userId: string): PostHistoryItem[] => getItem<PostHistoryItem[]>(getNamespacedKey(POSTS_KEY, userId), []);
export const savePosts = (userId: string, posts: PostHistoryItem[]): void => setItem(getNamespacedKey(POSTS_KEY, userId), posts);

// Gemini API Key
export const getGeminiApiKey = (userId: string): string => getItem<string>(getNamespacedKey(API_KEY_KEY, userId), '');
export const saveGeminiApiKey = (userId: string, apiKey: string): void => setItem(getNamespacedKey(API_KEY_KEY, userId), apiKey);

// Article Agent Settings
export const getArticleAgentSettings = (userId: string): ArticleAgentSettings => getItem<ArticleAgentSettings>(getNamespacedKey(AGENT_SETTINGS_KEY, userId), {
    mainPrompt: 'You are an expert food blogger and SEO specialist. Your writing style is warm, engaging, and helpful. You always write content that is easy to read and follow.',
    internalLinks: 2,
    externalLinks: 1,
    knowledgeFiles: [],
});
export const saveArticleAgentSettings = (userId: string, settings: ArticleAgentSettings): void => setItem(getNamespacedKey(AGENT_SETTINGS_KEY, userId), settings);

// Pinterest Settings
const PINTEREST_SETTINGS_KEY = 'recipepress-pinterest-settings';
export const getPinterestSettings = (userId: string): import('../types').PinterestSettings => getItem<import('../types').PinterestSettings>(getNamespacedKey(PINTEREST_SETTINGS_KEY, userId), {
    token: null,
    boardId: null,
    autoPost: false,
    descriptionTemplate: 'Check out this delicious {title}! {description} #recipe #cooking',
});
export const savePinterestSettings = (userId: string, settings: import('../types').PinterestSettings): void => setItem(getNamespacedKey(PINTEREST_SETTINGS_KEY, userId), settings);

// License Keys (Global)
export const getLicenseKeys = (): LicenseKey[] => {
    const keys = getItem<any[]>(LICENSE_KEYS_KEY, []);
    let needsUpdate = false;
    // Fix: Explicitly type the mapped array and the new key object to ensure type conformity.
    const migratedKeys: LicenseKey[] = keys.map(key => {
        if (typeof key.isAssigned !== 'undefined' || !key.id) {
            needsUpdate = true;
            const validTypes: LicenseKey['type'][] = ['pro', 'unlimited', 'special'];
            const newKey: LicenseKey = {
                id: key.id || crypto.randomUUID(),
                key: key.key,
                type: validTypes.includes(key.type) ? key.type : 'pro',
                status: key.isAssigned ? 'active' : 'inactive',
                assignedTo: key.assignedTo || null,
                assignedEmail: key.assignedEmail || '',
                createdAt: key.createdAt || new Date().toISOString(),
                expiresAt: key.expiresAt || null,
                notes: key.notes || '',
            };
            return newKey;
        }
        return key as LicenseKey;
    });

    if (needsUpdate) {
        saveLicenseKeys(migratedKeys);
    }
    
    return migratedKeys;
};
export const saveLicenseKeys = (keys: LicenseKey[]): void => setItem(LICENSE_KEYS_KEY, keys);

// Notifications (Global)
export const getNotifications = (): Notification[] => {
    const notifications = getItem<any[]>(NOTIFICATIONS_KEY, []);
    // Migration for old notification format
    return notifications.map(n => {
        if (typeof n.message === 'string' && !n.title) {
            return {
                ...n,
                title: 'General Announcement',
                status: 'sent',
                targetGroup: 'all',
                scheduledAt: null,
                stats: { sent: 0 } // Cannot determine sent count for old notifications
            };
        }
        return n as Notification;
    });
};
export const saveNotifications = (notifications: Notification[]): void => setItem(NOTIFICATIONS_KEY, notifications);


// Referrals (Global)
export const getReferrals = (): Referral[] => getItem<Referral[]>(REFERRALS_KEY, []);
export const saveReferrals = (referrals: Referral[]): void => setItem(REFERRALS_KEY, referrals);

// Admin Settings (Global)
export const getAdminSettings = (): AdminSettings => getItem<AdminSettings>(ADMIN_SETTINGS_KEY, { 
    referralBonus: 10,
    branding: {
        appName: 'RecipePress Blog AI',
        logoUrl: null,
        primaryColor: '#0d9488', // tailwind teal-600
    },
    automations: {
        autoDeleteExpiredKeys: false,
        autoRewardReferrals: true,
        sendInactiveReminders: false,
        inactiveUserThresholdDays: 30,
    },
    email: {
        provider: 'mock',
        apiKey: '',
        fromEmail: '',
    },
    payment: {
        provider: 'mock',
        publicKey: '',
        secretKey: '',
    },
    notificationTemplates: [
        { id: 'welcome', name: 'Welcome Message', subject: 'Welcome to {{appName}}!', body: 'Hi {{userName}},\n\nWelcome aboard! We are excited to have you.\n\nBest,\nThe {{appName}} Team', placeholders: ['{{userName}}', '{{appName}}'] },
        { id: 'inactive', name: 'Inactive User Reminder', subject: 'We Miss You at {{appName}}!', body: 'Hi {{userName}},\n\nIt\'s been a while since you last logged in. We have new features we think you\'ll love!\n\nBest,\nThe {{appName}} Team', placeholders: ['{{userName}}', '{{appName}}'] }
    ],
    affiliateSettings: {
        textSnippets: `My Favorite Grill: https://amazon.com/link-to-grill\nQuality Chef's Knife: https://amazon.com/link-to-knife`,
        visuals: [],
    },
    languageSettings: [
        { id: 'en-US', code: 'en-US', name: 'English (United States)', isEnabled: true, isDefault: true },
        { id: 'es-ES', code: 'es-ES', name: 'Español (España)', isEnabled: false, isDefault: false },
    ],
    scheduledReports: [],
});
export const saveAdminSettings = (settings: AdminSettings): void => setItem(ADMIN_SETTINGS_KEY, settings);

// Activity Logs (Global)
export const getActivityLogs = (): ActivityLog[] => getItem<ActivityLog[]>(ACTIVITY_LOG_KEY, []);
export const saveActivityLogs = (logs: ActivityLog[]): void => setItem(ACTIVITY_LOG_KEY, logs);

export const addActivityLog = (logData: Omit<ActivityLog, 'id' | 'timestamp'>): void => {
    try {
        const logs = getActivityLogs();
        const newLog: ActivityLog = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            ...logData
        };
        const updatedLogs = [newLog, ...logs].slice(0, MAX_ACTIVITY_LOGS);
        saveActivityLogs(updatedLogs);
    } catch (error) {
        console.error("Failed to add activity log:", error);
    }
};


// Support Tickets (Global)
export const getSupportTickets = (): SupportTicket[] => getItem<SupportTicket[]>(SUPPORT_TICKETS_KEY, [
    {
        id: 'ticket-1',
        userId: 'user-123',
        userName: 'John Doe',
        userEmail: 'john.doe@example.com',
        subject: 'Cannot connect my site',
        message: 'I followed the instructions but I keep getting a CORS error. I have added the .htaccess rules. My site is example.com.',
        status: 'open',
        priority: 'high',
        category: 'technical',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        assignedTo: null,
        replies: []
    },
    {
        id: 'ticket-2',
        userId: 'user-456',
        userName: 'Jane Smith',
        userEmail: 'jane.smith@example.com',
        subject: 'Question about billing',
        message: 'How do I upgrade my plan to Pro? I don\'t see an option.',
        status: 'in-progress',
        priority: 'medium',
        category: 'billing',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        assignedTo: 'admin-user-123',
        replies: [
            {
                id: 'reply-1',
                authorId: 'admin-user-123',
                authorName: 'Admin User',
                message: 'Hi Jane, you can upgrade by going to the pricing page. Let me know if you have any issues!',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
            }
        ]
    },
    {
        id: 'ticket-3',
        userId: 'user-789',
        userName: 'Sam Wilson',
        userEmail: 'sam.wilson@example.com',
        subject: 'Great App!',
        message: 'Just wanted to say this app is amazing and has saved me so much time!',
        status: 'closed',
        priority: 'low',
        category: 'general',
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days ago
        updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        assignedTo: 'admin-user-123',
        replies: [
             {
                id: 'reply-2',
                authorId: 'admin-user-123',
                authorName: 'Admin User',
                message: 'Thanks so much for the kind words, Sam! We appreciate it.',
                createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
            }
        ]
    }
]);
export const saveSupportTickets = (tickets: SupportTicket[]): void => setItem(SUPPORT_TICKETS_KEY, tickets);

// Feedback (Global)
export const getFeedback = (): Feedback[] => getItem<Feedback[]>(FEEDBACK_KEY, [
    {
        id: 'feedback-1',
        userId: 'user-123',
        userName: 'John Doe',
        type: 'suggestion',
        message: 'It would be great if we could bulk regenerate recipe cards for posts without them.',
        createdAt: new Date().toISOString(),
        isArchived: false,
        pageContext: 'dashboard/update'
    }
]);
export const saveFeedback = (feedback: Feedback[]): void => setItem(FEEDBACK_KEY, feedback);

// Quick Reply Templates (Global)
export const getQuickReplyTemplates = (): QuickReplyTemplate[] => getItem<QuickReplyTemplate[]>(QUICK_REPLY_TEMPLATES_KEY, [
    {
        id: 'template-1',
        title: 'CORS Issue Greeting',
        content: 'Hi there,\n\nThanks for reaching out. CORS errors can be tricky. Have you tried adding the .htaccess rules from the onboarding guide? Let me know your site URL and I can take a closer look.\n\nBest,\nSupport Team'
    },
    {
        id: 'template-2',
        title: 'Upgrade Instructions',
        content: 'Hello,\n\nTo upgrade your plan, simply click on the "Pricing" tab in the app header. From there you can select the Pro plan.\n\nLet us know if you have any other questions!\n\nThanks,\nSupport Team'
    }
]);
export const saveQuickReplyTemplates = (templates: QuickReplyTemplate[]): void => setItem(QUICK_REPLY_TEMPLATES_KEY, templates);


// User Data Management
export const deleteUserData = (userId: string): void => {
    const keysToRemove = [
        getNamespacedKey(SITES_KEY, userId),
        getNamespacedKey(POSTS_KEY, userId),
        getNamespacedKey(API_KEY_KEY, userId),
        getNamespacedKey(AGENT_SETTINGS_KEY, userId),
    ];
    keysToRemove.forEach(key => {
        try {
            window.localStorage.removeItem(key);
        } catch (error) {
            console.error(`Failed to remove key ${key} for user ${userId}`, error);
        }
    });
};
