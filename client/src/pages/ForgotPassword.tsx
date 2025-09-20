import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { apiRequest } from "@/lib/queryClient";
import { forgotPasswordSchema, directResetPasswordSchema, type ForgotPassword, type DirectResetPassword } from "@shared/schema";

type ForgotPasswordStep = "email" | "password";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>("email");
  const [verifiedEmail, setVerifiedEmail] = useState<string>("");

  const emailForm = useForm<ForgotPassword>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const passwordForm = useForm<DirectResetPassword>({
    resolver: zodResolver(directResetPasswordSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async (data: ForgotPassword) => {
      const response = await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (data, variables) => {
      // Email verified successfully, move to password reset step
      setVerifiedEmail(variables.email);
      passwordForm.setValue("email", variables.email);
      setCurrentStep("password");
    },
    onError: (error: any) => {
      toast({
        title: t('auth.forgot.error.title'),
        description: error.message || t('auth.forgot.error.description'),
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: DirectResetPassword) => {
      const response = await apiRequest("/api/auth/reset-password-direct", {
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

  const onEmailSubmit = (data: ForgotPassword) => {
    verifyEmailMutation.mutate(data);
  };

  const onPasswordSubmit = (data: DirectResetPassword) => {
    resetPasswordMutation.mutate(data);
  };

  const goBackToEmail = () => {
    setCurrentStep("email");
    setVerifiedEmail("");
    passwordForm.reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center" data-testid="title-forgot-password">
            {currentStep === "email" ? t('auth.forgot.title') : t('auth.reset.title')}
          </CardTitle>
          <CardDescription className="text-center">
            {currentStep === "email" ? t('auth.forgot.subtitle') : t('auth.reset.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === "email" ? (
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.forgot.email')}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t('auth.forgot.email.placeholder')}
                          data-testid="input-email"
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
                  disabled={verifyEmailMutation.isPending}
                  data-testid="button-verify-email"
                >
                  {verifyEmailMutation.isPending ? t('auth.forgot.button.loading') : t('auth.forgot.button')}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  {t('auth.reset.emailVerified')}: <strong>{verifiedEmail}</strong>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto ml-2 text-sm"
                    onClick={goBackToEmail}
                    data-testid="button-change-email"
                  >
                    {t('auth.reset.changeEmail')}
                  </Button>
                </div>

                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.reset.password')}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
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
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.reset.confirmPassword')}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
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
                  data-testid="button-reset-password"
                >
                  {resetPasswordMutation.isPending ? t('auth.reset.button.loading') : t('auth.reset.button')}
                </Button>
              </form>
            </Form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('auth.forgot.footer')}{" "}
              <Link href="/login">
                <a className="font-medium text-primary hover:text-primary/80" data-testid="link-back-to-login">
                  {t('auth.forgot.footer.signin')}
                </a>
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}