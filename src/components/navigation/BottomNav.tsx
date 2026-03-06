"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, MapPin, User, Bell, MessageCircle } from "lucide-react";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/add", label: "Add", icon: PlusCircle },
  { href: "/map", label: "Map", icon: MapPin },
  { href: "/profile", label: "Profile", icon: User }
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on full-screen experiences like business profile mini-sites
  const isHidden = pathname?.startsWith('/business/') && typeof window !== 'undefined' && window.innerWidth < 768;

  if (isHidden) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-gray-800/80 md:hidden">
      <div className="mx-auto max-w-md flex items-center justify-around px-2 py-1">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          const isAdd = tab.href === '/add';
          
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 w-14 py-1 relative ${
                isAdd ? '' : isActive
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {isAdd ? (
                <div className="w-11 h-11 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30 -mt-2">
                  <Icon size={24} className="text-white" />
                </div>
              ) : (
                <div className="relative">
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  {tab.href === '/profile' && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                  )}
                </div>
              )}
              <span className={`text-[10px] font-medium ${isAdd ? 'mt-0.5' : ''}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
