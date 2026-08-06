import { NextResponse } from 'next/server';

export async function GET() {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY;
  const rapidApiKey = process.env.RAPIDAPI_KEY || process.env.JSEARCH_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;

  const results: Record<string, any> = {};

  // 1. Test Gemini API Key
  if (!geminiKey || geminiKey.startsWith('AQ.') || geminiKey === 'YOUR_GEMINI_API_KEY') {
    results.gemini = {
      status: 'INVALID_OR_PLACEHOLDER',
      message: 'Gemini API Key is invalid or placeholder. Get a valid free key at https://aistudio.google.com/',
    };
  } else {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
      if (res.ok) {
        results.gemini = { status: 'VALID', message: 'Gemini API Key is working!' };
      } else {
        const errorData = await res.json();
        results.gemini = {
          status: 'ERROR',
          message: errorData.error?.message || `HTTP ${res.status}: Invalid key or permission denied`,
        };
      }
    } catch (err: any) {
      results.gemini = { status: 'NETWORK_ERROR', message: err.message };
    }
  }

  // 2. Test RapidAPI (JSearch) Key
  if (!rapidApiKey || rapidApiKey === 'YOUR_RAPIDAPI_KEY') {
    results.rapidapi = {
      status: 'NOT_CONFIGURED',
      message: 'RapidAPI Key not set. Using sample job feed fallback. Get a free key at https://rapidapi.com/letscrape-6afefacf1563/api/jsearch',
    };
  } else {
    try {
      const res = await fetch('https://jsearch.p.rapidapi.com/search?query=Developer&page=1&num_pages=1', {
        headers: {
          'x-rapidapi-key': rapidApiKey,
          'x-rapidapi-host': 'jsearch.p.rapidapi.com',
        },
      });
      if (res.ok) {
        results.rapidapi = { status: 'VALID', message: 'JSearch / RapidAPI Key is working!' };
      } else {
        results.rapidapi = { status: 'ERROR', message: `HTTP ${res.status}: Invalid key or subscription expired` };
      }
    } catch (err: any) {
      results.rapidapi = { status: 'NETWORK_ERROR', message: err.message };
    }
  }

  // 3. Test Anthropic API Key
  if (!anthropicKey || anthropicKey === 'YOUR_ANTHROPIC_KEY') {
    results.anthropic = { status: 'NOT_CONFIGURED', message: 'Anthropic Key is not set' };
  } else {
    results.anthropic = { status: 'CONFIGURED', message: 'Anthropic API Key is configured' };
  }

  // 4. Test Resend API Key (for email sending)
  if (!resendKey || resendKey === 'YOUR_RESEND_API_KEY') {
    results.resend = {
      status: 'NOT_CONFIGURED',
      message: 'Resend API Key not set. Email dispatch will use simulation mode. Get a free key at https://resend.com/',
    };
  } else {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: 'test@example.com',
          subject: 'Test Email',
          html: '<p>This is a test email to verify the Resend API key.</p>',
        }),
      });
      
      if (res.ok) {
        results.resend = { status: 'VALID', message: 'Resend API Key is working!' };
      } else {
        const errorData = await res.json();
        results.resend = {
          status: 'ERROR',
          message: errorData.message || `HTTP ${res.status}: Invalid key or permission denied`,
        };
      }
    } catch (err: any) {
      results.resend = { status: 'NETWORK_ERROR', message: err.message };
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    results,
    fallbacksActive: {
      nlpParserFallback: true,
      jobFeedFallback: true,
      memoryStoreFallback: true,
      emailSimulationFallback: !resendKey || resendKey === 'YOUR_RESEND_API_KEY',
    },
  });
}
