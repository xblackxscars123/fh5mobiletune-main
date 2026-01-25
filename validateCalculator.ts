/**
 * Forza Horizon 5 Tuning Calculator Validation
 * Tests the tuning calculator to ensure it produces valid tunes for FH5 cars
 */

import { calculateTune, type CarSpecs, type TuneSettings } from './src/lib/tuningCalculator';

// ==========================================
// TEST DATA
// ==========================================

const TEST_CARS = [
    {
        name: "2020 Lamborghini Sián FKP 37",
        specs: {
            weight: 3636,
            weightDistribution: 43,
            driveType: "AWD" as const,
            piClass: "X",
            hasAero: true,
            frontDownforce: 500,
            rearDownforce: 450,
            tireCompound: "semi-slick" as const,
            horsepower: 807,
            gearCount: 8,
        } as CarSpecs
    },
    {
        name: "1991 Nissan Skyline GT-R (R32)",
        specs: {
            weight: 2783,
            weightDistribution: 50,
            driveType: "AWD" as const,
            piClass: "S1",
            hasAero: false,
            tireCompound: "sport" as const,
            horsepower: 323,
            gearCount: 5,
        } as CarSpecs
    },
    {
        name: "2020 Ford Mustang Shelby GT500",
        specs: {
            weight: 4212,
            weightDistribution: 53,
            driveType: "RWD" as const,
            piClass: "X",
            hasAero: false,
            tireCompound: "semi-slick" as const,
            horsepower: 760,
            gearCount: 10,
        } as CarSpecs
    },
    {
        name: "1999 Mitsubishi Evo VI GSR",
        specs: {
            weight: 3033,
            weightDistribution: 54,
            driveType: "AWD" as const,
            piClass: "B",
            hasAero: false,
            tireCompound: "sport" as const,
            horsepower: 280,
            gearCount: 5,
        } as CarSpecs
    },
];

const TUNE_TYPES = ["grip", "drift", "offroad", "drag", "rally", "street"] as const;

// ==========================================
// VALIDATION CRITERIA
// ==========================================

const FH5_LIMITS = {
    tire_pressure: { min: 14.0, max: 55.0 },
    ride_height: { min: 1.0, max: 12.0 },
    camber: { min: -5.0, max: 0.5 },
    toe: { min: -2.0, max: 5.0 },
    caster: { min: 4.0, max: 7.0 },
    arb: { min: 1, max: 65 },
    damping: { min: 0, max: 100 },
    brake_pressure: { min: 50, max: 100 },
    brake_balance: { min: 0, max: 100 },
    differential: { min: 0, max: 100 },
    final_drive: { min: 2.5, max: 5.5 },
    gear_ratio: { min: 0.50, max: 4.50 },
};

const PI_CLASS_SPRING_RANGES: Record<string, Record<string, { min: number; max: number }>> = {
    D: { grip: { min: 110, max: 300 }, drift: { min: 90, max: 220 }, drag: { min: 150, max: 400 }, street: { min: 90, max: 240 }, rally: { min: 65, max: 200 }, offroad: { min: 50, max: 150 } },
    C: { grip: { min: 140, max: 400 }, drift: { min: 110, max: 280 }, drag: { min: 190, max: 520 }, street: { min: 110, max: 320 }, rally: { min: 78, max: 260 }, offroad: { min: 55, max: 165 } },
    B: { grip: { min: 170, max: 500 }, drift: { min: 130, max: 340 }, drag: { min: 235, max: 680 }, street: { min: 135, max: 400 }, rally: { min: 92, max: 305 }, offroad: { min: 62, max: 185 } },
    A: { grip: { min: 210, max: 650 }, drift: { min: 155, max: 420 }, drag: { min: 285, max: 870 }, street: { min: 165, max: 500 }, rally: { min: 108, max: 355 }, offroad: { min: 70, max: 215 } },
    S1: { grip: { min: 270, max: 820 }, drift: { min: 175, max: 500 }, drag: { min: 360, max: 1050 }, street: { min: 195, max: 600 }, rally: { min: 125, max: 405 }, offroad: { min: 80, max: 250 } },
    S2: { grip: { min: 330, max: 980 }, drift: { min: 195, max: 580 }, drag: { min: 430, max: 1240 }, street: { min: 235, max: 700 }, rally: { min: 145, max: 455 }, offroad: { min: 90, max: 280 } },
    X: { grip: { min: 390, max: 1150 }, drift: { min: 220, max: 660 }, drag: { min: 500, max: 1400 }, street: { min: 275, max: 800 }, rally: { min: 165, max: 505 }, offroad: { min: 100, max: 310 } },
};

