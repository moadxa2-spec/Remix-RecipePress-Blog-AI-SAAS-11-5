import type { User, LicenseKey, Referral } from '../types';
import * as dataService from './dataService';

const SESSION_KEY = 'recipepress-user-session';
const USERS_DB_KEY = 'recipepress-users-db';

// MOCK IMPLEMENTATION - Replace with actual API calls to your backend

// Helper to get all users from our mock DB, with migration for new fields
const getAllUsersFromDb = (): User[] => {
    try {
        const usersJSON = localStorage.getItem(USERS_DB_KEY);
        let users = usersJSON ? JSON.parse(usersJSON) : [];
        
        // One-time migration for existing users
        let needsUpdate = false;
        const migratedUsers = users.map((user: Partial<User> & { plan?: 'owner' }) => {
            const updatedUser: Partial<User> = { ...user };
            let userWasUpdated = false;

            // Migrate old 'admin' role to 'owner'
            if (user.role === 'admin') {
                updatedUser.role = 'owner';
                userWasUpdated = true;
            }

            // Migrate 'owner' from plan to role
            if (user.plan === 'owner') {
                updatedUser.role = 'owner';
                updatedUser.plan = 'pro';
                userWasUpdated = true;
            }

            if (!user.status) { updatedUser.status = 'active'; userWasUpdated = true; }
            if (!user.lastLogin) { updatedUser.lastLogin = user.registeredAt || new Date().toISOString(); userWasUpdated = true; }
            if (user.postsGenerated === undefined) { updatedUser.postsGenerated = 0; userWasUpdated = true; }
            if (user.twoFactorEnabled === undefined) { updatedUser.twoFactorEnabled = false; userWasUpdated = true; }
            if (user.lastReminderSentAt === undefined) { updatedUser.lastReminderSentAt = null; userWasUpdated = true; }

            if (userWasUpdated) {
                needsUpdate = true;
            }

            return updatedUser;
        });

        if (needsUpdate) {
            saveUsersToDb(migratedUsers as User[]);
        }

        return migratedUsers as User[];

    } catch (e) {
        return [];
    }
};

// Helper to save all users to our mock DB
const saveUsersToDb = (users: User[]) => {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
};

// Initialize admin user if not present
const initializeAdmin = () => {
    const users = getAllUsersFromDb();
    const ownerExists = users.some(u => u.role === 'owner');
    if (!ownerExists) {
        users.push({
            id: 'admin-user-123',
            email: 'admin@recipepress.ai',
            name: 'Admin User',
            role: 'owner',
            plan: 'pro', // Owners are always pro
            status: 'active',
            registeredAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            postsGenerated: 0,
            referralCode: 'ADMIN-REF',
            referredBy: null,
            bonusArticles: 999,
            apiToken: `rp-admin-secret-token-${crypto.randomUUID()}`,
            twoFactorEnabled: false,
            lastReminderSentAt: null,
        });
        saveUsersToDb(users);
    }
};
initializeAdmin();


export function getCurrentUser(): User | null {
    try {
        // Prioritize localStorage for "Remember me"
        const localSession = localStorage.getItem(SESSION_KEY);
        if (localSession) {
            return JSON.parse(localSession);
        }
        // Fallback to sessionStorage for regular sessions
        const session = sessionStorage.getItem(SESSION_KEY);
        return session ? JSON.parse(session) : null;
    } catch (error) {
        console.error("Failed to get user session", error);
        return null;
    }
}

function saveSession(user: User, rememberMe: boolean = false) {
    try {
        if (rememberMe) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(user));
            sessionStorage.removeItem(SESSION_KEY);
        } else {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
            localStorage.removeItem(SESSION_KEY);
        }
    } catch (error) {
        console.error("Failed to save user session", error);
    }
}

