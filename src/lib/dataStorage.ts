// Data persistence layer using localStorage
// In production, this would connect to a real database

export interface Business {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  description: string;
  logo_url?: string;
  cover_image_url?: string;
  rating: number;
  review_count: number;
  price_range: string;
  distance?: number;
  address: string;
  phone?: string;
  website?: string;
  email?: string;
  location_lat?: number;
  location_lng?: number;
  owner_id: string;
  is_verified: boolean;
  is_featured: boolean;
  custom_website_url?: string;
  operating_hours?: {
    [key: string]: {
      open: string;
      close: string;
      is_open: boolean;
    };
  };
  services?: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    duration_minutes: number;
    category: string;
    is_bookable: boolean;
  }>;
  offers?: Array<{
    id: string;
    title: string;
    description: string;
    discount_percent: number;
    valid_until: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  business_id: string;
  service_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  business_id: string;
  user_name: string;
  user_email: string;
  rating: number;
  comment: string;
  images?: string[];
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'business_owner' | 'admin';
  businesses?: string[];
  created_at: string;
  updated_at: string;
}

export interface Reel {
  id: string;
  business_id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
}

class DataStorage {
  private static instance: DataStorage;
  private initialized = false;

  private constructor() {
    this.initializeDatabase();
  }

  static getInstance(): DataStorage {
    if (!DataStorage.instance) {
      DataStorage.instance = new DataStorage();
    }
    return DataStorage.instance;
  }

  private initializeDatabase() {
    if (this.initialized) return;
    
    // Initialize all collections if they don't exist
    const collections = ['businesses', 'bookings', 'reviews', 'users', 'reels'];
    
    collections.forEach(collection => {
      if (!localStorage.getItem(collection)) {
        localStorage.setItem(collection, JSON.stringify([]));
      }
    });

    // Initialize default data if empty
    if (this.getBusinesses().length === 0) {
      this.seedDefaultData();
    }

    this.initialized = true;
    console.log('Database initialized successfully');
  }

