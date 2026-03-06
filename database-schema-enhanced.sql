-- ============================================
-- BIZ GALLERY - COMPREHENSIVE DATABASE SCHEMA
-- ============================================
-- Instagram + Google Maps + Justdial + TikTok + AI Marketing Platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geospatial queries
CREATE EXTENSION IF NOT EXISTS "vector"; -- For AI embeddings

-- ============================================
-- CORE TABLES
-- ============================================

-- Enhanced users table with creator economy features
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    full_name VARCHAR(255),
    avatar_url TEXT,
    bio TEXT,
    user_type VARCHAR(20) DEFAULT 'customer' CHECK (user_type IN ('customer', 'business_owner', 'influencer', 'admin')),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    city VARCHAR(100),
    preferences JSONB DEFAULT '{}', -- Store user preferences, interests
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_influencer BOOLEAN DEFAULT FALSE,
    influencer_tier VARCHAR(20) DEFAULT 'none' CHECK (influencer_tier IN ('none', 'micro', 'macro', 'celebrity')),
    trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
    notification_settings JSONB DEFAULT '{"push": true, "email": true, "sms": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced businesses table with geospatial and creator features
CREATE TABLE businesses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    tags TEXT[], -- Array of tags for better search
    phone VARCHAR(20),
    whatsapp_number VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    address TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(10),
    logo_url TEXT,
    cover_image_url TEXT,
    gallery TEXT[], -- Array of image URLs
    operating_hours JSONB, -- Store opening hours for each day
    price_range VARCHAR(10) CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
    rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    follower_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    booking_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_promoted BOOLEAN DEFAULT FALSE,
    promotion_end_date TIMESTAMP WITH TIME ZONE,
    trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
    response_time_minutes INTEGER DEFAULT 60,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    seo_title VARCHAR(255),
    seo_description TEXT,
    social_links JSONB DEFAULT '{}', -- Store social media links
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create geospatial index for location queries
CREATE INDEX businesses_location_idx ON businesses USING GIST (
    ST_Point(location_lng, location_lat)
);

-- Business services for booking and comparison
CREATE TABLE business_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL, -- Price in INR
    unit VARCHAR(50) DEFAULT 'per_session', -- per_hour, per_visit, per_person, per_session
    duration_minutes INTEGER,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business opening hours
CREATE TABLE business_opening_hours (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- VIDEO REELS SYSTEM (TikTok Style)
-- ============================================

-- Business reels table
CREATE TABLE business_reels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Can be business owner or influencer
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    duration_seconds INTEGER,
    tags TEXT[],
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    is_trending BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reel interactions
CREATE TABLE reel_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reel_id UUID REFERENCES business_reels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(reel_id, user_id)
);

CREATE TABLE reel_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reel_id UUID REFERENCES business_reels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    parent_id UUID REFERENCES reel_comments(id) ON DELETE CASCADE, -- For replies
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE reel_saves (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reel_id UUID REFERENCES business_reels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(reel_id, user_id)
);

-- ============================================
-- BUSINESS GALLERY
-- ============================================

CREATE TABLE business_photos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- REVIEWS AND TRUST SYSTEM
-- ============================================

CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    review_text TEXT,
    images TEXT[], -- Array of image URLs
    is_verified_purchase BOOLEAN DEFAULT FALSE, -- If user actually booked/visited
    helpful_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'flagged')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review helpful votes
CREATE TABLE review_helpful (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(review_id, user_id)
);

-- ============================================
-- OFFERS AND ADS SYSTEM
-- ============================================

CREATE TABLE offers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    offer_type VARCHAR(50) CHECK (offer_type IN ('percentage', 'fixed', 'bogo', 'bundle', 'free_service', 'other')),
    discount_percent DECIMAL(5, 2),
    discount_amount DECIMAL(10, 2),
    original_price DECIMAL(10, 2),
    offer_price DECIMAL(10, 2),
    quantity_available INTEGER,
    quantity_used INTEGER DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE,
    expiry_time TIMESTAMP WITH TIME ZONE,
    is_flash_sale BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    terms_conditions TEXT,
    click_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'scheduled', 'expired', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Advertisement system
