// Telemetry Guide Content Data

export interface SetupStep {
  step: number;
  title: string;
  description: string;
  code?: string;
  note?: string;
}

export interface TroubleshootItem {
  problem: string;
  solution: string;
}

export interface PlatformSetup {
  id: string;
  name: string;
  icon: string;
  description: string;
  steps: SetupStep[];
  troubleshooting: TroubleshootItem[];
}

export const platformSetups: PlatformSetup[] = [
  {
    id: 'pc',
    name: 'PC Setup',
    icon: 'Monitor',
    description: 'Direct connection for Windows PC players',
    steps: [
      {
        step: 1,
        title: 'Download the Relay Server',
        description: 'Download the telemetry relay server package. Requires Node.js installed on your system.',
        note: 'If you don\'t have Node.js, download it from nodejs.org first.',
      },
      {
        step: 2,
        title: 'Extract & Install',
        description: 'Extract the ZIP file to any folder, then open a terminal/command prompt in that folder.',
        code: 'npm install',
      },
      {
        step: 3,
        title: 'Start the Relay Server',
        description: 'Run the relay server. Keep this terminal window open while using telemetry.',
        code: 'node relay-server.js',
        note: 'You should see: "Telemetry Relay running on UDP:5555 → WS:8765"',
      },
      {
        step: 4,
        title: 'Configure Forza Horizon 5',
        description: 'In FH5, go to Settings → HUD and Gameplay → Data Out and configure:',
        note: 'Data Out: ON | IP Address: 127.0.0.1 | Port: 5555',
      },
      {
        step: 5,
        title: 'Connect in App',
        description: 'Return to PRO TUNER and open the Telemetry Panel. It will automatically connect when FH5 starts sending data.',
      },
    ],
    troubleshooting: [
      {
        problem: 'No data appearing in the app',
        solution: 'Check Windows Firewall. Allow Node.js through the firewall, or try temporarily disabling it to test.',
      },
      {
        problem: 'UWP Loopback blocked (127.0.0.1 not working)',
        solution: 'Run this command in an admin PowerShell: CheckNetIsolation LoopbackExempt -a -n="Microsoft.SunriseBaseGame_8wekyb3d8bbwe"',
      },
      {
        problem: 'Port 5555 already in use',
        solution: 'Change to port 5556 in both the relay-server.js file and FH5 Data Out settings.',
      },
      {
        problem: 'Connection drops frequently',
        solution: 'Ensure your PC isn\'t going to sleep. Disable power saving mode while tuning.',
      },
    ],
  },
  {
    id: 'xbox',
    name: 'Xbox Setup',
    icon: 'Gamepad2',
    description: 'Stream telemetry from Xbox to your PC or mobile device',
    steps: [
      {
        step: 1,
        title: 'Requirements',
        description: 'You need a PC on the same network as your Xbox to act as the relay server.',
        note: 'Your Xbox and PC must be on the same WiFi or wired network.',
      },
      {
        step: 2,
        title: 'Find Your PC\'s IP Address',
        description: 'On your PC, open Command Prompt and run:',
        code: 'ipconfig',
        note: 'Look for "IPv4 Address" under your network adapter (e.g., 192.168.1.100)',
      },
      {
        step: 3,
        title: 'Set Up Relay on PC',
        description: 'Follow the PC Setup steps 1-3 to install and run the relay server on your computer.',
      },
      {
        step: 4,
        title: 'Configure Forza on Xbox',
        description: 'In FH5 on Xbox, go to Settings → HUD and Gameplay → Data Out:',
        note: 'Data Out: ON | IP Address: [Your PC\'s IP] | Port: 5555',
      },
      {
        step: 5,
        title: 'Allow Through Firewall',
        description: 'On your PC, allow incoming UDP traffic on port 5555 through Windows Firewall.',
      },
    ],
    troubleshooting: [
      {
        problem: 'Xbox can\'t reach PC',
        solution: 'Ensure both devices are on the same network. Try pinging your PC from Xbox Network Settings.',
      },
      {
        problem: 'Firewall blocking connection',
        solution: 'Create an inbound rule in Windows Firewall for UDP port 5555.',
      },
      {
        problem: 'High latency in telemetry',
        solution: 'Use a wired Ethernet connection for both Xbox and PC if possible.',
      },
    ],
  },
  {
    id: 'mobile',
    name: 'Mobile Viewing',
    icon: 'Smartphone',
    description: 'View telemetry on your phone or tablet while gaming',
    steps: [
      {
        step: 1,
        title: 'Set Up PC Relay First',
        description: 'Complete the PC or Xbox setup first. The relay server must be running on your PC.',
      },
      {
        step: 2,
        title: 'Connect to Same Network',
        description: 'Ensure your mobile device is on the same WiFi network as your gaming PC.',
      },
      {
        step: 3,
        title: 'Open PRO TUNER on Mobile',
        description: 'Navigate to this app in your mobile browser.',
      },
      {
        step: 4,
        title: 'Enter PC\'s IP Address',
        description: 'In the Telemetry Panel, enter your PC\'s local IP address instead of localhost.',
        note: 'Example: ws://192.168.1.100:8765',
      },
      {
        step: 5,
        title: 'Mount Your Device',
        description: 'Position your phone/tablet where you can see it while gaming. A phone mount on your desk or monitor works great!',
      },
    ],
    troubleshooting: [
      {
        problem: 'Can\'t connect from mobile',
        solution: 'Make sure the relay server is running and accepting connections from other devices (not just localhost).',
      },
      {
        problem: 'Connection timeout',
        solution: 'Check that your mobile device is on the same network and can ping the PC.',
      },
    ],
  },
];