// ==========================================
// VALIDATION FUNCTIONS
// ==========================================

interface ValidationResult {
    passed: boolean;
    errors: string[];
    warnings: string[];
}

function validateTirePressure(tune: TuneSettings): ValidationResult {
    const result: ValidationResult = { passed: true, errors: [], warnings: [] };

    if (!tune.tirePressureFront) return result;

    const minPsi = FH5_LIMITS.tire_pressure.min;
    const maxPsi = FH5_LIMITS.tire_pressure.max;

    if (tune.tirePressureFront < minPsi || tune.tirePressureFront > maxPsi) {
        result.passed = false;
        result.errors.push(
            `Tire pressure front ${tune.tirePressureFront} PSI out of range [${minPsi}, ${maxPsi}]`
        );
    }

    if (tune.tirePressureRear < minPsi || tune.tirePressureRear > maxPsi) {
        result.passed = false;
        result.errors.push(
            `Tire pressure rear ${tune.tirePressureRear} PSI out of range [${minPsi}, ${maxPsi}]`
        );
    }

    // Check for realistic pressure differences
    const diff = Math.abs(tune.tirePressureFront - tune.tirePressureRear);
    if (diff > 25) {
        result.warnings.push(
            `Large tire pressure difference: ${diff.toFixed(1)} PSI (front: ${tune.tirePressureFront}, rear: ${tune.tirePressureRear})`
        );
    }

    return result;
}

function validateSuspension(tune: TuneSettings): ValidationResult {
    const result: ValidationResult = { passed: true, errors: [], warnings: [] };

    // Ride height
    if (tune.rideHeightFront) {
        const minRh = FH5_LIMITS.ride_height.min;
        const maxRh = FH5_LIMITS.ride_height.max;

        if (tune.rideHeightFront < minRh || tune.rideHeightFront > maxRh) {
            result.errors.push(`Ride height front ${tune.rideHeightFront}" out of range [${minRh}, ${maxRh}]`);
            result.passed = false;
        }
        if (tune.rideHeightRear < minRh || tune.rideHeightRear > maxRh) {
            result.errors.push(`Ride height rear ${tune.rideHeightRear}" out of range [${minRh}, ${maxRh}]`);
            result.passed = false;
        }
    }

    // Camber
    if (tune.camberFront !== undefined) {
        const minCam = FH5_LIMITS.camber.min;
        const maxCam = FH5_LIMITS.camber.max;

        if (tune.camberFront < minCam || tune.camberFront > maxCam) {
            result.errors.push(`Camber front ${tune.camberFront}° out of range [${minCam}, ${maxCam}]`);
            result.passed = false;
        }
        if (tune.camberRear < minCam || tune.camberRear > maxCam) {
            result.errors.push(`Camber rear ${tune.camberRear}° out of range [${minCam}, ${maxCam}]`);
            result.passed = false;
        }
    }

    // Toe
    if (tune.toeFront !== undefined) {
        const minToe = FH5_LIMITS.toe.min;
        const maxToe = FH5_LIMITS.toe.max;

        if (tune.toeFront < minToe || tune.toeFront > maxToe) {
            result.errors.push(`Toe front ${tune.toeFront}° out of range [${minToe}, ${maxToe}]`);
            result.passed = false;
        }
        if (tune.toeRear < minToe || tune.toeRear > maxToe) {
            result.errors.push(`Toe rear ${tune.toeRear}° out of range [${minToe}, ${maxToe}]`);
            result.passed = false;
        }
    }

    // Caster
    if (tune.caster !== undefined) {
        const minCas = FH5_LIMITS.caster.min;
        const maxCas = FH5_LIMITS.caster.max;

        if (tune.caster < minCas || tune.caster > maxCas) {
            result.errors.push(`Caster ${tune.caster}° out of range [${minCas}, ${maxCas}]`);
            result.passed = false;
        }
    }

    return result;
}

