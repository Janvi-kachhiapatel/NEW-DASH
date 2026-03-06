"use client";
import { useState, useEffect } from 'react';
import { Store, Users, TrendingUp, Calendar, Settings, ExternalLink, BarChart3, Star, Phone, Mail, MapPin, Clock, Edit, Eye, Heart } from 'lucide-react';

// Mock business owner data
const mockBusinessOwnerData = {
  business: {
    id: '1',
    name: 'Neon Gaming Zone',
    slug: 'neon-gaming-zone',
    category: 'Entertainment',
    description: 'Premium gaming experience with latest consoles and VR headsets',
    logo_url: '/api/placeholder/200/200',
    cover_image_url: '/api/placeholder/400/200',
    rating: 4.8,
    review_count: 234,
    price_range: '$$',
    address: '123 Gaming Street, Ahmedabad, Gujarat 380001',
    phone: '+91 98765 43210',
    email: 'info@neongaming.example.com',
    website: 'https://neongaming.example.com',
    custom_website_url: 'https://neon-gaming.business.com',
    is_verified: true,
    is_featured: true,
    operating_hours: {
      monday: { open: '10:00', close: '22:00', is_open: true },
      tuesday: { open: '10:00', close: '22:00', is_open: true },
      wednesday: { open: '10:00', close: '22:00', is_open: true },
      thursday: { open: '10:00', close: '22:00', is_open: true },
      friday: { open: '10:00', close: '23:00', is_open: true },
      saturday: { open: '10:00', close: '23:00', is_open: true },
      sunday: { open: '10:00', close: '22:00', is_open: true }
    }
  },
  analytics: {
    total_views: 15420,
    total_bookings: 892,
    total_reviews: 234,
    average_rating: 4.8,
    monthly_revenue: 285000,
    growth_rate: 23.5,
    popular_services: [
      { name: 'VR Gaming', bookings: 342, revenue: 102300 },
      { name: 'Console Gaming', bookings: 289, revenue: 57511 },
      { name: 'Tournaments', bookings: 261, revenue: 25839 }
    ],
    recent_reviews: [
      {
        id: '1',
        user_name: 'Rahul Sharma',
        rating: 5,
        comment: 'Amazing gaming experience! The VR setup is top-notch.',
        created_at: '2024-01-15T10:30:00Z',
        helpful_count: 12
      },
      {
        id: '2',
        user_name: 'Priya Patel',
        rating: 4,
        comment: 'Great place for gaming with friends.',
        created_at: '2024-01-10T15:45:00Z',
        helpful_count: 8
      }
    ]
  }
};

export default function BusinessOwnerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [businessData, setBusinessData] = useState(mockBusinessOwnerData);

  const handleEditBusiness = () => {
    // Navigate to edit business page
    window.location.href = '/dashboard/business/edit';
  };

  const handleViewWebsite = () => {
    window.open(businessData.business.custom_website_url, '_blank');
  };

  const handleViewPublicProfile = () => {
    window.location.href = `/business/${businessData.business.slug}`;
  };

  const StatCard = ({ icon: Icon, title, value, change, color = 'violet' }: any) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg flex items-center justify-center`}>
          <Icon size={20} className={`text-${color}-600 dark:text-${color}-400`} />
        </div>
        {change && (
          <span className={`text-sm font-medium ${
            change > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{title}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-violet-600 rounded-lg flex items-center justify-center">
                <Store size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {businessData.business.name}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Business Owner Dashboard
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleViewPublicProfile}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <Eye size={16} />
                View Profile
              </button>
              <button
                onClick={handleViewWebsite}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-2"
              >
                <ExternalLink size={16} />
                My Website
              </button>
              <button
                onClick={handleEditBusiness}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Edit size={16} />
                Edit Business
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
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'bookings', label: 'Bookings', icon: Calendar },
              { id: 'reviews', label: 'Reviews', icon: Star },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Eye}
                title="Total Views"
                value={businessData.analytics.total_views.toLocaleString()}
                change={23.5}
                color="blue"
              />
              <StatCard
                icon={Calendar}
                title="Total Bookings"
                value={businessData.analytics.total_bookings}
                change={18.2}
                color="green"
              />
              <StatCard
                icon={Star}
                title="Average Rating"
                value={businessData.analytics.average_rating}
                change={2.1}
                color="yellow"
              />
              <StatCard
                icon={TrendingUp}
                title="Monthly Revenue"
                value={`₹${(businessData.analytics.monthly_revenue / 1000).toFixed(0)}K`}
                change={15.8}
                color="purple"
              />
            </div>

            {/* Business Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Business Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{businessData.business.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{businessData.business.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{businessData.business.address}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <ExternalLink size={18} className="text-gray-400" />
                    <a href={businessData.business.custom_website_url} 
                       target="_blank" 
                       className="text-violet-600 dark:text-violet-400 hover:underline">
                      {businessData.business.custom_website_url}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star size={18} className="text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {businessData.business.rating} ({businessData.business.review_count} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Open Today: 10:00 - 22:00
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Services */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Popular Services</h2>
              <div className="space-y-3">
                {businessData.analytics.popular_services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{service.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {service.bookings} bookings
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-white">
                        ₹{service.revenue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Reviews</h2>
            <div className="space-y-4">
              {businessData.analytics.recent_reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{review.user_name}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">{review.comment}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>👍 {review.helpful_count} helpful</span>
                    <button className="text-violet-600 dark:text-violet-400 hover:underline">Reply</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Performance Metrics</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Growth Rate</span>
                  <span className="font-medium text-green-600">+{businessData.analytics.growth_rate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Conversion Rate</span>
                  <span className="font-medium">12.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Avg. Booking Value</span>
                  <span className="font-medium">₹319</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Customer Insights</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Peak Hours</span>
                  <span className="font-medium">6PM - 9PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Best Day</span>
                  <span className="font-medium">Saturday</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Repeat Customers</span>
                  <span className="font-medium">34%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
