
import { GoogleGenAI, Type } from "@google/genai";
import { Redis } from "@upstash/redis";
import type { GeneratedPost, LogEntry } from '../../types';

// This is the serverless function that will act as the API endpoint
// for the WordPress plugin. It should be deployed automatically by
// modern hosting providers like Vercel, Netlify, or Hostinger.

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
}

async function logApiCall(logData: Omit<LogEntry, 'id' | 'timestamp'>) {
    if (!redis) return;
    try {
        const entry: LogEntry = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            ...logData
        };
        await redis.lpush('recipepress_api_logs', JSON.stringify(entry));
        await redis.ltrim('recipepress_api_logs', 0, 99); // Keep only the last 100 logs
    } catch (e) {
        console.error("Failed to write to Redis log:", e);
    }
}


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// The schema for the expected JSON output from the AI model.
const recipeSchema = {
    type: Type.OBJECT,
    properties: {
        post_title: {
            type: Type.STRING,
            description: "A catchy, SEO-friendly title for the blog post about the recipe. This should be based on the original article's title."
        },
        post_content: {
            type: Type.STRING,
            description: "A 2-3 paragraph, engaging and warm introduction for the blog post, rewritten based on the article's content. Use HTML tags like <p> and <strong> for formatting."
        },
        recipe_data: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "The name of the recipe itself." },
                author: { type: Type.STRING, description: "The name of the recipe author, e.g., 'Jane Doe' or 'The Recipe Blog'." },
                description: { type: Type.STRING, description: "A brief, one-sentence summary of the recipe." },
                prep_time: { type: Type.STRING, description: "Preparation time as a simple string (e.g., '15 minutes')." },
                cook_time: { type: Type.STRING, description: "Cooking time as a simple string (e.g., '25 minutes')." },
                total_time: { type: Type.STRING, description: "Total time as a simple string (e.g., '40 minutes')." },
                yield: { type: Type.STRING, description: "The number of servings the recipe yields (e.g., '4-6 servings' or '12 cookies')." },
                keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 3-5 relevant keywords for SEO." },
                cuisine: { type: Type.STRING, description: "The cuisine type (e.g., 'Italian', 'Mexican')." },
                category: { type: Type.STRING, description: "The recipe category (e.g., 'Main Course', 'Dessert')." },
                image: { type: Type.STRING, description: "URL for a single, high-quality, royalty-free, landscape-oriented image relevant to the recipe (e.g., from Unsplash, Pexels)." },
                ingredients: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                        description: "A single ingredient, including amount and name (e.g., '2 cups all-purpose flour')."
                    },
                },
                instructions: {
                    type: Type.ARRAY,
                    items: {
                       type: Type.STRING,
                       description: "A single, clear step in the recipe instructions. Each step must start with 'Step X:' in bold (using HTML bold tags), where X is the step number (e.g., '<b>Step 1:</b> Mix the flour...').",
                    },
                },
                notes: { type: Type.STRING, description: "Optional notes, tips, or variations for the recipe." },
            },
             required: ["name", "description", "prep_time", "cook_time", "total_time", "yield", "keywords", "cuisine", "category", "ingredients", "instructions"],
        },
    },
    required: ["post_title", "post_content", "recipe_data"],
};


// The main handler for the serverless function.
export default async function handler(req: Request) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Ensure the request is a POST request
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  const requestUrl = new URL(req.url);

  // Authenticate the request from the WordPress plugin
  const appToken = process.env.RECIPEPRESS_APP_TOKEN;
  const authHeader = req.headers.get('Authorization');
  const sentToken = authHeader?.split('Bearer ')?.[1];
  
  let requestBody;
  try {
     requestBody = await req.json();
  } catch (e) {
     requestBody = { error: "Could not parse JSON body" };
  }

  if (!appToken || !sentToken || appToken !== sentToken) {
    const errorMsg = 'Unauthorized';
    await logApiCall({ method: req.method, endpoint: requestUrl.pathname, status: 401, error: errorMsg, requestPayload: requestBody });
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Ensure the Gemini API key is configured in the environment variables
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
     const errorMsg = 'Server configuration error: API_KEY not set.';
     await logApiCall({ method: req.method, endpoint: requestUrl.pathname, status: 500, error: errorMsg, requestPayload: requestBody });
     return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { content, title } = requestBody;

    if (!content) {
      const errorMsg = 'Missing "content" in request body.';
      await logApiCall({ method: req.method, endpoint: requestUrl.pathname, status: 400, error: errorMsg, requestPayload: requestBody });
      return new Response(JSON.stringify({ error: errorMsg }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize the Gemini AI client
    const ai = new GoogleGenAI({ apiKey });
    
    // Create a prompt specifically for extracting a recipe from existing article text
    const prompt = `You are an expert recipe extractor. Analyze the following article content and generate a complete recipe blog post structure from it. The original article title is "${title}". The article content is: "${content}". Please provide the output in a JSON format that strictly adheres to the provided schema. The "post_content" should be a new, engaging 2-3 paragraph introduction based on the article, and the "recipe_data" should be extracted from the text. If no clear recipe is found, create a relevant recipe based on the article's title.`;
    
    // Call the Gemini API
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      },
    });

    const jsonString = response.text.trim();
    const parsedData = JSON.parse(jsonString);

    // Validate the response from the AI
    if (!parsedData.recipe_data || !parsedData.recipe_data.name) {
       throw new Error("AI response was missing required recipe data.");
    }
    
    await logApiCall({ method: req.method, endpoint: requestUrl.pathname, status: 200, requestPayload: requestBody, response: parsedData });
    // Send the generated recipe data back to the WordPress plugin
    return new Response(JSON.stringify(parsedData), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in API generate function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    await logApiCall({ method: req.method, endpoint: requestUrl.pathname, status: 500, error: errorMessage, requestPayload: requestBody });
    return new Response(JSON.stringify({ error: 'Failed to generate recipe.', details: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
