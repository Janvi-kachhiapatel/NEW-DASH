"use client";
import { useState, useEffect } from 'react';
import { Store, Plus, Edit, Star, Calendar, Globe, Eye, Menu, DollarSign, MapPin, Phone, CheckCircle, Utensils } from 'lucide-react';
import { dataStorage, Business } from '@/lib/dataStorage';
import WebsiteGenerator from '@/components/website/WebsiteGenerator';
import MenuOfferManager from '@/components/management/MenuOfferManager';
import BookingApproval from '@/components/booking/BookingApproval';
import DailyMenuManager from '@/components/management/DailyMenuManager';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function BusinessOwnerDashboard() {
  return (
    <ProtectedRoute requiredRole="business_owner">
      <BusinessOwnerDashboardContent />
    </ProtectedRoute>
  );
}

function BusinessOwnerDashboardContent() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'business' | 'bookings' | 'menu'>('overview');
  const [showWebsiteGenerator, setShowWebsiteGenerator] = useState(false);
  const [showMenuManager, setShowMenuManager] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = () => {
    const allBusinesses = dataStorage.getBusinesses();
    const currentUser = localStorage.getItem('currentUser');
    
    if (currentUser) {
      const userBusinesses = allBusinesses.filter(b => b.owner_id === currentUser);
      setBusinesses(userBusinesses);
    }
  };

  const handleGenerateWebsite = (business: Business) => {
    setSelectedBusiness(business);
    setShowWebsiteGenerator(true);
  };

  const handleManageMenu = (business: Business) => {
    setSelectedBusiness(business);
    setShowMenuManager(true);
  };

  const handleAddBusiness = () => {
    window.location.href = '/dashboard';
  };

  const BusinessCard = ({ business }: { business: Business }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="h-48 bg-gradient-to-br from-violet-500 to-purple-600 relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-3xl font-bold">{business.name.charAt(0)}</span>
            </div>
            <h3 className="font-bold text-xl">{business.name}</h3>
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            business.is_verified ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
          }`}>
            {business.is_verified ? 'Verified' : 'Pending'}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm font-medium">
            {business.category}
          </span>
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <Star size={14} className="text-yellow-500 fill-current" />
            <span>{business.rating}</span>
            <span className="text-xs">({business.review_count || 0})</span>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {business.description}
        </p>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <MapPin size={14} />
          <span>{business.address}</span>
        </div>

        {business.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Phone size={14} />
            <span>{business.phone}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => window.location.href = `/business/${business.slug}`}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Eye size={14} />
            View
          </button>
          <button
            onClick={() => handleGenerateWebsite(business)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Globe size={14} />
            Website
          </button>
          <button
            onClick={() => handleManageMenu(business)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Menu size={14} />
            Menu
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            <Edit size={14} />
            Edit
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Store size={28} className="text-violet-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Business Owner Portal
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your businesses and track performance
                </p>
              </div>
            </div>
            <button
              onClick={handleAddBusiness}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            >
              <Plus size={16} />
              Add Business
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveView('overview')}
              className={`py-3 px-1 border-b-2 transition-colors ${
                activeView === 'overview'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView('business')}
              className={`py-3 px-1 border-b-2 transition-colors ${
                activeView === 'business'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              My Businesses ({businesses.length})
            </button>
            <button
              onClick={() => setActiveView('bookings')}
              className={`py-3 px-1 border-b-2 transition-colors ${
                activeView === 'bookings'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Bookings
            </button>
            <button
              onClick={() => setActiveView('menu')}
              className={`py-3 px-1 border-b-2 transition-colors ${
                activeView === 'menu'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Utensils size={16} />
                Daily Menu
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {activeView === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                    <Store size={24} className="text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Businesses</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{businesses.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Calendar size={24} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {(() => {
                        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
                        return bookings.filter((b: any) => 
                          businesses.some(business => business.id === b.businessId)
                        ).length;
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <DollarSign size={24} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${(() => {
                        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
                        return businesses.reduce((total, business) => {
                          const businessBookings = bookings.filter((b: any) => b.businessId === business.id && b.status === 'completed');
                          const revenue = businessBookings.reduce((sum: number, booking: any) => {
                            const service = business.services?.find((s: any) => s.name === booking.service);
                            return sum + (service?.price || 0);
                          }, 0);
                          return total + revenue;
                        }, 0);
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Businesses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.slice(0, 3).map(business => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'business' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                All Your Businesses ({businesses.length})
              </h2>
              <button
                onClick={handleAddBusiness}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                <Plus size={16} />
                Add New Business
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map(business => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>

            {businesses.length === 0 && (
              <div className="text-center py-12">
                <Store size={64} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No businesses yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Add your first business to get started
                </p>
                <button
                  onClick={handleAddBusiness}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                  <Plus size={16} />
                  Add Your First Business
                </button>
              </div>
            )}
          </div>
        )}

        {activeView === 'bookings' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Booking Management
            </h2>
            {businesses.length > 0 ? (
              <div className="space-y-6">
                {businesses.map(business => (
                  <div key={business.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-bold text-violet-600 dark:text-violet-400">
                          {business.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {business.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {business.category} • {business.address}
                        </p>
                      </div>
                    </div>
                    <BookingApproval 
                      businessId={business.id}
                      onBookingUpdate={fetchBusinesses}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar size={64} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No businesses to manage bookings
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Add a business to start managing bookings
                </p>
                <button
                  onClick={handleAddBusiness}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                  <Plus size={16} />
                  Add Business
                </button>
              </div>
            )}
          </div>
        )}

        {activeView === 'menu' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Daily Menu Management
            </h2>
            {businesses.length > 0 ? (
              <div className="space-y-6">
                {businesses.map(business => (
                  <div key={business.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                        <Utensils size={24} className="text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {business.name} - Daily Menu
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Manage your daily specials and menu items
                        </p>
                      </div>
                    </div>
                    <DailyMenuManager businessId={business.id} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Utensils size={64} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No businesses for menu management
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Add a business to start managing your daily menu
                </p>
                <button
                  onClick={handleAddBusiness}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                  <Plus size={16} />
                  Add Business
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showWebsiteGenerator && selectedBusiness && (
        <WebsiteGenerator
          business={selectedBusiness}
          onClose={() => {
            setShowWebsiteGenerator(false);
            setSelectedBusiness(null);
          }}
        />
      )}

      {showMenuManager && selectedBusiness && (
        <MenuOfferManager
          business={selectedBusiness}
          onSave={(data) => {
            const updatedBusiness = { ...selectedBusiness, ...data };
            dataStorage.updateBusiness(selectedBusiness.id, updatedBusiness);
            fetchBusinesses();
            setShowMenuManager(false);
            setSelectedBusiness(null);
          }}
          onClose={() => {
            setShowMenuManager(false);
            setSelectedBusiness(null);
          }}
        />
      )}
    </div>
  );
}
