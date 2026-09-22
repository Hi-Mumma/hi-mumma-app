import { supabase } from './supabaseClient';

export interface AiApiResponse {
  success: boolean;
  answer?: string;
  responseId?: string;
  error?: string;
}

export interface AiMessageRequest {
  message: string;
  previousResponseId?: string;
}

/**
 * Frontend service for communicating with the secure Hi Mumma Gemini AI backend.
 * Uses the active Supabase JWT session for authorization.
 */
export async function sendAiMessage(request: AiMessageRequest): Promise<AiApiResponse> {
  const { message, previousResponseId } = request;

  if (!message || !message.trim()) {
    return {
      success: false,
      error: 'Please enter a valid non-empty question.'
    };
  }

  try {
    // 1. Retrieve current Supabase authenticated session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      return {
        success: false,
        error: 'You must be signed in as a mother to consult the AI assistant.'
      };
    }

    // 2. Resolve backend URL from environment
    const baseUrl = (import.meta.env.VITE_AI_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
    const endpoint = `${baseUrl}/api/ai`;

    // 3. Send message payload to secure proxy server
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        message: message.trim(),
        previousResponseId: previousResponseId ? previousResponseId.trim() : undefined
      })
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          error: 'Your session has expired. Please sign in again.'
        };
      }
      if (response.status === 403) {
        return {
          success: false,
          error: data.error || 'Gemini AI Assistant is accessible to mothers only.'
        };
      }
      if (response.status === 429) {
        return {
          success: false,
          error: 'Rate limit reached. Please wait a moment before asking another question.'
        };
      }

      return {
        success: false,
        error: data.error || 'Failed to receive a response from the AI assistant. Please try again.'
      };
    }

    return {
      success: true,
      answer: data.answer || '',
      responseId: data.responseId || ''
    };
  } catch (err: any) {
    console.error('[AI Service Error]:', err?.message || err);
    return {
      success: false,
      error: 'Unable to connect to the AI assistant server. Please check your network connection.'
    };
  }
}
