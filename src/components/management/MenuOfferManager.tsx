"use client";
import { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Upload, Tag, DollarSign, Clock, ChefHat, Percent, Image as ImageIcon } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  is_available: boolean;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  discount_percent: number;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  valid_until: string;
  applicable_items?: string[];
  min_order_amount?: number;
  is_active: boolean;
}

interface MenuOfferManagerProps {
  business: any;
  onSave: (data: { menu?: MenuItem[], offers?: Offer[] }) => void;
  onClose: () => void;
}

export default function MenuOfferManager({ business, onSave, onClose }: MenuOfferManagerProps) {
  const [activeTab, setActiveTab] = useState<'menu' | 'offers'>('menu');
  const [menuItems, setMenuItems] = useState<MenuItem[]>(
    business.services?.map((service: any) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      category: service.category || 'General',
      image: service.image,
      is_available: service.is_available !== false
    })) || []
  );
  
  const [offers, setOffers] = useState<Offer[]>(
    business.offers?.map((offer: any) => ({
      id: offer.id,
      title: offer.title,
      description: offer.description,
      discount_percent: offer.discount_percent,
      discount_type: 'percentage',
      discount_value: offer.discount_percent,
      valid_until: offer.valid_until || '',
      applicable_items: [],
      min_order_amount: 0,
      is_active: true
    })) || []
  );

  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const menuCategories = ['Food', 'Beverages', 'Desserts', 'Services', 'Products', 'General'];

  const handleAddMenuItem = () => {
    setEditingMenuItem({
      id: Date.now().toString(),
      name: '',
      description: '',
      price: 0,
      category: 'General',
      is_available: true
    });
    setShowAddForm(true);
  };

  const handleAddOffer = () => {
    setEditingOffer({
      id: Date.now().toString(),
      title: '',
      description: '',
      discount_percent: 0,
      discount_type: 'percentage',
      discount_value: 0,
      valid_until: '',
      applicable_items: [],
      min_order_amount: 0,
      is_active: true
    });
    setShowAddForm(true);
  };

  const handleSaveMenuItem = (item: MenuItem) => {
    if (editingMenuItem) {
      setMenuItems(prev => {
        const existing = prev.find(i => i.id === item.id);
        if (existing) {
          return prev.map(i => i.id === item.id ? item : i);
        } else {
          return [...prev, item];
        }
      });
    }
    setEditingMenuItem(null);
    setShowAddForm(false);
  };

  const handleSaveOffer = (offer: Offer) => {
    if (editingOffer) {
      setOffers(prev => {
        const existing = prev.find(o => o.id === offer.id);
        if (existing) {
          return prev.map(o => o.id === offer.id ? offer : o);
        } else {
          return [...prev, offer];
        }
      });
    }
    setEditingOffer(null);
    setShowAddForm(false);
  };

  const handleDeleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  const handleDeleteOffer = (id: string) => {
    setOffers(prev => prev.filter(offer => offer.id !== id));
  };

  const handleSaveAll = () => {
    onSave({
      menu: menuItems,
      offers: offers
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Menu & Offers Management
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {business.name} - Manage your menu items and special offers
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'menu'
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <ChefHat size={16} className="inline mr-2" />
              Menu Items ({menuItems.length})
            </button>
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'offers'
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Percent size={16} className="inline mr-2" />
              Offers ({offers.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {activeTab === 'menu' ? (
            <MenuManagement
              items={menuItems}
              categories={menuCategories}
              onAdd={handleAddMenuItem}
              onEdit={setEditingMenuItem}
              onDelete={handleDeleteMenuItem}
            />
          ) : (
            <OfferManagement
              offers={offers}
              menuItems={menuItems}
              onAdd={handleAddOffer}
              onEdit={setEditingOffer}
              onDelete={handleDeleteOffer}
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              Save All Changes
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Forms */}
      {showAddForm && editingMenuItem && (
        <MenuItemForm
          item={editingMenuItem}
          categories={menuCategories}
          onSave={handleSaveMenuItem}
          onCancel={() => {
            setShowAddForm(false);
            setEditingMenuItem(null);
          }}
        />
      )}

      {showAddForm && editingOffer && (
        <OfferForm
          offer={editingOffer}
          menuItems={menuItems}
          onSave={handleSaveOffer}
          onCancel={() => {
            setShowAddForm(false);
            setEditingOffer(null);
          }}
        />
      )}
    </div>
  );
}

function MenuManagement({ items, categories, onAdd, onEdit, onDelete }: any) {
  return (
    <div className="space-y-6">
      {/* Add Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Menu Items</h3>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Menu Item
        </button>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item: MenuItem) => (
          <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">{item.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-lg font-bold text-violet-600">${item.price}</span>
                  <span className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-xs">
                    {item.category}
                  </span>
                  {item.is_available ? (
                    <span className="text-green-600 text-xs">✓ Available</span>
                  ) : (
                    <span className="text-red-600 text-xs">✗ Unavailable</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(item)}
                  className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-8">
          <ChefHat size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No menu items yet. Add your first item to get started.
          </p>
        </div>
      )}
    </div>
  );
}

function OfferManagement({ offers, menuItems, onAdd, onEdit, onDelete }: any) {
  return (
    <div className="space-y-6">
      {/* Add Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Special Offers</h3>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Offer
        </button>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {offers.map((offer: Offer) => (
          <div key={offer.id} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-red-800 dark:text-red-200">{offer.title}</h4>
                <p className="text-sm text-red-600 dark:text-red-400">{offer.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xl font-bold text-red-600">
                    {offer.discount_percent}% OFF
                  </span>
                  {offer.valid_until && (
                    <span className="text-xs text-red-600 dark:text-red-400">
                      Valid until {new Date(offer.valid_until).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(offer)}
                  className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => onDelete(offer.id)}
                  className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {offers.length === 0 && (
        <div className="text-center py-8">
          <Percent size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No offers yet. Create your first special offer to attract customers.
          </p>
        </div>
      )}
    </div>
  );
}

function MenuItemForm({ item, categories, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({ ...item });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {item.id ? 'Edit Menu Item' : 'Add Menu Item'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {categories.map((cat: string) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="available"
              checked={formData.is_available}
              onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="available" className="text-sm text-gray-700 dark:text-gray-300">
              Available for order
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OfferForm({ offer, menuItems, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({ ...offer });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {offer.id ? 'Edit Offer' : 'Add Offer'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Offer Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., Weekend Special"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
              placeholder="Describe your special offer..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Discount Percentage *
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.discount_percent}
              onChange={(e) => setFormData({ ...formData, discount_percent: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Valid Until
            </label>
            <input
              type="date"
              value={formData.valid_until}
              onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="active" className="text-sm text-gray-700 dark:text-gray-300">
              Active offer
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
