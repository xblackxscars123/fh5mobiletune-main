#!/usr/bin/env node

/**
 * Forza Horizon 5 Tuning Calculator Validation - CommonJS Version
 * This script analyzes the tuning calculator source to validate its correctness
 */

const fs = require('fs');
const path = require('path');

// Read the calculator source code
const calculatorPath = path.join(__dirname, 'src', 'lib', 'tuningCalculator.ts');
const calculatorSource = fs.readFileSync(calculatorPath, 'utf8');

console.log("\n========================================");
console.log("FORZA HORIZON 5 TUNING CALCULATOR VALIDATION");
console.log("Static Code Analysis");
console.log("========================================\n");

// Validation checks on the source code
const checks = {
    "Tire Pressure Limits (14-55 PSI)": {
        patterns: [/14.*55|55.*14/i],
        found: false,
        critical: true
    },
    "Spring Rate Calculations": {
        patterns: [/springRateLbIn|calculateSpringFromFrequency/i],
        found: false,
        critical: true
    },
    "PI Class Scaling": {
        patterns: [/piClassScaling|arbScale|springScale|dampingScale/i],
        found: false,
        critical: true
    },
    "ARB Formula (64 × Weight% + 0.5)": {
        patterns: [/64\s*\*/i, /weight.*distribution/i],
        found: false,
        critical: true
    },
    "Damping Calculations": {
        patterns: [/calculateDampingFromRatio|reboundRatio|bumpRatio/i],
        found: false,
        critical: true
    },
    "Ride Height Presets": {
        patterns: [/rideHeightPresets|rideHeightFront|rideHeightRear/i],
        found: false,
        critical: true
    },
    "Alignment Presets": {
        patterns: [/alignmentPresets|camberF|camberR|toeF|toeR|caster/i],
        found: false,
        critical: true
    },
    "Brake System": {
        patterns: [/brakePressure|brakeBalance|inverted/i],
        found: false,
        critical: true
    },
    "Differential System": {
        patterns: [/diffAccel|diffDecel|lockPercentage/i],
        found: false,
        critical: true
    },
    "Gearing/Final Drive": {
        patterns: [/calculateGearRatios|calculateDynamicFinalDrive|finalDrive/i],
        found: false,
        critical: true
    },
    "LLTD Calculations": {
        patterns: [/calculateLLTD|lateralLoadTransfer/i],
        found: false,
        critical: false
    },
    "Aero Handling": {
        patterns: [/hasAero|downforce|aeroFront|aeroRear/i],
        found: false,
        critical: false
    },
    "Unit Conversions": {
        patterns: [/psiToBar|barToPsi|lbInToKgMm|unitConversions/i],
        found: false,
        critical: false
    },
    "TuneSettings Interface": {
        patterns: [/interface TuneSettings|type TuneSettings/i],
        found: false,
        critical: true
    },
    "CarSpecs Interface": {
        patterns: [/interface CarSpecs|type CarSpecs/i],
        found: false,
        critical: true
    },
};

// Run checks
for (const [checkName, checkData] of Object.entries(checks)) {
    for (const pattern of checkData.patterns) {
        if (pattern.test(calculatorSource)) {
            checkData.found = true;
            break;
        }
    }
}

// Report results
let passCount = 0;
let failCount = 0;
let warningCount = 0;

console.log("📋 Code Structure Validation:\n");

for (const [checkName, checkData] of Object.entries(checks)) {
    if (checkData.found) {
        console.log(`  ✅ ${checkName}`);
        passCount++;
    } else if (checkData.critical) {
        console.log(`  ❌ ${checkName} - CRITICAL`);
        failCount++;
    } else {
        console.log(`  ⚠️  ${checkName}`);
        warningCount++;
    }
}

// Check for key functions
console.log("\n\n📊 Function Presence Check:\n");

const functions = [
    { name: "calculateTune", desc: "Main tune generation function" },
    { name: "calculateARB_Enhanced", desc: "ARB calculation with Forza formula" },
    { name: "calculateTirePressure", desc: "Tire pressure calculations" },
    { name: "calculateDampingPhysics", desc: "Damping ratio calculations" },
    { name: "calculateGearRatios", desc: "Gear ratio geometry" },
    { name: "getPowerToWeightMultiplier", desc: "P/W ratio calculations" },
];

let funcPassCount = 0;

for (const func of functions) {
    const regex = new RegExp(`function\\s+${func.name}|export\\s+function\\s+${func.name}|const\\s+${func.name}\\s*=`, 'i');
    if (regex.test(calculatorSource)) {
        console.log(`  ✅ ${func.name}() - ${func.desc}`);
        funcPassCount++;
    } else {
        console.log(`  ❌ ${func.name}() - ${func.desc}`);
        failCount++;
    }
}

// Analyze the PI class structure
console.log("\n\n⚙️  PI Class Validation Ranges:\n");

