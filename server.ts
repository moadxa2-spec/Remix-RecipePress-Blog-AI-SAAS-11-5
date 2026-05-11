import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use sandbox for Pinterest Trial access, production for Standard/Approved access.
// Set PINTEREST_USE_SANDBOX=true in your .env to use the sandbox.
const PINTEREST_API_BASE = 'https://api.pinterest.com/v5';
console.log('Pinterest API Base:', PINTEREST_API_BASE);
async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add JSON parsing middleware
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // In-memory cache for generated images
  const generatedImageCache = new Map();

  // API Route for generating images and caching them slightly
  app.post("/api/generate-image", async (req, res) => {
      try {
          const { prompt, geminiApiKey } = req.body;
          if (!prompt || !geminiApiKey) {
              return res.status(400).json({ error: "Missing prompt or geminiApiKey" });
          }

          const { GoogleGenAI, Modality } = await import("@google/genai");
          const ai = new GoogleGenAI({ apiKey: geminiApiKey });
          const aiResponse = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: { parts: [{ text: prompt }] },
              config: {
                  responseModalities: [Modality.IMAGE],
              },
          });

          const part = aiResponse.candidates?.[0]?.content?.parts?.[0];
          if (part && part.inlineData && part.inlineData.data) {
              const base64Data = part.inlineData.data;
              const mimeType = part.inlineData.mimeType || 'image/jpeg';
              const imageId = Date.now().toString(36) + Math.random().toString(36).substring(2);
              
              generatedImageCache.set(imageId, { base64Data, mimeType });
              
              // Automatically clean up cache after 10 minutes
              setTimeout(() => {
                  generatedImageCache.delete(imageId);
              }, 10 * 60 * 1000);

              res.json({ imageId, imageUrl: `/api/generated-image/${imageId}` });
          } else {
              throw new Error("Failed to generate image bytes");
          }
      } catch (e) {
          console.error("Image generation error:", e);
          res.status(500).json({ error: String(e) });
      }
  });

  app.get("/api/generated-image/:id", (req, res) => {
      const img = generatedImageCache.get(req.params.id);
      if (img) {
          res.setHeader('Content-Type', img.mimeType);
          res.send(Buffer.from(img.base64Data, 'base64'));
      } else {
          res.status(404).send("Not found");
      }
  });

  // API Route for Pinterest OAuth Token Exchange proxy
  app.post("/api/pinterest/token", async (req, res) => {
    try {
      const { code, redirect_uri } = req.body;

      const formData = new URLSearchParams();
      formData.append('grant_type', 'authorization_code');
      formData.append('code', code);
      formData.append('redirect_uri', redirect_uri || '');

      const appId = process.env.VITE_PINTEREST_APP_ID || process.env.PINTEREST_APP_ID || '';
      const appSecret = process.env.VITE_PINTEREST_APP_SECRET || process.env.PINTEREST_APP_SECRET || '';
      const authHeader = `Basic ${Buffer.from(`${appId}:${appSecret}`).toString('base64')}`;

      const oauthApiBase = 'https://api.pinterest.com/v5';
      const pinterestRes = await fetch(`${oauthApiBase}/oauth/token`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': authHeader
          },
          body: formData.toString()
      });

      const data = await pinterestRes.json();
      console.log('Pinterest Token Exchange Response Status:', pinterestRes.status);
      console.log('Pinterest Token Exchange Response Data Keys:', Object.keys(data));
      if (!data.access_token) {
          console.error('MISSING ACCESS TOKEN IN RESPONSE. Full Data:', JSON.stringify(data));
      }
      res.status(pinterestRes.status).json(data);
    } catch (e) {
      console.error('Pinterest Token Error:', e);
      res.status(500).json({ error: String(e) });
    }
  });

  // API Route for Pinterest Boards proxy
  app.get("/api/pinterest/boards", async (req, res) => {
      try {
          const authHeader = req.headers.authorization;
          const pinterestRes = await fetch(`${PINTEREST_API_BASE}/boards`, {
              headers: {
                  'Authorization': authHeader || ''
              }
          });
          const text = await pinterestRes.text();
          let data;
          try { data = JSON.parse(text); } catch(e) { data = { content: text }; }
          if (!pinterestRes.ok) {
              console.error("Pinterest Boards Error Response:", pinterestRes.status, text);
          }
          res.status(pinterestRes.status).json(data);
      } catch (e) {
          console.error('Pinterest Boards Proxy Exception:', e);
          res.status(500).json({ error: String(e) });
      }
  });

  // API Route for Pinterest Pin Creation proxy
  app.post("/api/pinterest/pins", async (req, res) => {
      try {
          const authHeader = req.headers.authorization;
          const payload = { ...req.body };
          
          if (payload.imageId) {
              const img = generatedImageCache.get(payload.imageId);
              if (img) {
                  payload.media_source = {
                      source_type: "image_base64",
                      content_type: img.mimeType,
                      data: img.base64Data
                  };
              } else {
                  return res.status(400).json({ error: "Generated image expired or not found" });
              }
              delete payload.imageId;
          }

          const pinterestRes = await fetch(`${PINTEREST_API_BASE}/pins`, {
              method: 'POST',
              headers: {
                  'Authorization': authHeader || '',
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
          });
          
          if (!pinterestRes.ok) {
              const errText = await pinterestRes.text();
              console.error("Pinterest API returned error for Pins:", pinterestRes.status, errText);
              return res.status(pinterestRes.status).send(errText);
          }
          
          const data = await pinterestRes.json();
          res.status(pinterestRes.status).json(data);
      } catch (e) {
          console.error('Pinterest Pins Error:', e);
          res.status(500).json({ error: String(e) });
      }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), 'dist');
    console.log(`[Server] serving from ${distPath}`);
    app.use(express.static(distPath));
    
    // SPA fallback
    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();