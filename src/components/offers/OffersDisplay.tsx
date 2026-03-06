"use client";
import { useState, useEffect } from 'react';
import { Tag, Clock, Percent, Calendar, X, Plus, Edit, Trash2 } from 'lucide-react';

interface Offer {
  id: string;
  business_id: string;
  title: string;
  description: string;
  discount_percent: number;
  valid_until: string;
  terms?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface OffersDisplayProps {
  businessId?: string;
  businessOwnerId?: string;
  isOwner?: boolean;
  onOfferCreated?: (offer: Offer) => void;
}

export default function OffersDisplay({ 
  businessId, 
  businessOwnerId, 
  isOwner = false,
  onOfferCreated 
}: OffersDisplayProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_percent: 10,
    valid_until: '',
    terms: '',
    is_active: true
  });

  useEffect(() => {
    fetchOffers();
  }, [businessId, businessOwnerId]);

  const fetchOffers = async () => {
    try {
      setIsLoading(true);
      // In a real app, fetch from API
      // For now, use mock data
      const mockOffers: Offer[] = [
        {
          id: '1',
          business_id: businessId || '1',
          title: 'Weekend Special',
          description: 'Get 25% off on all gaming sessions during weekends',
          discount_percent: 25,
          valid_until: '2024-12-31',
          terms: 'Valid on weekends only. Cannot be combined with other offers.',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          business_id: businessId || '1',
          title: 'First Timer Discount',
          description: 'Special discount for new customers',
          discount_percent: 20,
          valid_until: '2024-11-30',
          terms: 'Valid for first-time customers only.',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setOffers(mockOffers);
    } catch (error) {
      console.error('Failed to fetch offers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.valid_until) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const newOffer: Offer = {
        id: editingOffer ? editingOffer.id : Date.now().toString(),
        business_id: businessId || '1',
        title: formData.title,
        description: formData.description,
        discount_percent: formData.discount_percent,
        valid_until: formData.valid_until,
        terms: formData.terms,
        is_active: formData.is_active,
        created_at: editingOffer ? editingOffer.created_at : new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (editingOffer) {
        setOffers(offers.map(o => o.id === editingOffer.id ? newOffer : o));
      } else {
        setOffers([...offers, newOffer]);
        onOfferCreated?.(newOffer);
      }

      setShowCreateForm(false);
      setEditingOffer(null);
      resetForm();
      
    } catch (error) {
      console.error('Failed to save offer:', error);
      alert('Failed to save offer. Please try again.');
    }
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      discount_percent: offer.discount_percent,
      valid_until: offer.valid_until,
      terms: offer.terms || '',
      is_active: offer.is_active
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (offerId: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    
    try {
      setOffers(offers.filter(o => o.id !== offerId));
    } catch (error) {
      console.error('Failed to delete offer:', error);
      alert('Failed to delete offer. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discount_percent: 10,
      valid_until: '',
      terms: '',
      is_active: true
    });
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const getDaysLeft = (validUntil: string) => {
    const today = new Date();
    const expiry = new Date(validUntil);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Owner Actions */}
      {isOwner && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Offers & Deals</h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add Offer
          </button>
        </div>
      )}

      {/* Offers List */}
      <div className="space-y-3">
        {offers.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Tag size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 dark:text-gray-400">
              {isOwner ? 'No offers yet. Create your first offer!' : 'No offers available at the moment.'}
            </p>
          </div>
        ) : (
          offers.map((offer) => {
            const expired = isExpired(offer.valid_until);
            const daysLeft = getDaysLeft(offer.valid_until);
            
            return (
              <div
                key={offer.id}
                className={`border rounded-lg p-4 ${
                  expired 
                    ? 'border-gray-200 dark:border-gray-700 opacity-60' 
                    : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{offer.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        expired 
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      }`}>
                        {expired ? 'Expired' : `${offer.discount_percent}% OFF`}
                      </span>
                      {offer.is_active && !expired && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                          Active
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-2">{offer.description}</p>
                    
                    {offer.terms && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <strong>Terms:</strong> {offer.terms}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>Valid until {new Date(offer.valid_until).toLocaleDateString()}</span>
                      </div>
                      {!expired && (
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Expires today'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Owner Actions */}
                  {isOwner && (
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(offer)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Edit size={16} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(offer.id)}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create/Edit Offer Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingOffer ? 'Edit Offer' : 'Create New Offer'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingOffer(null);
                  resetForm();
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Offer Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="e.g., Weekend Special"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe your offer..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Discount %
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valid Until *
                  </label>
                  <input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Terms & Conditions
                </label>
                <textarea
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  rows={2}
                  placeholder="Any terms and conditions..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Make this offer active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingOffer(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                  {editingOffer ? 'Update' : 'Create'} Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
