import { I18nProvider } from '@/providers/i18n-provider';
import { GoogleAnalytics } from '@/components/analytics/google-analytics';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn('min-h-screen bg-background antialiased', fontSans.variable)}>
        <I18nProvider>
          <GoogleAnalytics />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <CartProvider>
              <AuthProvider>
                <QueryProvider>
                  {/* ... existing code ... */}
                </QueryProvider>
              </AuthProvider>
            </CartProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
} 