function validateAntiRollBars(tune: TuneSettings): ValidationResult {
    const result: ValidationResult = { passed: true, errors: [], warnings: [] };

    if (!tune.arbFront) return result;

    const minArb = FH5_LIMITS.arb.min;
    const maxArb = FH5_LIMITS.arb.max;

    if (tune.arbFront < minArb || tune.arbFront > maxArb) {
        result.errors.push(`ARB front ${tune.arbFront} out of range [${minArb}, ${maxArb}]`);
        result.passed = false;
    }
    if (tune.arbRear < minArb || tune.arbRear > maxArb) {
        result.errors.push(`ARB rear ${tune.arbRear} out of range [${minArb}, ${maxArb}]`);
        result.passed = false;
    }

    // Check ARB balance
    const ratio = Math.max(tune.arbFront, tune.arbRear) / Math.min(tune.arbFront, tune.arbRear);
    if (ratio > 4) {
        result.warnings.push(
            `Large ARB imbalance: Front ${tune.arbFront}, Rear ${tune.arbRear} (ratio: ${ratio.toFixed(2)})`
        );
    }

    return result;
}

function validateSprings(tune: TuneSettings, piClass: string, tuneType: string): ValidationResult {
    const result: ValidationResult = { passed: true, errors: [], warnings: [] };

    if (!tune.springsFront || !PI_CLASS_SPRING_RANGES[piClass]) return result;

    const range = PI_CLASS_SPRING_RANGES[piClass][tuneType];
    if (!range) return result;

    // Allow 30% tolerance beyond published ranges (physics can adjust)
    const tolerance = 0.3;
    const minSpring = range.min * (1 - tolerance);
    const maxSpring = range.max * (1 + tolerance);

    if (tune.springsFront < minSpring || tune.springsFront > maxSpring) {
        result.warnings.push(
            `Spring front ${tune.springsFront} LB/IN outside ${piClass} ${tuneType} range [${range.min}, ${range.max}]`
        );
    }

    if (tune.springsRear < minSpring || tune.springsRear > maxSpring) {
        result.warnings.push(
            `Spring rear ${tune.springsRear} LB/IN outside ${piClass} ${tuneType} range [${range.min}, ${range.max}]`
        );
    }

    // Check for reasonable front-rear ratio (except drag which is extreme)
    const ratio = Math.max(tune.springsFront, tune.springsRear) / Math.min(tune.springsFront, tune.springsRear);
    if (ratio > 2.0 && tuneType !== "drag") {
        result.warnings.push(
            `Large spring imbalance: Front ${tune.springsFront}, Rear ${tune.springsRear} (ratio: ${ratio.toFixed(2)})`
        );
    }

    return result;
}

function validateGearing(tune: TuneSettings): ValidationResult {
    const result: ValidationResult = { passed: true, errors: [], warnings: [] };

    if (!tune.finalDrive) return result;

    const minFd = FH5_LIMITS.final_drive.min;
    const maxFd = FH5_LIMITS.final_drive.max;

    if (tune.finalDrive < minFd || tune.finalDrive > maxFd) {
        result.errors.push(`Final drive ${tune.finalDrive} out of range [${minFd}, ${maxFd}]`);
        result.passed = false;
    }

    // Check gear ratios
    const minGear = FH5_LIMITS.gear_ratio.min;
    const maxGear = FH5_LIMITS.gear_ratio.max;

    if (tune.gearRatios) {
        for (let i = 0; i < tune.gearRatios.length; i++) {
            const ratio = tune.gearRatios[i];
            if (ratio < minGear || ratio > maxGear) {
                result.errors.push(`Gear ${i + 1} ratio ${ratio} out of range [${minGear}, ${maxGear}]`);
                result.passed = false;
            }
        }
    }

    return result;
}

function validateBrakes(tune: TuneSettings): ValidationResult {
    const result: ValidationResult = { passed: true, errors: [], warnings: [] };

    if (tune.brakePressure === undefined) return result;

    const minBp = FH5_LIMITS.brake_pressure.min;
    const maxBp = FH5_LIMITS.brake_pressure.max;

    if (tune.brakePressure < minBp || tune.brakePressure > maxBp) {
        result.errors.push(`Brake pressure ${tune.brakePressure} out of range [${minBp}, ${maxBp}]`);
        result.passed = false;
    }

    if (tune.brakeBalance < 0 || tune.brakeBalance > 100) {
        result.errors.push(`Brake balance ${tune.brakeBalance} out of range [0, 100]`);
        result.passed = false;
    }

    return result;
}

