
export type EmailProvider = 'mock' | 'sendgrid' | 'mailgun';
export type PaymentProvider = 'mock' | 'stripe' | 'paypal';

export interface EmailSettings {
    provider: EmailProvider;
    apiKey: string;
    fromEmail: string;
}

export interface PaymentSettings {
    provider: PaymentProvider;
    publicKey: string;
    secretKey: string;
}

export interface NotificationTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    placeholders: string[];
}

export interface AffiliateVisual {
    id: string;
    name: string;
    imageUrl: string; // base64 or URL
    targetUrl: string;
}

export interface AffiliateSettings {
    textSnippets: string; // Replaces the old affiliateLinks string
    visuals: AffiliateVisual[];
}

export interface LanguageSetting {
    id: string;
    code: string; // e.g., 'en-US'
    name: string; // e.g., 'English (United States)'
    isEnabled: boolean;
    isDefault: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'support' | 'admin' | 'owner';
  plan: 'free' | 'pro';
  status: 'active' | 'suspended' | 'banned';
  licenseKey?: string;
  registeredAt: string;
  lastLogin: string;
  postsGenerated: number;
  referralCode: string;
  referredBy: string | null;
  bonusArticles: number;
  apiToken?: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  lastReminderSentAt?: string | null;
}

export interface LicenseKey {
  id: string;
  key: string;
  type: 'pro' | 'unlimited' | 'special';
  status: 'active' | 'inactive' | 'expired' | 'revoked';
  assignedTo: string | null;
  assignedEmail?: string;
  createdAt: string;
  expiresAt: string | null;
  notes: string;
}

export interface Referral {
    id: string;
    referrerId: string;
    referrerName: string;
    referredId: string;
    referredName: string;
    timestamp: string;
    converted: boolean;
    convertedAt: string | null;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  status: 'sent' | 'scheduled' | 'draft';
  targetGroup: 'all' | 'free' | 'pro';
  timestamp: string; // Used as creation/sent date
  scheduledAt: string | null;
  stats: {
    sent: number;
    opens?: number; // For future use
    clicks?: number; // For future use
  };
  read?: boolean;
}

export interface SupportTicket {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    subject: string;
    message: string;
    status: 'open' | 'in-progress' | 'closed';
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
    updatedAt: string;
    assignedTo: string | null; // User ID of admin/support
    replies: TicketReply[];
    category: 'technical' | 'billing' | 'general';
}

export interface TicketReply {
    id: string;
    authorId: string;
    authorName: string;
    message: string;
    createdAt: string;
}

export interface Feedback {
    id: string;
    userId: string | null;
    userName: string; // Could be anonymous
    type: 'bug' | 'suggestion' | 'praise';
    message: string;
    createdAt: string;
    isArchived: boolean;
    pageContext?: string; // e.g., 'dashboard', 'settings/sites'
}

export interface QuickReplyTemplate {
    id: string;
    title: string;
    content: string;
}

export interface NutritionData {
  servingSize?: string;
  calories?: string;
  sugarContent?: string;
  sodiumContent?: string;
  fatContent?: string;
  saturatedFatContent?: string;
  unsaturatedFatContent?: string;
  transFatContent?: string;
  carbohydrateContent?: string;
  fiberContent?: string;
  proteinContent?: string;
  cholesterolContent?: string;
}

export interface RecipeData {
  name: string;
  description: string;
  prep_time: string;
  cook_time: string;
  total_time: string;
  yield: string;
  keywords: string[];
  cuisine: string;
  category: string;
  ingredients: string[];
  instructions: string[];
  notes?: string;
  image?: string; // base64 string or URL
  image_alt?: string;
  image_title?: string;
  image_description?: string;
  method?: string;
  diet?: string;
  video_url?: string;
  nutrition?: NutritionData;
  aggregateRating?: {
    ratingValue: string;
    ratingCount: number;
  };
}

export interface GeneratedPost {
  post_title: string;
  post_content: string;
  recipe_data: RecipeData;
  focus_keyword?: string;
  meta_description?: string;
  slug?: string;
  faqSchema?: any;
}

export interface WordPressSite {
  id: string;
  name: string;
  url: string;
  siteToken: string;
}

export interface RecipeDetails {
  has_card: boolean;
  has_ingredients: boolean;

