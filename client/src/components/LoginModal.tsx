import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const { t, language } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Add cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowPassword(false);
      setErrorMessage('');
      setIsLoading(false);
      form.reset();
    }
  }, [isOpen, form]);

  // Add escape key handler for better mobile/tablet experience
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, isLoading, onClose]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Login successful
        onLoginSuccess?.();
        onClose();
        // Refresh the page to update authentication state
        window.location.reload();
      } else {
        // Login failed
        const errorText = language === 'ar' 
          ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
          : 'Either email or password is not correct';
        setErrorMessage(errorText);
      }
    } catch (error) {
      const errorText = language === 'ar' 
        ? 'حدث خطأ أثناء تسجيل الدخول'
        : 'An error occurred during login';
      setErrorMessage(errorText);
    } finally {
      setIsLoading(false);
    }
  };

  // Ensure modal can always be closed, even if there are errors
  const handleModalClose = (open: boolean) => {
    if (!open && !isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent 
        className="sm:max-w-md"
        onPointerDownOutside={(e) => {
          // Allow closing by clicking outside, unless loading
          if (isLoading) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Allow escape key, unless loading
          if (isLoading) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                {errorMessage}
              </div>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                      {...field}
                      data-testid="login-email-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    {language === 'ar' ? 'كلمة المرور' : 'Password'}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                        {...field}
                        data-testid="login-password-input"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        data-testid="toggle-password-visibility"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                data-testid="cancel-login-button"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-purple-primary hover:bg-purple-primary/90"
                data-testid="submit-login-button"
              >
                {isLoading ? (
                  language === 'ar' ? 'جاري تسجيل الدخول...' : 'Logging in...'
                ) : (
                  language === 'ar' ? 'تسجيل الدخول' : 'Login'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}