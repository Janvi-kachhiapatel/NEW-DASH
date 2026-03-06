"use client";
import { useState } from 'react';
import { Calendar, Clock, User, CreditCard, Check, X, Star, MapPin, Phone, ChevronRight, IndianRupee } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  base_price: number;
  unit: string;
  duration_minutes?: number;
  category: string;
  business_id: string;
  business_name: string;
  business_rating: number;
  business_distance?: number;
  business_address: string;
}

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  available_capacity: number;
  capacity: number;
}

interface BookingData {
  service_id: string;
  date: string;
  time_slot: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes: string;
}

interface BookingSystemProps {
  services: Service[];
  availableSlots?: TimeSlot[];
  onBookingConfirm: (booking: BookingData) => void;
  loading?: boolean;
}

export default function BookingSystem({ 
  services, 
  availableSlots = [], 
  onBookingConfirm,
  loading = false 
}: BookingSystemProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [showComparison, setShowComparison] = useState(false);
  const [bookingStep, setBookingStep] = useState<'service' | 'datetime' | 'details' | 'confirmation'>('service');
  const [bookingData, setBookingData] = useState<BookingData>({
    service_id: '',
    date: '',
    time_slot: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    notes: ''
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const getSlotsForDate = (date: string) => {
    // This would typically come from an API call
    return availableSlots.filter(slot => {
      const slotDate = new Date(slot.start_time).toISOString().split('T')[0];
      return slotDate === date && slot.available_capacity > 0;
    });
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setBookingData(prev => ({ ...prev, service_id: service.id }));
    setBookingStep('datetime');
  };

  const handleDateTimeSelect = (date: string, slot: string) => {
    setSelectedDate(date);
    setSelectedSlot(slot);
    setBookingData(prev => ({ ...prev, date, time_slot: slot }));
    setBookingStep('details');
  };

  const handleBookingSubmit = () => {
    if (!selectedService) return;
    
    onBookingConfirm(bookingData);
    setBookingStep('confirmation');
  };

  const resetBooking = () => {
    setSelectedService(null);
    setSelectedDate('');
    setSelectedSlot('');
    setBookingStep('service');
    setBookingData({
      service_id: '',
      date: '',
      time_slot: '',
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      notes: ''
    });
  };

  // Group services by category for comparison
  const servicesByCategory = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Book a Service
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Compare prices and book the best service for your needs
        </p>
      </div>

      {/* Toggle Comparison View */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Available Services
        </h3>
        <button
          onClick={() => setShowComparison(!showComparison)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            showComparison
              ? 'bg-violet-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          {showComparison ? 'List View' : 'Compare Prices'}
        </button>
      </div>

      {/* Service Selection Step */}
      {bookingStep === 'service' && (
        <>
          {showComparison ? (
            /* Comparison View */
            <div className="space-y-6">
              {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                <div key={category} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
                  <div className="p-4 bg-violet-50 dark:bg-violet-900/20 border-b border-violet-200 dark:border-violet-800">
                    <h3 className="font-semibold text-violet-900 dark:text-violet-100">{category}</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Business
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Service
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Duration
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Rating
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Distance
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {categoryServices.map((service) => (
                          <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-4">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {service.business_name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {service.business_address}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {service.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {service.description}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1">
                                <IndianRupee size={16} className="text-gray-500" />
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {service.base_price}
                                </span>
                                <span className="text-sm text-gray-500">/{service.unit}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              {service.duration_minutes ? (
                                <div className="flex items-center gap-1">
                                  <Clock size={16} className="text-gray-400" />
                                  <span className="text-sm text-gray-900 dark:text-white">
                                    {service.duration_minutes} min
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">-</span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1">
                                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {service.business_rating}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              {service.business_distance ? (
                                <div className="flex items-center gap-1">
                                  <MapPin size={16} className="text-gray-400" />
                                  <span className="text-sm text-gray-900 dark:text-white">
                                    {service.business_distance.toFixed(1)} km
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">-</span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <button
                                onClick={() => handleServiceSelect(service)}
                                className="px-3 py-1 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm"
                              >
                                Select
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <div key={service.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {service.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {service.business_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 line-clamp-2">
                        {service.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <IndianRupee size={16} className="text-gray-500" />
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {service.base_price}
                      </span>
                      <span className="text-sm text-gray-500">/{service.unit}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-gray-900 dark:text-white">
                          {service.business_rating}
                        </span>
                      </div>
                      {service.business_distance && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <MapPin size={14} />
                          <span>{service.business_distance.toFixed(1)} km</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {service.duration_minutes && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                      <Clock size={14} />
                      <span>{service.duration_minutes} minutes</span>
                    </div>
                  )}

                  <button
                    onClick={() => handleServiceSelect(service)}
                    className="w-full py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    Book Now
                    <ChevronRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Date & Time Selection Step */}
      {bookingStep === 'datetime' && selectedService && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <button
            onClick={() => setBookingStep('service')}
            className="mb-4 text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
          >
            <ChevronRight size={16} className="rotate-180" />
            Back to services
          </button>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Select Date & Time
          </h3>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Date
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {getAvailableDates().map((date) => {
                const dateObj = new Date(date);
                const isToday = date === new Date().toISOString().split('T')[0];
                const slots = getSlotsForDate(date);
                
                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    disabled={slots.length === 0}
                    className={`p-3 rounded-lg border transition-colors ${
                      selectedDate === date
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                        : slots.length === 0
                        ? 'border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600'
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {dateObj.toLocaleDateString('en-IN', { weekday: 'short' })}
                    </div>
                    <div className="text-lg font-bold">
                      {dateObj.getDate()}
                    </div>
                    <div className="text-xs">
                      {dateObj.toLocaleDateString('en-IN', { month: 'short' })}
                    </div>
                    {isToday && (
                      <div className="text-xs text-violet-600 dark:text-violet-400">Today</div>
                    )}
                    {slots.length === 0 && !isToday && (
                      <div className="text-xs text-gray-500">No slots</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Available Time Slots
              </label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {getSlotsForDate(selectedDate).map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => handleDateTimeSelect(selectedDate, slot.id)}
                    className={`p-3 rounded-lg border transition-colors ${
                      selectedSlot === slot.id
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600'
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {formatTime(slot.start_time)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {slot.available_capacity}/{slot.capacity} available
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Customer Details Step */}
      {bookingStep === 'details' && selectedService && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <button
            onClick={() => setBookingStep('datetime')}
            className="mb-4 text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
          >
            <ChevronRight size={16} className="rotate-180" />
            Back to date & time
          </button>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Your Details
          </h3>

          {/* Booking Summary */}
          <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-violet-900 dark:text-violet-100 mb-2">Booking Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Service:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedService.name} at {selectedService.business_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Date:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(selectedDate).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Time:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedDate && formatTime(
                    availableSlots.find(s => s.id === selectedSlot)?.start_time || ''
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Price:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatPrice(selectedService.base_price)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={bookingData.customer_name}
                onChange={(e) => setBookingData(prev => ({ ...prev, customer_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={bookingData.customer_email}
                onChange={(e) => setBookingData(prev => ({ ...prev, customer_email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={bookingData.customer_phone}
                onChange={(e) => setBookingData(prev => ({ ...prev, customer_phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="+91 98765 43210"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                value={bookingData.notes}
                onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows={3}
                placeholder="Any special requirements or notes for the business..."
              />
            </div>
          </div>

          <button
            onClick={handleBookingSubmit}
            disabled={loading || !bookingData.customer_name || !bookingData.customer_email || !bookingData.customer_phone}
            className="w-full mt-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <Check size={20} />
                Confirm Booking
              </>
            )}
          </button>
        </div>
      )}

      {/* Confirmation Step */}
      {bookingStep === 'confirmation' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600 dark:text-green-400" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Booking Confirmed!
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your booking has been successfully confirmed. You'll receive a confirmation email shortly.
          </p>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Booking Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Booking ID:</span>
                <span className="font-medium text-gray-900 dark:text-white">#BK{Date.now()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Service:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedService?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Business:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedService?.business_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Date & Time:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedDate && new Date(selectedDate).toLocaleDateString('en-IN')} at{' '}
                  {selectedDate && formatTime(
                    availableSlots.find(s => s.id === selectedSlot)?.start_time || ''
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetBooking}
              className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Book Another Service
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            >
              Print Confirmation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