export interface TelemetryMetric {
  id: string;
  name: string;
  icon: string;
  unit: string;
  description: string;
  ranges: {
    label: string;
    min: number;
    max: number;
    color: string;
    meaning: string;
  }[];
  adjustments: {
    condition: string;
    suggestion: string;
  }[];
}

export const telemetryMetrics: TelemetryMetric[] = [
  {
    id: 'suspension-travel',
    name: 'Suspension Travel',
    icon: 'ArrowUpDown',
    unit: '%',
    description: 'How much of the available suspension travel is being used. Each wheel has its own reading (FL, FR, RL, RR).',
    ranges: [
      { label: 'Topping Out', min: 0, max: 10, color: 'destructive', meaning: 'Suspension fully extended - may lose contact with road' },
      { label: 'Low Travel', min: 10, max: 20, color: 'warning', meaning: 'Very little compression - springs may be too stiff' },
      { label: 'Optimal', min: 20, max: 80, color: 'success', meaning: 'Healthy working range - suspension functioning properly' },
      { label: 'High Travel', min: 80, max: 90, color: 'warning', meaning: 'Getting close to limits - watch for bottoming' },
      { label: 'Bottoming Out', min: 90, max: 100, color: 'destructive', meaning: 'Hitting bump stops - losing control and grip' },
    ],
    adjustments: [
      { condition: 'Consistently above 90%', suggestion: 'Increase spring rate by 10-15% or raise ride height' },
      { condition: 'Consistently below 20%', suggestion: 'Decrease spring rate by 10-15% or lower ride height' },
      { condition: 'Front higher than rear', suggestion: 'Stiffen front springs or soften rear springs' },
      { condition: 'Spikes to 100% on curbs', suggestion: 'Raise ride height to prevent bottoming on impacts' },
    ],
  },
  {
    id: 'tire-temperature',
    name: 'Tire Temperature',
    icon: 'Thermometer',
    unit: '°F',
    description: 'Temperature of each tire. Hotter tires grip better up to a point, then degrade. Check inner vs outer temps for camber tuning.',
    ranges: [
      { label: 'Cold', min: 0, max: 150, color: 'info', meaning: 'Tires not up to temperature - reduced grip' },
      { label: 'Warming', min: 150, max: 180, color: 'muted', meaning: 'Approaching optimal - grip improving' },
      { label: 'Optimal', min: 180, max: 220, color: 'success', meaning: 'Maximum grip zone - ideal operating temperature' },
      { label: 'Hot', min: 220, max: 250, color: 'warning', meaning: 'Getting too hot - grip starting to fall off' },
      { label: 'Overheating', min: 250, max: 400, color: 'destructive', meaning: 'Excessive heat - rapid wear, grip loss' },
    ],
    adjustments: [
      { condition: 'All tires too hot', suggestion: 'Increase tire pressure by 1-2 PSI' },
      { condition: 'All tires too cold', suggestion: 'Decrease tire pressure by 1-2 PSI or drive more aggressively' },
      { condition: 'Inner edge hotter than outer', suggestion: 'Reduce negative camber by 0.3-0.5°' },
      { condition: 'Outer edge hotter than inner', suggestion: 'Increase negative camber by 0.3-0.5°' },
      { condition: 'Rear hotter than front', suggestion: 'Lower rear tire pressure or soften rear ARB' },
    ],
  },
  {
    id: 'wheel-slip',
    name: 'Wheel Slip',
    icon: 'CircleDot',
    unit: '%',
    description: 'Combined slip ratio showing how much each wheel is spinning faster or slower than road speed. Some slip is needed for acceleration.',
    ranges: [
      { label: 'Full Grip', min: 0, max: 5, color: 'success', meaning: 'Maximum traction - no slip' },
      { label: 'Optimal Slip', min: 5, max: 15, color: 'success', meaning: 'Peak acceleration zone - slight slip for max power transfer' },
      { label: 'Light Slip', min: 15, max: 30, color: 'warning', meaning: 'Starting to lose traction - backing off throttle helps' },
      { label: 'Moderate Spin', min: 30, max: 50, color: 'warning', meaning: 'Significant wheelspin - losing acceleration efficiency' },
      { label: 'Heavy Spin', min: 50, max: 100, color: 'destructive', meaning: 'Excessive wheelspin - wasting power, wearing tires' },
    ],
    adjustments: [
      { condition: 'Rear wheels spinning on exit', suggestion: 'Reduce rear diff acceleration by 5-10%' },
      { condition: 'Front wheels spinning (AWD)', suggestion: 'Adjust center diff toward rear or reduce front diff accel' },
      { condition: 'Slip only in low gears', suggestion: 'Consider taller final drive ratio or softer throttle input' },
      { condition: 'Slip on corner exit', suggestion: 'Add more rear grip: lower pressure, softer ARB, or more downforce' },
    ],
  },
  {
    id: 'g-force',
    name: 'G-Force',
    icon: 'Move',
    unit: 'G',
    description: 'Lateral (left/right) and longitudinal (brake/accel) forces. Shows how hard the car is cornering, braking, and accelerating.',
    ranges: [
      { label: 'Light', min: 0, max: 0.5, color: 'muted', meaning: 'Gentle driving - not using full grip potential' },
      { label: 'Moderate', min: 0.5, max: 1.0, color: 'success', meaning: 'Normal driving range - good control' },
      { label: 'High', min: 1.0, max: 1.5, color: 'success', meaning: 'Pushing hard - near grip limit' },
      { label: 'Extreme', min: 1.5, max: 3.0, color: 'warning', meaning: 'Maximum grip or losing control' },
    ],
    adjustments: [
      { condition: 'Can\'t reach 1G lateral', suggestion: 'Check tire compound, add downforce, or lower ride height' },
      { condition: 'Uneven left vs right G', suggestion: 'Check weight distribution or suspension imbalance' },
      { condition: 'Low braking G', suggestion: 'Increase brake pressure or shift brake bias forward' },
    ],
  },
];

