import type { User, LicenseKey, Referral, ToastType } from '../types';

const downloadCSV = (csvContent: string, filename: string) => {
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const showToast = (toastFunc: (message: string, type?: ToastType) => void, message: string, type: ToastType) => {
    toastFunc(message, type);
};

export const exportUsersToCSV = (users: User[], toastFunc: (message: string, type?: ToastType) => void) => {
    if (users.length === 0) {
        showToast(toastFunc, 'No user data to export.', 'error');
        return;
    }
    
    const headers = ["ID", "Name", "Email", "Role", "Plan", "Status", "Registered At", "Last Login", "Posts Generated", "Bonus Articles", "Referral Code", "Referred By ID"];
    const csvRows = [
        headers.join(','),
        ...users.map(u => [
            u.id,
            `"${u.name.replace(/"/g, '""')}"`,
            u.email,
            u.role,
            u.plan,
            u.status,
            `"${u.registeredAt}"`,
            `"${u.lastLogin}"`,
            u.postsGenerated,
            u.bonusArticles,
            u.referralCode,
            u.referredBy || 'N/A'
        ].join(','))
    ];
    
    downloadCSV("data:text/csv;charset=utf-8," + csvRows.join('\n'), "recipepress-users.csv");
    showToast(toastFunc, 'User data exported.', 'success');
};


export const exportLicenseKeysToCSV = (keys: LicenseKey[], toastFunc: (message: string, type?: ToastType) => void) => {
    if (keys.length === 0) {
        showToast(toastFunc, 'No license keys to export.', 'error');
        return;
    }

    const headers = ["Key", "Type", "Status", "Assigned To Email", "Created At", "Expires At", "Notes"];
    const csvRows = [
        headers.join(","),
        ...keys.map(k => [
            `"${k.key}"`,
            k.type,
            k.status,
            `"${k.assignedEmail || 'N/A'}"`,
            `"${k.createdAt}"`,
            `"${k.expiresAt || 'N/A'}"`,
            `"${k.notes.replace(/"/g, '""')}"`
        ].join(","))
    ];

    downloadCSV("data:text/csv;charset=utf-8," + csvRows.join("\n"), "recipepress-keys.csv");
    showToast(toastFunc, 'License keys exported.', 'success');
};


export const exportReferralsToCSV = (referrals: Referral[], users: User[], toastFunc: (message: string, type?: ToastType) => void) => {
     if(referrals.length === 0) {
        showToast(toastFunc, 'No referral data to export.', 'error');
        return;
    }
    
    const allUsers = [...users, ...users.filter(u => u.role === 'owner' || u.role === 'admin')]; // Make sure we have all users
    const referralsWithEmails = referrals.map(ref => {
            const referrer = allUsers.find(u => u.id === ref.referrerId);
            const referred = allUsers.find(u => u.id === ref.referredId);
            return {
                ...ref,
                referrerEmail: referrer?.email || 'N/A',
                referredEmail: referred?.email || 'N/A',
            }
        });

    const headers = ["Referred User", "Referred Email", "Referrer", "Referrer Email", "Signup Date", "Converted", "Conversion Date"];
    const csvRows = [
        headers.join(','),
        ...referralsWithEmails.map(ref => [
            `"${ref.referredName.replace(/"/g, '""')}"`,
            `"${ref.referredEmail}"`,
            `"${ref.referrerName.replace(/"/g, '""')}"`,
            `"${ref.referrerEmail}"`,
            `"${new Date(ref.timestamp).toISOString()}"`,
            ref.converted ? "Yes" : "No",
            `"${ref.convertedAt ? new Date(ref.convertedAt).toISOString() : 'N/A'}"`
        ].join(','))
    ];
    
    downloadCSV("data:text/csv;charset=utf-8," + csvRows.join('\n'), "recipepress-referrals.csv");
    showToast(toastFunc, 'Referral data exported.', 'success');
};