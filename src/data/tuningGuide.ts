// Educational content for tuning tooltips - "Guide for Dummies"
// Each explanation is written in simple, non-technical language

export interface TuningExplanation {
  title: string;
  what: string;
  why: string;
  tip?: string;
}

// Input field explanations
export const inputExplanations: Record<string, TuningExplanation> = {
  weight: {
    title: "Vehicle Weight",
    what: "Your car's total weight from the stats screen in Forza.",
    why: "Heavier cars need stiffer springs and more braking power. It affects almost every tune setting.",
    tip: "Find this in your car's stats before tuning!",
  },
  weightDistribution: {
    title: "Weight Distribution",
    what: "THE most important number! Shows what percentage of weight is over the front wheels.",
    why: "A 52% front means 52% of weight is on front wheels. This single number determines springs, ARBs, and damping balance.",
    tip: "This is found in your car's stats. Most cars are 50-55% front.",
  },
  driveType: {
    title: "Drive Type",
    what: "Which wheels receive power from the engine.",
    why: "RWD = rear wheels only (more oversteer). FWD = front wheels only (more understeer). AWD = all wheels (best traction, different diff settings).",
    tip: "AWD is easiest for beginners, RWD is most fun for skilled drivers.",
  },
  horsepower: {
    title: "Horsepower",
    what: "How much power your engine produces.",
    why: "Higher power cars may need stiffer suspension to handle the extra speed and forces.",
    tip: "400+ HP is considered high power and gets adjusted settings.",
  },
  gearCount: {
    title: "Number of Gears",
    what: "How many forward gears your transmission has.",
    why: "More gears = smoother acceleration curve. Fewer gears = simpler to calculate ratios.",
    tip: "Most cars have 6-7 gears. Check your transmission upgrade.",
  },
  piClass: {
    title: "PI Class",
    what: "Your car's performance rating (D, C, B, A, S1, S2, X).",
    why: "Higher classes may benefit from different tire pressures and aero settings.",
    tip: "S1 and S2 are the most popular online racing classes.",
  },
  tireCompound: {
    title: "Tire Compound",
    what: "The type of tires installed on your car.",
    why: "Softer compounds grip better but wear faster. Affects optimal tire pressure.",
    tip: "Sport tires are good for most builds. Race tires for high-end builds.",
  },
  hasAero: {
    title: "Aero Parts",
    what: "Whether you have a front splitter and/or rear wing installed.",
    why: "Aero adds downforce at speed, pushing the car down for more grip. Affects handling balance.",
    tip: "Only turn this on if you've actually installed aero parts!",
  },
};

