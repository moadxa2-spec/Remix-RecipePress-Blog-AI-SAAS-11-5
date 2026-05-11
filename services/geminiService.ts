

import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import type { GeneratedPost, ArticleAgentSettings, ImageConfiguration, RecipeData, AdminSettings } from '../types';

// A helper function to safely parse JSON, stripping markdown backticks
function safeJsonParse(jsonString: string, context: string): any {
    // Sometimes the model wraps the JSON in markdown backticks, with or without `json`
    const cleanedString = jsonString.trim().replace(/^```(json)?\s*/, '').replace(/\s*```$/, '').trim();
    try {
        return JSON.parse(cleanedString);
    } catch (e) {
        console.error(`JSON parsing error in ${context}:`, e);
        console.error("Malformed JSON string received from AI:", cleanedString);
        throw new Error(`AI returned malformed JSON for ${context}. Please try again. The raw response was logged to the console.`);
    }
}

export async function extractTitleFromText(apiKey: string, text: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    const prompt = `Analyze the following recipe text and determine the most appropriate and SEO-friendly title for it. Respond with ONLY the title and nothing else.\n\nTEXT:\n${text}`;
    
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
    });

    return response.text.trim().replace(/^"|"$/g, ''); // Also remove quotes just in case
}

export async function generatePinterestDescription(apiKey: string, title: string, originalDescription: string, template: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey });
    let baseDescription = template.replace(/{title}/gi, title).replace(/{description}/gi, originalDescription);
    const prompt = `You are a Pinterest social media expert for food blogs. 
Here is a base description for a Pinterest pin: "${baseDescription}".
Enhance this description, make it engaging for Pinterest, and add highly relevant Pinterest hashtags (3 to 6 hashtags).
Only output the final Pinterest text content. Do not wrap in quotes. Keep it strictly under 450 characters total.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
    });

    return response.text.trim().substring(0, 490);
}


// Schemas define the expected JSON structure from the AI model.

const nutritionDataSchema = {
    type: Type.OBJECT,
    properties: {
        servingSize: { type: Type.STRING, description: "The serving size, e.g., '1 slice' or '1 cup'." },
        calories: { type: Type.STRING, description: "Calories per serving, e.g., '250 kcal'." },
        sugarContent: { type: Type.STRING, description: "Sugar content per serving, e.g., '10g'." },
        sodiumContent: { type: Type.STRING, description: "Sodium content per serving, e.g., '300mg'." },
        fatContent: { type: Type.STRING, description: "Total fat content per serving, e.g., '15g'." },
        saturatedFatContent: { type: Type.STRING, description: "Saturated fat content per serving, e.g., '5g'." },
        unsaturatedFatContent: { type: Type.STRING, description: "Unsaturated fat content per serving, e.g., '8g'." },
        transFatContent: { type: Type.STRING, description: "Trans fat content per serving, e.g., '0g'." },
        carbohydrateContent: { type: Type.STRING, description: "Carbohydrates per serving, e.g., '30g'." },
        fiberContent: { type: Type.STRING, description: "Fiber content per serving, e.g., '4g'." },
        proteinContent: { type: Type.STRING, description: "Protein content per serving, e.g., '12g'." },
        cholesterolContent: { type: Type.STRING, description: "Cholesterol content per serving, e.g., '60mg'." },
    }
};

const aggregateRatingSchema = {
    type: Type.OBJECT,
    properties: {
        ratingValue: { type: Type.STRING, description: "The average rating value, e.g., '4.8'." },
        ratingCount: { type: Type.INTEGER, description: "The total number of ratings, e.g., 75." },
    },
    description: "The aggregate rating for the recipe. The AI should generate plausible, realistic values."
};

const recipeDataSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "The name of the recipe itself." },
        description: { type: Type.STRING, description: "A brief, one-sentence summary of the recipe." },
        prep_time: { type: Type.STRING, description: "Preparation time as a simple string (e.g., '15 minutes')." },
        cook_time: { type: Type.STRING, description: "Cooking time as a simple string (e.g., '25 minutes')." },
        total_time: { type: Type.STRING, description: "Total time as a simple string (e.g., '40 minutes')." },
        yield: { type: Type.STRING, description: "The number of servings the recipe yields (e.g., '4-6 servings' or '12 cookies')." },
        keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 3-5 relevant keywords for SEO." },
        cuisine: { type: Type.STRING, description: "The cuisine type (e.g., 'Italian', 'Mexican')." },
        category: { type: Type.STRING, description: "The recipe category (e.g., 'Main Course', 'Dessert')." },
        method: { type: Type.STRING, description: "The cooking method, e.g., 'Baking', 'Grilling'." },
        diet: { type: Type.STRING, description: "The diet type, e.g., 'Vegetarian', 'Gluten-Free'." },
        video_url: { type: Type.STRING, description: "A relevant YouTube video URL showing how to prepare the recipe. The AI should actively search for one." },
        nutrition: nutritionDataSchema,
        aggregateRating: aggregateRatingSchema,
        ingredients: { type: Type.ARRAY, items: { type: Type.STRING, description: "A single ingredient, including amount and name (e.g., '2 cups all-purpose flour')." } },
        instructions: { type: Type.ARRAY, items: { type: Type.STRING, description: "A single, clear step in the recipe instructions. Each step must start with 'Step X:' in bold (using HTML bold tags), where X is the step number (e.g., '<b>Step 1:</b> Mix the flour...')." } },
        notes: { type: Type.STRING, description: "Optional notes, tips, or variations for the recipe." },
        image_alt: { type: Type.STRING, description: "SEO-optimized alt text for the featured image, incorporating the focus keyword." },
        image_title: { type: Type.STRING, description: "A descriptive, SEO-friendly title for the featured image file." },
        image_description: { type: Type.STRING, description: "A short paragraph describing the image for the media library." },
    },
    required: ["name", "description", "prep_time", "cook_time", "total_time", "yield", "keywords", "cuisine", "category", "ingredients", "instructions", "image_alt", "image_title", "image_description"],
};

// Base schema for a simple post with just an intro
const recipeWithIntroSchema = {
    type: Type.OBJECT,
    properties: {
        post_title: { type: Type.STRING },
        meta_description: { type: Type.STRING },
        slug: { type: Type.STRING },
        post_content: { type: Type.STRING },
        recipe_data: recipeDataSchema,
    },
    required: ["post_title", "meta_description", "slug", "post_content", "recipe_data"],
};

// Schema for the FAQPage JSON-LD object.
const faqPageSchema = {
    type: Type.OBJECT,
    description: "A valid 'FAQPage' JSON-LD object with 3-4 relevant questions and answers about the recipe. This must follow the structure provided in the example.",
    properties: {
        '@context': { type: Type.STRING, description: "Should be 'https://schema.org'" },
        '@type': { type: Type.STRING, description: "Should be 'FAQPage'" },
        mainEntity: {
            type: Type.ARRAY,
            description: "An array of Question objects.",
            items: {
                type: Type.OBJECT,
                properties: {
                    '@type': { type: Type.STRING, description: "Should be 'Question'" },
                    name: { type: Type.STRING, description: "The question text." },
                    acceptedAnswer: {
                        type: Type.OBJECT,
                        properties: {
                            '@type': { type: Type.STRING, description: "Should be 'Answer'" },
                            text: { type: Type.STRING, description: "The answer text." }
                        },
                        required: ['@type', 'text']
                    }
                },
                required: ['@type', 'name', 'acceptedAnswer']
            }
        }
    },
    required: ['@context', '@type', 'mainEntity']
};

const orchestratorSchema = {
    type: Type.OBJECT,
    properties: {
        post_title: { type: Type.STRING, description: "A catchy, SEO-friendly title." },
        meta_description: { type: Type.STRING, description: "A compelling, SEO-optimized meta description (approx 155 characters)." },
        slug: { type: Type.STRING, description: "A clean, SEO-friendly URL slug." },
        faqSchema: faqPageSchema,
        post_content: { type: Type.STRING, description: "The full blog post in PURE HTML format (paragraphs, H2s, H3s, lists), including strategically placed internal and external links as specified in the rules." },
        recipe_data: recipeDataSchema,
    },
    required: ["post_title", "meta_description", "slug", "faqSchema", "post_content", "recipe_data"],
};


export async function generateImage(apiKey: string, prompt: string, inputImage?: { imageBytes: string, mimeType: string }): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const contents = inputImage ? {
        parts: [
            { inlineData: { data: inputImage.imageBytes, mimeType: inputImage.mimeType } },
            { text: prompt }
        ]
    } : {
        parts: [{ text: prompt }]
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: contents,
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData && part.inlineData.data) {
        return part.inlineData.data;
    }
    
    throw new Error("Image generation failed to return an image.");
}


// Handles the main logic for all generation types
async function handleGeneration(
    params: {
        apiKey: string;
        primaryKeyword: string;
        generationType: 'full' | 'intro';
        source: { type: 'text'; value: string } | { type: 'content'; value: { title: string, content: string }};
        settings: ArticleAgentSettings;
        adminSettings: AdminSettings;
        imageConfig: ImageConfiguration;
        existingPosts?: { title: string, link: string }[];
        imageStrategy?: 'keep' | 'regenerate';
    }
): Promise<GeneratedPost> {
    
    let { apiKey, primaryKeyword, generationType, source, settings, adminSettings, imageConfig, existingPosts, imageStrategy = 'regenerate' } = params;

    if (generationType === 'full' && source.type === 'text' && !primaryKeyword) {
        primaryKeyword = await extractTitleFromText(apiKey, source.value);
        if (!primaryKeyword) {
            throw new Error("Could not determine a title from the provided text. Please try again or provide a keyword.");
        }
    }

    // 1. Generate the text content (article or intro)
    let generatedPost: GeneratedPost;
    if (generationType === 'full') {
        generatedPost = await generateArticleAndRecipe(
            apiKey,
            primaryKeyword, 
            settings, 
            adminSettings,
            existingPosts || [], 
            imageStrategy,
            source.type === 'content' ? source.value.content : (source.type === 'text' ? source.value : undefined)
        );
    } else {
        generatedPost = await generateRecipeWithIntro(apiKey, source, primaryKeyword);
    }
    
    // 2. Handle the image generation/assignment
    let imageBase64: string | undefined;
    
    if (imageStrategy === 'regenerate' && generatedPost.recipe_data && generatedPost.recipe_data.name) {
        switch (imageConfig.option) {
            case 'generate':
                const imagePrompt = `Photorealistic food photography of ${generatedPost.recipe_data.name}, ${generatedPost.recipe_data.cuisine || ''} style, beautifully plated, bright lighting, high detail, delicious looking.`;
                imageBase64 = await generateImage(apiKey, imagePrompt);
                break;
            case 'variation':
                if (imageConfig.uploadedImage) {
                    const variationPrompt = `Generate a new, unique, high-quality photograph inspired by an image of ${generatedPost.recipe_data.name}. Maintain a similar style but create a different composition.`;
                    imageBase64 = await generateImage(apiKey, variationPrompt, {
                        imageBytes: imageConfig.uploadedImage.base64,
                        mimeType: imageConfig.uploadedImage.mimeType,
                    });
                }
                break;
            case 'upload':
                if (imageConfig.uploadedImage) {
                    imageBase64 = imageConfig.uploadedImage.base64;
                }
                break;
        }
    } else if (imageStrategy === 'regenerate') {
        console.warn("Recipe name is missing from the generated content. Skipping image generation.");
    }


    if (imageBase64) {
        generatedPost.recipe_data.image = imageBase64;
    }

    // 3. Assign focus keyword (use title as fallback if keyword is missing, e.g., from text)
    generatedPost.focus_keyword = primaryKeyword || generatedPost.post_title;
    
    return generatedPost;
}

export { handleGeneration };


async function agentOrchestrator(
    apiKey: string,
    primaryKeyword: string, 
    settings: ArticleAgentSettings, 
    adminSettings: AdminSettings,
    existingPosts: { title: string, link: string }[],
    imageStrategy: 'keep' | 'regenerate', 
    originalContent?: string
): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: apiKey });

    let knowledgeBase = '';
    if (settings.knowledgeFiles && settings.knowledgeFiles.length > 0) {
        knowledgeBase = "Use the following knowledge base to inform your writing:\n" + settings.knowledgeFiles.map(f => `--- KNOWLEDGE FILE: ${f.name} ---\n${f.content}`).join('\n\n');
    }

    let contentPromptExtension = '';
    const imageMap: { [key: string]: string } = {};

    // This block handles both creating from text and updating an existing post.
    if (originalContent) {
        // A simple heuristic to differentiate a full HTML post from simple recipe text.
        // If it's a full post, it's an update task. Otherwise, it's a create-from-text task.
        const isUpdateTask = /<p>|<h[1-6]>/i.test(originalContent);

        if (isUpdateTask) {
            // === THIS IS THE NEW LOGIC FOR UPDATING A POST ===
            let contentForPrompt = originalContent;
            let imageInstruction = "You will also generate a new featured image for this post.";

            if (imageStrategy === 'keep') {
                let imageCounter = 0;
                contentForPrompt = originalContent.replace(/<img[^>]*>/g, (match) => {
                    const placeholder = `[IMAGE_PLACEHOLDER_${imageCounter}]`;
                    imageMap[placeholder] = match;
                    imageCounter++;
                    return placeholder;
                });
                imageInstruction = `The content may contain special placeholders like [IMAGE_PLACEHOLDER_0]. If they exist, you **MUST** preserve them exactly as they appear and in their original positions. Do not add, remove, or alter these placeholders.`;
            }

            contentPromptExtension = `
                **IMPORTANT REGENERATION TASK:**
                You are to generate a completely new article. The previous version of the article is provided below for context, but you should not copy its prose.

                **Your Process:**
                1.  **Analyze and Extract:** Read the 'Old Article Content' below. Your ONLY goal in this step is to identify and extract the core recipe components: the main keyword/title, the full list of ingredients, and the step-by-step instructions.
                2.  **Generate a NEW Article:** Using ONLY the extracted core recipe from Step 1 as your starting point, write a **completely new and original blog post**. You MUST NOT rewrite, rephrase, or use the prose from the 'Old Article Content'. The new article must be unique and follow all my persona and linking rules.
                3.  **Handle Images:** ${imageInstruction}
                4.  **Create New Components:** You **MUST** generate a brand new, complete, and well-structured **'recipe_data' object** based on the extracted recipe. You must also generate a new **'faqSchema' object**.

                **Old Article Content:**
                ---
                ${contentForPrompt}
                ---
            `;
        } else {
            // === THIS IS THE EXISTING LOGIC FOR CREATING FROM TEXT (UNCHANGED) ===
            contentPromptExtension = `
                **IMPORTANT TASK:**
                You are creating a new article based on the following recipe text. Expand on this text to create a full blog post.
                **Special Instruction for Ingredients:** If the ingredients list has quantities on separate lines from the descriptions (e.g., a line with '2' followed by a line with 'cups of flour'), you MUST combine them into a single ingredient string like '2 cups of flour'.
                
                **Original Text:**
                ---
                ${originalContent}
                ---
            `;
        }
    }
    
     // Determine internal linking strategy
    const hasInternalLinks = existingPosts.length > 0 && settings.internalLinks > 0;
    const internalLinksRequirement = hasInternalLinks 
        ? `- **Internal Links:** You MUST insert exactly ${settings.internalLinks} internal links.`
        : `- **Internal Links:** 0. You MUST NOT add any internal links.`;
        
    const internalLinkingContext = hasInternalLinks
        ? `You MUST choose from this list for internal links. Select the most relevant posts and use the post's title as the anchor text. List of available posts: \n${existingPosts.map(p => `- Title: "${p.title}", URL: "${p.link}"`).join('\n')}`
        : `No internal links have been provided. The requirement to add ${settings.internalLinks} internal links is overridden. You MUST NOT add any internal links to the article.`;

    const affiliateLinksContext = adminSettings.affiliateSettings.textSnippets?.trim() 
        ? `If relevant, you may use these affiliate links. They count towards your external link total. \nAffiliate Links to use:\n${adminSettings.affiliateSettings.textSnippets}`
        : 'None provided.';

    const prompt = `
        You are an elite, all-in-one food blogger and SEO specialist AI. Your task is to generate a complete, high-quality blog post from a single prompt, including all content and linking.
        
        **Primary Keyword / Recipe Concept:** "${primaryKeyword}"
        
        **Your Persona & Style:**
        ${settings.mainPrompt}

        **TASK: Generate a complete blog post JSON object with the following components:**
        1.  **SEO Metadata:** A catchy title, compelling meta description (approx 155 chars), and a clean URL slug.
        2.  **FAQ Schema:** A valid "FAQPage" JSON-LD object with 3-4 relevant questions and answers.
        3.  **Article Content:** A full, engaging blog post in clean HTML format (p, h2, h3, ul, li) that includes all required links.
        4.  **Recipe Data:** A complete, structured recipe card object, including a relevant YouTube video URL and SEO-optimized metadata for a featured image.
            
        **Linking Requirements & Rules:**
        ${internalLinksRequirement}
        - **External Links:** You MUST insert exactly ${settings.externalLinks} external links.
        - **Available Internal Links:** ${internalLinkingContext}
        - **Available Affiliate Links (Optional):** ${affiliateLinksContext}
        - **Strict Rules for ALL Links:**
            1.  **Relevance & Quality (External):** Link ONLY to high-quality, authoritative, and VERIFIABLY REAL websites that add value (e.g., Wikipedia, Food Network, major culinary blogs). DO NOT invent domains.
            2.  **Formatting:** All external/affiliate links MUST open in a new tab (\`target="_blank"\`). Affiliate links MUST have \`rel="nofollow"\`. Use descriptive, natural anchor text.
            3.  **Distribution:** Spread links naturally throughout the article.

        ${contentPromptExtension}

        **Knowledge Base:**
        ${knowledgeBase || 'No additional knowledge base provided.'}
        
        **Output Format Rules:**
        CRITICAL: The entire output MUST be a single JSON object.
        1.  The 'recipe_data' object **MUST** be fully generated with all required fields, even when editing. This is not optional.
        2.  The 'faqSchema' field **MUST be a valid JSON object** that strictly follows the schema. It **MUST NOT** be a string and **MUST NOT** contain any WordPress block comments (e.g., '<!-- wp:rank-math/faq-block ... -->').
        3.  The 'post_content' field must be clean HTML and MUST NOT contain any JSON-LD script tags or WordPress block comments.
        4.  Do not include any markdown formatting (like \`\`\`json\`) around the final JSON output.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: orchestratorSchema }
    });
    
    const parsedData = safeJsonParse(response.text, 'agentOrchestrator');
    
    // If we were keeping images, restore them now
    if (imageStrategy === 'keep') {
        let finalContent = parsedData.post_content;
        for (const placeholder in imageMap) {
            const regex = new RegExp(placeholder.replace(/\[/g, '\\[').replace(/\]/g, '\\]'), 'g');
            finalContent = finalContent.replace(regex, imageMap[placeholder]);
        }
        parsedData.post_content = finalContent;
    }
    
    return parsedData;
}


async function generateArticleAndRecipe(
    apiKey: string,
    primaryKeyword: string, 
    settings: ArticleAgentSettings, 
    adminSettings: AdminSettings,
    existingPosts: { title: string, link: string }[],
    imageStrategy: 'keep' | 'regenerate',
    originalContent?: string
): Promise<GeneratedPost> {
    
    const orchestratedData = await agentOrchestrator(
        apiKey,
        primaryKeyword,
        settings,
        adminSettings,
        existingPosts,
        imageStrategy,
        originalContent
    );
    
    return orchestratedData;
}


// Internal function to generate just an intro + recipe
async function generateRecipeWithIntro(
  apiKey: string,
  source: { type: 'text'; value: string } | { type: 'content'; value: { title: string, content: string }},
  primaryKeyword: string,
): Promise<GeneratedPost> {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    let prompt: string;
    
    const baseInstruction = (kw: string) => `
      You must generate a full SEO package for this post. The primary keyword is "${kw}".
      1.  **Meta Description:** Create a compelling, SEO-optimized meta description (around 155 characters).
      2.  **URL Slug:** Create a clean, SEO-friendly URL slug (lowercase, hyphenated).
      3.  **Image Metadata:** Generate SEO-optimized 'image_alt', 'image_title', and 'image_description' for a featured image. The alt text must include the primary keyword.
    `;

    switch (source.type) {
        case 'content':
            prompt = `You are an expert recipe extractor. Analyze the following article (title: "${source.value.title}", content: "${source.value.content}") and generate a complete recipe structure from it. The "post_content" should be a new, engaging 2-3 paragraph introduction based on the article. If no clear recipe is found, create one based on the article's title. For the 'video_url' field, find a relevant YouTube video URL that demonstrates how to make the recipe. ${baseInstruction(primaryKeyword)}`;
            break;
        case 'text':
            const specialInstruction = "**Special Instruction for Ingredients:** If the ingredients list has quantities on separate lines from the descriptions (e.g., a line with '2' followed by a line with 'cups of flour'), you MUST combine them into a single ingredient string like '2 cups of flour'.";
            if (primaryKeyword) {
                 prompt = `You are an expert recipe formatter. Analyze this user-provided text: "${source.value}". ${specialInstruction} Structure it perfectly into the recipe schema. If information is missing, use your knowledge to complete the recipe. Generate a short, engaging introduction for the "post_content". The post title should be "${primaryKeyword}". For the 'video_url' field, find a relevant YouTube video URL that demonstrates how to make the recipe. ${baseInstruction(primaryKeyword)}`;
            } else {
                 prompt = `You are an expert recipe formatter. Analyze this user-provided text: "${source.value}". ${specialInstruction} First, determine the correct and SEO-friendly title for this recipe from the text. Use this title as the primary keyword. Then, structure the text perfectly into the recipe schema. If information is missing, use your knowledge to complete the recipe. Generate a short, engaging introduction for the "post_content". For the 'video_url' field, find a relevant YouTube video URL that demonstrates how to make the recipe. Finally, generate the full SEO package (meta description, slug, image metadata) based on the title you determined.`;
            }
            break;
    }

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: recipeWithIntroSchema }
    });
    return safeJsonParse(response.text, 'generateRecipeWithIntro') as GeneratedPost;
}

// Unified error handler for all generation services
export async function safeGenerate<T>(promise: Promise<T>): Promise<T> {
    try {
        return await promise;
    } catch (error) {
        console.error("Error during Gemini generation:", error);
        if (error instanceof Error) {
            if (error.message.includes('API key not valid')) {
                throw new Error("Your Gemini API key is not valid. Please check it in the settings.");
            }
            if (error.message.includes('429')) {
                throw new Error("API rate limit exceeded. Please wait a moment and try again.");
            }
             if (error.message.includes('response is missing required fields')) {
                 throw new Error("AI response validation failed. It might be incomplete. Please try again.");
             }
        }
        throw new Error("Failed to generate content. The AI model may be temporarily unavailable or there was a network issue.");
    }
}
