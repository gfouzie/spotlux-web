import type { Metadata } from 'next';
import { Geist, Geist_Mono, Martel_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserProvider } from '@/contexts/UserContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const martelSans = Martel_Sans({
  variable: '--font-martel-sans',
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Spotlux',
  description: 'Shining on the future',
  icons: {
    icon: '/spotlux_favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/spotlux_favicon.ico" />
        <link rel="shortcut icon" href="/spotlux_favicon.ico" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('spotlux-theme');
                if (theme === 'light' || theme === 'dark') {
                  document.documentElement.setAttribute('data-theme', theme);
                } else {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              } catch (e) {
                document.documentElement.setAttribute('data-theme', 'light');
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${martelSans.variable} antialiased bg-bg-col text-text-col`}
      >
        <ThemeProvider defaultTheme="light">
          <AuthProvider>
            <UserProvider>{children}</UserProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