CREATE TABLE ads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    landing_url TEXT,
    placement VARCHAR(50) CHECK (placement IN ('home_feed', 'search_top', 'map_pin', 'category_banner', 'reel_overlay')),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    budget DECIMAL(10, 2),
    max_cpc DECIMAL(10, 2), -- Maximum cost per click
    target_audience JSONB DEFAULT '{}', -- Location, age, interests targeting
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- BOOKING SYSTEM
-- ============================================

CREATE TABLE booking_slots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    service_id UUID REFERENCES business_services(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    capacity INTEGER DEFAULT 1, -- For group bookings
    available_capacity INTEGER DEFAULT 1,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern JSONB, -- For recurring slots
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    service_id UUID REFERENCES business_services(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    slot_id UUID REFERENCES booking_slots(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    amount DECIMAL(10, 2), -- Price in INR
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'partial_refund')),
    payment_id VARCHAR(255), -- Payment gateway ID
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- LEAD REQUEST SYSTEM (for services like plumber, electrician)
-- ============================================

CREATE TABLE lead_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- plumber, electrician, repair, etc.
    subcategory VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    preferred_time TIMESTAMP WITH TIME ZONE,
    urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'emergency')),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    address TEXT,
    budget_min DECIMAL(10, 2),
    budget_max DECIMAL(10, 2),
    images TEXT[], -- Photos of the issue
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lead_matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lead_id UUID REFERENCES lead_requests(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'viewed', 'responded', 'rejected', 'accepted')),
    quoted_amount DECIMAL(10, 2),
    response_time_minutes INTEGER,
    response_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AI AND ANALYTICS
-- ============================================

-- Business embeddings for AI recommendations
CREATE TABLE business_embeddings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    embedding vector(1536), -- OpenAI embedding dimension
    source VARCHAR(50) CHECK (source IN ('description', 'reviews', 'services', 'combined')),
    model_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User behavior tracking for recommendations
CREATE TABLE user_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Allow anonymous tracking
    business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    event_type VARCHAR(50) CHECK (event_type IN ('view_business', 'view_reel', 'like', 'save', 'search', 'booking_created', 'lead_created', 'click_ad', 'call_business')),
    metadata JSONB DEFAULT '{}', -- Search query, filters, etc.
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User embeddings for personalization
CREATE TABLE user_embeddings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    embedding vector(1536),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SOCIAL FEATURES
-- ============================================

-- User follows for social features
CREATE TABLE user_follows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Business follows
CREATE TABLE business_follows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, business_id)
);

-- Notifications
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('new_follower', 'business_like', 'reel_like', 'comment', 'booking_confirmed', 'offer_nearby', 'lead_matched')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}', -- Additional data for deep linking
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Core business indexes
CREATE INDEX businesses_category_idx ON businesses(category);
CREATE INDEX businesses_city_idx ON businesses(city);
CREATE INDEX businesses_rating_idx ON businesses(rating DESC);
CREATE INDEX businesses_price_range_idx ON businesses(price_range);
CREATE INDEX businesses_verified_idx ON businesses(is_verified);
CREATE INDEX businesses_featured_idx ON businesses(is_featured);
CREATE INDEX businesses_status_idx ON businesses(status);

-- Service indexes
CREATE INDEX business_services_business_idx ON business_services(business_id);
CREATE INDEX business_services_price_idx ON business_services(base_price);
CREATE INDEX business_services_category_idx ON business_services(category);

-- Reels indexes
CREATE INDEX business_reels_business_idx ON business_reels(business_id);
CREATE INDEX business_reels_creator_idx ON business_reels(creator_id);
CREATE INDEX business_reels_status_idx ON business_reels(status);
CREATE INDEX business_reels_trending_idx ON business_reels(is_trending DESC);
CREATE INDEX business_reels_created_idx ON business_reels(created_at DESC);

