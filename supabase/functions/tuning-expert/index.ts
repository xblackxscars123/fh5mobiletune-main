import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiter (per deployment instance)
// For production with multiple instances, use Supabase/Redis
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute per IP

function getClientIP(req: Request): string {
  // Check various headers for the real client IP
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  // Fallback to a hash of user-agent + accept-language as fingerprint
  const userAgent = req.headers.get("user-agent") || "unknown";
  const acceptLang = req.headers.get("accept-language") || "unknown";
  return `fingerprint:${userAgent.slice(0, 50)}:${acceptLang.slice(0, 20)}`;
}

function checkRateLimit(clientId: string): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const clientData = rateLimitMap.get(clientId);
  
  // Clean up old entries periodically
  if (rateLimitMap.size > 10000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }
  
  if (!clientData || now > clientData.resetTime) {
    // New window
    rateLimitMap.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetInSeconds: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000) };
  }
  
  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    const resetInSeconds = Math.ceil((clientData.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, resetInSeconds };
  }
  
  clientData.count++;
  return { 
    allowed: true, 
    remaining: MAX_REQUESTS_PER_WINDOW - clientData.count, 
    resetInSeconds: Math.ceil((clientData.resetTime - now) / 1000) 
  };
}

// Input validation
function validateMessages(messages: unknown): { valid: boolean; error?: string } {
  if (!Array.isArray(messages)) {
    return { valid: false, error: "Messages must be an array" };
  }
  if (messages.length === 0) {
    return { valid: false, error: "Messages array cannot be empty" };
  }
  if (messages.length > 50) {
    return { valid: false, error: "Too many messages in conversation" };
  }
  
  for (const msg of messages) {
    if (typeof msg !== 'object' || msg === null) {
      return { valid: false, error: "Invalid message format" };
    }
    if (!('role' in msg) || !('content' in msg)) {
      return { valid: false, error: "Message must have role and content" };
    }
    if (typeof msg.role !== 'string' || !['user', 'assistant', 'system'].includes(msg.role)) {
      return { valid: false, error: "Invalid message role" };
    }
    if (typeof msg.content !== 'string') {
      return { valid: false, error: "Message content must be a string" };
    }
    if (msg.content.length > 10000) {
      return { valid: false, error: "Message content too long" };
    }
  }
  
  return { valid: true };
}

const SYSTEM_PROMPT = `You are a professional Forza Horizon 5 tuning expert with deep knowledge of car physics, suspension geometry, and racing setups. Your expertise includes:

- Tire pressure optimization for different driving styles (grip, drift, drag, rally)
- Suspension tuning: springs, damping, anti-roll bars, and ride height
- Differential settings for various drivetrains (AWD, RWD, FWD)
- Gearing ratios and final drive optimization
- Aero balance and downforce settings
- Brake bias and brake pressure tuning
- Alignment settings: camber, toe, and caster

Be helpful, technical but accessible, and provide specific numbers when asked. Use racing terminology naturally. If someone asks about a specific car, give tailored advice based on typical characteristics of that vehicle class.

Keep responses concise but informative. Use bullet points for tuning recommendations. Always explain WHY a setting helps, not just what to set it to.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const clientId = getClientIP(req);
    const rateLimitResult = checkRateLimit(clientId);
    
    if (!rateLimitResult.allowed) {
      console.warn(`Rate limit exceeded for client: ${clientId}`);
      return new Response(
        JSON.stringify({ 
          error: `Rate limit exceeded. Please wait ${rateLimitResult.resetInSeconds} seconds before trying again.` 
        }), 
        {
          status: 429,
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.resetInSeconds.toString(),
          },
        }
      );
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (typeof body !== 'object' || body === null || !('messages' in body)) {
      return new Response(JSON.stringify({ error: "Request must include messages array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = body as { messages: unknown };
    
    // Validate messages
    const validation = validateMessages(messages);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...(messages as Array<{ role: string; content: string }>),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
      },
    });
  } catch (error) {
    console.error("Tuning expert error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
