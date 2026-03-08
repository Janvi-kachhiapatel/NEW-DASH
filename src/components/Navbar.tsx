"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, ShoppingCart, ArrowLeft, User, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function Navbar() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isAuthenticated } = useAuth();

  useEffect(() => setMounted(true), []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const handleSignOut = () => {
    signOut();
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-violet-200/50 dark:border-violet-800/50 transition-all duration-300 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex items-center gap-4">
            {/* Back Button */}
            {pathname !== '/' && (
              <button 
                onClick={() => router.back()}
                className="p-2 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-all duration-300 group shadow-md border border-violet-200 dark:border-violet-700"
                aria-label="Go back"
              >
                <ArrowLeft size={20} className="text-violet-600 dark:text-violet-400 group-hover:-translate-x-1 transition-transform" />
              </button>
            )}

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg">
                <ShoppingCart size={20} />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                Biz<span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Gallery</span>
              </span>
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            {mounted && (
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-all duration-300 group shadow-md border border-violet-200 dark:border-violet-700"
                aria-label="Toggle theme"
              >
                {resolvedTheme === 'dark' ? 
                  <Sun size={20} className="text-yellow-400 group-hover:rotate-180 transition-transform duration-500" /> : 
                  <Moon size={20} className="text-violet-600 group-hover:rotate-12 transition-transform duration-500" />
                }
              </button>
            )}

            {/* Authentication Buttons */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                  Hi, {user.name}
                </span>
                {user.role === 'business_owner' && (
                  <Link 
                    href="/owner" 
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-violet-500/30 transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105 flex items-center gap-2"
                  >
                    <ShoppingCart size={16} />
                    Dashboard
                  </Link>
                )}
                <button 
                  onClick={handleSignOut}
                  className="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 group shadow-md border border-red-200 dark:border-red-700"
                  aria-label="Sign out"
                >
                  <LogOut size={20} className="text-red-600 dark:text-red-400" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  href="/login" 
                  className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium text-sm px-4 py-2 rounded-lg border border-violet-200 dark:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-all duration-300"
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-violet-500/30 transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105"
                >
                  Sign Up
                </Link>
                <Link 
                  href="/owner" 
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-violet-500/30 transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105 flex items-center gap-2"
                >
                  <ShoppingCart size={16} />
                  For Business Owners
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