-- Reviews indexes
CREATE INDEX reviews_business_idx ON reviews(business_id);
CREATE INDEX reviews_user_idx ON reviews(user_id);
CREATE INDEX reviews_rating_idx ON reviews(rating);
CREATE INDEX reviews_created_idx ON reviews(created_at DESC);

-- Offers and ads indexes
CREATE INDEX offers_business_idx ON offers(business_id);
CREATE INDEX offers_active_idx ON offers(status) WHERE status = 'active';
CREATE INDEX offers_expiry_idx ON offers(expiry_time);
CREATE INDEX ads_business_idx ON ads(business_id);
CREATE INDEX ads_placement_idx ON ads(placement);
CREATE INDEX ads_active_idx ON ads(status) WHERE status = 'active';

-- Bookings indexes
CREATE INDEX bookings_business_idx ON bookings(business_id);
CREATE INDEX bookings_user_idx ON bookings(user_id);
CREATE INDEX bookings_status_idx ON bookings(status);
CREATE INDEX bookings_time_idx ON bookings(start_time);
CREATE INDEX booking_slots_business_idx ON booking_slots(business_id);
CREATE INDEX booking_slots_time_idx ON booking_slots(start_time);

-- Lead indexes
CREATE INDEX lead_requests_category_idx ON lead_requests(category);
CREATE INDEX lead_requests_status_idx ON lead_requests(status);
CREATE INDEX lead_requests_location_idx ON lead_requests USING GIST(ST_Point(location_lng, location_lat));
CREATE INDEX lead_matches_lead_idx ON lead_matches(lead_id);
CREATE INDEX lead_matches_business_idx ON lead_matches(business_id);

-- Analytics indexes
CREATE INDEX user_events_user_idx ON user_events(user_id);
CREATE INDEX user_events_business_idx ON user_events(business_id);
CREATE INDEX user_events_type_idx ON user_events(event_type);
CREATE INDEX user_events_created_idx ON user_events(created_at DESC);

-- Social indexes
CREATE INDEX user_follows_follower_idx ON user_follows(follower_id);
CREATE INDEX user_follows_following_idx ON user_follows(following_id);
CREATE INDEX business_follows_user_idx ON business_follows(user_id);
CREATE INDEX business_follows_business_idx ON business_follows(business_id);
CREATE INDEX notifications_user_idx ON notifications(user_id);
CREATE INDEX notifications_read_idx ON notifications(is_read);

-- Vector indexes for AI
CREATE INDEX business_embeddings_vector_idx ON business_embeddings USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX user_embeddings_vector_idx ON user_embeddings USING ivfflat (embedding vector_cosine_ops);

-- ============================================
-- TRIGGERS AND FUNCTIONS
-- ============================================

-- Function to update business rating and review count
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE businesses 
    SET 
        rating = (
            SELECT COALESCE(AVG(rating), 0) 
            FROM reviews 
            WHERE business_id = NEW.business_id AND status = 'published'
        ),
        review_count = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE business_id = NEW.business_id AND status = 'published'
        )
    WHERE id = NEW.business_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rating updates
CREATE TRIGGER trigger_update_business_rating
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_business_rating();

-- Function to update trust score
CREATE OR REPLACE FUNCTION calculate_trust_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE businesses 
    SET trust_score = LEAST(100, GREATEST(0,
        -- Base score from verification
        CASE WHEN is_verified THEN 30 ELSE 0 END +
        -- Rating contribution (max 30)
        (rating * 6) +
        -- Review count contribution (max 20, logarithmic)
        LEAST(20, LOG(review_count + 1) * 4) +
        -- Recent activity (max 20)
        LEAST(20, EXTRACT(EPOCH FROM (NOW() - last_active)) / 86400 * -0.5)
    ))
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for trust score updates
CREATE TRIGGER trigger_calculate_trust_score
    AFTER UPDATE ON businesses
    FOR EACH ROW
    EXECUTE FUNCTION calculate_trust_score();

