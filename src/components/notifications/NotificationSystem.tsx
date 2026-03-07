"use client";
import { useState, useEffect } from 'react';
import { Bell, Clock, Calendar, Tag, ChefHat, Check, X, Settings } from 'lucide-react';

interface Notification {
  id: string;
  type: 'offer_expiry' | 'menu_reminder' | 'verification_due' | 'booking_reminder';
  title: string;
  message: string;
  time: string;
  action_required: boolean;
  actions?: Array<{
    label: string;
    action: string;
    style: 'primary' | 'secondary' | 'danger';
  }>;
}

interface NotificationSystemProps {
  businessId?: string;
  businessName?: string;
  onNotificationAction?: (notificationId: string, action: string) => void;
}

export default function NotificationSystem({ businessId, businessName, onNotificationAction }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    offerReminders: true,
    menuReminders: true,
    verificationReminders: true,
    bookingReminders: true,
    offerReminderTime: 24, // hours before expiry
    menuReminderTime: '09:00', // daily at 9 AM
    verificationReminderDay: 1 // day of month
  });

  useEffect(() => {
    generateMockNotifications();
    setupNotificationSchedule();
  }, []);

  const generateMockNotifications = () => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'offer_expiry',
        title: 'Offer Expiring Soon',
        message: `Your "Weekend Special" offer for ${businessName || 'your shop'} expires in 24 hours. Would you like to continue it or delete it?`,
        time: '2 hours ago',
        action_required: true,
        actions: [
          { label: 'Continue', action: 'continue', style: 'primary' },
          { label: 'Delete', action: 'delete', style: 'danger' }
        ]
      },
      {
        id: '2',
        type: 'menu_reminder',
        title: 'Daily Menu Update',
        message: `Good morning! Don't forget to update your menu for ${businessName || 'your shop'}. Fresh menu items attract more customers!`,
        time: '8 hours ago',
        action_required: false,
        actions: [
          { label: 'Update Menu', action: 'update_menu', style: 'primary' }
        ]
      },
      {
        id: '3',
        type: 'verification_due',
        title: 'Monthly Verification Due',
        message: `It's time to submit new photos for monthly verification of ${businessName || 'your shop'}. This ensures customer trust and better visibility.`,
        time: '1 day ago',
        action_required: true,
        actions: [
          { label: 'Upload Photos', action: 'upload_photos', style: 'primary' }
        ]
      },
      {
        id: '4',
        type: 'booking_reminder',
        title: 'New Booking Alert',
        message: `You have 3 new bookings for ${businessName || 'your shop'} today. Remember to prepare for customer visits.`,
        time: '3 hours ago',
        action_required: false,
        actions: [
          { label: 'View Bookings', action: 'view_bookings', style: 'primary' }
        ]
      }
    ];
    setNotifications(mockNotifications);
  };

  const setupNotificationSchedule = () => {
    // Schedule daily menu reminder at 9 AM
    if (notificationSettings.menuReminders) {
      const scheduleDailyReminder = () => {
        const now = new Date();
        const reminderTime = notificationSettings.menuReminderTime.split(':');
        const reminderDate = new Date();
        reminderDate.setHours(parseInt(reminderTime[0]));
        reminderDate.setMinutes(parseInt(reminderTime[1]));
        reminderDate.setSeconds(0);
        
        if (now >= reminderDate) {
          // Schedule for next day
          reminderDate.setDate(reminderDate.getDate() + 1);
        }
        
        const timeUntilReminder = reminderDate.getTime() - now.getTime();
        
        setTimeout(() => {
          addNotification({
            id: Date.now().toString(),
            type: 'menu_reminder',
            title: 'Daily Menu Update',
            message: `Good morning! Time to update your menu for ${businessName || 'your shop'}. Fresh menu items attract more customers!`,
            time: 'Just now',
            action_required: false,
            actions: [
              { label: 'Update Menu', action: 'update_menu', style: 'primary' }
            ]
          });
          
          // Schedule next day's reminder
          scheduleDailyReminder();
        }, timeUntilReminder);
      };
      
      scheduleDailyReminder();
    }
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const handleNotificationAction = (notificationId: string, action: string) => {
    console.log('Notification action:', notificationId, action);
    
    // Remove notification after action
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    // Call parent handler
    onNotificationAction?.(notificationId, action);
    
    // Handle specific actions
    switch (action) {
      case 'continue':
        // Continue offer logic
        window.location.href = '/dashboard/offers';
        break;
      case 'delete':
        // Delete offer logic
        window.location.href = '/dashboard/offers';
        break;
      case 'update_menu':
        // Update menu logic
        window.location.href = '/dashboard/menu';
        break;
      case 'upload_photos':
        // Upload verification photos
        window.location.href = '/dashboard/verification';
        break;
      case 'view_bookings':
        // View bookings
        window.location.href = '/dashboard/bookings';
        break;
    }
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const updateNotificationSetting = (setting: string, value: any) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    
    // Save to localStorage
    localStorage.setItem('notificationSettings', JSON.stringify({
      ...notificationSettings,
      [setting]: value
    }));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'offer_expiry': return <Tag size={16} />;
      case 'menu_reminder': return <ChefHat size={16} />;
      case 'verification_due': return <Calendar size={16} />;
      case 'booking_reminder': return <Clock size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const getActionButtonClass = (style: string) => {
    switch (style) {
      case 'primary': return 'px-3 py-1 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm';
      case 'secondary': return 'px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm';
      case 'danger': return 'px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm';
      default: return 'px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm';
    }
  };

  return (
    <div className="space-y-4">
      {/* Notification Bell Icon */}
      <div className="relative">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Bell size={20} className="text-gray-600 dark:text-gray-400" />
          {notifications.filter(n => n.action_required).length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          )}
        </button>
      </div>

      {/* Notifications Panel */}
      {showSettings && (
        <div className="fixed top-16 right-4 w-96 max-h-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {notifications.filter(n => n.action_required).length} pending
                </span>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X size={16} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 dark:text-gray-400">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        notification.action_required 
                          ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            {notification.action_required && (
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                            <button
                              onClick={() => dismissNotification(notification.id)}
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              <X size={12} className="text-gray-400" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{notification.time}</span>
                          {notification.actions && (
                            <div className="flex items-center gap-2">
                              {notification.actions.map((action, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleNotificationAction(notification.id, action.action)}
                                  className={getActionButtonClass(action.style)}
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notification Settings */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Settings size={16} />
                Notification Settings
              </h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Offer Reminders
                  </label>
                  <p className="text-xs text-gray-500">
                    Notify {notificationSettings.offerReminderTime}h before offers expire
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.offerReminders}
                  onChange={(e) => updateNotificationSetting('offerReminders', e.target.checked)}
                  className="w-4 h-4 text-violet-600"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Menu Updates
                  </label>
                  <p className="text-xs text-gray-500">
                    Daily reminder at {notificationSettings.menuReminderTime}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.menuReminders}
                  onChange={(e) => updateNotificationSetting('menuReminders', e.target.checked)}
                  className="w-4 h-4 text-violet-600"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Verification Reminders
                  </label>
                  <p className="text-xs text-gray-500">
                    Monthly verification due date
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.verificationReminders}
                  onChange={(e) => updateNotificationSetting('verificationReminders', e.target.checked)}
                  className="w-4 h-4 text-violet-600"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
