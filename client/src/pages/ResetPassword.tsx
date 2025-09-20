import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { apiRequest } from "@/lib/queryClient";
import { resetPasswordSchema, type ResetPassword } from "@shared/schema";

export default function ResetPassword() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [token, setToken] = useState<string>("");

  // Extract token from URL query parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    
    if (!resetToken) {
      toast({
        title: t('auth.reset.error.title'),
        description: t('auth.reset.error.notoken'),
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }
    
    setToken(resetToken);
  }, [location, toast, t, setLocation]);

  const form = useForm<ResetPassword>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Update token in form when it's extracted from URL
  useEffect(() => {
    if (token) {
      form.setValue('token', token);
    }
  }, [token, form]);

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPassword) => {
      const response = await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: t('auth.reset.success.title'),
        description: t('auth.reset.success.description'),
      });
      // Redirect to login page after successful password reset
      setLocation("/login");
    },
    onError: (error: any) => {
      toast({
        title: t('auth.reset.error.title'),
        description: error.message || t('auth.reset.error.description'),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ResetPassword) => {
    resetPasswordMutation.mutate(data);
  };

  // Don't render form until token is loaded
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600">{t('auth.reset.loading')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center" data-testid="title-reset-password">
            {t('auth.reset.title')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('auth.reset.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.reset.password')}</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder={t('auth.reset.password.placeholder')}
                        data-testid="input-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.reset.confirmPassword')}</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder={t('auth.reset.confirmPassword.placeholder')}
                        data-testid="input-confirm-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={resetPasswordMutation.isPending}
                data-testid="button-submit"
              >
                {resetPasswordMutation.isPending ? t('auth.reset.button.loading') : t('auth.reset.button')}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('auth.reset.footer')}{" "}
              <Link href="/login">
                <a className="font-medium text-primary hover:text-primary/80" data-testid="link-back-to-login">
                  {t('auth.reset.footer.signin')}
                </a>
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}