-- Function to update reel counts
CREATE OR REPLACE FUNCTION update_reel_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE business_reels 
        SET 
            likes_count = likes_count + 1
        WHERE id = NEW.reel_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE business_reels 
        SET 
            likes_count = GREATEST(0, likes_count - 1)
        WHERE id = OLD.reel_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for reel likes
CREATE TRIGGER trigger_update_reel_counts
    AFTER INSERT OR DELETE ON reel_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_reel_counts();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all user-facing tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Businesses policies
CREATE POLICY "Anyone can view active businesses" ON businesses
    FOR SELECT USING (status = 'active');

CREATE POLICY "Business owners can manage own businesses" ON businesses
    FOR ALL USING (owner_id = auth.uid());

-- Reviews policies
CREATE POLICY "Anyone can view published reviews" ON reviews
    FOR SELECT USING (status = 'published');

CREATE POLICY "Users can manage own reviews" ON reviews
    FOR ALL USING (user_id = auth.uid());

-- Bookings policies
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Businesses can view own bookings" ON bookings
    FOR SELECT USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- And similar policies for other tables...

-- ============================================
-- SAMPLE DATA (for development)
-- ============================================

-- Insert sample categories
INSERT INTO businesses (name, slug, category, description, location_lat, location_lng, city, price_range, rating, owner_id) VALUES
('Neon Gaming Zone', 'neon-gaming-zone', 'Entertainment', 'Premium gaming experience with latest consoles and VR', 23.0225, 72.5714, 'Ahmedabad', '$$', 4.5, (SELECT id FROM users WHERE email = 'business@example.com' LIMIT 1)),
('Cafe Bliss', 'cafe-bliss', 'Restaurant', 'Cozy cafe with artisanal coffee and fresh baked goods', 23.0320, 72.5800, 'Ahmedabad', '$', 4.2, (SELECT id FROM users WHERE email = 'business@example.com' LIMIT 1)),
('Style Studio', 'style-studio', 'Beauty', 'Unisex salon with modern styling and beauty treatments', 23.0250, 72.5750, 'Ahmedabad', '$$$', 4.7, (SELECT id FROM users WHERE email = 'business@example.com' LIMIT 1));

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View for business listings with all necessary data
CREATE VIEW business_listings AS
SELECT 
    b.*,
    bs.min_price,
    bo.has_offers,
    COALESCE(recent_reviews.count, 0) as recent_review_count,
    CASE 
        WHEN b.is_featured THEN 1
        WHEN b.is_verified THEN 2
        ELSE 3
    END as sort_priority
FROM businesses b
LEFT JOIN (
    SELECT business_id, MIN(base_price) as min_price
    FROM business_services
    WHERE is_active = true
    GROUP BY business_id
) bs ON b.id = bs.business_id
LEFT JOIN (
    SELECT DISTINCT business_id, 1 as has_offers
    FROM offers
    WHERE status = 'active' AND expiry_time > NOW()
) bo ON b.id = bo.business_id
LEFT JOIN (
    SELECT business_id, COUNT(*) as count
    FROM reviews
    WHERE status = 'published' AND created_at > NOW() - INTERVAL '30 days'
    GROUP BY business_id
) recent_reviews ON b.id = recent_reviews.business_id
WHERE b.status = 'active';

-- View for trending businesses
CREATE VIEW trending_businesses AS
SELECT 
    b.*,
    (b.view_count * 0.3 + b.booking_count * 0.5 + COALESCE(recent_views.count, 0) * 0.2) as trend_score
FROM businesses b
LEFT JOIN (
    SELECT business_id, COUNT(*) as count
    FROM user_events
    WHERE event_type IN ('view_business', 'view_reel')
    AND created_at > NOW() - INTERVAL '7 days'
    GROUP BY business_id
) recent_views ON b.id = recent_views.business_id
WHERE b.status = 'active'
ORDER BY trend_score DESC;
