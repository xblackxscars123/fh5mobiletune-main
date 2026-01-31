import { getCSPHeaders } from '@/lib/security';

// CSP Headers for Vite development and production
export function setupSecurityHeaders() {
  // Only add headers in production or when explicitly enabled
  if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_SECURITY_HEADERS === 'true') {
    const headers = getCSPHeaders();
    
    // Log CSP headers for debugging
    if (import.meta.env.DEV) {
      console.log('Security Headers Enabled:', headers);
    }
    
    return headers;
  }
  
  return {};
}

// Middleware function for Vite
export function securityMiddleware() {
  return {
    name: 'security-headers',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const headers = setupSecurityHeaders();
        
        Object.entries(headers).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
        
        next();
      });
    }
  };
}
