import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, LogIn, UserPlus } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Welcome back!');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      if (error instanceof TypeError && /fetch/i.test(error.message)) {
        toast.error('Network error while contacting the auth server. Please disable ad blockers/VPN, check your connection, and try again.');
      } else {
        const message = error instanceof Error ? error.message : 'Login failed';
        
        if (message.includes('Email not confirmed')) {
          toast.error('Email not confirmed', {
            description: 'Please check your inbox and verify your email address.',
            action: {
              label: 'Resend',
              onClick: async () => {
                const { error: resendError } = await supabase.auth.resend({
                  type: 'signup',
                  email,
                  options: {
                    emailRedirectTo: import.meta.env.VITE_AUTH_REDIRECT_URL || `${window.location.origin}/`
                  }
                });
                if (resendError) toast.error(resendError.message);
                else toast.success('Confirmation email sent!');
              }
            }
          });
        } else {
          toast.error(message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL || `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      });

      if (error) throw error;

      if (data.session) {
        toast.success('Account created! You are now logged in.');
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.message('Account created!', {
          description: 'Please check your email to confirm your account before logging in.',
          duration: 6000,
        });
        setActiveTab('login');
      }
    } catch (error) {
      if (error instanceof TypeError && /fetch/i.test(error.message)) {
        toast.error('Network error while contacting the auth server. Please disable ad blockers/VPN, check your connection, and try again.');
      } else {
        toast.error(error instanceof Error ? error.message : 'Signup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[hsl(220,18%,8%)] border-[hsl(220,15%,20%)]">
        <DialogHeader>
          <DialogTitle className="font-display text-[hsl(var(--racing-yellow))] uppercase tracking-wider">
            Sync Your Tunes
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Sign in to save tunes to the cloud and access them anywhere
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[hsl(220,15%,12%)]">
            <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              <UserPlus className="w-4 h-4 mr-2" />
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-sm text-muted-foreground">
                  Email
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="racer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[hsl(220,15%,12%)] border-[hsl(220,15%,20%)]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-sm text-muted-foreground">
                  Password
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-[hsl(220,15%,12%)] border-[hsl(220,15%,20%)]"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/80 text-black font-display uppercase tracking-wider"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
                Login
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-sm text-muted-foreground">
                  Display Name
                </Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="SpeedDemon"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-[hsl(220,15%,12%)] border-[hsl(220,15%,20%)]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-sm text-muted-foreground">
                  Email
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="racer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[hsl(220,15%,12%)] border-[hsl(220,15%,20%)]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-sm text-muted-foreground">
                  Password
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-[hsl(220,15%,12%)] border-[hsl(220,15%,20%)]"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/80 text-black font-display uppercase tracking-wider"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Your tunes are saved locally even without an account
        </p>
      </DialogContent>
    </Dialog>
  );
}
