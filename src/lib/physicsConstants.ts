/**
 * Unified Physics Constants for Forza Horizon 5
 * Single source of truth for all physics-related constants
 * Eliminates magic numbers scattered throughout codebase
 */

// ==========================================
// UNIT CONVERSION CONSTANTS
// ==========================================

/** Convert mph to tire RPM (based on tire diameter) */
export const MPH_TO_TIRE_RPM_CONVERSION = 336;

/** Acceleration due to gravity (ft/s²) */
export const GRAVITY_ACCELERATION = 32.2;

/** Miles per hour to feet per second */
export const MPH_TO_FPS = 1.46667;

/** Pounds force to kilonewtons */
export const LBF_TO_KN = 0.00444822;

// ==========================================
// TIRE & GRIP CONSTANTS
// ==========================================

/** Default tire radius (inches) */
export const DEFAULT_TIRE_RADIUS = 12.5;

/** Minimum grip multiplier for tires */
export const MIN_TIRE_GRIP = 0.8;

/** Maximum grip multiplier for tires */
export const MAX_TIRE_GRIP = 2.0;

/** Grip loss per degree C above optimal temperature */
export const GRIP_LOSS_PER_TEMP_DEGREE = 0.008;

/** Standard tire operating temperature (°C) */
export const STANDARD_TIRE_TEMP = 80;

/** Tire wear rate modifier per lap at standard conditions */
export const STANDARD_WEAR_RATE = 0.02;

// ==========================================
// SUSPENSION & GEOMETRY CONSTANTS
// ==========================================

/** Optimal camber angle for maximum grip (degrees) */
export const OPTIMAL_CAMBER = -2.5;

/** Grip improvement per degree of negative camber (multiplier) */
export const CAMBER_GRIP_IMPROVEMENT_PER_DEGREE = 0.15;

/** Grip penalty per degree of positive camber (multiplier) */
export const POSITIVE_CAMBER_GRIP_PENALTY_PER_DEGREE = 0.25;

/** Maximum grip increase from camber */
export const MAX_CAMBER_GRIP = 1.52;

/** Straight-line wear increase per degree of negative camber */
export const CAMBER_WEAR_FACTOR = 0.08;

/** Toe-in effect on turn-in response (0-1.0 scale) */
export const TOE_IN_RESPONSE_FACTOR = 0.12;

/** Caster effect on self-centering (multiplier per degree) */
export const CASTER_SELF_CENTER_FACTOR = 0.08;

// ==========================================
// BRAKE CONSTANTS
// ==========================================

/** Brake fade effect per 100 heat units (%) */
export const BRAKE_FADE_PER_HEAT_UNIT = 10;

/** Maximum brake fade percentage */
export const MAX_BRAKE_FADE = 40;

/** Lockup risk from front brake bias (per %) */
export const FRONT_LOCKUP_RISK_PER_BIAS = 0.008;

/** Load transfer to front during braking (percentage points) */
export const BRAKE_LOAD_TRANSFER = 40;

/** Rear lockup risk multiplier for rear bias */
export const REAR_LOCKUP_RISK_MULTIPLIER = 0.6;

/** Speed effect on lockup risk (per 200 mph) */
export const SPEED_LOCKUP_RISK_FACTOR = 0.15;

// ==========================================
// AERODYNAMICS CONSTANTS
// ==========================================

/** Speed reference for aerodynamic calculations (mph) */
export const AERO_REFERENCE_SPEED = 100;

/** Downforce scales with speed squared */
export const AERO_SPEED_POWER = 2;

/** Minimum ride height for aero effectiveness (inches) */
export const MIN_EFFECTIVE_RIDE_HEIGHT = 2.0;

/** Drag increase per 10 mph over 150 mph threshold (%) */
export const DRAG_INCREASE_RATE = 0.09;

// ==========================================
// LOAD TRANSFER CONSTANTS
// ==========================================

/** Longitudinal weight transfer rate (per G) */
export const LONGITUDINAL_LOAD_TRANSFER_RATE = 25;

/** Lateral weight transfer rate (per G) */
export const LATERAL_LOAD_TRANSFER_RATE = 35;

/** Maximum load transfer percentage */
export const MAX_LOAD_TRANSFER = 100;

/** Minimum load transfer percentage */
export const MIN_LOAD_TRANSFER = 0;

/** Grade effect on weight distribution (per degree of slope) */
export const GRADE_EFFECT_FACTOR = 1.74;

// ==========================================
// GEARING CONSTANTS
// ==========================================

/** Optimal gear spacing ratio for smooth power delivery */
export const OPTIMAL_GEAR_SPACING = 1.25;

/** Minimum acceptable gear spacing */
export const MIN_GEAR_SPACING = 1.15;

/** Maximum acceptable gear spacing */
export const MAX_GEAR_SPACING = 1.35;

/** Redline RPM for typical sports car */
export const DEFAULT_REDLINE_RPM = 7500;

/** Engine efficiency loss per 1000 RPM (%) */
export const ENGINE_EFFICIENCY_LOSS_PER_1000RPM = 2;

// ==========================================
// PERFORMANCE CONSTANTS
// ==========================================

/** 0-60 time calculation scaling factor */
export const ZERO_SIXTY_SCALING = 0.45;

/** 0-100 time to 0-60 time multiplier */
export const ZERO_HUNDRED_MULTIPLIER = 2.15;

/** Downforce-to-weight ratio threshold for stability */
export const STABILITY_DOWNFORCE_RATIO = 0.3;

// ==========================================
// DIFFERENTIAL CONSTANTS
// ==========================================

/** Maximum locking percentage (0-100) */
export const MAX_LOCK_PERCENTAGE = 100;

/** Speed threshold for differential lock transitions (mph) */
export const DIFF_LOCK_SPEED_THRESHOLD = 5;

/** Lock rate multiplier on acceleration */
export const ACCEL_LOCK_RATE_MULTIPLIER = 1.5;

/** Lock rate multiplier on deceleration */
export const DECEL_LOCK_RATE_MULTIPLIER = 0.8;