  private seedDefaultData() {
    const defaultBusinesses = [
      {
        id: '1',
        name: 'Neon Gaming Zone',
        slug: 'neon-gaming-zone',
        category: 'Entertainment',
        subcategory: 'Gaming Arcade',
        description: 'Premium gaming experience with latest consoles and VR headsets',
        logo_url: '/api/placeholder/200/200',
        cover_image_url: '/api/placeholder/400/200',
        rating: 4.8,
        review_count: 234,
        price_range: '$$',
        location_lat: 23.0225,
        location_lng: 72.5714,
        address: '123 Gaming Street, Ahmedabad, Gujarat 380001',
        phone: '+91 98765 43210',
        website: 'https://neongaming.example.com',
        email: 'info@neongaming.example.com',
        is_verified: true,
        is_featured: true,
        owner_id: 'user1',
        custom_website_url: 'https://neon-gaming.business.com',
        operating_hours: {
          monday: { open: '10:00', close: '22:00', is_open: true },
          tuesday: { open: '10:00', close: '22:00', is_open: true },
          wednesday: { open: '10:00', close: '22:00', is_open: true },
          thursday: { open: '10:00', close: '22:00', is_open: true },
          friday: { open: '10:00', close: '23:00', is_open: true },
          saturday: { open: '10:00', close: '23:00', is_open: true },
          sunday: { open: '10:00', close: '22:00', is_open: true }
        },
        services: [
          {
            id: '1',
            name: 'VR Gaming Session',
            description: '30-minute virtual reality gaming experience',
            price: 299,
            duration_minutes: 30,
            category: 'Gaming',
            is_bookable: true
          }
        ],
        offers: [
          {
            id: '1',
            title: 'Weekend Gaming Special',
            description: 'Get 25% off on all gaming sessions',
            discount_percent: 25,
            valid_until: '2024-12-31'
          }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Cafe Bliss',
        slug: 'cafe-bliss',
        category: 'Restaurant',
        subcategory: 'Coffee Shop',
        description: 'Cozy cafe with artisanal coffee and fresh baked goods',
        logo_url: '/api/placeholder/200/200',
        cover_image_url: '/api/placeholder/400/200',
        rating: 4.6,
        review_count: 189,
        price_range: '$',
        location_lat: 23.0320,
        location_lng: 72.5800,
        address: '456 Coffee Lane, Ahmedabad, Gujarat 380002',
        phone: '+91 98765 43211',
        website: 'https://cafebliss.example.com',
        email: 'hello@cafebliss.example.com',
        is_verified: true,
        is_featured: false,
        owner_id: 'user2',
        custom_website_url: 'https://cafe-bliss.business.com',
        operating_hours: {
          monday: { open: '07:00', close: '21:00', is_open: true },
          tuesday: { open: '07:00', close: '21:00', is_open: true },
          wednesday: { open: '07:00', close: '21:00', is_open: true },
          thursday: { open: '07:00', close: '21:00', is_open: true },
          friday: { open: '07:00', close: '22:00', is_open: true },
          saturday: { open: '08:00', close: '22:00', is_open: true },
          sunday: { open: '08:00', close: '20:00', is_open: true }
        },
        services: [
          {
            id: '3',
            name: 'Table Reservation',
            description: 'Reserve a table for dining',
            price: 0,
            duration_minutes: 120,
            category: 'Dining',
            is_bookable: true
          }
        ],
        offers: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const defaultUsers = [
      {
        id: 'user1',
        name: 'Business Owner 1',
        email: 'owner1@example.com',
        phone: '+91 98765 43210',
        role: 'business_owner',
        businesses: ['1'],
        created_at: new Date().toISOString()
      },
      {
        id: 'user2',
        name: 'Business Owner 2',
        email: 'owner2@example.com',
        phone: '+91 98765 43211',
        role: 'business_owner',
        businesses: ['2'],
        created_at: new Date().toISOString()
      }
    ];

    localStorage.setItem('businesses', JSON.stringify(defaultBusinesses));
    localStorage.setItem('users', JSON.stringify(defaultUsers));
    console.log('Default data seeded');
  }

  // Businesses CRUD
  getBusinesses(): Business[] {
    try {
      const data = localStorage.getItem('businesses');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get businesses:', error);
      return [];
    }
  }

  getBusiness(slug: string): Business | null {
    try {
      const businesses = this.getBusinesses();
      return businesses.find(b => b.slug === slug) || null;
    } catch (error) {
      console.error('Failed to get business:', error);
      return null;
    }
  }

  addBusiness(businessData: Partial<Business>): Business {
    try {
      const businesses = this.getBusinesses();
      const newBusiness: Business = {
        id: Date.now().toString(),
        slug: businessData.name?.toLowerCase().replace(/\s+/g, '-') || '',
        rating: 0,
        review_count: 0,
        is_verified: false,
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...businessData
      } as Business;

      businesses.push(newBusiness);
      localStorage.setItem('businesses', JSON.stringify(businesses));
      
      console.log('Business added successfully:', newBusiness.id);
      return newBusiness;
    } catch (error) {
      console.error('Failed to add business:', error);
      throw new Error('Failed to add business');
    }
  }

  updateBusiness(id: string, updates: Partial<Business>): Business {
    try {
      const businesses = this.getBusinesses();
      const index = businesses.findIndex(b => b.id === id);
      
      if (index === -1) {
        throw new Error('Business not found');
      }

      businesses[index] = {
        ...businesses[index],
        ...updates,
        updated_at: new Date().toISOString()
      };

      localStorage.setItem('businesses', JSON.stringify(businesses));
      
      console.log('Business updated successfully:', id);
      return businesses[index];
    } catch (error) {
      console.error('Failed to update business:', error);
      throw new Error('Failed to update business');
    }
  }

  deleteBusiness(id: string): boolean {
    try {
      const businesses = this.getBusinesses();
      const filteredBusinesses = businesses.filter(b => b.id !== id);
      
      if (filteredBusinesses.length === businesses.length) {
        throw new Error('Business not found');
      }

      localStorage.setItem('businesses', JSON.stringify(filteredBusinesses));
      
      console.log('Business deleted successfully:', id);
      return true;
    } catch (error) {
      console.error('Failed to delete business:', error);
      throw new Error('Failed to delete business');
    }
  }

  // Bookings CRUD
  getBookings(): Booking[] {
    try {
      const data = localStorage.getItem('bookings');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get bookings:', error);
      return [];
    }
  }

  addBooking(bookingData: Partial<Booking>): Booking {
    try {
      const bookings = this.getBookings();
      const newBooking: Booking = {
        id: Date.now().toString(),
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...bookingData
      } as Booking;

      bookings.push(newBooking);
      localStorage.setItem('bookings', JSON.stringify(bookings));
      
      console.log('Booking added successfully:', newBooking.id);
      return newBooking;
    } catch (error) {
      console.error('Failed to add booking:', error);
      throw new Error('Failed to add booking');
    }
  }

  checkBookingConflict(businessId: string, date: string, time: string): boolean {
    try {
      const bookings = this.getBookings();
      const conflict = bookings.find(b => 
        b.business_id === businessId && 
        b.booking_date === date && 
        b.booking_time === time &&
        b.status !== 'cancelled'
      );
      return !!conflict;
    } catch (error) {
      console.error('Failed to check booking conflict:', error);
      return false;
    }
  }

  // Reviews CRUD
  getReviews(): Review[] {
    try {
      const data = localStorage.getItem('reviews');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get reviews:', error);
      return [];
    }
  }

  getReviewsForBusiness(businessId: string): Review[] {
    try {
      const reviews = this.getReviews();
      return reviews.filter(r => r.business_id === businessId);
    } catch (error) {
      console.error('Failed to get reviews for business:', error);
      return [];
    }
  }

  addReview(reviewData: Partial<Review>): Review {
    try {
      const reviews = this.getReviews();
      const newReview: Review = {
        id: Date.now().toString(),
        helpful_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...reviewData
      } as Review;

      reviews.push(newReview);
      localStorage.setItem('reviews', JSON.stringify(reviews));

      // Update business rating
      this.updateBusinessRating(reviewData.business_id!);
      
      console.log('Review added successfully:', newReview.id);
      return newReview;
    } catch (error) {
      console.error('Failed to add review:', error);
      throw new Error('Failed to add review');
    }
  }

  private updateBusinessRating(businessId: string) {
    try {
      const reviews = this.getReviewsForBusiness(businessId);
      const businesses = this.getBusinesses();
      const businessIndex = businesses.findIndex(b => b.id === businessId);
      
      if (businessIndex !== -1 && reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        businesses[businessIndex].rating = Math.round(avgRating * 10) / 10;
        businesses[businessIndex].review_count = reviews.length;
        businesses[businessIndex].updated_at = new Date().toISOString();
        
        localStorage.setItem('businesses', JSON.stringify(businesses));
      }
    } catch (error) {
      console.error('Failed to update business rating:', error);
    }
  }

  // Users CRUD
  getUsers(): User[] {
    try {
      const data = localStorage.getItem('users');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get users:', error);
      return [];
    }
  }

  addUser(userData: Partial<User>): User {
    try {
      const users = this.getUsers();
      const newUser: User = {
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...userData
      } as User;

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      console.log('User added successfully:', newUser.id);
      return newUser;
    } catch (error) {
      console.error('Failed to add user:', error);
      throw new Error('Failed to add user');
    }
  }

  // Reels CRUD
  getReels(): Reel[] {
    try {
      const data = localStorage.getItem('reels');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get reels:', error);
      return [];
    }
  }

  addReel(reelData: Partial<Reel>): Reel {
    try {
      const reels = this.getReels();
      const newReel: Reel = {
        id: Date.now().toString(),
        likes_count: 0,
        comments_count: 0,
        views_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...reelData
      } as Reel;

      reels.push(newReel);
      localStorage.setItem('reels', JSON.stringify(reels));
      
      console.log('Reel added successfully:', newReel.id);
      return newReel;
    } catch (error) {
      console.error('Failed to add reel:', error);
      throw new Error('Failed to add reel');
    }
  }

  // Database statistics
  getDatabaseStats() {
    return {
      businesses: this.getBusinesses().length,
      bookings: this.getBookings().length,
      reviews: this.getReviews().length,
      users: this.getUsers().length,
      reels: this.getReels().length,
      lastUpdated: new Date().toISOString()
    };
  }
}

export const dataStorage = DataStorage.getInstance();
