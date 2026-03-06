"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Upload, 
  Plus, 
  X, 
  Image as ImageIcon, 
  Tag, 
  DollarSign, 
  Camera, 
  Trash2, 
  Edit, 
  Save, 
  Eye, 
  Search, 
  Filter,
  Grid3x3,
  List,
  MoreVertical,
  Heart,
  MessageCircle,
  Share2,
  Star,
  TrendingUp,
  Package,
  Zap,
  Clock,
  MapPin,
  Phone,
  Calendar,
  BarChart3,
  Sparkles,
  Users
} from 'lucide-react';

export default function EnhancedContentManager({ shopId }) {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('offers');
  const [content, setContent] = useState({
    offers: [],
    menu: [],
    gallery: []
  });
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    price: '',
    image: null,
    category: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showActions, setShowActions] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUser(user);
    if (shopId) {
      fetchBusiness(shopId, user.id);
    } else {
      // Fallback or error
      setLoading(false);
    }
  };

  const fetchBusiness = async (id, userId) => {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (data) {
      setBusiness(data);
      fetchContent(data.id);
    } else {
      console.error('Error fetching business or unauthorized:', error);
      setLoading(false);
    }
  };

  const fetchContent = async (businessId) => {
    // Sample data for demonstration
    setContent({
      offers: [
        { id: 1, title: "50% OFF on First Order", description: "Valid until end of month", image: "/api/placeholder/400/300", active: true, views: 234, clicks: 45 },
        { id: 2, title: "Buy 2 Get 1 Free", description: "On selected items", image: "/api/placeholder/400/300", active: true, views: 189, clicks: 32 }
      ],
      menu: [
        { id: 1, title: "Signature Dish", description: "Our special recipe", price: "$12.99", image: "/api/placeholder/400/300", available: true, orders: 67 },
        { id: 2, title: "Chef's Special", description: "Limited time offer", price: "$15.99", image: "/api/placeholder/400/300", available: true, orders: 45 }
      ],
      gallery: [
        { id: 1, title: "Shop Interior", description: "Beautiful ambiance", image: "/api/placeholder/400/300", likes: 89 },
        { id: 2, title: "Our Team", description: "Friendly staff", image: "/api/placeholder/400/300", likes: 124 }
      ]
    });
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUploadProgress(0);
    
    const newContent = {
      id: Date.now(),
      ...newItem,
      image: newItem.image || "/api/placeholder/400/300",
      active: true,
      views: 0,
      clicks: 0,
      likes: 0,
      orders: 0,
      available: true,
      createdAt: new Date().toISOString()
    };

    setContent(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newContent]
    }));

    setNewItem({ title: '', description: '', price: '', image: null, category: '' });
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setNewItem({
      title: item.title,
      description: item.description,
      price: item.price || '',
      image: item.image,
      category: item.category || ''
    });
    setShowForm(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    setUploadProgress(0);

    setContent(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(item => 
        item.id === editingItem.id 
          ? { ...item, ...newItem }
          : item
      )
    }));

    setNewItem({ title: '', description: '', price: '', image: null, category: '' });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setContent(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(item => item.id !== id)
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItem(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload({ target: { files: e.dataTransfer.files } });
    }
  };

  const filteredContent = content[activeTab].filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading content manager...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-violet-100 to-indigo-100 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="text-violet-600 dark:text-violet-400" size={48} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">No Business Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">You need to create a business first</p>
          <Link
            href="/create"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-violet-500/30 transform hover:-translate-y-1 transition-all duration-300"
          >
            <Plus size={20} />
            <span>Create Business</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-violet-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-violet-100 dark:border-violet-800/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Content Manager
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your offers, menu items, and gallery</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-violet-100 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 rounded-xl font-medium">
                <BarChart3 size={18} />
                Analytics
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl font-medium">
                <TrendingUp size={18} />
                Insights
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Sparkles size={24} />
              <span className="text-2xl font-bold">{content.offers.length}</span>
            </div>
            <p className="text-sm font-medium">Active Offers</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Package size={24} />
              <span className="text-2xl font-bold">{content.menu.length}</span>
            </div>
            <p className="text-sm font-medium">Menu Items</p>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <ImageIcon size={24} />
              <span className="text-2xl font-bold">{content.gallery.length}</span>
            </div>
            <p className="text-sm font-medium">Gallery Photos</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Users size={24} />
              <span className="text-2xl font-bold">1.2K</span>
            </div>
            <p className="text-sm font-medium">Total Views</p>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-violet-100 dark:border-violet-800/50 p-2 mb-8">
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'offers', label: '🔥 Hot Offers', icon: Zap, color: 'from-red-500 to-orange-500' },
              { id: 'menu', label: '🍽️ Menu Items', icon: Package, color: 'from-blue-500 to-cyan-500' },
              { id: 'gallery', label: '📸 Gallery', icon: Camera, color: 'from-purple-500 to-pink-500' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                    : 'text-gray-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-violet-900/30'
                }`}
              >
                <tab.icon size={20} className={activeTab === tab.id ? 'text-white' : ''} />
                <span>{tab.label}</span>
                <span className="bg-white/20 dark:bg-black/20 px-2 py-1 rounded-full text-xs">
                  {content[tab.id].length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-violet-100 dark:border-violet-800/50 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Items</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{content[activeTab].length}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Package className="text-white" size={16} />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-violet-100 dark:border-violet-800/50 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">
                  {content[activeTab].filter(item => item.active !== false).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Eye className="text-white" size={16} />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-violet-100 dark:border-violet-800/50 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Views</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">
                  {content[activeTab].reduce((sum, item) => sum + (item.views || 0), 0)}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-white" size={16} />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-violet-100 dark:border-violet-800/50 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Engagement</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">89%</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Star className="text-white" size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Add New Button */}
        <div className="mb-8">
          <button
            onClick={() => {
              setEditingItem(null);
              setNewItem({ title: '', description: '', price: '', image: null, category: '' });
              setShowForm(true);
            }}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-violet-500/30 transform hover:-translate-y-1 transition-all duration-300"
          >
            <Plus size={20} />
            <span>Add New {activeTab === 'offers' ? 'Offer' : activeTab === 'menu' ? 'Menu Item' : 'Photo'}</span>
            <Zap size={20} className="text-yellow-300" />
          </button>
        </div>

        {/* Enhanced Add/Edit Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingItem ? '✏️ Edit' : '➕ Add New'} {activeTab === 'offers' ? 'Offer' : activeTab === 'menu' ? 'Menu Item' : 'Photo'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                    setNewItem({ title: '', description: '', price: '', image: null, category: '' });
                  }}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X size={24} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <form onSubmit={editingItem ? handleUpdate : handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newItem.title}
                      onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-violet-500/50 focus:border-violet-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                      placeholder="Enter title..."
                    />
                  </div>

                  {activeTab === 'menu' && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                        Price *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          value={newItem.price}
                          onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-violet-500/50 focus:border-violet-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                    Description *
                  </label>
                  <textarea
                    required
                    value={newItem.description}
                    onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-violet-500/50 focus:border-violet-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium resize-none"
                    rows={4}
                    placeholder="Describe your item..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                    Image *
                  </label>
                  <div
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                      dragActive
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    } ${newItem.image ? 'border-solid border-violet-500' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      {newItem.image ? (
                        <div className="space-y-4">
                          <img
                            src={newItem.image}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-xl mx-auto"
                          />
                          <p className="text-sm text-gray-600 dark:text-gray-400">Click or drag to change image</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/20 rounded-full flex items-center justify-center mx-auto">
                            <Camera size={32} className="text-violet-600 dark:text-violet-400" />
                          </div>
                          <div>
                            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                              {dragActive ? 'Drop your image here' : 'Click to upload or drag and drop'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-violet-500/30 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>{editingItem ? 'Updating...' : 'Creating...'}</span>
                      </div>
                    ) : (
                      <span>{editingItem ? '💾 Update' : '✨ Create'} {activeTab === 'offers' ? 'Offer' : activeTab === 'menu' ? 'Menu Item' : 'Photo'}</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingItem(null);
                      setNewItem({ title: '', description: '', price: '', image: null, category: '' });
                    }}
                    className="flex-1 px-8 py-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-2xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Enhanced Content Grid */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-4'}>
          {filteredContent.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <div className="w-32 h-32 bg-gradient-to-r from-violet-100 to-indigo-100 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <ImageIcon size={48} className="text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                No {activeTab === 'offers' ? 'offers' : activeTab === 'menu' ? 'menu items' : 'gallery photos'} yet
              </h3>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                {searchTerm ? 'Try adjusting your search terms' : `Add your first ${activeTab.slice(0, -1)} to get started`}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setNewItem({ title: '', description: '', price: '', image: null, category: '' });
                    setShowForm(true);
                  }}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-violet-500/30 transform hover:-translate-y-1 transition-all duration-300"
                >
                  <Plus size={20} />
                  <span>Add First {activeTab === 'offers' ? 'Offer' : activeTab === 'menu' ? 'Menu Item' : 'Photo'}</span>
                </button>
              )}
            </div>
          ) : (
            filteredContent.map((item, index) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Image */}
                <div className="h-56 relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.active !== false 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-500 text-white'
                    }`}>
                      {item.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="flex-1 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => handleEdit(item)}
                      className="flex-1 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button className="flex-1 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  
                  {item.price && (
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
                      {item.price}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      {item.views !== undefined && (
                        <span className="flex items-center gap-1">
                          <Eye size={14} />
                          {item.views}
                        </span>
                      )}
                      {item.likes !== undefined && (
                        <span className="flex items-center gap-1">
                          <Heart size={14} />
                          {item.likes}
                        </span>
                      )}
                      {item.orders !== undefined && (
                        <span className="flex items-center gap-1">
                          <Package size={14} />
                          {item.orders}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
