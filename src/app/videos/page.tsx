"use client";
import { useState, useEffect } from 'react';
import { Search, Filter, Play, Eye, Heart, MessageCircle, Share2, TrendingUp, Clock, User, ChevronRight } from 'lucide-react';
import { dataStorage, Business } from '@/lib/dataStorage';

export default function VideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('trending');

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [videos, searchQuery, selectedCategory, sortBy]);

  const fetchVideos = () => {
    // Mock viral videos data
    const mockVideos = [
      {
        id: '1',
        title: 'Amazing Restaurant Tour - Hidden Gem!',
        description: 'Check out this incredible restaurant with amazing food and atmosphere',
        thumbnail: '/api/placeholder/400/225',
        videoUrl: 'https://example.com/video1',
        views: 125000,
        likes: 8500,
        comments: 342,
        duration: '3:45',
        uploadedAt: '2 days ago',
        businessId: '1',
        businessName: 'The Hidden Kitchen',
        category: 'Food',
        isTrending: true
      },
      {
        id: '2',
        title: 'Spa Day Experience - Ultimate Relaxation',
        description: 'Experience the most relaxing spa treatment in the city',
        thumbnail: '/api/placeholder/400/225',
        videoUrl: 'https://example.com/video2',
        views: 89000,
        likes: 6200,
        comments: 289,
        duration: '5:12',
        uploadedAt: '1 week ago',
        businessId: '2',
        businessName: 'Serenity Spa',
        category: 'Beauty',
        isTrending: true
      },
      {
        id: '3',
        title: 'Fitness Transformation - 30 Day Challenge',
        description: 'Watch this incredible fitness transformation journey',
        thumbnail: '/api/placeholder/400/225',
        videoUrl: 'https://example.com/video3',
        views: 156000,
        likes: 12000,
        comments: 567,
        duration: '8:30',
        uploadedAt: '3 days ago',
        businessId: '3',
        businessName: 'Power Gym',
        category: 'Fitness',
        isTrending: true
      },
      {
        id: '4',
        title: 'Shopping Haul - Best Local Finds',
        description: 'Discover amazing products from local businesses',
        thumbnail: '/api/placeholder/400/225',
        videoUrl: 'https://example.com/video4',
        views: 67000,
        likes: 4500,
        comments: 234,
        duration: '6:15',
        uploadedAt: '5 days ago',
        businessId: '4',
        businessName: 'Local Boutique',
        category: 'Shopping',
        isTrending: false
      },
      {
        id: '5',
        title: 'Medical Checkup - Modern Healthcare',
        description: 'See how modern healthcare facilities are helping patients',
        thumbnail: '/api/placeholder/400/225',
        videoUrl: 'https://example.com/video5',
        views: 45000,
        likes: 3200,
        comments: 156,
        duration: '4:20',
        uploadedAt: '1 week ago',
        businessId: '5',
        businessName: 'City Medical Center',
        category: 'Healthcare',
        isTrending: false
      },
      {
        id: '6',
        title: 'Entertainment Zone - Family Fun',
        description: 'Great entertainment options for the whole family',
        thumbnail: '/api/placeholder/400/225',
        videoUrl: 'https://example.com/video6',
        views: 98000,
        likes: 7800,
        comments: 412,
        duration: '7:45',
        uploadedAt: '4 days ago',
        businessId: '6',
        businessName: 'Fun Zone',
        category: 'Entertainment',
        isTrending: true
      }
    ];

    setVideos(mockVideos);
  };

  const filterVideos = () => {
    let filtered = videos;

    if (searchQuery) {
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.businessName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(video => video.category === selectedCategory);
    }

    // Sort videos
    switch (sortBy) {
      case 'trending':
        filtered = filtered.filter(video => video.isTrending);
        break;
      case 'views':
        filtered = filtered.sort((a, b) => b.views - a.views);
        break;
      case 'likes':
        filtered = filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'recent':
        filtered = filtered.sort((a, b) => {
          const daysA = parseInt(a.uploadedAt);
          const daysB = parseInt(b.uploadedAt);
          return daysA - daysB;
        });
        break;
    }

    setFilteredVideos(filtered);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const categories = ['all', 'Food', 'Beauty', 'Fitness', 'Shopping', 'Healthcare', 'Entertainment'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Play size={32} className="text-yellow-300" />
            <h1 className="text-3xl font-bold">Viral Videos</h1>
          </div>
          <p className="text-purple-100 text-lg">
            Discover trending videos from local businesses
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="trending">Trending</option>
              <option value="views">Most Views</option>
              <option value="likes">Most Likes</option>
              <option value="recent">Recent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {filteredVideos.length} Videos
          </h2>
          {sortBy === 'trending' && (
            <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
              <TrendingUp size={16} />
              <span>Trending Now</span>
            </div>
          )}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map(video => (
            <div key={video.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Video Thumbnail */}
              <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <button className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                    <Play size={24} className="text-purple-600 ml-1" />
                  </button>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
                  {video.duration}
                </div>
                {video.isTrending && (
                  <div className="absolute top-2 left-2 bg-red-600 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                    <TrendingUp size={12} />
                    Trending
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {video.description}
                </p>

                {/* Business Info */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                      {video.businessName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {video.businessName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {video.category} • {video.uploadedAt}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Eye size={14} />
                      <span>{formatNumber(video.views)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart size={14} />
                      <span>{formatNumber(video.likes)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle size={14} />
                      <span>{video.comments}</span>
                    </div>
                  </div>
                  <button className="text-purple-600 hover:text-purple-700 transition-colors">
                    <Share2 size={14} />
                  </button>
                </div>

                {/* Actions */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => window.location.href = `/business/${video.businessId}`}
                    className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    Visit Business
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <Play size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No videos found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
