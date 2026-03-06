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
  is_verified: boolean;
  is_featured: boolean;
  location_lat: number;
  location_lng: number;
  custom_website_url?: string;
  owner_id?: string;
  operating_hours?: any;
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
    terms?: string;
  }>;
  gallery?: string[];
  reels?: Array<{
    id: string;
    business_id: string;
    business_name: string;
    video_url: string;
    thumbnail_url: string;
    caption: string;
    duration_seconds: number;
    likes_count: number;
    comments_count: number;
    views_count: number;
    created_at: string;
  }>;
  reviews?: Array<{
    id: string;
    user_name: string;
    user_email: string;
    rating: number;
    comment: string;
    images?: string[];
    helpful_count: number;
    created_at: string;
  }>;
  created_at?: string;
  updated_at?: string;
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
  guests?: number;
  special_requests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
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
  role: 'customer' | 'business_owner';
  businesses?: string[]; // Array of business IDs if owner
  created_at: string;
}

class DataStorage {
  private readonly STORAGE_KEYS = {
    BUSINESSES: 'bizgallery_businesses',
    BOOKINGS: 'bizgallery_bookings',
    REVIEWS: 'bizgallery_reviews',
    USERS: 'bizgallery_users',
    REELS: 'bizgallery_reels'
  };

  // Initialize with default data if empty
  constructor() {
    this.initializeData();
  }