// Output/results explanations
export const outputExplanations: Record<string, TuningExplanation> = {
  // Tire Pressure
  tirePressureFront: {
    title: "Front Tire Pressure",
    what: "How much air is in your front tires.",
    why: "Lower pressure = more grip but sluggish steering. Higher = responsive but less grip.",
    tip: "Start at 28 PSI. In-game, aim for 32-34 PSI when hot.",
  },
  tirePressureRear: {
    title: "Rear Tire Pressure",
    what: "How much air is in your rear tires.",
    why: "Lower rear pressure helps with traction on RWD cars. Higher prevents overheating.",
    tip: "Rear tires often run slightly higher than front for stability.",
  },

  // Anti-Roll Bars
  arbFront: {
    title: "Front Anti-Roll Bar",
    what: "A bar that connects the left and right suspension to reduce body lean.",
    why: "Stiffer front ARB = car rotates more in corners (more oversteer). Softer = more understeer.",
    tip: "If your car pushes wide in corners, LOWER the front ARB.",
  },
  arbRear: {
    title: "Rear Anti-Roll Bar",
    what: "Same as front, but for the rear suspension.",
    why: "Stiffer rear ARB = car understeers more (rear sticks better). Softer = more oversteer.",
    tip: "If your rear slides too much, LOWER the rear ARB.",
  },

  // Springs
  springsFront: {
    title: "Front Springs",
    what: "How stiff your front suspension is.",
    why: "Stiffer = faster response but less grip over bumps. Calculated from your weight distribution.",
    tip: "These values come from: (Max-Min) × Weight% + Min",
  },
  springsRear: {
    title: "Rear Springs",
    what: "How stiff your rear suspension is.",
    why: "Should be proportional to how much weight is over the rear wheels.",
    tip: "Rear springs are usually softer than front on most cars.",
  },
  rideHeightFront: {
    title: "Front Ride Height",
    what: "How high off the ground your front suspension sits.",
    why: "Lower = better aero and handling. Higher = clears bumps and curbs better.",
    tip: "Go low for grip racing, higher for offroad/rally.",
  },
  rideHeightRear: {
    title: "Rear Ride Height",
    what: "How high off the ground your rear suspension sits.",
    why: "Slightly higher rear can help with weight transfer during acceleration.",
    tip: "Keep rear slightly higher than front for most setups.",
  },

  // Damping
  reboundFront: {
    title: "Front Rebound",
    what: "How fast the suspension extends after being compressed.",
    why: "Controls how quickly weight shifts. Higher = car settles faster after bumps.",
    tip: "Rebound should always be higher than Bump values.",
  },
  reboundRear: {
    title: "Rear Rebound",
    what: "How fast the rear suspension extends.",
    why: "Higher rear rebound helps prevent the rear from bouncing during acceleration.",
    tip: "Scale with rear weight percentage.",
  },
  bumpFront: {
    title: "Front Bump",
    what: "How fast the suspension compresses when hitting bumps.",
    why: "Higher = stiffer over bumps (good for smooth tracks). Lower = absorbs bumps better.",
    tip: "Keep Bump at 50-65% of Rebound value.",
  },
  bumpRear: {
    title: "Rear Bump",
    what: "How fast the rear suspension compresses.",
    why: "Affects how the rear handles bumps and curbs during cornering.",
    tip: "Should be about 60% of rear rebound.",
  },

  // Alignment
  camberFront: {
    title: "Front Camber",
    what: "How much the wheels tilt inward at the top (negative camber).",
    why: "More negative = better cornering grip but less straight-line grip.",
    tip: "-1.0 to -1.5° is good for most grip tunes.",
  },
  camberRear: {
    title: "Rear Camber",
    what: "How much the rear wheels tilt.",
    why: "Less aggressive than front. Keeps rear stable during cornering.",
    tip: "-0.5 to -1.0° works for most cars.",
  },
  toeFront: {
    title: "Front Toe",
    what: "Whether front wheels point inward (toe-in) or outward (toe-out).",
    why: "Toe-out = sharper turn-in but less stable. Toe-in = stable but lazy steering.",
    tip: "Start at 0°. Adjust ±0.1° based on feel.",
  },
  toeRear: {
    title: "Rear Toe",
    what: "Whether rear wheels point inward or outward.",
    why: "Toe-in on rear adds stability. Toe-out makes the rear more lively.",
    tip: "0° to 0.1° toe-in is standard for stability.",
  },
  caster: {
    title: "Front Caster",
    what: "The angle of the steering axis when viewed from the side.",
    why: "More caster = steering self-centers better and feels heavier at speed.",
    tip: "5.0-5.5° is a good starting point for most cars.",
  },

  // Differential
  diffAccelRear: {
    title: "Rear Diff Acceleration",
    what: "How much the rear wheels lock together when accelerating.",
    why: "Higher = more power delivery but can cause oversteer on exit. Lower = more forgiving.",
    tip: "40-55% for grip racing. 80-100% for drifting.",
  },
  diffDecelRear: {
    title: "Rear Diff Deceleration",
    what: "How much the rear wheels lock when lifting off throttle or braking.",
    why: "Lower = smoother corner entry. Higher = car rotates more on entry.",
    tip: "10-20% for stable corner entry.",
  },
  diffAccelFront: {
    title: "Front Diff Acceleration",
    what: "How much the front wheels lock together when accelerating (FWD/AWD only).",
    why: "Higher can cause understeer. Keep low for better steering feel.",
    tip: "20-30% for AWD. Higher for FWD if you need more traction.",
  },
  diffDecelFront: {
    title: "Front Diff Deceleration",
    what: "Front wheel locking under braking/coast (FWD/AWD only).",
    why: "Keep low to maintain steering authority during deceleration.",
    tip: "0-10% is usually best.",
  },
  centerBalance: {
    title: "Center Differential",
    what: "How power is split between front and rear axles (AWD only).",
    why: "Higher = more power to rear (sporty). Lower = more power to front (stable).",
    tip: "65-70% rear bias for a sporty feel. 50% for maximum traction.",
  },

  // Brakes
  brakeBalance: {
    title: "Brake Balance",
    what: "The in-game slider value for front/rear brake distribution.",
    why: "⚠️ FH5's slider is INVERTED! Lower number = MORE front braking.",
    tip: "40-45% on the slider gives good front bias. Don't be confused by the display!",
  },
  brakePressure: {
    title: "Brake Pressure",
    what: "How hard the brakes clamp overall.",
    why: "Higher = shorter stopping but easier to lock up. Lower = more modulation.",
    tip: "100% is standard. Lower if you're locking up frequently.",
  },

  // Aero
  aeroFront: {
    title: "Front Downforce",
    what: "How much the front splitter pushes the front down at speed.",
    why: "More = better front grip at high speed but more drag (slower top speed).",
    tip: "Usually run slightly less front than rear for stability.",
  },
  aeroRear: {
    title: "Rear Downforce",
    what: "How much the rear wing pushes the rear down at speed.",
    why: "More = better rear grip at high speed. Prevents high-speed oversteer.",
    tip: "Rear slightly higher than front prevents snap oversteer at speed.",
  },

  // Gearing
  finalDrive: {
    title: "Final Drive",
    what: "The overall gear ratio multiplier for all gears.",
    why: "Lower number = higher top speed. Higher number = faster acceleration.",
    tip: "Adjust this first before touching individual gears.",
  },
  gearRatios: {
    title: "Individual Gear Ratios",
    what: "The ratio for each specific gear.",
    why: "Fine-tune acceleration in each gear. Usually auto-calculated.",
    tip: "Let the game's auto-adjust handle this after setting final drive.",
  },
};

// Quick tips for the welcome banner
export const quickStartTips = [
  "💡 Only 3 numbers really matter: Weight, Weight Distribution, and Drive Type",
  "🎯 Hover over any setting for 1.5 seconds to learn what it does",
  "🔧 Based on HokiHoshi's community-proven tuning method",
  "📊 Weight Distribution is THE most important number - get it from your car stats!",
];
