import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiter (per deployment instance)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

function getClientIP(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  const userAgent = req.headers.get("user-agent") || "unknown";
  const acceptLang = req.headers.get("accept-language") || "unknown";
  return `fingerprint:${userAgent.slice(0, 50)}:${acceptLang.slice(0, 20)}`;
}

function checkRateLimit(clientId: string): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const clientData = rateLimitMap.get(clientId);
  
  if (rateLimitMap.size > 10000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }
  
  if (!clientData || now > clientData.resetTime) {
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

// Build dynamic system prompt with tune context
function buildSystemPrompt(tuneContext?: {
  carName?: string;
  tuneType?: string;
  specs?: Record<string, unknown>;
  currentTune?: Record<string, unknown>;
}): string {
  let basePrompt = `You are a suspension and handling tuning expert for Forza Horizon 5.

CRITICAL RULES - READ THESE FIRST:
1. You advise on SUSPENSION, DIFFERENTIAL, BRAKES, and TIRE SETTINGS ONLY
2. The user's car is ALREADY BUILT to their target PI class - you CANNOT change PI
3. You do NOT advise on engine swaps, tire compound changes, weight reduction, or any parts
4. When a user says "A class tune" they have a car AT A class that needs handling help
5. Your job is to make the car HANDLE BETTER at its current performance level

WHAT YOU CAN TUNE:
- Tire pressure (PSI/BAR)
- Alignment (camber, toe, caster)
- Anti-roll bars (ARB)
- Springs and ride height
- Damping (rebound and bump)
- Differential settings
- Brake pressure and balance
- Aero (if equipped)
- Gearing (final drive and ratios)

WHAT YOU CANNOT CHANGE (DO NOT SUGGEST THESE):
- Engine/turbo upgrades
- Tire compound (street -> sport -> slick)
- Weight reduction parts
- Drivetrain conversions (RWD -> AWD)
- ANYTHING that affects PI rating

HANDLING SYMPTOM SOLUTIONS:

UNDERSTEER (car won't turn):
- Soften front ARB by 3-5 points, stiffen rear ARB by 3-5 points
- Increase front tire pressure 0.5-1 PSI
- Add more negative front camber (-0.2° to -0.5°)
- Reduce front diff accel 5-10% (AWD)
- Lower front ride height by 0.1-0.2"

OVERSTEER (rear slides out unexpectedly):
- Stiffen front ARB by 3-5 points, soften rear ARB by 3-5 points
- Increase rear tire pressure 0.5-1 PSI
- Reduce rear diff accel 5-10%
- Add rear aero if available
- Soften rear springs by 10-15%

LIFT-OFF OVERSTEER (rear snaps when lifting throttle):
- Lower rear diff decel by 5-10%
- Stiffen rear rebound damping by 1-2 points
- Reduce rear brake bias by 2-3%

POWER-ON OVERSTEER (rear slides under acceleration):
- Lower rear diff accel by 5-10%
- Soften rear ARB by 3-5 points
- Increase rear tire pressure 0.5-1 PSI

BOUNCY/UNSTABLE:
- Increase bump and rebound damping by 1-2 points each
- Stiffen springs by 10-15%
- Check tire pressures aren't too low (aim for 28-32 PSI hot)

BOTTOMING OUT:
- Increase spring rates by 15-25%
- Raise ride height
- Increase rebound damping

DIRT/RALLY/CROSS-COUNTRY EXPERTISE:

DIRT FUNDAMENTALS:
- Softer springs essential for terrain absorption and tire contact
- Maximum ride height prevents bottoming out on jumps/bumps
- Lower tire pressure (22-26 PSI) increases contact patch on loose surfaces
- High rebound damping "sticks" landings after jumps
- Near-locked differentials (80-100%) maintain traction when wheels leave ground

TIRE PRESSURE BY SURFACE:
- Loose Gravel: 24-26 PSI (max contact patch)
- Packed Dirt: 26-28 PSI
- Wet Mud: 22-24 PSI (lowest possible)
- Cross Country: 17-22 PSI (very low for flotation)

SUSPENSION FOR DIRT:
- Springs: 25-50% softer than road tune equivalent
- Ride Height: Maximum (both front and rear) - 9-10 inches
- Fine-tune: Lower rear 0.1" for understeer, lower front 0.1" for oversteer
- Rebound: Higher than bump (bump = 50-75% of rebound)
- Dampers: Monitor suspension travel - aim for 20-80% compression

ALIGNMENT FOR DIRT:
- Camber: -1.0° to -1.5° Front, -0.5° to -1.0° Rear (less aggressive than road)
- Toe: Front 0.0° to -0.1° (slight toe-out), Rear 0.0° to +0.1° (toe-in)
- Caster: 5.0° to 6.0° (increase 0.1° for stability)

ARBs FOR DIRT:
- Keep both soft for wheel independence over bumps
- Front 15-25, Rear 15-25 for cross-country
- Rally can be slightly stiffer: Front 20-30, Rear 20-30

DIFFERENTIAL FOR DIRT (AWD preferred):
- Accel Lock: 70-95% (higher than road for traction on loose surfaces)
- Decel Lock: 30-50% (moderate to avoid understeer on entry)
- Center Balance: 50-60% rear bias (balanced traction)
- AVOID below 50% accel lock - causes inconsistent traction

BRAKES FOR DIRT:
- Pressure: 88-95% (lower to prevent lockups on loose surfaces)
- Bias: 48-52% (slight rear bias helps initiate controlled slides)
- Practice trail braking to rotate car into corners

RESPONSE FORMATTING:
- Be specific with numbers: "Set ARB Front to 28" not "lower the front ARB"
- Format adjustments like: "Try setting [SETTING_NAME] to [VALUE]"
- Keep responses concise but informative
- Use bullet points for multiple recommendations
- Always explain WHY a setting helps

IMPORTANT: When suggesting tune adjustments, format specific value changes like this:
- "Try setting ARB Front to 28"
- "Set Tire Pressure Rear to 30 PSI"
- "Adjust Diff Accel Rear to 65%"
This helps the user apply your suggestions directly.`;

  // Add tune context if available
  if (tuneContext) {
    basePrompt += `\n\n--- CURRENT TUNE CONTEXT ---`;
    
    if (tuneContext.carName) {
      basePrompt += `\nCar: ${tuneContext.carName}`;
    }
    
    if (tuneContext.tuneType) {
      basePrompt += `\nTune Type: ${tuneContext.tuneType}`;
    }
    
    if (tuneContext.specs) {
      const specs = tuneContext.specs;
      basePrompt += `\nCar Specs:`;
      if (specs.weight) basePrompt += `\n  - Weight: ${specs.weight} lbs`;
      if (specs.weightDistribution) basePrompt += `\n  - Weight Distribution: ${specs.weightDistribution}% front`;
      if (specs.driveType) basePrompt += `\n  - Drive Type: ${specs.driveType}`;
      if (specs.horsepower) basePrompt += `\n  - Horsepower: ${specs.horsepower} HP`;
      if (specs.piClass) basePrompt += `\n  - PI Class: ${specs.piClass} (THIS IS FIXED - do not suggest changing it)`;
      if (specs.tireCompound) basePrompt += `\n  - Tire Compound: ${specs.tireCompound} (THIS IS FIXED - do not suggest changing it)`;
    }
    
    if (tuneContext.currentTune) {
      const tune = tuneContext.currentTune;
      basePrompt += `\nCurrent Tune Settings (suggest changes relative to these):`;
      if (tune.tirePressureFront !== undefined) basePrompt += `\n  - Tire Pressure: F ${tune.tirePressureFront} / R ${tune.tirePressureRear} PSI`;
      if (tune.camberFront !== undefined) basePrompt += `\n  - Camber: F ${tune.camberFront}° / R ${tune.camberRear}°`;
      if (tune.toeFront !== undefined) basePrompt += `\n  - Toe: F ${tune.toeFront}° / R ${tune.toeRear}°`;
      if (tune.caster !== undefined) basePrompt += `\n  - Caster: ${tune.caster}°`;
      if (tune.arbFront !== undefined) basePrompt += `\n  - Anti-Roll Bars: F ${tune.arbFront} / R ${tune.arbRear}`;
      if (tune.springsFront !== undefined) basePrompt += `\n  - Springs: F ${tune.springsFront} / R ${tune.springsRear} LB/IN`;
      if (tune.rideHeightFront !== undefined) basePrompt += `\n  - Ride Height: F ${tune.rideHeightFront} / R ${tune.rideHeightRear} IN`;
      if (tune.reboundFront !== undefined) basePrompt += `\n  - Rebound: F ${tune.reboundFront} / R ${tune.reboundRear}`;
      if (tune.bumpFront !== undefined) basePrompt += `\n  - Bump: F ${tune.bumpFront} / R ${tune.bumpRear}`;
      if (tune.diffAccelRear !== undefined) basePrompt += `\n  - Diff (Rear): Accel ${tune.diffAccelRear}% / Decel ${tune.diffDecelRear}%`;
      if (tune.diffAccelFront !== undefined) basePrompt += `\n  - Diff (Front): Accel ${tune.diffAccelFront}% / Decel ${tune.diffDecelFront}%`;
      if (tune.centerBalance !== undefined) basePrompt += `\n  - Center Diff: ${tune.centerBalance}% rear`;
      if (tune.brakePressure !== undefined) basePrompt += `\n  - Brakes: ${tune.brakePressure}% pressure, ${tune.brakeBalance}% balance`;
      if (tune.finalDrive !== undefined) basePrompt += `\n  - Final Drive: ${tune.finalDrive}`;
    }
    
    basePrompt += `\n--- END CONTEXT ---\n\nUse this context to give specific, tailored advice. Reference the actual current values when suggesting changes. Remember: you can ONLY adjust handling settings - the car's PI class and parts are FIXED.`;
  }

  return basePrompt;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const { messages, tuneContext } = body as { 
      messages: unknown; 
      tuneContext?: {
        carName?: string;
        tuneType?: string;
        specs?: Record<string, unknown>;
        currentTune?: Record<string, unknown>;
      };
    };
    
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

    // Build system prompt with tune context
    const systemPrompt = buildSystemPrompt(tuneContext);
    console.log("Tune context received:", tuneContext ? "yes" : "no");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
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