export function login(email?: string, password?: string, rememberMe: boolean = false): Promise<User & { twoFactorRequired?: boolean }> {
    return new Promise((resolve, reject) => {
        if (!email) {
            dataService.addActivityLog({ actorId: 'anonymous', actorName: 'System', action: 'login_failed', details: `Failed login attempt for empty email.` });
            return reject(new Error("Email is required."));
        }
        let users = getAllUsersFromDb();
        const userIndex = users.findIndex(u => u.email === email);
        const user = users[userIndex];
        
        if (!user) {
            dataService.addActivityLog({ actorId: 'anonymous', actorName: email, action: 'login_failed', details: `User not found.` });
            return reject(new Error("User not found."));
        }
        
        if (user.status === 'banned') {
            dataService.addActivityLog({ actorId: user.id, actorName: user.name, action: 'login_failed', details: `Attempted login while banned.` });
            return reject(new Error("This account has been banned."));
        }
        if (user.status === 'suspended') {
            dataService.addActivityLog({ actorId: user.id, actorName: user.name, action: 'login_failed', details: `Attempted login while suspended.` });
            return reject(new Error("This account is temporarily suspended."));
        }

        // In a real app, you would hash and verify the password. Here we just check for existence.
        if (!password) {
            dataService.addActivityLog({ actorId: user.id, actorName: user.name, action: 'login_failed', details: `Attempted login with no password.` });
            return reject(new Error("Invalid password."));
        }

        // If 2FA is enabled, return a special response
        if (user.twoFactorEnabled) {
            resolve({ ...user, twoFactorRequired: true });
            return;
        }

        // Update last login time
        user.lastLogin = new Date().toISOString();
        users[userIndex] = user;
        saveUsersToDb(users);
        dataService.addActivityLog({ actorId: user.id, actorName: user.name, action: 'login_success' });
        
        saveSession(user, rememberMe);
        resolve(user);
    });
}

export function verify2FA(userId: string, code: string, rememberMe: boolean = false): Promise<User> {
    return new Promise((resolve, reject) => {
        let users = getAllUsersFromDb();
        const userIndex = users.findIndex(u => u.id === userId);
        const user = users[userIndex];

        if (!user) {
            return reject(new Error("User not found."));
        }

        // MOCK: In a real app, you would verify the code against the user's secret.
        // Here, we'll just use a static code for demonstration.
        if (code === '123456') {
            user.lastLogin = new Date().toISOString();
            users[userIndex] = user;
            saveUsersToDb(users);
            dataService.addActivityLog({ actorId: user.id, actorName: user.name, action: 'login_success_2fa' });
            saveSession(user, rememberMe);
            resolve(user);
        } else {
            dataService.addActivityLog({ actorId: user.id, actorName: user.name, action: 'login_failed_2fa', details: 'Invalid 2FA code.' });
            reject(new Error("Invalid verification code."));
        }
    });
}


export function loginWithGoogle(): Promise<User> {
    // This is a mock. A real implementation would involve a popup and token exchange.
    return signup('Google User', `google-user-${Date.now()}@example.com`, 'password');
}

