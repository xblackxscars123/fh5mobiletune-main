import { GoogleGenerativeAI } from "@google/generative-ai";
import { CarSpecs, TuneSettings, TuneType, UnitSystem, convertTuneToUnits, getUnitLabels } from "./tuningCalculator";

// Initialize the Gemini API client
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export interface TuneContext {
  carName?: string;
  tuneType?: TuneType;
  specs?: CarSpecs;
  currentTune?: TuneSettings;
  unitSystem?: UnitSystem;
}

export type ChatMessage = {
  role: "user" | "model";
  parts: string;
};

const SYSTEM_PROMPT = `You are a world-class Forza Horizon 5 tuning expert and mechanic. 
Your goal is to help users optimize their car tunes, solve handling issues, and explain tuning concepts.

You have access to the user's current car specifications and tune settings.
When answering:
1. Be specific and practical. Suggest concrete changes (e.g., "Soften front springs by 10-20 lbs" or "Reduce pressure by 0.2 bar").
2. Explain WHY a change helps (physics/handling).
3. Use the user's preferred unit system (Imperial/Metric) as indicated in the context.
4. Be concise but helpful.

If the user asks about a specific handling problem (e.g., "understeer on entry"), analyze their current settings (especially ARBs, Damping, Diff) and suggest fixes.
`;

export async function sendGeminiMessage(
  history: ChatMessage[],
  newMessage: string,
  context?: TuneContext
) {
  if (!apiKey) {
    throw new Error("Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
  }

  // Construct context string
  let contextStr = "Current Car Context:\n";
  if (context) {
    const unitSystem = context.unitSystem || 'imperial';
    const units = getUnitLabels(unitSystem);
    
    if (context.carName) contextStr += `Car: ${context.carName}\n`;
    if (context.tuneType) contextStr += `Tune Type: ${context.tuneType}\n`;
    
    if (context.specs) {
      const weight = unitSystem === 'metric' ? Math.round(context.specs.weight * 0.453592) : context.specs.weight;
      contextStr += `Specs: ${weight}${units.weight}, ${context.specs.weightDistribution}% Front, ${context.specs.driveType}\n`;
      if (context.specs.frontTireWidth) contextStr += `Tires: ${context.specs.frontTireWidth}mm F / ${context.specs.rearTireWidth}mm R\n`;
    }
    
    if (context.currentTune) {
      const displayTune = convertTuneToUnits(context.currentTune, unitSystem);
      
      contextStr += `Current Tune Settings (${unitSystem.toUpperCase()}):\n`;
      contextStr += `- Tires: ${displayTune.tirePressureFront}/${displayTune.tirePressureRear} ${units.pressure}\n`;
      contextStr += `- Springs: ${displayTune.springsFront}/${displayTune.springsRear} ${units.springs}\n`;
      contextStr += `- ARBs: ${displayTune.arbFront}/${displayTune.arbRear}\n`;
      contextStr += `- Damping (Rebound): ${displayTune.reboundFront}/${displayTune.reboundRear}\n`;
      contextStr += `- Damping (Bump): ${displayTune.bumpFront}/${displayTune.bumpRear}\n`;
      contextStr += `- Diff (Accel): ${displayTune.diffAccelRear}%\n`;
    }
    
    contextStr += `\nUser Preference: ${unitSystem} units.\n`;
  }

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT + "\n\n" + contextStr }],
      },
      {
        role: "model",
        parts: [{ text: "Understood. I am ready to assist with your Forza Horizon 5 tuning needs based on the provided car context." }],
      },
      ...history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.parts }]
      }))
    ],
  });

  const result = await chat.sendMessageStream(newMessage);
  return result.stream;
}
