"use client";
import { useState, useEffect } from 'react';
import { Store, Plus, Edit, Trash2, Star, Users, TrendingUp, Calendar, Settings, Globe, Eye, Heart, MessageSquare, BarChart3, Camera, Award } from 'lucide-react';
import { dataStorage, Business } from '@/lib/dataStorage';
import BusinessCreationForm from '@/components/forms/BusinessCreationForm';

export default function BusinessOwnerDashboard() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [showAddBusiness, setShowAddBusiness] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  useEffect(() => {
    fetchBusinesses();
    fetchNotifications();
  }, []);

  const fetchBusinesses = () => {
    const allBusinesses = dataStorage.getBusinesses();
    const currentUser = localStorage.getItem('currentUser');
    
    if (currentUser) {
      const userBusinesses = allBusinesses.filter(b => b.owner_id === currentUser);
      setBusinesses(userBusinesses);
    }
  };

  const fetchNotifications = () => {
    // Mock notifications
    const mockNotifications = [
      {
        id: '1',
        type: 'offer_reminder',
        title: 'Offer Expiring Soon',
        message: 'Your "Weekend Special" offer expires in 24 hours. Continue or delete?',
        time: '2 hours ago',
        action_required: true
      },
      {
        id: '2',
        type: 'menu_reminder',
        title: 'Menu Update Reminder',
        message: 'Have you updated your menu today? Customers love fresh content!',
        time: '8 hours ago',
        action_required: false
      },
      {
        id: '3',
        type: 'verification',
        title: 'Monthly Verification Due',
        message: 'Please upload current shop photos for monthly verification.',
        time: '1 day ago',
        action_required: true
      }
    ];
    setNotifications(mockNotifications);
  };

  const handleAddBusiness = () => {
    setEditingBusiness(null);
    setShowAddBusiness(true);
  };

  const handleEditBusiness = (business: Business) => {
    setEditingBusiness(business);
    setShowAddBusiness(true);
  };

  const handleSaveBusiness = (businessData: any) => {
    try {
      if (editingBusiness) {
        // Update existing business
        dataStorage.updateBusiness(editingBusiness.id, businessData);
        setBusinesses(prev => 
          prev.map(b => b.id === editingBusiness.id ? { ...b, ...businessData } : b)
        );
      } else {
        // Add new business
        const newBusiness = dataStorage.addBusiness(businessData);
        setBusinesses(prev => [...prev, newBusiness]);
      }
      
      setShowAddBusiness(false);
      setEditingBusiness(null);
    } catch (error) {
      console.error('Failed to save business:', error);
      alert('Failed to save business. Please try again.');
    }
  };

  const handleDeleteBusiness = (businessId: string) => {
    if (confirm('Are you sure you want to delete this business?')) {
      try {
        // Get current businesses and remove the one to delete
        const currentBusinesses = dataStorage.getBusinesses();
        const updatedBusinesses = currentBusinesses.filter(b => b.id !== businessId);
        
        // Update localStorage with filtered businesses
        localStorage.setItem('businesses', JSON.stringify(updatedBusinesses));
        setBusinesses(updatedBusinesses);
      } catch (error) {
        console.error('Failed to delete business:', error);
        alert('Failed to delete business. Please try again.');
      }
    }
  };

  const handleVisitWebsite = (url: string) => {
    if (url && url !== '') {
      window.open(url, '_blank');
    } else {
      alert('Website URL not available for this business');
    }
  };

  const handleViewBusiness = (business: Business) => {
    window.location.href = `/business/${business.slug}`;
  };

  const handleAnalytics = () => {
    window.location.href = '/dashboard/analytics';
  };

  const handleBookings = () => {
    window.location.href = '/dashboard/bookings';
  };

  const handleSettings = () => {
    window.location.href = '/dashboard/settings';
  };

  const handleNotificationAction = (notificationId: string, action: string) => {
    console.log('Notification action:', notificationId, action);
    // Handle notification actions
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const BusinessCard = ({ business }: { business: Business }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
            <Store size={20} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{business.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{business.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {business.is_verified && (
            <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Award size={10} />
              Verified
            </div>
          )}
          {business.is_featured && (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-xs px-2 py-1 rounded-full">
              ⭐ Featured
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Star size={16} className="text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-medium">{business.rating}</span>
          <span className="text-sm text-gray-500">({business.review_count})</span>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Created {new Date(business.created_at).toLocaleDateString()}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleViewBusiness(business)}
          className="flex-1 px-3 py-2 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors flex items-center justify-center gap-1"
        >
          <Eye size={14} />
          View
        </button>
        <button
          onClick={() => handleVisitWebsite(business.custom_website_url || business.website || '')}
          className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-1"
        >
          <Globe size={14} />
          Website
        </button>
        <button
          onClick={() => handleEditBusiness(business)}
          className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Edit size={14} />
        </button>
        <button
          onClick={() => handleDeleteBusiness(business.id)}
          className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center">
                <Store size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Businesses</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage your shops and services</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNotificationSettings(true)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <MessageSquare size={18} className="text-gray-600 dark:text-gray-400" />
                {notifications.filter(n => n.action_required).length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button
                onClick={() => window.location.href = '/dashboard/analytics'}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <BarChart3 size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => window.location.href = '/dashboard/settings'}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Settings size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex gap-6 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Store, handler: () => {} },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp, handler: handleAnalytics },
              { id: 'bookings', label: 'Bookings', icon: Calendar, handler: handleBookings },
              { id: 'notifications', label: 'Notifications', icon: MessageSquare, handler: () => {} },
              { id: 'verification', label: 'Verification', icon: Camera, handler: () => {} }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={tab.handler}
                className={`flex items-center gap-2 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <tab.icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <Store size={20} className="text-violet-600 dark:text-violet-400" />
                  <span className="text-sm text-green-600">+12%</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{businesses.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Businesses</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <Users size={20} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-green-600">+8%</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">1,234</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Customers</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <Star size={20} className="text-yellow-500" />
                  <span className="text-sm text-green-600">+0.3</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">4.8</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-600">+24%</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">₹45.2K</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</div>
              </div>
            </div>

            {/* Add Business Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Businesses</h2>
              <button
                onClick={handleAddBusiness}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Add Business
              </button>
            </div>

            {/* Businesses Grid */}
            {businesses.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <Store size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Businesses Yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Start by adding your first business to BizGallery</p>
                <button
                  onClick={handleAddBusiness}
                  className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Plus size={16} />
                  Add Your First Business
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {businesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h2>
            {notifications.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Notifications</h3>
                <p className="text-gray-600 dark:text-gray-400">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{notification.title}</h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">{notification.message}</p>
                        <p className="text-sm text-gray-500">{notification.time}</p>
                      </div>
                      {notification.action_required && (
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleNotificationAction(notification.id, 'continue')}
                            className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm"
                          >
                            Continue
                          </button>
                          <button
                            onClick={() => handleNotificationAction(notification.id, 'delete')}
                            className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'verification' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Shop Verification</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <Camera size={48} className="mx-auto text-violet-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Monthly Verification Required</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Upload current photos of your shop for monthly verification. 10 random customers will be asked to verify your shop exists.
                </p>
                <button className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-2 mx-auto">
                  <Camera size={16} />
                  Upload Verification Photos
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Business Modal */}
      {showAddBusiness && (
        <BusinessCreationForm
          business={editingBusiness}
          onSave={handleSaveBusiness}
          onClose={() => {
            setShowAddBusiness(false);
            setEditingBusiness(null);
          }}
        />
      )}

      {/* Notification Settings Modal */}
      {showNotificationSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notification Settings</h2>
              <button
                onClick={() => setShowNotificationSettings(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Offer Reminders</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get notified 24h before offers expire</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-violet-600" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Menu Updates</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Daily reminder at 9 AM to update menu</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-violet-600" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Monthly Verification</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Reminder for monthly shop verification</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-violet-600" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