export function signup(name?: string, email?: string, password?: string, licenseKey?: string, referralCode?: string): Promise<User> {
    return new Promise((resolve, reject) => {
        if (!name || !email) return reject(new Error("Name and email are required."));
        
        let users = getAllUsersFromDb();
        if (users.some(u => u.email === email)) {
            return reject(new Error("An account with this email already exists."));
        }

        const now = new Date().toISOString();
        const newUser: User = {
            id: `user-${crypto.randomUUID()}`,
            email,
            name,
            role: 'user',
            plan: 'free',
            status: 'active',
            registeredAt: now,
            lastLogin: now,
            postsGenerated: 0,
            referralCode: `REF-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
            referredBy: null,
            bonusArticles: 0,
            twoFactorEnabled: false,
            lastReminderSentAt: null,
        };

        if (licenseKey) {
            const allKeys = dataService.getLicenseKeys();
            const keyIndex = allKeys.findIndex(k => k.key === licenseKey && k.status === 'inactive');
            const targetKey = allKeys[keyIndex];

            if (targetKey) {
                newUser.plan = 'pro';
                newUser.licenseKey = licenseKey;
                targetKey.status = 'active';
                targetKey.assignedTo = newUser.id;
                targetKey.assignedEmail = newUser.email;
                allKeys[keyIndex] = targetKey;
                dataService.saveLicenseKeys(allKeys);
            } else {
                return reject(new Error("The provided license key is invalid, already in use, or expired."));
            }
        }
        
        let referrer: User | undefined;
        if (referralCode) {
            const referrerIndex = users.findIndex(u => u.referralCode === referralCode);
            if (referrerIndex !== -1) {
                const adminSettings = dataService.getAdminSettings();
                referrer = users[referrerIndex];
                referrer.bonusArticles = (referrer.bonusArticles || 0) + adminSettings.referralBonus;
                users[referrerIndex] = referrer;
                newUser.referredBy = referrer.id;

                const referrals = dataService.getReferrals();
                const newReferral: Referral = {
                    id: crypto.randomUUID(),
                    referrerId: referrer.id,
                    referrerName: referrer.name,
                    referredId: newUser.id,
                    referredName: newUser.name,
                    timestamp: new Date().toISOString(),
                    converted: newUser.plan === 'pro',
                    convertedAt: newUser.plan === 'pro' ? new Date().toISOString() : null,
                };
                dataService.saveReferrals([newReferral, ...referrals]);
            }
        }
        
        users.push(newUser);
        saveUsersToDb(users);
        saveSession(newUser);
        dataService.addActivityLog({
            actorId: newUser.id,
            actorName: newUser.name,
            action: 'user_signup',
            details: `Signed up with ${licenseKey ? 'license key' : 'free plan'}.${referrer ? ` Referred by ${referrer.name}.` : ''}`
        });
        resolve(newUser);
    });
}

export function logout(): void {
    const user = getCurrentUser();
    if(user) {
        dataService.addActivityLog({ actorId: user.id, actorName: user.name, action: 'user_logout' });
    }
    try {
        sessionStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(SESSION_KEY);
    } catch (error) {
        console.error("Failed to clear user session", error);
    }
}

// --- Admin Functions ---

export const getAllUsers = (): Promise<User[]> => {
    return Promise.resolve(getAllUsersFromDb());
}

export const updateUser = (userId: string, updates: Partial<User>): Promise<User> => {
    return new Promise((resolve, reject) => {
        const users = getAllUsersFromDb();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return reject(new Error("User not found"));
        }
        
        const originalUser = { ...users[userIndex] };

        // Permission checks
        const currentUser = getCurrentUser();
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'owner')) {
            // Self-service updates (like 2FA) are allowed
            if (currentUser?.id !== userId) {
                 return reject(new Error("Permission denied."));
            }
        }
        
        if (originalUser.role === 'owner' && updates.role && updates.role !== 'owner') {
             return reject(new Error("The owner's role cannot be changed."));
        }
        
        if (currentUser.role === 'admin' && (originalUser.role === 'owner' || (originalUser.role === 'admin' && originalUser.id !== currentUser.id))) {
             return reject(new Error("Admins cannot modify other admins or owners."));
        }
        
        if (originalUser.role === 'owner' && updates.role && updates.role !== 'owner') {
            const ownerCount = users.filter(u => u.role === 'owner').length;
            if (ownerCount <= 1) {
                return reject(new Error("Cannot remove the last owner."));
            }
        }

        const updatedUser = { ...originalUser, ...updates };
        users[userIndex] = updatedUser;
        saveUsersToDb(users);

        // Logging the changes
        const changes = Object.keys(updates).filter(key => originalUser[key as keyof User] !== updatedUser[key as keyof User]).map(key => `${key}: from '${originalUser[key as keyof User]}' to '${updatedUser[key as keyof User]}'`).join(', ');
        if (changes) {
             dataService.addActivityLog({
                actorId: currentUser.id,
                actorName: currentUser.name,
                action: 'user_update',
                targetType: 'user',
                targetId: updatedUser.id,
                details: `Updated ${updatedUser.name}: ${changes}`
            });
        }
        
        // if current user is being updated, update session as well
        if(currentUser && currentUser.id === userId) {
            saveSession(updatedUser);
        }

        resolve(updatedUser);
    });
};

export const deleteUser = (userId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        let users = getAllUsersFromDb();
        const userToDelete = users.find(u => u.id === userId);

        if (!userToDelete) {
             return reject(new Error("User not found"));
        }
        
        if (userToDelete.role === 'owner') {
            return reject(new Error("The owner account cannot be deleted."));
        }
        
        // Permission check
        const currentUser = getCurrentUser();
         if (!currentUser || currentUser.role === 'user' || currentUser.role === 'support') {
             return reject(new Error("Permission denied."));
         }
         
         if (currentUser.role === 'admin' && userToDelete.role === 'admin') {
            return reject(new Error("Admins cannot delete other admins or owners."));
         }

        users = users.filter(u => u.id !== userId);
        saveUsersToDb(users);
        
        dataService.addActivityLog({
            actorId: currentUser.id,
            actorName: currentUser.name,
            action: 'user_delete',
            targetType: 'user',
            targetId: userToDelete.id,
            details: `Deleted user ${userToDelete.name} (${userToDelete.email})`
        });

        if (userToDelete.licenseKey) {
            const allKeys = dataService.getLicenseKeys();
            const keyIndex = allKeys.findIndex(k => k.key === userToDelete.licenseKey);
            if (keyIndex !== -1) {
                allKeys[keyIndex].status = 'inactive';
                allKeys[keyIndex].assignedTo = null;
                allKeys[keyIndex].assignedEmail = '';
                dataService.saveLicenseKeys(allKeys);
            }
        }
        resolve();
    });
};

export const adminCreateUser = (userData: Partial<User>, password?: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        const currentUser = getCurrentUser();
        if (!currentUser || currentUser.role !== 'owner') {
            return reject(new Error("Only owners can create staff accounts."));
        }

        if (!userData.name || !userData.email || !password || !userData.role || !userData.plan) {
            return reject(new Error("Missing required fields for creating a new user."));
        }
        let users = getAllUsersFromDb();
        if (users.some(u => u.email === userData.email)) {
            return reject(new Error("An account with this email already exists."));
        }

        const now = new Date().toISOString();
        const newUser: User = {
            id: `user-${crypto.randomUUID()}`,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            plan: userData.plan,
            status: 'active',
            registeredAt: now,
            lastLogin: now,
            postsGenerated: 0,
            referralCode: `REF-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
            referredBy: null,
            bonusArticles: 0,
            twoFactorEnabled: false,
            ...userData
        };

        // Note: Password handling would be different in a real backend.
        // We aren't actually using the password here, but it's passed for completeness.
        
        users.push(newUser);
        saveUsersToDb(users);
        
        dataService.addActivityLog({
            actorId: currentUser.id,
            actorName: currentUser.name,
            action: 'user_create',
            targetType: 'user',
            targetId: newUser.id,
            details: `Created new ${newUser.role} account for ${newUser.name}`
        });
        
        resolve(newUser);
    });
}