  has_instructions: boolean;
  recipe_id?: number | null;
}

export interface WordPressPost {
  id: number;
  title: string;
  link: string;
  recipe_details: RecipeDetails;
  post_status: string;
  has_recipe?: boolean;
  featured_image_url?: string | null;
  // New fields for detailed analysis
  word_count: number;
  headline_counts: { [key: string]: number };
  image_count: number;
  focus_keyword: string | null;
  language: string;
  has_meta_description: boolean;
  has_recipe_schema: boolean;
  has_faq_schema: boolean;
}

export type PublishStatus = 'generating' | 'draft' | 'publishing' | 'published' | 'failed' | 'queued' | 'scheduled';

export interface PostHistoryItem extends GeneratedPost {
  id: string;
  siteId: string;
  siteName: string;
  targetPostId: number;
  targetPostTitle: string;
  status: PublishStatus;
  publishedAt: string;
  publishedUrl?: string;
  pinterestStatus?: 'posted' | 'failed' | 'skipped';
  pinterestUrl?: string;
  error?: string;
  intendedStatus?: 'publish' | 'draft' | 'schedule';
  scheduledAt?: string | null;
  generationType?: 'full' | 'intro';
  imageStrategy?: 'keep' | 'regenerate';
  sourceData?: {
    generationType: 'full' | 'intro';
    generationTab: 'keyword' | 'text';
    primaryKeyword: string;
    recipeText: string;
    imageConfig: ImageConfiguration;
  }
}

export type View = 'dashboard' | 'ebook' | 'history' | 'onboarding' | 'settings' | 'landing' | 'login' | 'signup' | 'pricing' | 'admin' | 'about' | 'privacy' | 'corrections';

export type SettingsTab = 'sites' | 'gemini' | 'articleAgent' | 'pinterest' | 'logs' | 'aiMemory' | 'referrals' | 'api' | 'security';

export type ToastType = 'success' | 'error';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastMessage {
  message: string;
  type: ToastType;
  persistent?: boolean;
  action?: ToastAction;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  method: string;
  endpoint: string;
  status?: number;
  requestPayload?: any;
  response?: any;
  error?: string;
}

// FIX: Added AIMemoryLogEntry interface to resolve import error in AIMemoryLogViewer.
export interface AIMemoryLogEntry {
  id: string;
  timestamp: string;
  agent: string;
  primaryKeyword: string;
  reasoning: string;
}

export interface KnowledgeFile {
  name: string;
  content: string;
}

export interface PinterestSettings {
  token: string | null;
  boardId: string | null;
  autoPost: boolean;
  descriptionTemplate: string;
}

export interface ArticleAgentSettings {
  mainPrompt: string;
  internalLinks: number;
  externalLinks: number;
  knowledgeFiles: KnowledgeFile[];
}

export type ImageGenerationOption = 'generate' | 'upload' | 'variation';

export interface ImageConfiguration {
    option: ImageGenerationOption;
    uploadedImage: {
        base64: string;
        mimeType: string;
    } | null;
}

export interface BrandingSettings {
    appName: string;
    logoUrl: string | null;
    primaryColor: string;
}

export interface AutomationsSettings {
    autoDeleteExpiredKeys: boolean;
    autoRewardReferrals: boolean;
    sendInactiveReminders: boolean;
    inactiveUserThresholdDays: number;
}

export interface ScheduledReport {
  id: string;
  type: 'users' | 'keys' | 'referrals';
  frequency: 'daily' | 'weekly' | 'monthly';
  recipientEmail: string;
  lastSent: string | null;
}

export interface AdminSettings {
    referralBonus: number;
    branding: BrandingSettings;
    automations: AutomationsSettings;
    email: EmailSettings;
    payment: PaymentSettings;
    notificationTemplates: NotificationTemplate[];
    affiliateSettings: AffiliateSettings;
    languageSettings: LanguageSetting[];
    scheduledReports: ScheduledReport[];
}

export interface EditUserModalProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Partial<User>, password?: string) => void;
    currentUser: User;
    isSaving: boolean;
}

export interface ActivityLog {
    id: string;
    timestamp: string;
    actorId: string;
    actorName: string; // Denormalized for easy display
    action: string;
    targetType?: string;
    targetId?: string;
    details?: string;
}