export interface TuneIssue {
  id: string;
  telemetrySign: string;
  problem: string;
  severity: 'low' | 'medium' | 'high';
  suggestedFix: string;
  affectedSetting: string;
}

export const commonTuneIssues: TuneIssue[] = [
  {
    id: 'front-bottom',
    telemetrySign: 'Front suspension hitting 95%+ travel',
    problem: 'Front bottoming out on bumps or curbs',
    severity: 'high',
    suggestedFix: 'Increase front springs by 10-15% OR raise front ride height by 0.5"',
    affectedSetting: 'Springs / Ride Height',
  },
  {
    id: 'rear-bottom',
    telemetrySign: 'Rear suspension hitting 95%+ travel',
    problem: 'Rear bottoming out under acceleration',
    severity: 'high',
    suggestedFix: 'Increase rear springs by 10-15% OR raise rear ride height by 0.5"',
    affectedSetting: 'Springs / Ride Height',
  },
  {
    id: 'rear-overheat',
    telemetrySign: 'Rear tires 30°F+ hotter than front',
    problem: 'Rear tires overheating from excessive work',
    severity: 'medium',
    suggestedFix: 'Lower rear tire pressure by 1-2 PSI OR soften rear ARB by 2-3 points',
    affectedSetting: 'Tire Pressure / ARB',
  },
  {
    id: 'inner-hot',
    telemetrySign: 'Inner tire edge 20°F+ hotter than outer',
    problem: 'Too much negative camber wearing inner edge',
    severity: 'medium',
    suggestedFix: 'Reduce negative camber by 0.3-0.5° on affected axle',
    affectedSetting: 'Camber',
  },
  {
    id: 'outer-hot',
    telemetrySign: 'Outer tire edge 20°F+ hotter than inner',
    problem: 'Not enough negative camber for cornering load',
    severity: 'medium',
    suggestedFix: 'Increase negative camber by 0.3-0.5° on affected axle',
    affectedSetting: 'Camber',
  },
  {
    id: 'rear-spin',
    telemetrySign: 'Rear wheel slip exceeds 40% on corner exit',
    problem: 'Excessive wheelspin reducing acceleration',
    severity: 'high',
    suggestedFix: 'Reduce rear diff acceleration by 5-10%',
    affectedSetting: 'Differential',
  },
  {
    id: 'bouncy',
    telemetrySign: 'Suspension oscillates 3+ times after bumps',
    problem: 'Underdamped - car bounces too much',
    severity: 'medium',
    suggestedFix: 'Increase rebound damping by 1-2 points',
    affectedSetting: 'Damping',
  },
  {
    id: 'harsh',
    telemetrySign: 'Suspension travel spikes sharply on small bumps',
    problem: 'Overdamped bump - too harsh over bumps',
    severity: 'low',
    suggestedFix: 'Decrease bump damping by 1-2 points',
    affectedSetting: 'Damping',
  },
  {
    id: 'understeer-entry',
    telemetrySign: 'Front slip angle higher than rear on turn-in',
    problem: 'Push/understeer entering corners',
    severity: 'medium',
    suggestedFix: 'Soften front ARB, stiffen rear ARB, or add front downforce',
    affectedSetting: 'ARB / Aero',
  },
  {
    id: 'oversteer-exit',
    telemetrySign: 'Rear slip angle spikes on throttle application',
    problem: 'Oversteer/snap on corner exit',
    severity: 'high',
    suggestedFix: 'Reduce rear diff accel, soften rear ARB, or add rear downforce',
    affectedSetting: 'Differential / ARB / Aero',
  },
];

