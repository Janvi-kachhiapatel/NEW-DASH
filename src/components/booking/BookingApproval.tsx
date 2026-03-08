"use client";
import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, Check, X, Download, Send, FileText, DollarSign, Star } from 'lucide-react';

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

interface BookingApprovalProps {
  businessId: string;
  onBookingUpdate?: () => void;
}

export default function BookingApproval({ businessId, onBookingUpdate }: BookingApprovalProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [businessId]);

  const fetchBookings = () => {
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const businessBookings = allBookings.filter((booking: Booking) => booking.businessId === businessId);
    setBookings(businessBookings.sort((a: Booking, b: Booking) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
  };

  const handleApproveBooking = async (bookingId: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const updatedBookings = allBookings.map((booking: Booking) => {
      if (booking.id === bookingId) {
        return {
          ...booking,
          status: 'approved' as const,
          approvedAt: new Date().toISOString()
        };
      }
      return booking;
    });
    
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    
    // Send email notification (simulation)
    const booking = updatedBookings.find((b: Booking) => b.id === bookingId);
    if (booking) {
      sendApprovalEmail(booking);
    }
    
    fetchBookings();
    setIsLoading(false);
    onBookingUpdate?.();
  };

  const handleRejectBooking = async (bookingId: string) => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const updatedBookings = allBookings.map((booking: Booking) => {
      if (booking.id === bookingId) {
        return { ...booking, status: 'cancelled' as const };
      }
      return booking;
    });
    
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    
    fetchBookings();
    setIsLoading(false);
    onBookingUpdate?.();
  };

  const sendApprovalEmail = (booking: Booking) => {
    // Simulate email sending
    console.log('Sending approval email to:', booking.email);
    console.log('Booking approved:', booking);
  };

  const generateReceipt = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowReceiptModal(true);
  };

  const downloadReceipt = (booking: Booking) => {
    const receiptContent = `
BOOKING RECEIPT - ${booking.businessName}

========================================
Booking ID: ${booking.id}
Date: ${new Date(booking.approvedAt || booking.timestamp).toLocaleDateString()}
Status: ${booking.status.toUpperCase()}

CUSTOMER INFORMATION:
Name: ${booking.name}
Email: ${booking.email}
Phone: ${booking.phone}

BOOKING DETAILS:
Service: ${booking.service}
Date: ${booking.date}
Time: ${booking.time}
Duration: 1 hour

PAYMENT INFORMATION:
Service Price: $${getServicePrice(booking.service)}
Status: Paid on arrival

BUSINESS INFORMATION:
${booking.businessName}
${booking.businessEmail}

========================================
Thank you for your business!
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
    // Mock price calculation
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

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const approvedBookings = bookings.filter(b => b.status === 'approved');
  const completedBookings = bookings.filter(b => b.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Pending Bookings */}
      {pendingBookings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pending Approvals ({pendingBookings.length})
          </h3>
          <div className="space-y-3">
            {pendingBookings.map(booking => (
              <div key={booking.id} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User size={16} className="text-yellow-600" />
                      <span className="font-medium text-gray-900 dark:text-white">{booking.name}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        booked {new Date(booking.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{booking.date} at {booking.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign size={14} className="text-gray-400" />
                        <span>{booking.service}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        <span>{booking.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" />
                        <span>{booking.phone}</span>
                      </div>
                    </div>
                    
                    {booking.notes && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <strong>Notes:</strong> {booking.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleApproveBooking(booking.id)}
                      disabled={isLoading}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => handleRejectBooking(booking.id)}
                      disabled={isLoading}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Bookings */}
      {approvedBookings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Approved Bookings ({approvedBookings.length})
          </h3>
          <div className="space-y-3">
            {approvedBookings.map(booking => (
              <div key={booking.id} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Check size={16} className="text-green-600" />
                      <span className="font-medium text-gray-900 dark:text-white">{booking.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div>{booking.service} on {booking.date} at {booking.time}</div>
                      <div>Approved: {new Date(booking.approvedAt!).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => generateReceipt(booking)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FileText size={16} />
                    </button>
                    <button
                      onClick={() => downloadReceipt(booking)}
                      className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Bookings */}
      {completedBookings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Completed Bookings ({completedBookings.length})
          </h3>
          <div className="space-y-3">
            {completedBookings.map(booking => (
              <div key={booking.id} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-blue-600" />
                  <span className="font-medium text-gray-900 dark:text-white">{booking.name}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {booking.service} • {booking.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Bookings */}
      {bookings.length === 0 && (
        <div className="text-center py-8">
          <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No bookings yet</p>
        </div>
      )}

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
                <div><strong>Customer:</strong> {selectedBooking.name}</div>
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
