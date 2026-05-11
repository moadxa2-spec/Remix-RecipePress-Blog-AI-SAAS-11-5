import type { WordPressSite, GeneratedPost, WordPressPost, PublishStatus } from '../types';
import { addLog } from './loggingService';
import { getCurrentUser } from './authService';
import { getSites, saveSites } from './dataService';

const POSTS_PER_PAGE = 50;

async function attemptAutoFixApiFetch(site: WordPressSite, originalError: Error, pathAndQuery: string, options: RequestInit) {
    const user = getCurrentUser();
    if (!user) throw originalError;
    
    const originalBaseUrl = site.url.replace(/\/$/, '');
    const altUrls = new Set<string>();
    
    let baseHttps = originalBaseUrl.replace(/^http:\/\//, 'https://');
    altUrls.add(baseHttps);
    if (baseHttps.includes('://www.')) {
        altUrls.add(baseHttps.replace('://www.', '://'));
    } else {
        altUrls.add(baseHttps.replace('://', '://www.'));
    }

    const paths = new Set<string>();
    paths.add(pathAndQuery);
    if (pathAndQuery.includes('?')) {
        paths.add(pathAndQuery.replace('?', '/?'));
    } else {
        paths.add(pathAndQuery + '/');
    }

    for (const altBaseUrl of altUrls) {
        for (const pt of paths) {
            if (altBaseUrl === originalBaseUrl && pt === pathAndQuery) continue; // Skip original exact failing combination
            
            try {
                const endpoint = `${altBaseUrl}${pt}`;
                const res = await apiFetch(endpoint, options);
                
                const sites = getSites(user.id);
                const siteIndex = sites.findIndex(s => s.id === site.id);
                if (siteIndex !== -1) {
                     sites[siteIndex].url = altBaseUrl;
                     saveSites(user.id, sites);
                }
                site.url = altBaseUrl; 
                return res;
            } catch (e) {
                 // keep trying
            }
        }
    }
    throw originalError;
}

async function attemptAutoFixFetchWithHeaders(site: WordPressSite, originalError: Error, pathAndQuery: string, options: RequestInit) {
    const user = getCurrentUser();
    if (!user) throw originalError;
    
    const originalBaseUrl = site.url.replace(/\/$/, '');
    const altUrls = new Set<string>();
    
    let baseHttps = originalBaseUrl.replace(/^http:\/\//, 'https://');
    altUrls.add(baseHttps);
    if (baseHttps.includes('://www.')) {
        altUrls.add(baseHttps.replace('://www.', '://'));
    } else {
        altUrls.add(baseHttps.replace('://', '://www.'));
    }

    const paths = new Set<string>();
    paths.add(pathAndQuery);
    if (pathAndQuery.includes('?')) {
        paths.add(pathAndQuery.replace('?', '/?'));
    } else {
        paths.add(pathAndQuery + '/');
    }

    for (const altBaseUrl of altUrls) {
        for (const pt of paths) {
            if (altBaseUrl === originalBaseUrl && pt === pathAndQuery) continue; 
            
            try {
                const endpoint = `${altBaseUrl}${pt}`;
                const res = await fetchWithHeaders(endpoint, options);
                
                const sites = getSites(user.id);
                const siteIndex = sites.findIndex(s => s.id === site.id);
                if (siteIndex !== -1) {
                     sites[siteIndex].url = altBaseUrl;
                     saveSites(user.id, sites);
                }
                site.url = altBaseUrl; 
                return res;
            } catch (e) {
                 // keep trying
            }
        }
    }
    throw originalError;
}

async function apiFetch(url: string, options: RequestInit) {
    const logData: {
        endpoint: string;
        method: string;
        requestPayload?: any;
    } = {
        endpoint: new URL(url).pathname,
        method: options.method || 'GET',
        requestPayload: options.body ? JSON.parse(options.body as string) : undefined
    };

    try {
        const response = await fetch(url, options);
        const responseBody = await response.json().catch(() => ({ message: 'Received non-JSON response from server.' }));

        if (!response.ok) {
            const errorPrefix = responseBody.message || 'An unknown API error occurred';
            const errorMessage = `Request failed (Status ${response.status}): ${errorPrefix}`;
            addLog({ ...logData, status: response.status, error: errorMessage, response: responseBody });
            throw new Error(errorMessage);
        }
        
        addLog({ ...logData, status: response.status, response: responseBody });
        return responseBody;

    } catch (error) {
        if (error instanceof Error) {
             if (error.message.includes('Failed to fetch') || error.message.includes('Load failed')) {
                 const errorMessage = `A network or CORS error occurred. Please verify your site URL exactly matches your WordPress address (check for www vs non-www, http vs https) and that your .htaccess permits CORS.`;
                 addLog({ ...logData, error: errorMessage });
                 throw new Error(errorMessage);
             }
        }
        // Rethrow other errors (like from the response.ok check), which are already logged.
        throw error;
    }
}

async function fetchWithHeaders(url: string, options: RequestInit) {
  const logData:any = {
    endpoint: new URL(url).pathname,
    method: options.method || 'GET',
    requestPayload: options.body ? JSON.parse(options.body as string) : undefined
  };
  try {
    const res = await fetch(url, options);
    const body = await res.json().catch(() => ({ message: 'Received non-JSON response from server.' }));
    const headers: Record<string,string> = {};
    res.headers.forEach((v,k) => headers[k.toLowerCase()] = v);
    if (!res.ok) {
      const errorPrefix = (body && body.message) ? body.message : 'An unknown API error occurred';
      const errMsg = `Request failed (Status ${res.status}): ${errorPrefix}`;
      addLog({ ...logData, status: res.status, error: errMsg, response: body, headers });
      throw new Error(errMsg);
    }
    addLog({ ...logData, status: res.status, response: body, headers });
    return { body, headers };
  } catch (err) {
    if (err instanceof Error && (err.message.includes('Failed to fetch') || err.message.includes('Load failed'))) {
      const msg = `A network or CORS error occurred. Please verify your site URL exactly matches your WordPress address (check for www vs non-www, http vs https) and that your .htaccess permits CORS.`;
      addLog({ ...logData, error: msg });
      throw new Error(msg);
    }
    throw err;
  }
}

export async function verifyConnection(site: WordPressSite): Promise<{ success: boolean; message: string }> {
  const pathAndQuery = '/wp-json/recipepress-ai/v1/verify-connection';
  const baseUrl = site.url.replace(/\/$/, '');
  const endpoint = `${baseUrl}${pathAndQuery}`;
  const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site_token: site.siteToken }),
  };

  try {
    const data = await apiFetch(endpoint, options);
    return { success: true, message: data.message };
  } catch (error) {
    if (error instanceof Error && (error.message.includes('A network or CORS error occurred') || error.message.includes('Request failed (Status 404)'))) {
        try {
            const data = await attemptAutoFixApiFetch(site, error, pathAndQuery, options) as any;
            return { success: true, message: data.message };
        } catch (fallbackError) {
             return { success: false, message: fallbackError instanceof Error ? fallbackError.message : 'An unknown verification error occurred.' };
        }
    }
    return { success: false, message: error instanceof Error ? error.message : 'An unknown verification error occurred.' };
  }
}

