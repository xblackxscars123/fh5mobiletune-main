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
  let basePrompt = `You are a professional Forza Horizon 5 tuning expert with deep knowledge of car physics, suspension geometry, and racing setups. Your expertise includes:

CORE TUNING KNOWLEDGE:
- Tire pressure optimization for different driving styles (grip, drift, drag, rally, offroad, street)
- Suspension tuning: springs, damping, anti-roll bars, and ride height
- Differential settings for various drivetrains (AWD, RWD, FWD) - understanding lock %, slip %, and torque distribution
- Gearing ratios and final drive optimization for acceleration vs top speed
- Aero balance and downforce settings for stability and downforce distribution
- Brake bias and brake pressure tuning - front/rear balance and lock-up prevention
- Alignment settings: camber, toe, and caster effects on handling

PHYSICS PRINCIPLES YOU UNDERSTAND:
- Weight transfer and how suspension affects it
- Oversteer vs understeer and how to fix each with specific settings
- Tire grip curves and optimal operating temperatures
- Spring stiffness vs car weight and power output
- How drivetrain type affects tuning approach
- Load sensitivity and dynamic effects under braking/acceleration

TUNE-TYPE SPECIFIC EXPERTISE:
GRIP RACING: Balance tire temps, minimize tire wear, focus on responsive handling, high downforce if aero available
DRIFT: Loose setup with adjustable balance, high rear ARB, lowered tire pressure for easier angle, practice-friendly tuning
DRAG: Launch control focus, traction-heavy settings, minimized wheelspin, high spring rates for weight transfer
RALLY/OFFROAD: High ride height, softer setup for terrain compliance, predictable weight transfer, traction essential
STREET: Balanced approach, forgiving tuning, good braking, casual-friendly but still effective
OFFROAD: Lower tire pressure for flotation, suspension compliance, traction priority over precision

TUNING PHILOSOPHY:
Be helpful, technical but accessible, and provide specific numbers when asked. Use racing terminology naturally. 
Give tailored advice based on the car's weight, weight distribution, horsepower, drivetrain, and class.
Always explain WHY a setting helps the vehicle balance, not just what to set it to.
Reference real physics principles: "The heavier rear will benefit from stiffer springs to handle weight transfer" etc.

RESPONSE FORMAT:
Keep responses concise but informative. Use bullet points for tuning recommendations.
Always explain the physics behind changes.
Provide specific numerical suggestions that make sense for the given context.

IMPORTANT: When suggesting tune adjustments, format specific value changes like this:
- For single values: "Try setting [SETTING_NAME] to [VALUE]"
- Examples: "Try setting ARB Front to 28" or "Set your Tire Pressure Rear to 30 PSI"
This helps the user apply your suggestions directly.`;

  // Add tune context if available
  if (tuneContext) {
    basePrompt += `\n\n--- CURRENT TUNE CONTEXT ---`;
    
    if (tuneContext.carName) {
      basePrompt += `\nCar: ${tuneContext.carName}`;
    }
    
    if (tuneContext.tuneType) {
      basePrompt += `\nTune Type: ${tuneContext.tuneType}`;
      
      // Add tune-type specific guidance
      const tuneTypeGuidance: Record<string, string> = {
        grip: "\nGRIP TUNING FOCUS: Prioritize tire temperature management, precise handling response, and balanced weight distribution. Spring stiffness should support the car's weight without excessive damping. Aim for neutral or slight understeer for safety.",
        drift: "\nDRIFT TUNING FOCUS: Prioritize angle-friendly setup with adjustable balance for prolonged drifts. Rear ARB should be stiffer than front for rotation. Lower tire pressure (if safe) aids angle. Engine power band delivery is crucial for initiation.",
        drag: "\nDRAG TUNING FOCUS: Maximize traction off the line - this is everything. Use high spring rates, high brake balance rear, aggressive diff lock on acceleration. Minimize wheelspin, manage launch weight transfer carefully.",
        rally: "\nRALLY TUNING FOCUS: Emphasize suspension compliance and predictable weight transfer. Softer springs than grip tuning, higher ride height for terrain, good brake balance for trail-braking. Traction and forgiveness > precision.",
        offroad: "\nOFFROAD TUNING FOCUS: Extreme emphasis on compliance and traction. Very soft springs, high ride height, low tire pressure for flotation, forgiving damping. Handle unpredictable surfaces with smooth, predictable inputs.",
        street: "\nSTREET TUNING FOCUS: Balanced, forgiving setup for casual driving. Mid-range spring rates, responsive steering, good braking feel. Focus on usability and consistency rather than edge-case performance.",
      };
      
      const guidance = tuneTypeGuidance[tuneContext.tuneType as string];
      if (guidance) basePrompt += guidance;
    }
    
    if (tuneContext.specs) {
      const specs = tuneContext.specs;
      basePrompt += `\nCar Specifications:`;
      if (specs.weight) basePrompt += `\n  - Weight: ${specs.weight} lbs`;
      if (specs.weightDistribution) basePrompt += `\n  - Weight Distribution: ${specs.weightDistribution}% front`;
      if (specs.driveType) {
        basePrompt += `\n  - Drive Type: ${specs.driveType}`;
        
        // Add drivetrain-specific notes
        const driveTypeNotes: Record<string, string> = {
          RWD: " (RWD: Naturally slideable, rear-biased tuning, oversteer tendency)",
          FWD: " (FWD: Front-heavy, tendency to understeer, torque steer considerations)",
          AWD: " (AWD: Best traction, diff balance is critical, center diff affects handling balance)",
        };
        basePrompt += driveTypeNotes[specs.driveType as string] || "";
      }
      if (specs.horsepower) {
        basePrompt += `\n  - Horsepower: ${specs.horsepower} HP`;
        const hp = specs.horsepower as number;
        if (hp > 600) basePrompt += " (High power: stiffer suspension needed, braking is critical)";
        else if (hp > 400) basePrompt += " (Moderate power: balanced setup recommended)";
        else basePrompt += " (Lower power: softer setup acceptable, focus on efficiency)";
      }
      if (specs.piClass) basePrompt += `\n  - PI Class: ${specs.piClass}`;
      if (specs.tireCompound) basePrompt += `\n  - Tire Compound: ${specs.tireCompound}`;
      if (specs.hasAero) basePrompt += `\n  - Aerodynamic Parts: ${specs.hasAero ? "Yes (use aero balance)" : "No"}`;
    }
    
    if (tuneContext.currentTune) {
      const tune = tuneContext.currentTune;
      basePrompt += `\nCurrent Tune Settings:`;
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
    
    // Add comprehensive tuning guidance
    basePrompt += `\n\n--- TUNING ADJUSTMENT STRATEGY ---`;
    basePrompt += `\nWhen the user describes a handling issue, use this systematic approach:
1. IDENTIFY THE PROBLEM: Understeer (pushing), oversteer (sliding rear), poor traction, lack of control
2. FIND THE ROOT CAUSE: Weight transfer, tire temp/grip, stiffness imbalance, differential aggression
3. SUGGEST SPECIFIC FIXES: Give 2-3 specific value changes with clear physics reasoning
4. EXPLAIN TRADE-OFFS: Every change affects multiple handling characteristics
5. PRIORITIZE: Start with high-impact changes (ARB, springs, tire pressure) before minor tweaks

COMMON FIXES BY PROBLEM:
UNDERSTEER (car pushes wide):
  → Lower front ARB (reduces front grip demand)
  → Increase front tire pressure (adds grip)
  → Reduce front spring stiffness (better weight transfer)
  → Increase front camber (negative, adds grip)
  → Check brake balance - may be too front-biased

OVERSTEER (rear slides out):
  → Increase rear ARB (stiffens rear)
  → Reduce rear tire pressure (adds grip)
  → Increase rear spring stiffness (better weight transfer)
  → Decrease front ARB (less rotation)
  → Check diff settings - may be too loose

POOR LAUNCH/WHEELSPIN:
  → Increase spring stiffness (handles weight transfer)
  → Increase rear diff acceleration lock (0-10% usually)
  → Increase tire pressure slightly
  → Increase brake pressure for engine braking
  → Check horsepower vs setup - may need gearing adjustment

LACK OF ROTATION/SLOW TURN-IN:
  → Decrease front ARB (allows more flex)
  → Reduce front spring stiffness (quicker response)
  → Increase front camber (negative, adds grip)
  → Reduce caster (less return-to-center, more agile)

--- END CONTEXT ---

Use this comprehensive knowledge to give specific, tailored, physics-based advice. When suggesting changes, always explain the physics principle and expected outcome.`;
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
