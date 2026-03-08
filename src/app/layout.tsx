import './globals.css';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/navigation/BottomNav';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/lib/auth';

export const metadata = {
  title: 'BizGallery - Local Business Discovery Platform',
  description: 'Discover amazing local businesses with AI-powered recommendations, book services, and find the best deals near you.',
  keywords: 'local business, discovery, booking, AI recommendations, shopping, services',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body className="bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            <Navbar />
            <main className="pb-20 md:pb-0">{children}</main>
            <BottomNav />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