  private initializeData() {
    if (typeof window === 'undefined') return;

    // Initialize default businesses if empty
    if (!localStorage.getItem(this.STORAGE_KEYS.BUSINESSES)) {
      const defaultBusinesses: Business[] = [
        {
          id: '1',
          name: 'Neon Gaming Zone',
          slug: 'neon-gaming-zone',
          category: 'Entertainment',
          subcategory: 'Gaming Arcade',
          description: 'Premium gaming experience with latest consoles and VR headsets',
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
          services: [
            {
              id: '1',
              name: 'VR Gaming Session',
              description: '30-minute virtual reality gaming experience',
              price: 299,
              duration_minutes: 30,
              category: 'Gaming',
              is_bookable: true
            },
            {
              id: '2',
              name: 'Console Gaming',
              description: '1-hour gaming session on PS5/Xbox',
              price: 199,
              duration_minutes: 60,
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
              valid_until: '2024-12-31',
              terms: 'Valid on weekends only'
            }
          ],
          gallery: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
          reels: [
            {
              id: '1',
              business_id: '1',
              business_name: 'Neon Gaming Zone',
              video_url: '/api/placeholder/video',
              thumbnail_url: '/api/placeholder/400/700',
              caption: 'Check out our latest VR gaming experience! 🎮',
              duration_seconds: 30,
              likes_count: 234,
              comments_count: 45,
              views_count: 1200,
              created_at: new Date().toISOString()
            }
          ],
          reviews: [
            {
              id: '1',
              user_name: 'Rahul Sharma',
              user_email: 'rahul@example.com',
              rating: 5,
              comment: 'Amazing gaming experience! The VR setup is top-notch.',
              helpful_count: 12,
              created_at: new Date().toISOString()
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
          services: [
            {
              id: '3',
              name: 'Table Reservation',
              description: 'Reserve a table for dining',
              price: 0,
              duration_minutes: 120,
              category: 'Dining',
              is_bookable: true
            },
            {
              id: '4',
              name: 'Coffee Tasting',
              description: 'Sample our artisanal coffee collection',
              price: 149,
              duration_minutes: 30,
              category: 'Beverage',
              is_bookable: true
            }
          ],
          offers: [],
          gallery: ['/api/placeholder/400/300'],
          reels: [],
          reviews: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      localStorage.setItem(this.STORAGE_KEYS.BUSINESSES, JSON.stringify(defaultBusinesses));
    }

    // Initialize empty arrays for other data
    if (!localStorage.getItem(this.STORAGE_KEYS.BOOKINGS)) {
      localStorage.setItem(this.STORAGE_KEYS.BOOKINGS, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.REVIEWS)) {
      localStorage.setItem(this.STORAGE_KEYS.REVIEWS, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.USERS)) {
      const defaultUsers: User[] = [
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
      localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.REELS)) {
      localStorage.setItem(this.STORAGE_KEYS.REELS, JSON.stringify([]));
    }
  }

  // Businesses
  getBusinesses(): Business[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.STORAGE_KEYS.BUSINESSES);
    return data ? JSON.parse(data) : [];
  }

  getBusiness(slug: string): Business | null {
    const businesses = this.getBusinesses();
    return businesses.find(b => b.slug === slug) || null;
  }

  addBusiness(business: Omit<Business, 'id' | 'created_at' | 'updated_at'>): Business {
    const businesses = this.getBusinesses();
    const newBusiness: Business = {
      ...business,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    businesses.push(newBusiness);
    localStorage.setItem(this.STORAGE_KEYS.BUSINESSES, JSON.stringify(businesses));
    return newBusiness;
  }

  updateBusiness(slug: string, updates: Partial<Business>): Business | null {
    const businesses = this.getBusinesses();
    const index = businesses.findIndex(b => b.slug === slug);
    if (index === -1) return null;

    businesses[index] = {
      ...businesses[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(this.STORAGE_KEYS.BUSINESSES, JSON.stringify(businesses));
    return businesses[index];
  }

  // Bookings
  getBookings(): Booking[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.STORAGE_KEYS.BOOKINGS);
    return data ? JSON.parse(data) : [];
  }

  addBooking(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Booking {
    const bookings = this.getBookings();
    const newBooking: Booking = {
      ...booking,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    bookings.push(newBooking);
    localStorage.setItem(this.STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    return newBooking;
  }

  checkBookingConflict(businessId: string, date: string, time: string): boolean {
    const bookings = this.getBookings();
    return bookings.some(booking => 
      booking.business_id === businessId &&
      booking.booking_date === date &&
      booking.booking_time === time &&
      booking.status !== 'cancelled'
    );
  }

  getBookingsForBusiness(businessId: string): Booking[] {
    const bookings = this.getBookings();
    return bookings.filter(b => b.business_id === businessId);
  }

  // Reviews
  getReviews(): Review[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.STORAGE_KEYS.REVIEWS);
    return data ? JSON.parse(data) : [];
  }

  addReview(review: Omit<Review, 'id' | 'created_at' | 'updated_at'>): Review {
    const reviews = this.getReviews();
    const newReview: Review = {
      ...review,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    reviews.push(newReview);
    localStorage.setItem(this.STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));

    // Update business rating
    this.updateBusinessRating(review.business_id);
    return newReview;
  }

  getReviewsForBusiness(businessId: string): Review[] {
    const reviews = this.getReviews();
    return reviews.filter(r => r.business_id === businessId);
  }

  private updateBusinessRating(businessId: string) {
    const reviews = this.getReviewsForBusiness(businessId);
    const businesses = this.getBusinesses();
    const businessIndex = businesses.findIndex(b => b.id === businessId);
    
    if (businessIndex !== -1 && reviews.length > 0) {
      const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      businesses[businessIndex].rating = Math.round(avgRating * 10) / 10;
      businesses[businessIndex].review_count = reviews.length;
      localStorage.setItem(this.STORAGE_KEYS.BUSINESSES, JSON.stringify(businesses));
    }
  }

  // Users
  getUsers(): User[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  }

  addUser(user: Omit<User, 'id' | 'created_at'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  }

  getUserByEmail(email: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.email === email) || null;
  }

  // Reels
  getReels(): any[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.STORAGE_KEYS.REELS);
    return data ? JSON.parse(data) : [];
  }

  addReel(reel: any): any {
    const reels = this.getReels();
    const newReel = {
      ...reel,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    reels.push(newReel);
    localStorage.setItem(this.STORAGE_KEYS.REELS, JSON.stringify(reels));
    return newReel;
  }

  getReelsForBusiness(businessId: string): any[] {
    const reels = this.getReels();
    return reels.filter(r => r.business_id === businessId);
  }
}

export const dataStorage = new DataStorage();
