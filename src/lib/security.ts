/**
 * Security utilities for input validation and XSS protection
 */

// XSS Protection: Sanitize HTML content
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// SQL Injection Protection: Validate alphanumeric inputs
export function sanitizeAlphanumeric(input: string, allowSpaces = false): string {
  if (typeof input !== 'string') return '';
  
  const pattern = allowSpaces ? /^[a-zA-Z0-9\s\-_]+$/ : /^[a-zA-Z0-9\-_]+$/;
  const sanitized = input.replace(/[^\w\s\-_]/g, '');
  
  return pattern.test(sanitized) ? sanitized.trim() : '';
}

// Email validation with strict rules
export function validateEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const sanitizedEmail = email.toLowerCase().trim();
  
  return emailRegex.test(sanitizedEmail) && sanitizedEmail.length <= 254;
}

// Numeric input validation with range checking
export function validateNumericInput(
  input: string, 
  min: number = -Infinity, 
  max: number = Infinity,
  defaultValue: number = 0
): number {
  if (typeof input !== 'string') return defaultValue;
  
  const sanitized = input.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(sanitized);
  
  if (isNaN(parsed)) return defaultValue;
  if (parsed < min) return min;
  if (parsed > max) return max;
  
  return parsed;
}

// URL parameter validation
export function validateUrlParam(param: string, maxLength: number = 1000): string {
  if (typeof param !== 'string') return '';
  
  // Remove potentially dangerous characters
  const sanitized = param
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
  
  return sanitized.length > maxLength ? sanitized.substring(0, maxLength) : sanitized;
}

// Validate tune names and car names
export function validateTuneName(name: string): string {
  if (typeof name !== 'string') return '';
  
  // Allow letters, numbers, spaces, hyphens, and common punctuation
  const sanitized = name.replace(/[^\w\s\-.\,!\?\(\)\[\]]/g, '').trim();
  
  // Length limits
  if (sanitized.length === 0) return 'Untitled Tune';
  if (sanitized.length > 100) return sanitized.substring(0, 100);
  
  return sanitized;
}

// Validate display names for user profiles
export function validateDisplayName(name: string): string {
  if (typeof name !== 'string') return '';
  
  // More restrictive for display names
  const sanitized = name.replace(/[^\w\s\-]/g, '').trim();
  
  if (sanitized.length === 0) return 'Racer';
  if (sanitized.length > 50) return sanitized.substring(0, 50);
  
  return sanitized;
}

// Content Security Policy helper
export function getCSPHeaders(): Record<string, string> {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://apis.google.com https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; '),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
}

// Rate limiting for API calls
export class RateLimiter {
  private requests: number[] = [];
  
  constructor(private maxRequests: number = 10, private windowMs: number = 60000) {}
  
  isAllowed(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
  
  getRemainingRequests(): number {
    const now = Date.now();
    const recentRequests = this.requests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - recentRequests.length);
  }
}

// Input validation for car specifications
export function validateCarSpecs(specs: Record<string, unknown>): Record<string, unknown> {
  const validated: Record<string, unknown> = {};
  
  // Weight validation
  validated.weight = validateNumericInput(String(specs.weight || ''), 1000, 10000, 3000);
  
  // Weight distribution validation
  validated.weightDistribution = validateNumericInput(String(specs.weightDistribution || ''), 30, 70, 52);
  
  // Drive type validation
  const validDriveTypes = ['RWD', 'FWD', 'AWD'];
  validated.driveType = validDriveTypes.includes(String(specs.driveType)) ? specs.driveType : 'RWD';
  
  // PI class validation
  const validPiClasses = ['D', 'C', 'B', 'A', 'S1', 'S2', 'X'];
  validated.piClass = validPiClasses.includes(String(specs.piClass)) ? specs.piClass : 'A';
  
  // Boolean values
  validated.hasAero = Boolean(specs.hasAero);
  
  // Tire compound validation
  const validCompounds = ['street', 'sport', 'semi-slick', 'slick', 'rally', 'offroad', 'drag'];
  validated.tireCompound = validCompounds.includes(String(specs.tireCompound)) ? specs.tireCompound : 'sport';
  
  // Numeric validations with reasonable bounds
  validated.horsepower = validateNumericInput(String(specs.horsepower || ''), 50, 2000, 400);
  validated.torque = validateNumericInput(String(specs.torque || ''), 50, 2000);
  validated.displacement = validateNumericInput(String(specs.displacement || ''), 0.5, 10.0);
  validated.gearCount = validateNumericInput(String(specs.gearCount || ''), 4, 10, 6);
  validated.tireWidth = validateNumericInput(String(specs.tireWidth || ''), 100, 500, 245);
  validated.tireProfile = validateNumericInput(String(specs.tireProfile || ''), 20, 80, 40);
  validated.rimSize = validateNumericInput(String(specs.rimSize || ''), 10, 30, 19);
  validated.tireCircumference = validateNumericInput(String(specs.tireCircumference || ''), 1.0, 3.0, 2.1);
  
  return validated;
}

// Sanitize user input for chat/messages
export function sanitizeChatMessage(message: string): string {
  if (typeof message !== 'string') return '';
  
  // Remove HTML tags and dangerous content
  let sanitized = sanitizeHtml(message);
  
  // Remove potential script injections
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Length limit for chat messages
  if (sanitized.length > 2000) {
    sanitized = sanitized.substring(0, 2000) + '...';
  }
  
  return sanitized;
}

// Validate localStorage data before parsing
export function safeJsonParse<T>(data: string, fallback: T): T {
  try {
    if (typeof data !== 'string') return fallback;
    
    // Check for potentially dangerous content
    if (data.includes('<script') || data.includes('javascript:') || data.includes('data:')) {
      return fallback;
    }
    
    const parsed = JSON.parse(data);
    return parsed;
  } catch (error) {
    console.warn('Failed to parse JSON data:', error);
    return fallback;
  }
}

// Export a security audit function
export function auditUserInput(input: string, type: 'email' | 'text' | 'numeric' | 'url' = 'text'): {
  isValid: boolean;
  sanitized: string;
  warnings: string[];
} {
  const warnings: string[] = [];
  let sanitized = '';
  let isValid = true;
  
  switch (type) {
    case 'email':
      isValid = validateEmail(input);
      sanitized = input.toLowerCase().trim();
      if (!isValid) warnings.push('Invalid email format');
      break;
      
    case 'numeric': {
      const num = validateNumericInput(input);
      sanitized = num.toString();
      if (isNaN(num)) {
        isValid = false;
        warnings.push('Invalid numeric input');
      }
      break;
    }
      
    case 'url':
      sanitized = validateUrlParam(input);
      if (sanitized !== input) {
        warnings.push('URL parameters were sanitized');
      }
      break;
      
    case 'text':
    default:
      sanitized = sanitizeHtml(input);
      if (sanitized !== input) {
        warnings.push('Text content was sanitized for security');
      }
      break;
  }
  
  return { isValid, sanitized, warnings };
}
