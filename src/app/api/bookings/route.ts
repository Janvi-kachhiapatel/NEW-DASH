import { NextRequest, NextResponse } from 'next/server';
import { dataStorage } from '@/lib/dataStorage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      business_id,
      service_id,
      customer_name,
      customer_email,
      customer_phone,
      booking_date,
      booking_time,
      guests,
      special_requests
    } = body;

    // Validate required fields
    if (!business_id || !service_id || !customer_name || !customer_email || !booking_date || !booking_time) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for booking conflicts
    const hasConflict = dataStorage.checkBookingConflict(business_id, booking_date, booking_time);
    if (hasConflict) {
      return NextResponse.json(
        { success: false, error: 'This time slot is already booked. Please choose another time.' },
        { status: 409 }
      );
    }

    // Create new booking with persistent storage
    const newBooking = dataStorage.addBooking({
      business_id,
      service_id,
      customer_name,
      customer_email,
      customer_phone,
      booking_date,
      booking_time,
      guests: guests || 2,
      special_requests: special_requests || '',
      status: 'confirmed'
    });

    // Send confirmation email (mock)
    console.log('Booking confirmation email sent to:', customer_email);

    return NextResponse.json({
      success: true,
      data: newBooking,
      message: 'Booking confirmed successfully'
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const business_id = searchParams.get('business_id');
    const customer_email = searchParams.get('customer_email');

    let bookings = dataStorage.getBookings();

    if (business_id) {
      bookings = bookings.filter(b => b.business_id === business_id);
    }

    if (customer_email) {
      bookings = bookings.filter(b => b.customer_email === customer_email);
    }

    return NextResponse.json({
      success: true,
      data: bookings,
      total: bookings.length
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
