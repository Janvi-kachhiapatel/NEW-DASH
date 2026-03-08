"use client";
import { useState, useEffect } from 'react';
import { Store, Plus, Edit, Trash2, Star, Users, TrendingUp, Calendar, Settings, Globe, Eye, Heart, MessageSquare, BarChart3, Camera, Award } from 'lucide-react';
import { dataStorage, Business } from '@/lib/dataStorage';
import BusinessCreationForm from '@/components/forms/BusinessCreationForm';
import WebsiteGenerator from '@/components/website/WebsiteGenerator';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth';

export default function BusinessCreationDashboard() {
  return (
    <ProtectedRoute>
      <BusinessCreationContent />
    </ProtectedRoute>
  );
}

function BusinessCreationContent() {
  const [showAddBusiness, setShowAddBusiness] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const allBusinesses = dataStorage.getBusinesses();
    const userBusinesses = allBusinesses.filter(business => {
      // In a real app, this would check against the current user's ID
      return business; // For demo, show all businesses
    });
    setBusinesses(userBusinesses);
  }, []);

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
      console.error('Error saving business:', error);
    }
  };

  const handleAddBusiness = () => {
    setEditingBusiness(null);
    setShowAddBusiness(true);
  };

  const handleEditBusiness = (business: Business) => {
    setEditingBusiness(business);
    setShowAddBusiness(true);
  };

  const handleDeleteBusiness = (businessId: string) => {
    if (confirm('Are you sure you want to delete this business?')) {
      dataStorage.deleteBusiness(businessId);
      setBusinesses(prev => prev.filter(b => b.id !== businessId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Store className="text-violet-600" size={32} />
                Business Creation Center
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Create and manage your business listings on BizGallery
              </p>
            </div>
            <button
              onClick={handleAddBusiness}
              className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium"
            >
              <Plus size={20} />
              Create New Business
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Star size={24} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Verified</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {businesses.filter(b => b.is_verified).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} className="text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Featured</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {businesses.filter(b => b.is_featured).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {businesses.reduce((sum, b) => sum + (b.review_count || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Business List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Businesses</h2>
          </div>

          {businesses.length === 0 ? (
            <div className="p-12 text-center">
              <Store size={64} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Businesses Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first business to get started
              </p>
              <button
                onClick={handleAddBusiness}
                className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium"
              >
                <Plus size={20} />
                Create Your First Business
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {businesses.map((business) => (
                <div key={business.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {business.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          {business.is_verified && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium rounded-full">
                              Verified
                            </span>
                          )}
                          {business.is_featured && (
                            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 text-xs font-medium rounded-full">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {business.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-500 fill-current" />
                          <span>{business.rating}</span>
                          <span>({business.review_count || 0})</span>
                        </div>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                          {business.category}
                        </span>
                        <span>{business.price_range}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => window.location.href = `/business/${business.slug}`}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                        title="View Business"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEditBusiness(business)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                        title="Edit Business"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteBusiness(business.id)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete Business"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Business Creation Form Modal */}
      {showAddBusiness && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <BusinessCreationForm
              business={editingBusiness}
              onSave={handleSaveBusiness}
              onClose={() => {
                setShowAddBusiness(false);
                setEditingBusiness(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