function validateDifferentials(tune: TuneSettings): ValidationResult {
    const result: ValidationResult = { passed: true, errors: [], warnings: [] };

    if (tune.diffAccelRear === undefined) return result;

    const minDiff = FH5_LIMITS.differential.min;
    const maxDiff = FH5_LIMITS.differential.max;

    if (tune.diffAccelRear < minDiff || tune.diffAccelRear > maxDiff) {
        result.errors.push(`Diff accel rear ${tune.diffAccelRear}% out of range [${minDiff}, ${maxDiff}]`);
        result.passed = false;
    }

    if (tune.diffDecelRear < minDiff || tune.diffDecelRear > maxDiff) {
        result.errors.push(`Diff decel rear ${tune.diffDecelRear}% out of range [${minDiff}, ${maxDiff}]`);
        result.passed = false;
    }

    return result;
}

// ==========================================
// TEST RUNNER
// ==========================================

interface TestResult {
    carName: string;
    tuneType: string;
    piClass: string;
    success: boolean;
    errors: string[];
    warnings: string[];
}

const allResults: TestResult[] = [];
let passCount = 0;
let failCount = 0;
let warningCount = 0;

console.log("\n========================================");
console.log("FORZA HORIZON 5 TUNING CALCULATOR VALIDATION");
console.log("========================================\n");

for (const carTest of TEST_CARS) {
    console.log(`\n🚗 Testing: ${carTest.name}`);
    console.log(`   Weight: ${carTest.specs.weight} lbs | Weight Distribution: ${carTest.specs.weightDistribution}% front`);
    console.log(`   Drive: ${carTest.specs.driveType} | HP: ${carTest.specs.horsepower}`);

    for (const tuneType of TUNE_TYPES) {
        try {
            // Use the car's PI class from specs, or default to A
            const piClass = (carTest.specs as any).piClass || "A";

            const tune = calculateTune(carTest.specs, tuneType as any);

            const allErrors: string[] = [];
            const allWarnings: string[] = [];
            let testPassed = true;

            // Run all validations
            const validations = [
                validateTirePressure(tune),
                validateSuspension(tune),
                validateAntiRollBars(tune),
                validateSprings(tune, piClass, tuneType),
                validateGearing(tune),
                validateBrakes(tune),
                validateDifferentials(tune),
            ];

            for (const validation of validations) {
                allErrors.push(...validation.errors);
                allWarnings.push(...validation.warnings);
                if (!validation.passed) {
                    testPassed = false;
                }
            }

            const result: TestResult = {
                carName: carTest.name,
                tuneType,
                piClass,
                success: testPassed && allErrors.length === 0,
                errors: allErrors,
                warnings: allWarnings,
            };

            allResults.push(result);

            if (result.success) {
                passCount++;
                console.log(`  ✅ ${tuneType.padEnd(10)} - Valid tune generated`);
            } else {
                failCount++;
                console.log(`  ❌ ${tuneType.padEnd(10)} - VALIDATION FAILED`);
                for (const error of result.errors) {
                    console.log(`     ERROR: ${error}`);
                }
            }

            if (result.warnings.length > 0) {
                warningCount++;
                for (const warning of result.warnings) {
                    console.log(`     ⚠️  WARNING: ${warning}`);
                }
            }
        } catch (error) {
            failCount++;
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.log(`  ❌ ${tuneType.padEnd(10)} - EXCEPTION: ${errorMsg}`);
            allResults.push({
                carName: carTest.name,
                tuneType,
                piClass: "?",
                success: false,
                errors: [errorMsg],
                warnings: [],
            });
        }
    }
}

// ==========================================
// SUMMARY REPORT
// ==========================================

console.log("\n========================================");
console.log("VALIDATION SUMMARY");
console.log("========================================");

const totalTests = passCount + failCount;
const passRate = totalTests > 0 ? ((passCount / totalTests) * 100).toFixed(1) : "0.0";

console.log(`\n📊 Results:`);
console.log(`  ✅ Passed:  ${passCount}/${totalTests}`);
console.log(`  ❌ Failed:  ${failCount}/${totalTests}`);
console.log(`  ⚠️  Warnings: ${warningCount} test(s) with warnings`);
console.log(`  📈 Pass Rate: ${passRate}%`);

if (failCount === 0) {
    console.log("\n🎉 ALL TESTS PASSED! The tuning calculator is working correctly.");
} else {
    console.log("\n⚠️  Some tests failed. Review errors above.");
}

// Export results as JSON for analysis
console.log("\n📋 Detailed Results (JSON):");
console.log(JSON.stringify(allResults, null, 2));

// Exit with appropriate code
process.exit(failCount > 0 ? 1 : 0);
