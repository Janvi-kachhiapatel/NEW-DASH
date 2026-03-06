"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Store, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock, 
  MapPin, 
  Phone, 
  Settings, 
  Package, 
  Image, 
  Tag, 
  Calendar, 
  BarChart3, 
  Zap, 
  Award, 
  ShoppingBag, 
  MessageSquare, 
  Heart, 
  Share2, 
  MoreVertical, 
  Grid3x3, 
  List, 
  Search, 
  Filter,
  ArrowLeft
} from 'lucide-react';

export default function ShopkeeperDashboard() {
  const [user, setUser] = useState(null);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showActions, setShowActions] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchMyShops();
  }, []);

  const fetchMyShops = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return window.location.href = '/login';
    setUser(user);
    
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    setShops(data || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this shop?')) return;
    
    await supabase.from('businesses').delete().eq('id', id);
    setShops(shops.filter(shop => shop.id !== id));
  };

  const filteredShops = shops.filter(shop => 
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-violet-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-40 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-violet-200/50 dark:border-violet-800/50 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Back Button */}
                <Link 
                  href="/"
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-violet-200 dark:border-violet-700 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-all duration-300 shadow-md hover:shadow-lg group"
                >
                  <ArrowLeft size={20} className="text-violet-600 dark:text-violet-400 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Back to Home</span>
                </Link>
                
                <div>
                  <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="text-white" size={20} />
                    </div>
                    My Shops
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your business empire</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search shops..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 border border-violet-200 dark:border-violet-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                
                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-white dark:bg-gray-700 border border-violet-200 dark:border-violet-700 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'grid' 
                        ? 'bg-violet-600 text-white' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-violet-100 dark:hover:bg-violet-900/30'
                    }`}
                  >
                    <Grid3x3 size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-violet-600 text-white' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-violet-100 dark:hover:bg-violet-900/30'
                    }`}
                  >
                    <List size={18} />
                  </button>
                </div>
                
                {/* Create New Shop Button */}
                <Link
                  href="/create"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-violet-500/30 transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Plus size={20} />
                  <span>New Shop</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {shops.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-r from-violet-100 to-indigo-100 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Store size={48} className="text-violet-600 dark:text-violet-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">No Shops Yet</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Start by creating your first business profile</p>
              <Link 
                href="/create" 
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-violet-500/30 transform hover:-translate-y-1 transition-all duration-300"
              >
                <Plus size={20} />
                <span>Create Your First Shop</span>
              </Link>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-violet-100 dark:border-violet-800/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Shops</p>
                      <p className="text-3xl font-black text-gray-900 dark:text-white">{shops.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <Store className="text-white" size={20} />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-violet-100 dark:border-violet-800/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Avg Rating</p>
                      <p className="text-3xl font-black text-gray-900 dark:text-white">4.8</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <Star className="text-white" size={20} />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-violet-100 dark:border-violet-800/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Views</p>
                      <p className="text-3xl font-black text-gray-900 dark:text-white">2.4k</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Eye className="text-white" size={20} />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-violet-100 dark:border-violet-800/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Growth</p>
                      <p className="text-3xl font-black text-gray-900 dark:text-white">+24%</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <TrendingUp className="text-white" size={20} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shops Grid/List */}
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredShops.map((shop) => (
                  <div
                    key={shop.id}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-violet-100 dark:border-violet-800/50 hover:-translate-y-1 group"
                  >
                    {/* Shop Image */}
                    <div className="h-48 relative overflow-hidden rounded-t-2xl">
                      <img 
                        src={shop.image_url} 
                        alt={shop.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-violet-600 dark:text-violet-400 rounded-full text-xs font-bold">
                          {shop.category}
                        </span>
                      </div>
                    </div>

                    {/* Shop Info */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                            {shop.name}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                            <MapPin size={16} className="text-red-500" />
                            <span>{shop.location}</span>
                          </div>
                        </div>
                        
                        {/* Actions Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setShowActions(showActions === shop.id ? null : shop.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <MoreVertical size={18} className="text-gray-600 dark:text-gray-400" />
                          </button>
                          
                          {showActions === shop.id && (
                            <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-violet-100 dark:border-violet-800/50 z-50">
                            <Link
                                href={`/dashboard/content/${shop.id}`}
                                className="flex items-center gap-3 px-4 py-3 bg-violet-600 text-white hover:bg-violet-700 transition-colors rounded-t-xl"
                              >
                                <Edit size={16} className="text-white" />
                                <span className="font-bold">Manage Content</span>
                              </Link>
                              <Link
                                href={`/${shop.slug}`}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors"
                              >
                                <Eye size={16} className="text-blue-600 dark:text-blue-400" />
                                <span className="text-gray-700 dark:text-gray-300">View Shop</span>
                              </Link>
                              <Link
                                href={`/dashboard/edit/${shop.id}`}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors"
                              >
                                <Settings size={16} className="text-green-600 dark:text-green-400" />
                                <span className="text-gray-700 dark:text-gray-300">Edit Details</span>
                              </Link>
                              <button
                                onClick={() => handleDelete(shop.id)}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors rounded-b-xl w-full text-left"
                              >
                                <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                                <span className="text-gray-700 dark:text-gray-300">Delete Shop</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">4.8</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Rating</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">324</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Views</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Offers</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Link
                          href={`/dashboard/content/${shop.id}`}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg hover:shadow-violet-500/30 transition-all duration-300"
                        >
                          <Package size={16} />
                          <span>Manage Content</span>
                        </Link>
                        <Link
                          href={`/${shop.slug}`}
                          className="flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-700 border border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400 rounded-xl font-medium hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-all duration-300"
                        >
                          <Eye size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