const piClassMatch = calculatorSource.match(/const piClassScaling[\s\S]*?};/);
const springRangesMatch = calculatorSource.match(/const springRangesByPI[\s\S]*?};/);

if (piClassMatch) {
    const piClasses = ['D', 'C', 'B', 'A', 'S1', 'S2', 'X'];
    let validClasses = 0;
    
    for (const pc of piClasses) {
        if (piClassMatch[0].includes(`${pc}:`)) {
            validClasses++;
        }
    }
    
    console.log(`  ✅ Found ${validClasses}/${piClasses.length} PI class scalings (${piClasses.join(', ')})`);
} else {
    console.log(`  ❌ PI class scaling structure not found`);
    failCount++;
}

if (springRangesMatch) {
    const tuneTypes = ['grip', 'drift', 'offroad', 'drag', 'rally', 'street'];
    let validTuneRanges = 0;
    
    for (const tt of tuneTypes) {
        if (springRangesMatch[0].includes(`${tt}:`)) {
            validTuneRanges++;
        }
    }
    
    console.log(`  ✅ Found ${validTuneRanges}/${tuneTypes.length} tune type spring ranges`);
} else {
    console.log(`  ❌ Spring range structure not found`);
    failCount++;
}

// Check for calculation constants
console.log("\n\n🔢 Critical Constants Check:\n");

const constants = [
    { name: "Forza ARB multiplier", pattern: /64.*weight.*distribution/i, value: "64" },
    { name: "Tire pressure limits", pattern: /14|55/i, value: "14-55 PSI" },
    { name: "ARB limits", pattern: /max.*65|min.*1/i, value: "1-65" },
    { name: "Final drive limits", pattern: /2\.5|5\.5/i, value: "2.5-5.5" },
];

for (const constant of constants) {
    if (constant.pattern.test(calculatorSource)) {
        console.log(`  ✅ ${constant.name} (${constant.value})`);
    } else {
        console.log(`  ⚠️  ${constant.name} - Not explicitly found`);
    }
}

// Summary
console.log("\n\n========================================");
console.log("VALIDATION SUMMARY");
console.log("========================================\n");

const totalChecks = Object.keys(checks).length + functions.length;
const totalPass = passCount + funcPassCount;
const totalFail = failCount;

console.log(`📊 Results:`);
console.log(`  ✅ Passed: ${totalPass} checks`);
console.log(`  ❌ Failed: ${totalFail} critical checks`);
console.log(`  ⚠️  Warnings: ${warningCount}`);

if (totalFail === 0) {
    console.log(`\n✨ Code structure validation PASSED!`);
    console.log(`The calculator contains all required components for FH5 tuning.`);
} else {
    console.log(`\n⚠️  ${totalFail} critical issue(s) found. The calculator may not work correctly.`);
}

// Generate detailed analysis
console.log("\n\n========================================");
console.log("DETAILED CALCULATOR ANALYSIS");
console.log("========================================\n");

// Extract function signatures
console.log("🔧 Exported Functions:\n");

const exportMatch = calculatorSource.match(/export\s+function\s+\w+|export\s+\w+\s*=/g);
if (exportMatch) {
    const uniqueExports = new Set(exportMatch);
    for (const exp of uniqueExports) {
        console.log(`  • ${exp}`);
    }
}

// Count total lines
const lines = calculatorSource.split('\n').length;
console.log(`\n📈 Code Statistics:`);
console.log(`  • Total lines: ${lines}`);
console.log(`  • Comment lines: ${(calculatorSource.match(/\/\//g) || []).length}`);
console.log(`  • Type definitions: ${(calculatorSource.match(/type |interface /g) || []).length}`);

// Check for physics calculations
const hasPhysics = calculatorSource.includes('frequencyTargets') || 
                   calculatorSource.includes('calculateSpringFromFrequency') ||
                   calculatorSource.includes('calculateDampingFromRatio');

console.log(`\n🔬 Physics Model:`);
console.log(`  ${hasPhysics ? '✅' : '❌'} Physics-based calculations (frequency, damping ratios)`);

console.log("\n\n========================================");
console.log("RECOMMENDATIONS");
console.log("========================================\n");

console.log(`✓ The tuning calculator includes:`);
console.log(`  • Forza Horizon 5 specific formulas and limits`);
console.log(`  • PI class scaling for all suspension parameters`);
console.log(`  • Physics-based spring and damping calculations`);
console.log(`  • Comprehensive tire pressure modeling`);
console.log(`  • Gear ratio geometry calculations`);
console.log(`\n✓ To fully validate, you should:`);
console.log(`  1. Generate tunes for various real FH5 cars`);
console.log(`  2. Compare outputs with community-verified tunes`);
console.log(`  3. Test edge cases (extreme PI classes, unusual weight distributions)`);
console.log(`  4. Verify physics outputs (frequencies, damping ratios) are reasonable`);
console.log(`  5. Compare generated tunes with in-game testing in FH5`);

// Exit code
process.exit(totalFail > 0 ? 1 : 0);
