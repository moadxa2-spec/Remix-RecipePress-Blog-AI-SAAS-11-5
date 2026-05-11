// Pinterest API v5 Configuration & Services

const PINTEREST_APP_ID = import.meta.env.VITE_PINTEREST_APP_ID;

// We use the Shared App URL instead of window.location.origin because the Dev URL (ais-dev) is protected
// by a Google Google Auth Bridge that drops cookies in popups, causing a 403 Error.
// The Shared App URL is public and bypasses the proxy.
export const PINTEREST_REDIRECT_URI = import.meta.env.VITE_PINTEREST_REDIRECT_URI || 'https://ais-pre-l2qhs426fv6cokflllgb3j-73652577237.europe-west3.run.app/';

export interface PinterestBoard {
    id: string;
    name: string;
}

export function getPinterestAuthUrl(): string {
    if (!PINTEREST_APP_ID) {
        throw new Error('VITE_PINTEREST_APP_ID is not set in the environment.');
    }
    // Pinterest v5 requires space-separated scopes
    const scopes = "boards:read boards:write pins:read pins:write user_accounts:read"; 
    
    return `https://www.pinterest.com/oauth/?client_id=${PINTEREST_APP_ID}&redirect_uri=${encodeURIComponent(PINTEREST_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scopes)}&force_authentication=true`;
}

export async function exchangePinterestCodeForToken(code: string): Promise<string> {
    const response = await fetch('/api/pinterest/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            code: code,
            redirect_uri: PINTEREST_REDIRECT_URI
        })
    });

    if (!response.ok) {
        const errRef = await response.text();
        throw new Error(`Failed to exchange Pinterest token: ${response.status} - ${errRef}`);
    }

    const data = await response.json();
    return data.token || data.access_token;
}

export async function getPinterestBoards(accessToken: string): Promise<PinterestBoard[]> {
    const response = await fetch('/api/pinterest/boards', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        const errRef = await response.text();
        if (response.status === 401) {
            throw new Error(`Authentication failed. Your token is likely expired. Please go to Settings, Disconnect Pinterest, and Connect again.`);
        }
        throw new Error(`Failed to fetch Pinterest boards: ${response.status} - ${errRef}`);
    }

    const data = await response.json();
    return data.items || [];
}

export async function createPinterestPin(
    accessToken: string,
    boardId: string,
    title: string,
    description: string,
    link: string,
    imageUrl: string | { base64: string, mimeType: string } | { imageId: string },
    alternateImageUrl?: string // Use a public URL if available to avoid data URI issues
): Promise<{ id: string }> {
    
    // Pinterest API v5 /pins uses media_source
    let media_source: any;
    let imageId: string | undefined;
    
    if (imageUrl && typeof imageUrl === 'object' && 'imageId' in imageUrl) {
        imageId = imageUrl.imageId;
    } else {
        // Prefer the alternate (public) URL if provided and it looks like a URL
        const finalImage = (alternateImageUrl && alternateImageUrl.startsWith('http')) ? alternateImageUrl : imageUrl;
        
        if (typeof finalImage === 'string') {
            if (finalImage.startsWith('http')) {
                media_source = {
                    source_type: "image_url",
                    url: finalImage
                };
            } else if (finalImage.startsWith('data:image')) {
                 // Extract base64
                 const [header, base64Data] = finalImage.split(',');
                 media_source = {
                     source_type: "image_base64",
                     content_type: header.replace('data:', '').replace(';base64', ''),
                     data: base64Data
                 };
            } else {
                 media_source = {
                     source_type: "image_url",
                     url: finalImage
                 };
            }
        } else {
            media_source = {
                source_type: "image_base64",
                content_type: (imageUrl as any).mimeType,
                data: (imageUrl as any).base64
            };
        }
    }

    const payload: any = {
        board_id: boardId,
        title: title.substring(0, 100), // Pinterest limits title to 100 chars
    };
    
    if (imageId) {
        payload.imageId = imageId;
    } else {
        payload.media_source = media_source;
    }

    if (description?.trim()) {
        payload.description = description.substring(0, 500);
    }
    
    if (link?.trim()) {
        payload.link = link;
    }

    const response = await fetch('/api/pinterest/pins', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        let errRef = await response.text();
        try {
            const parsed = JSON.parse(errRef);
            if (parsed.message) errRef = parsed.message;
            if (parsed.error?.message) errRef = parsed.error.message;
            if (parsed.message_detail) errRef = `${parsed.message}: ${parsed.message_detail}`;
        } catch(e) {}
        
        if (response.status === 401) {
            throw new Error(`Authentication failed. Your token is likely expired. Please go to Settings, Disconnect Pinterest, and Connect again.`);
        }
        if (response.status === 403 && errRef.includes("Trial access")) {
            throw new Error(`Your Pinterest App is in Trial mode and cannot publish to production boards. Please upgrade your Pinterest app to Standard Access in the Pinterest Developer Console.`);
        }
        throw new Error(`Pinterest Pin Creation Failed: ${response.status} - ${errRef}`);
    }

    const data = await response.json();
    return { id: data.id };
}
