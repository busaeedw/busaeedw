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
import { forgotPasswordSchema, type ForgotPassword } from "@shared/schema";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();

  const form = useForm<ForgotPassword>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPassword) => {
      const response = await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: t('auth.forgot.success.title'),
        description: t('auth.forgot.success.description'),
      });
      // Redirect to login page after successful submission
      setLocation("/login");
    },
    onError: (error: any) => {
      toast({
        title: t('auth.forgot.error.title'),
        description: error.message || t('auth.forgot.error.description'),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ForgotPassword) => {
    forgotPasswordMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center" data-testid="title-forgot-password">
            {t('auth.forgot.title')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('auth.forgot.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
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
                disabled={forgotPasswordMutation.isPending}
                data-testid="button-submit"
              >
                {forgotPasswordMutation.isPending ? t('auth.forgot.button.loading') : t('auth.forgot.button')}
              </Button>
            </form>
          </Form>

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