export async function getPosts(site: WordPressSite): Promise<WordPressPost[]> {
  const baseUrl = site.url.replace(/\/$/, '');
  const pathAndQuery = `/wp-json/recipepress-ai/v1/posts?page=1&per_page=100&site_token=${encodeURIComponent(site.siteToken)}`;
  const endpoint = `${baseUrl}${pathAndQuery}`;
  
  const options = {
      method: 'GET',
      headers: {}
  };
  
  try {
      let responseBody: any;
      try {
          responseBody = await apiFetch(endpoint, options);
      } catch (error) {
          if (error instanceof Error && (error.message.includes('A network or CORS error occurred') || error.message.includes('Request failed (Status 404)'))) {
              responseBody = await attemptAutoFixApiFetch(site, error, pathAndQuery, options);
          } else {
              throw error;
          }
      }

      let batch: any[] = [];
      if (Array.isArray(responseBody)) {
        batch = responseBody;
      } else if (responseBody && Array.isArray(responseBody.posts)) {
        batch = responseBody.posts;
      } else if (responseBody && Array.isArray(responseBody.data)) {
        batch = responseBody.data;
      } else {
        const arr = responseBody ? Object.values(responseBody).find(v => Array.isArray(v)) : undefined;
        if (arr) batch = arr as any[];
      }

      if (!Array.isArray(batch)) {
        console.error('Invalid response structure for getPosts:', responseBody);
        return []; 
      }
      
      return batch as WordPressPost[];

  } catch (error) {
      console.error(`Failed to fetch posts for site ${site.name}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch posts. Error: ${errorMessage}`);
  }
}


export async function getPostContent(site: WordPressSite, postId: number): Promise<{ content: string, title: string }> {
    const baseUrl = site.url.replace(/\/$/, '');
    const endpoint = `${baseUrl}/wp-json/recipepress-ai/v1/post/${postId}?site_token=${encodeURIComponent(site.siteToken)}`;
     return apiFetch(endpoint, {
        method: 'GET',
        headers: {},
    });
}

export async function importRecipe(site: WordPressSite, targetPostId: number, postData: GeneratedPost, status: 'publish' | 'draft' = 'publish', generationType: 'full' | 'intro'): Promise<{ success: boolean; message: string; post_id: number; post_url: string; }> {
    const baseUrl = site.url.replace(/\/$/, '');
    const endpoint = `${baseUrl}/wp-json/recipepress-ai/v1/import`;

    try {
        const responseData = await apiFetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                site_token: site.siteToken,
                target_post: targetPostId,
                post_status: status,
                generation_type: generationType,
                focus_keyword: postData.focus_keyword,
                meta_description: postData.meta_description,
                slug: postData.slug,
                ...postData,
            }),
        });
        
        if (responseData.success) {
            return responseData;
        }

        throw new Error("Import failed: WordPress response did not indicate success.");
    
    } catch (error) {
        console.error(`Failed to import recipe to ${site.name}:`, error);
        if (error instanceof Error) {
            if (error.message.includes('A network or CORS error occurred')) {
                 throw new Error(`Could not connect to "${site.name}". ${error.message} Please use the 'Test Connection' button.`);
            }
            throw error;
        }
        throw new Error(`An unknown error occurred while importing the recipe to "${site.name}".`);
    }
}