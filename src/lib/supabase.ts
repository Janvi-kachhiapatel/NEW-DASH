import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://business-gallery3.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrb2V6dXVvY2Vjc295Y3JjYWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MDgzNjUsImV4cCI6MjA4NTA4NDM2NX0.t9cul0YOEsqZUoNXhM0WL7Qix-hbWJ9tt0_5dYep0pc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (you can generate these with Supabase CLI)
export interface Database {
  public: {
    businesses: {
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
      operating_hours?: any;
      services?: any[];
      offers?: any[];
      created_at: string;
      updated_at: string;
    };
    bookings: {
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
    };
    reviews: {
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
    };
    users: {
      id: string;
      name: string;
      email: string;
      phone?: string;
      role: 'customer' | 'business_owner' | 'admin';
      businesses?: string[];
      created_at: string;
      updated_at: string;
    };
    reels: {
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
    };
  };
}

// Helper functions for Supabase operations
export class SupabaseService {
  // Businesses CRUD
  static async getBusinesses() {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getBusiness(slug: string) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createBusiness(businessData: any) {
    const { data, error } = await supabase
      .from('businesses')
      .insert([{
        ...businessData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateBusiness(id: string, updates: any) {
    const { data, error } = await supabase
      .from('businesses')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteBusiness(id: string) {
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // Bookings CRUD
  static async getBookings() {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createBooking(bookingData: any) {
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        ...bookingData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateBookingStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Reviews CRUD
  static async getReviews(businessId?: string) {
    let query = supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (businessId) {
      query = query.eq('business_id', businessId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async createReview(reviewData: any) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        ...reviewData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Users CRUD
  static async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateUser(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Real-time subscriptions
  static subscribeToBusinesses(callback: (payload: any) => void) {
    return supabase
      .channel('businesses')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'businesses' }, 
        callback
      )
      .subscribe();
  }

  static subscribeToBookings(callback: (payload: any) => void) {
    return supabase
      .channel('bookings')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bookings' }, 
        callback
      )
      .subscribe();
  }

  // Authentication helpers
  static async signUp(email: string, password: string, metadata?: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    
    if (error) throw error;
    return data;
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  // File upload helpers
  static async uploadFile(file: File, bucket: string = 'uploads') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${bucket}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    const { data: publicUrl } = await supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return {
      path: filePath,
      publicUrl
    };
  }
}

export default SupabaseService;
