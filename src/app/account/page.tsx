"use client";
import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Phone, Mail, Download, FileText, Check, X, Star, DollarSign, User } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth';

interface Booking {
  id: string;
  businessId: string;
  businessName: string;
  businessEmail: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  service: string;
  notes: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  approvedAt?: string;
  receiptGenerated: boolean;
}

export default function AccountPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <AccountPageContent />
    </ProtectedRoute>
  );
}

function AccountPageContent() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = () => {
    if (!user) return;
    
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const userBookings = allBookings.filter((booking: Booking) => booking.email === user.email);
    setBookings(userBookings.sort((a: Booking, b: Booking) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
  };

  const downloadReceipt = (booking: Booking) => {
    const receiptContent = `
BOOKING RECEIPT - ${booking.businessName}

========================================
Booking ID: ${booking.id}
Customer: ${booking.name}
Email: ${booking.email}
Phone: ${booking.phone}

BOOKING DETAILS:
Service: ${booking.service}
Date: ${booking.date}
Time: ${booking.time}
Duration: 1 hour
Status: ${booking.status.toUpperCase()}

BUSINESS INFORMATION:
${booking.businessName}
${booking.businessEmail}

PAYMENT INFORMATION:
Service Price: $${getServicePrice(booking.service)}
Payment Method: Pay on arrival

========================================
Thank you for choosing ${booking.businessName}!
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${booking.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Mark receipt as generated
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const updatedBookings = allBookings.map((b: Booking) => {
      if (b.id === booking.id) {
        return { ...b, receiptGenerated: true };
      }
      return b;
    });
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    fetchBookings();
  };

  const getServicePrice = (serviceName: string): number => {
    const prices: Record<string, number> = {
      'VR Gaming Session': 299,
      'Coffee Tasting': 150,
      'Spa Treatment': 500,
      'Personal Training': 400,
      'Consultation': 200
    };
    return prices[serviceName] || 250;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} className="text-yellow-600" />;
      case 'approved': return <Check size={16} className="text-green-600" />;
      case 'completed': return <Star size={16} className="text-blue-600" />;
      case 'cancelled': return <X size={16} className="text-red-600" />;
      default: return null;
    }
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const approvedBookings = bookings.filter(b => b.status === 'approved');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center">
              <User size={32} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                My Account
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {user?.name} • {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Clock size={24} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingBookings.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Check size={24} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{approvedBookings.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Star size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedBookings.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <X size={24} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{cancelledBookings.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings */}
        <div className="space-y-6">
          {/* Pending Bookings */}
          {pendingBookings.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Pending Bookings ({pendingBookings.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingBookings.map(booking => (
                  <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {booking.businessName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Booked on {new Date(booking.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Calendar size={16} className="text-gray-400" />
                        <span>{booking.date} at {booking.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <DollarSign size={16} className="text-gray-400" />
                        <span>{booking.service}</span>
                      </div>
                      {booking.notes && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Notes:</strong> {booking.notes}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Waiting for business owner approval...
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approved Bookings */}
          {approvedBookings.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Approved Bookings ({approvedBookings.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {approvedBookings.map(booking => (
                  <div key={booking.id} className="bg-green-50 dark:bg-green-900/20 rounded-xl shadow-lg p-6 border border-green-200 dark:border-green-800">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {booking.businessName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Approved on {new Date(booking.approvedAt!).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-600" />
                        <span className="text-sm font-medium text-green-600">Approved</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Calendar size={16} className="text-gray-400" />
                        <span>{booking.date} at {booking.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <DollarSign size={16} className="text-gray-400" />
                        <span>{booking.service}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <DollarSign size={16} className="text-gray-400" />
                        <span>Price: ${getServicePrice(booking.service)}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => downloadReceipt(booking)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Download size={16} />
                        Download Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Bookings */}
          {completedBookings.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Completed Bookings ({completedBookings.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedBookings.map(booking => (
                  <div key={booking.id} className="bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {booking.businessName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Completed on {booking.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star size={16} className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">Completed</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Calendar size={16} className="text-gray-400" />
                        <span>{booking.date} at {booking.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <DollarSign size={16} className="text-gray-400" />
                        <span>{booking.service}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => downloadReceipt(booking)}
                        className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Download size={16} />
                        Download Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Bookings */}
          {bookings.length === 0 && (
            <div className="text-center py-12">
              <Calendar size={64} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No bookings yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Book your first service to get started
              </p>
              <button
                onClick={() => window.location.href = '/bookings'}
                className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                Browse Services
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Booking Receipt</h3>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-sm">
              <div className="space-y-2">
                <div><strong>Booking ID:</strong> {selectedBooking.id}</div>
                <div><strong>Business:</strong> {selectedBooking.businessName}</div>
                <div><strong>Service:</strong> {selectedBooking.service}</div>
                <div><strong>Date:</strong> {selectedBooking.date}</div>
                <div><strong>Time:</strong> {selectedBooking.time}</div>
                <div><strong>Price:</strong> ${getServicePrice(selectedBooking.service)}</div>
                <div><strong>Status:</strong> {selectedBooking.status}</div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => downloadReceipt(selectedBooking)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download size={16} className="inline mr-2" />
                Download
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
