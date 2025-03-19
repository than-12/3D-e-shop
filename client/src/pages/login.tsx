import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { LogIn, User, KeyRound, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "@/components/ui/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SEO } from "@/components/ui/seo";
import { authAPI } from "@/services/api";
import { useUserStore } from "@/lib/userStore";

const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, { message: "login.username_email_required" }),
  password: z.string().min(1, { message: "login.password_required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUserStore();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login({ 
        email: values.usernameOrEmail, 
        password: values.password 
      });
      
      if (response && response.user) {
        login(response.user);
        toast(t("login.welcome_back"));

        if (response.user.role === 'admin') {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(t("login.invalid_credentials"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-12 max-w-md">
      <SEO 
        title="Σύνδεση" 
        description="Συνδεθείτε στο λογαριασμό σας για να διαχειριστείτε τις παραγγελίες σας και το προφίλ σας." 
      />
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {t("login.title")}
            </CardTitle>
          </div>
          <CardDescription>
            {t("login.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="usernameOrEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {t("login.username_or_email")}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={t("login.username_or_email_placeholder")} {...field} />
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
                    <FormLabel className="flex items-center gap-1">
                      <KeyRound className="h-4 w-4" />
                      {t("login.password")}
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t("login.password_placeholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t("login.logging_in") : (
                  <span className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    {t("login.login_button")}
                  </span>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center">
            {t("login.no_account")}{" "}
            <Link href="/register" className="text-primary">
              {t("login.create_account")}
            </Link>
          </div>
          <div className="text-sm text-center">
            <Link href="/forgot-password" className="text-gray-500">
              {t("login.forgot_password")}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 