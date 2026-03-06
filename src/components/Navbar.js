"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useTheme } from 'next-themes';
import { Moon, Sun, ShoppingCart, LogOut, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
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

            {/* Auth Buttons */}
            {user ? (
              <>
                <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-violet-600 font-medium transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20">
                  <LayoutDashboard size={18} /> 
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut size={18} /> 
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 dark:text-gray-300 font-medium hover:text-violet-600 transition-all duration-300 hidden sm:block hover:scale-105 px-3 py-2 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20">
                  Login
                </Link>
                <Link href="/signup" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-violet-500/30 transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105 flex items-center gap-2">
                  <ShoppingCart size={16} />
                  Start Selling
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}