import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
        // Module category colors
        module: {
          suspension: 'hsl(var(--module-suspension))',
          aero: 'hsl(var(--module-aero))',
          gearing: 'hsl(var(--module-gearing))',
          tires: 'hsl(var(--module-tires))',
          differential: 'hsl(var(--module-differential))',
          brakes: 'hsl(var(--module-brakes))',
          alignment: 'hsl(var(--module-alignment))',
          damping: 'hsl(var(--module-damping))'
        },
        // Neon colors
        neon: {
          pink: 'hsl(var(--neon-pink))',
          cyan: 'hsl(var(--neon-cyan))',
          purple: 'hsl(var(--neon-purple))',
          blue: 'hsl(var(--neon-blue))'
        },
        // Blueprint colors
        blueprint: {
          bg: 'hsl(var(--blueprint-bg))',
          grid: 'hsl(var(--blueprint-grid))',
          line: 'hsl(var(--blueprint-line))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'module-snap': {
          '0%': { transform: 'scale(1.05)' },
          '50%': { transform: 'scale(0.98)' },
          '100%': { transform: 'scale(1)' }
        },
        'ink-ripple': {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(2)', opacity: '0' }
        },
        'draw-line': {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' }
        },
        'pulse-neon': {
          '0%, 100%': { 
            boxShadow: '0 0 10px hsl(var(--neon-pink) / 0.2), 0 0 20px hsl(var(--neon-pink) / 0.1)'
          },
          '50%': { 
            boxShadow: '0 0 15px hsl(var(--neon-pink) / 0.4), 0 0 30px hsl(var(--neon-pink) / 0.2)'
          }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'module-snap': 'module-snap 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ink-ripple': 'ink-ripple 0.6s ease-out forwards',
        'draw-line': 'draw-line 0.5s ease-out forwards',
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite'
      },
      fontFamily: {
        sans: ['Rajdhani', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Caveat', 'cursive'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        display: ['Orbitron', 'sans-serif'],
        sketch: ['Architects Daughter', 'Caveat', 'cursive']
      },
      boxShadow: {
        '2xs': 'var(--shadow-2xs)',
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        'module': 'var(--shadow-module)',
        'glow-pink': 'var(--shadow-glow-pink)',
        'glow-cyan': 'var(--shadow-glow-cyan)'
      },
      backgroundImage: {
        'blueprint-grid': `
          linear-gradient(hsl(var(--blueprint-grid) / 0.3) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--blueprint-grid) / 0.3) 1px, transparent 1px),
          linear-gradient(hsl(var(--blueprint-grid) / 0.15) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--blueprint-grid) / 0.15) 1px, transparent 1px)
        `
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