export const incrementPostsGenerated = (userId: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        const users = getAllUsersFromDb();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return reject(new Error("User not found for incrementing post count"));
        }
        const user = users[userIndex];
        user.postsGenerated = (user.postsGenerated || 0) + 1;
        users[userIndex] = user;
        saveUsersToDb(users);

        // if it's the current user, update their session too
        const currentUser = getCurrentUser();
        if(currentUser && currentUser.id === userId) {
            saveSession(user);
        }

        resolve(user);
    });
};

export const enable2FA = (userId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const users = getAllUsersFromDb();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return reject(new Error("User not found"));
        }
        const secret = `SECRET_${crypto.randomUUID().slice(0,16).toUpperCase()}`;
        users[userIndex].twoFactorEnabled = true;
        users[userIndex].twoFactorSecret = secret;
        saveUsersToDb(users);

        const currentUser = getCurrentUser();
        if(currentUser && currentUser.id === userId) {
            saveSession(users[userIndex]);
        }
        
        dataService.addActivityLog({ actorId: userId, actorName: users[userIndex].name, action: 'security_2fa_enabled' });

        resolve(secret);
    });
};

export const disable2FA = (userId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const users = getAllUsersFromDb();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return reject(new Error("User not found"));
        }
        users[userIndex].twoFactorEnabled = false;
        users[userIndex].twoFactorSecret = undefined;
        saveUsersToDb(users);

        const currentUser = getCurrentUser();
        if(currentUser && currentUser.id === userId) {
            saveSession(users[userIndex]);
        }

        dataService.addActivityLog({ actorId: userId, actorName: users[userIndex].name, action: 'security_2fa_disabled' });

        resolve();
    });
};

export const regenerateApiToken = (userId: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        const currentUser = getCurrentUser();
        if (!currentUser || currentUser.role !== 'owner' || currentUser.id !== userId) {
            return reject(new Error("Permission denied to regenerate API token."));
        }

        let users = getAllUsersFromDb();
        const userIndex = users.findIndex(u => u.id === userId && u.role === 'owner');

        if (userIndex === -1) {
            return reject(new Error("Owner user not found."));
        }

        const newApiToken = `rp-admin-secret-token-${crypto.randomUUID()}`;
        users[userIndex].apiToken = newApiToken;
        saveUsersToDb(users);
        saveSession(users[userIndex]); // Update session for the current user

        dataService.addActivityLog({
            actorId: currentUser.id,
            actorName: currentUser.name,
            action: 'api_token_regenerated'
        });

        resolve(users[userIndex]);
    });
};