export interface GlossaryTerm {
  term: string;
  definition: string;
  category: 'suspension' | 'tires' | 'differential' | 'alignment' | 'general';
}

export const glossaryTerms: GlossaryTerm[] = [
  { term: 'Hz (Hertz)', definition: 'Suspension natural frequency - how many times per second the suspension oscillates. Higher Hz = stiffer, more responsive feel.', category: 'suspension' },
  { term: 'Damping', definition: 'How quickly suspension motion is slowed. Too little = bouncy, too much = harsh.', category: 'suspension' },
  { term: 'Rebound', definition: 'Damping that controls suspension extending (springing back up). Higher = slower extension.', category: 'suspension' },
  { term: 'Bump', definition: 'Damping that controls suspension compressing (hitting bumps). Higher = harsher over bumps.', category: 'suspension' },
  { term: 'Spring Rate', definition: 'How stiff the springs are, measured in lb/in or N/mm. Higher = stiffer suspension.', category: 'suspension' },
  { term: 'Ride Height', definition: 'Distance from ground to chassis. Lower = better aero and handling, but may bottom out.', category: 'suspension' },
  { term: 'ARB (Anti-Roll Bar)', definition: 'Connects left and right suspension to reduce body roll in corners. Stiffer = flatter cornering.', category: 'suspension' },
  { term: 'Camber', definition: 'Wheel tilt when viewed from front/rear. Negative = top tilts inward, helps cornering grip.', category: 'alignment' },
  { term: 'Toe', definition: 'Wheel direction when viewed from above. Toe-in = points inward, toe-out = points outward.', category: 'alignment' },
  { term: 'Caster', definition: 'Steering axis tilt. More caster = more self-centering, heavier steering, better high-speed stability.', category: 'alignment' },
  { term: 'Diff (Differential)', definition: 'Controls how wheels on the same axle share power and rotation.', category: 'differential' },
  { term: 'Diff Accel', definition: 'How much the diff locks under throttle. Higher = more lock, better traction but can cause understeer.', category: 'differential' },
  { term: 'Diff Decel', definition: 'How much the diff locks when lifting throttle. Higher = more stability but can cause oversteer.', category: 'differential' },
  { term: 'Contact Patch', definition: 'Area of tire touching the road. Larger = more grip. Affected by pressure, camber, and load.', category: 'tires' },
  { term: 'Slip Angle', definition: 'Difference between where tire points and where it travels. Some slip = maximum grip.', category: 'tires' },
  { term: 'Slip Ratio', definition: 'Difference between wheel rotation speed and actual road speed. Indicates wheelspin or lockup.', category: 'tires' },
  { term: 'Understeer', definition: 'When front tires lose grip first, causing the car to push wide. "Won\'t turn enough."', category: 'general' },
  { term: 'Oversteer', definition: 'When rear tires lose grip first, causing the rear to swing out. "Turns too much."', category: 'general' },
  { term: 'Weight Transfer', definition: 'How weight shifts between wheels under braking, acceleration, and cornering.', category: 'general' },
  { term: 'Downforce', definition: 'Aerodynamic force pushing car into ground. More = more grip but more drag.', category: 'general' },
  { term: 'Final Drive', definition: 'Overall gear ratio from transmission to wheels. Lower number = higher top speed, higher = more acceleration.', category: 'general' },
];

export const workflowTips = [
  {
    title: 'Establish a Baseline',
    icon: 'PlayCircle',
    tips: [
      'Drive 3-5 laps to warm up tires before reading telemetry',
      'Note your baseline suspension travel and tire temps',
      'Identify consistent issues vs one-time events',
    ],
  },
  {
    title: 'Test Specific Scenarios',
    icon: 'Target',
    tips: [
      'Hard braking zones → Watch front suspension & tire temps',
      'Long sweepers → Check overall tire temps and slip angles',
      'Jumps and curbs → Monitor max suspension travel',
      'Acceleration zones → Check rear slip and temperatures',
    ],
  },
  {
    title: 'One Change at a Time',
    icon: 'Settings2',
    tips: [
      'Adjust one setting, then do 2-3 laps',
      'Compare telemetry before and after',
      'If it helps, keep it. If not, revert and try something else',
      'Document what works for future reference',
    ],
  },
  {
    title: 'Track-Specific Tuning',
    icon: 'Map',
    tips: [
      'Different tracks stress different parts of your tune',
      'A tune for Goliath won\'t work the same on a rally stage',
      'Use telemetry on the actual track you\'ll be racing',
      'Consider having track-specific tune variants',
    ],
  },
];
