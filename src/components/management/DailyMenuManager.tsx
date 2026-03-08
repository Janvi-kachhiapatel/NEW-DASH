"use client";
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Clock, Calendar, DollarSign, Tag, TrendingUp, Package, Coffee, Pizza, Salad, Cake } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  isSpecial: boolean;
  preparationTime: string;
  ingredients?: string[];
  dailySpecial?: boolean;
  createdAt: string;
}

interface DailyMenuManagerProps {
  businessId: string;
}

export default function DailyMenuManager({ businessId }: DailyMenuManagerProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'main',
    available: true,
    isSpecial: false,
    dailySpecial: false,
    preparationTime: '',
    ingredients: ''
  });

  const categories = [
    { id: 'all', name: 'All Items', icon: Package },
    { id: 'appetizer', name: 'Appetizers', icon: Coffee },
    { id: 'main', name: 'Main Course', icon: Pizza },
    { id: 'dessert', name: 'Desserts', icon: Cake },
    { id: 'salad', name: 'Salads', icon: Salad },
    { id: 'beverage', name: 'Beverages', icon: Coffee }
  ];

  useEffect(() => {
    loadMenuItems();
  }, [businessId]);

  const loadMenuItems = () => {
    const stored = localStorage.getItem(`menu_${businessId}`);
    if (stored) {
      setMenuItems(JSON.parse(stored));
    } else {
      // Load default menu items
      const defaultItems: MenuItem[] = [
        {
          id: '1',
          name: 'Special Coffee',
          description: 'Premium arabica coffee with special blend',
          price: 150,
          category: 'beverage',
          available: true,
          isSpecial: true,
          dailySpecial: true,
          preparationTime: '5 mins',
          ingredients: ['Coffee', 'Milk', 'Sugar'],
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Grilled Sandwich',
          description: 'Fresh vegetables with cheese on multigrain bread',
          price: 200,
          category: 'main',
          available: true,
          isSpecial: false,
          dailySpecial: false,
          preparationTime: '10 mins',
          ingredients: ['Bread', 'Vegetables', 'Cheese'],
          createdAt: new Date().toISOString()
        }
      ];
      setMenuItems(defaultItems);
      localStorage.setItem(`menu_${businessId}`, JSON.stringify(defaultItems));
    }
  };

  const saveMenuItem = () => {
    const newItem: MenuItem = {
      id: editingItem?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      available: formData.available,
      isSpecial: formData.isSpecial,
      dailySpecial: formData.dailySpecial,
      preparationTime: formData.preparationTime,
      ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i),
      createdAt: editingItem?.createdAt || new Date().toISOString()
    };

    let updatedItems;
    if (editingItem) {
      updatedItems = menuItems.map(item => item.id === editingItem.id ? newItem : item);
    } else {
      updatedItems = [...menuItems, newItem];
    }

    setMenuItems(updatedItems);
    localStorage.setItem(`menu_${businessId}`, JSON.stringify(updatedItems));
    resetForm();
  };

  const deleteMenuItem = (id: string) => {
    const updatedItems = menuItems.filter(item => item.id !== id);
    setMenuItems(updatedItems);
    localStorage.setItem(`menu_${businessId}`, JSON.stringify(updatedItems));
  };

  const toggleAvailability = (id: string) => {
    const updatedItems = menuItems.map(item =>
      item.id === id ? { ...item, available: !item.available } : item
    );
    setMenuItems(updatedItems);
    localStorage.setItem(`menu_${businessId}`, JSON.stringify(updatedItems));
  };

  const toggleDailySpecial = (id: string) => {
    const updatedItems = menuItems.map(item =>
      item.id === id ? { ...item, dailySpecial: !item.dailySpecial } : item
    );
    setMenuItems(updatedItems);
    localStorage.setItem(`menu_${businessId}`, JSON.stringify(updatedItems));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'main',
      available: true,
      isSpecial: false,
      dailySpecial: false,
      preparationTime: '',
      ingredients: ''
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  const startEdit = (item: MenuItem) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      available: item.available,
      isSpecial: item.isSpecial,
      dailySpecial: item.dailySpecial,
      preparationTime: item.preparationTime,
      ingredients: item.ingredients?.join(', ') || ''
    });
    setEditingItem(item);
    setShowAddForm(true);
  };

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const dailySpecials = menuItems.filter(item => item.dailySpecial);
  const availableItems = menuItems.filter(item => item.available);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Package size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Items</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{menuItems.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Tag size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{availableItems.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Daily Specials</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{dailySpecials.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Price</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ${menuItems.length > 0 ? Math.round(menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Specials Section */}
      {dailySpecials.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Today's Specials
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dailySpecials.map(item => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-2 py-1 rounded text-xs font-medium">
                        SPECIAL
                      </span>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{item.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-lg font-bold text-orange-600">₹{item.price}</span>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock size={14} />
                        <span>{item.preparationTime}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleDailySpecial(item.id)}
                    className="p-2 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                  >
                    <Tag size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? 'bg-violet-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon size={16} />
              <span>{category.name}</span>
              {category.id === 'all' && <span className="bg-violet-500 text-white px-2 py-0.5 rounded-full text-xs">{menuItems.length}</span>}
            </button>
          );
        })}
      </div>

      {/* Add Item Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Menu Items ({filteredItems.length})
        </h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          <Plus size={16} />
          Add Item
        </button>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div key={item.id} className={`bg-white dark:bg-gray-800 rounded-lg shadow ${!item.available ? 'opacity-60' : ''}`}>
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{item.name}</h4>
                    {item.isSpecial && (
                      <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded text-xs">
                        SPECIAL
                      </span>
                    )}
                    {item.dailySpecial && (
                      <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-2 py-0.5 rounded text-xs">
                        DAILY
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.description}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-bold text-violet-600">₹{item.price}</span>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock size={14} />
                      <span>{item.preparationTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              {item.ingredients && item.ingredients.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ingredients:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.ingredients.slice(0, 3).map((ingredient, index) => (
                      <span key={index} className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
                        {ingredient}
                      </span>
                    ))}
                    {item.ingredients.length > 3 && (
                      <span className="text-xs text-gray-500">+{item.ingredients.length - 3} more</span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAvailability(item.id)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      item.available
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {item.available ? 'Available' : 'Unavailable'}
                  </button>
                  {!item.dailySpecial && (
                    <button
                      onClick={() => toggleDailySpecial(item.id)}
                      className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 rounded text-xs font-medium hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                    >
                      Make Special
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(item)}
                    className="p-2 text-gray-600 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => deleteMenuItem(item.id)}
                    className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter item name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
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
                  placeholder="Describe the item"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="appetizer">Appetizer</option>
                    <option value="main">Main Course</option>
                    <option value="dessert">Dessert</option>
                    <option value="salad">Salad</option>
                    <option value="beverage">Beverage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Preparation Time
                  </label>
                  <input
                    type="text"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., 15 mins"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ingredients (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Tomato, Cheese, Basil"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Available</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isSpecial}
                    onChange={(e) => setFormData({ ...formData, isSpecial: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Special Item</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.dailySpecial}
                    onChange={(e) => setFormData({ ...formData, dailySpecial: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Daily Special</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveMenuItem}
                disabled={!formData.name || !formData.price}
                className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
              >
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
