import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load environment variables reliably from all candidate locations (.env.local, ../.env.local, .env)
 */
function loadEnvVariables() {
  const candidatePaths = [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(__dirname, '../.env.local'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '../.env')
  ];

  for (const envPath of candidatePaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath, override: true });
    }
  }
}

// Initial environment variable load
loadEnvVariables();

const app = express();
app.use(express.json({ limit: '1mb' }));

// CORS middleware allowing local Vite development origins
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Environment variable resolution
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Initialize a client-scoped Supabase instance passing user JWT authorization header
 */
function getSupabaseClient(authToken?: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: authToken
      ? {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      : undefined
  });
}

/**
 * Fixed Server-Side System Prompt enforcing educational & safety guardrails
 */
const SYSTEM_PROMPT = `You are the Hi Mumma educational support assistant.

Hi Mumma is an educational and organizational pregnancy/postpartum companion.

Your role is limited to:
- general pregnancy and postpartum education
- explaining common pregnancy concepts in simple language
- helping organize questions for an OB-GYN
- appointment preparation
- general lifestyle and nutrition education
- explaining information already provided by the Hi Mumma educational content
- helping users understand terminology

You must NOT:
- diagnose diseases or medical conditions
- determine whether symptoms are emergencies
- perform medical triage
- prescribe medicines
- recommend medication doses
- recommend supplement doses
- change a clinician's treatment plan
- tell the user to start, stop, or change medication
- provide individualized clinical decisions
- claim to replace an OB-GYN, doctor, nurse, or other healthcare professional
- invent universal pregnancy schedules or medical requirements

When a user asks for diagnosis, treatment, medication/dosage, supplement dosage, or urgency/triage:
- do not provide the requested clinical decision
- explain that Hi Mumma cannot make that decision
- encourage the user to contact their attending clinician or appropriate healthcare service
- if the question is suitable for education, provide general educational context without turning it into individualized medical advice

For pregnancy/postpartum information, clearly distinguish general educational information from clinician-specific advice.

Never claim certainty when medical information depends on the individual's clinician, history, tests, location, or circumstances.

Keep answers clear, calm, concise, and understandable to a mother/family member.

Do not use frightening language.

Do not diagnose based on symptoms.`;

/**
 * Health Check Endpoint
 * GET /api/health
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    service: 'hi-mumma-gemini'
  });
});

/**
 * AI Educational Assistant Proxy Endpoint (Google Gemini API)
 * POST /api/ai
 */
app.post('/api/ai', async (req: Request, res: Response) => {
  try {
    // 1. Authenticate user using Supabase Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid Authorization header.'
      });
    }

    const token = authHeader.split(' ')[1]?.trim();
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Missing authentication token.'
      });
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({
        success: false,
        error: 'Supabase configuration is missing on the server.'
      });
    }

    const supabase = getSupabaseClient(token);

    // 2. Server-side JWT verification
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired authentication session.'
      });
    }

    const userId = authData.user.id;

    // 3. Verify user role (Mothers/Patients only)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (profileError || !profile) {
      return res.status(403).json({
        success: false,
        error: 'User profile not found.'
      });
    }

    if (profile.role !== 'patient') {
      return res.status(403).json({
        success: false,
        error: 'Access restricted: AI educational assistant is accessible to mothers only.'
      });
    }

    // 4. Input validation
    const { message, stageContext, previousResponseId } = req.body || {};

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a non-empty string.'
      });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length > 4000) {
      return res.status(400).json({
        success: false,
        error: 'Message length exceeds the maximum allowed limit of 4000 characters.'
      });
    }

    if (previousResponseId !== undefined && typeof previousResponseId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'previousResponseId must be a string if provided.'
      });
    }

    // 5. Server-side GEMINI_API_KEY check with dynamic reload fallback
    let geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey || geminiApiKey.trim().length === 0) {
      loadEnvVariables();
      geminiApiKey = process.env.GEMINI_API_KEY;
    }

    const isKeyConfigured = Boolean(geminiApiKey && geminiApiKey.trim().length > 0);

    // Process minimal non-sensitive pregnancy stage context if supplied
    let promptContents = trimmedMessage;
    if (stageContext && typeof stageContext === 'string' && stageContext.trim().length > 0) {
      const cleanStageContext = stageContext.trim().slice(0, 100);
      promptContents = `[Current Pregnancy Stage Context: ${cleanStageContext}]\n\nUser Question: ${trimmedMessage}`;
    }

    // Safe non-sensitive diagnostic logging
    console.log('[AI API Diagnostic]', {
      postEndpointReached: true,
      authenticatedPatientVerified: true,
      geminiKeyConfigured: isKeyConfigured,
      geminiClientInitialized: isKeyConfigured,
      hasStageContext: Boolean(stageContext),
      modelUsed: 'gemini-3.6-flash'
    });

    if (!isKeyConfigured || !geminiApiKey) {
      console.error('[AI API Error] GEMINI_API_KEY is not configured in process.env');
      return res.status(500).json({
        success: false,
        error: 'Gemini API key is not configured on the server.'
      });
    }

    // 6. Call Google Gemini API using gemini-3.6-flash model
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptContents,
      config: {
        systemInstruction: SYSTEM_PROMPT
      }
    });

    console.log('[AI API Diagnostic]', {
      geminiRequestSucceeded: true,
      geminiResponseReceived: Boolean(geminiResponse)
    });

    const answerText = geminiResponse.text || '';
    const generatedResponseId = `gemini-${Date.now()}`;

    return res.status(200).json({
      success: true,
      answer: answerText,
      responseId: generatedResponseId
    });
  } catch (err: any) {
    console.error('[Gemini Server Error Exception Details]:', {
      name: err?.name,
      message: err?.message,
      status: err?.status || err?.statusCode,
      code: err?.code || err?.errorDetails?.[0]?.reason,
      stack: err?.stack
    });

    if (err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED')) {
      return res.status(429).json({
        success: false,
        error: 'Upstream rate limit exceeded. Please wait a moment and try again.'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'An unexpected server error occurred.'
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[Hi Mumma Gemini Backend] Server running on http://localhost:${PORT}`);
});
