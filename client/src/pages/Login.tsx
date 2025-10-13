import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { apiRequest } from "@/lib/queryClient";
import { loginSchema, type LoginUser } from "@shared/schema";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const form = useForm<LoginUser>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginUser) => {
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: async () => {
      toast({
        title: t('auth.login.success.title'),
        description: t('auth.login.success.description'),
      });
      // Invalidate the auth user query to fetch the logged-in user
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Fetch the user data to check role
      const userData = await queryClient.fetchQuery({
        queryKey: ["/api/auth/user"],
      });
      
      // Redirect admin users to admin dashboard, others to regular dashboard
      if (userData && (userData as any).role === 'admin') {
        setLocation("/admin");
      } else {
        setLocation("/");
      }
    },
    onError: (error: any) => {
      toast({
        title: t('auth.login.error.title'),
        description: error.message || t('auth.login.error.description'),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginUser) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center" data-testid="title-login">
            {t('auth.login.title')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('auth.login.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.login.username')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('auth.login.username.placeholder')}
                        data-testid="input-username"
                        autoCapitalize="off"
                        {...field}
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
                    <FormLabel>{t('auth.login.password')}</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder={t('auth.login.password.placeholder')}
                        data-testid="input-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80 font-medium" data-testid="link-forgot-password">
                  {t('auth.login.forgot')}
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? t('auth.login.button.loading') : t('auth.login.button')}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('auth.login.footer')}{" "}
              <Link href="/register" className="font-medium text-primary hover:text-primary/80" data-testid="link-register">
                {t('auth.login.footer.signup')}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}