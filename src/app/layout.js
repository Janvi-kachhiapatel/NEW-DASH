import './globals.css';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/navigation/BottomNav';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/lib/auth';

export const metadata = {
  title: 'BizGallery - Local Business Discovery',
  description: 'Find the best local shops near you.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
        />
      </head>
      <body className="bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            <Navbar />
            <main className="pb-16 md:pb-0">{children}</main>
            <BottomNav />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
