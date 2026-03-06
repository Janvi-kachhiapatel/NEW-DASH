"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'next/navigation';
import { Phone, MessageCircle, ArrowLeft, Globe, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

export default function WebsitePreview() {
  const { slug } = useParams();
  const [biz, setBiz] = useState(null);

  useEffect(() => {
    const fetchBiz = async () => {
      const { data } = await supabase.from('businesses').select('*').eq('slug', slug).single();
      setBiz(data);
    };
    fetchBiz();
  }, [slug]);

  if (!biz) return (
    <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  const cleanPhone = biz.whatsapp.replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] h-[85vh] bg-white dark:bg-gray-900 rounded-[40px] shadow-2xl overflow-hidden border-8 border-gray-800 dark:border-gray-950 flex flex-col relative">
        
        {/* Floating Back Button */}
        <Link href="/" className="absolute top-6 left-6 z-10 bg-black/30 hover:bg-black/50 backdrop-blur text-white p-2 rounded-full transition">
          <ArrowLeft size={20} />
        </Link>

        {/* Cover Image */}
        <div className="h-64 w-full flex-shrink-0 relative">
          <img src={biz.image_url} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h1 className="text-3xl font-extrabold text-white shadow-sm leading-tight">{biz.name}</h1>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-4 uppercase tracking-wide text-xs">
            <Globe size={12} /> {biz.category}
          </div>
          
          <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300 mb-6 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
            <MapPin size={18} className="mt-0.5 text-red-500" />
            <span className="text-sm font-medium">{biz.location}</span>
          </div>

          {(biz.opening_time && biz.closing_time) && (
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 mb-6 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
              <Clock size={18} className="text-blue-500" />
              <div>
                <span className="text-sm font-medium">Open: {biz.opening_time} - {biz.closing_time}</span>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {(() => {
                    const now = new Date();
                    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                    const isOpen = currentTime >= biz.opening_time && currentTime <= biz.closing_time;
                    return isOpen ? '🟢 Open Now' : '🔴 Closed Now';
                  })()}
                </div>
              </div>
            </div>
          )}

          {(biz.latitude && biz.longitude) && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-bold mb-3">
                <MapPin size={16} />
                <span className="text-sm">Location</span>
              </div>
              <div className="w-full h-48 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${biz.longitude - 0.005},${biz.latitude - 0.005},${biz.longitude + 0.005},${biz.latitude + 0.005}&layer=mapnik&marker=${biz.latitude},${biz.longitude}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  className="w-full h-full"
                />
              </div>
              <button 
                onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${biz.latitude}&mlon=${biz.longitude}#map=15/${biz.latitude}/${biz.longitude}`)}
                className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition text-sm"
              >
                🗺️ View on Map
              </button>
            </div>
          )}

          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">About Us</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
            {biz.description}
          </p>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900 p-4 rounded-2xl">
             <p className="text-green-700 dark:text-green-300 font-bold text-sm text-center">We are open for business!</p>
          </div>
          
          {/* Spacer for sticky footer */}
          <div className="h-20"></div>
        </div>

        {/* Sticky Floating Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-4 pb-8 grid grid-cols-2 gap-4 rounded-b-[32px]">
          <button 
            onClick={() => window.open(`tel:${cleanPhone}`)} 
            className="flex items-center justify-center gap-2 py-3.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl font-bold hover:bg-blue-100 transition"
          >
            <Phone size={20} /> Call
          </button>
          <button 
            onClick={() => window.open(`https://wa.me/${cleanPhone}?text=Hi, I saw your website.`)} 
            className="flex items-center justify-center gap-2 py-3.5 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition shadow-lg shadow-green-200"
          >
            <MessageCircle size={20} /> WhatsApp
          </button>
        </div>

      </div>
    </div>
  );
}