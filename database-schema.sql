-- ============================================
-- BIZ GALLERY - NEXT GENERATION DATABASE SCHEMA
-- ============================================
-- Instagram + Google Maps + Justdial + TikTok + AI Marketing Platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geospatial queries

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
    user_type VARCHAR(20) DEFAULT 'customer' CHECK (user_type IN ('customer', 'business_owner', 'influencer')),
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
    orientation VARCHAR(10) DEFAULT 'vertical' CHECK (orientation IN ('vertical', 'horizontal')),
    music_track_id UUID REFERENCES music_tracks(id),
    hashtags TEXT[],
    tagged_businesses UUID[] REFERENCES businesses(id),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    location_name VARCHAR(255),
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    is_trending BOOLEAN DEFAULT FALSE,
    trending_rank INTEGER,
    is_featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'flagged')),
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_prompt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Music tracks for reels
CREATE TABLE music_tracks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    audio_url TEXT NOT NULL,
    duration_seconds INTEGER,
    is_trending BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reel interactions
CREATE TABLE reel_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reel_id UUID REFERENCES business_reels(id) ON DELETE CASCADE,
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('like', 'comment', 'share', 'save', 'view')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, reel_id, interaction_type)
);

-- ============================================
-- AI REEL GENERATOR
-- ============================================

-- AI generated reels
CREATE TABLE ai_generated_reels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES users(id) ON DELETE CASCADE,
    media_urls TEXT[] NOT NULL, -- Input images/videos
    generated_video_url TEXT,
    prompt_used TEXT,
    ai_model_version VARCHAR(50),
    generation_status VARCHAR(20) DEFAULT 'pending' CHECK (generation_status IN ('pending', 'processing', 'completed', 'failed')),
    processing_time_seconds INTEGER,
    cost_credits INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- LIVE OFFERS SYSTEM
-- ============================================

-- Time-limited offers
CREATE TABLE offers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount_percent INTEGER CHECK (discount_percent >= 0 AND discount_percent <= 100),
    discount_amount DECIMAL(10, 2),
    original_price DECIMAL(10, 2),
    offer_price DECIMAL(10, 2),
    offer_type VARCHAR(20) CHECK (offer_type IN ('percentage', 'fixed', 'bogo', 'free_shipping', 'bundle')),
    quantity_available INTEGER,
    quantity_used INTEGER DEFAULT 0,
    expiry_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_flash_sale BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    terms_conditions TEXT,
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'paused')),
    click_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offer redemptions
CREATE TABLE offer_redemptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    redemption_code VARCHAR(50) UNIQUE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired')),
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- REVIEWS & TRUST SYSTEM
-- ============================================

-- Enhanced reviews
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    photos TEXT[],
    helpful_votes INTEGER DEFAULT 0,
    response_from_business TEXT,
    response_date TIMESTAMP WITH TIME ZONE,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    sentiment_score DECIMAL(3, 2), -- AI sentiment analysis
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'flagged')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, business_id) -- One review per user per business
);

-- Review helpful votes
CREATE TABLE review_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(review_id, user_id)
);

-- Trust score calculations (cached)
CREATE TABLE trust_scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
    reviews_score DECIMAL(5, 2) DEFAULT 0,
    verification_score DECIMAL(5, 2) DEFAULT 0,
    activity_score DECIMAL(5, 2) DEFAULT 0,
    response_score DECIMAL(5, 2) DEFAULT 0,
    social_score DECIMAL(5, 2) DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FOLLOW/SAVE SYSTEM
-- ============================================

-- User follows businesses (Instagram style)
CREATE TABLE follows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- User saves/bookmarks businesses
CREATE TABLE bookmarks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    bookmark_type VARCHAR(20) DEFAULT 'save' CHECK (bookmark_type IN ('save', 'favorite', 'visit_later')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, business_id, bookmark_type)
);

-- ============================================
-- BOOKING SYSTEM
-- ============================================

-- Services offered by businesses
CREATE TABLE services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER,
    price DECIMAL(10, 2),
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    booking_advance_days INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    booking_reference VARCHAR(50) UNIQUE,
    title VARCHAR(255),
    description TEXT,
    date DATE NOT NULL,
    time_start TIME NOT NULL,
    time_end TIME,
    duration_minutes INTEGER,
    price DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MESSAGING & WHATSAPP INTEGRATION
-- ============================================

-- Conversations
CREATE TABLE conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    participant_1 UUID REFERENCES users(id) ON DELETE CASCADE,
    participant_2 UUID REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_text TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'document', 'location', 'offer')),
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    sent_via_whatsapp BOOLEAN DEFAULT FALSE,
    whatsapp_message_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AI RECOMMENDATION ENGINE
-- ============================================

-- User behavior tracking
CREATE TABLE user_behaviors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    behavior_type VARCHAR(50) NOT NULL, -- 'view', 'like', 'share', 'save', 'search', 'booking'
    target_type VARCHAR(50), -- 'business', 'reel', 'offer', 'category'
    target_id UUID,
    metadata JSONB DEFAULT '{}', -- Additional context like location, time, etc.
    session_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI recommendations (cached)
CREATE TABLE recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL, -- 'business', 'reel', 'offer'
    target_id UUID NOT NULL,
    score DECIMAL(5, 4) NOT NULL, -- Confidence score
    reason TEXT, -- AI explanation
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ANALYTICS & INSIGHTS
-- ============================================

-- Business analytics
CREATE TABLE business_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    profile_views INTEGER DEFAULT 0,
    reel_views INTEGER DEFAULT 0,
    website_clicks INTEGER DEFAULT 0,
    phone_clicks INTEGER DEFAULT 0,
    whatsapp_clicks INTEGER DEFAULT 0,
    booking_requests INTEGER DEFAULT 0,
    new_followers INTEGER DEFAULT 0,
    offer_views INTEGER DEFAULT 0,
    revenue_generated DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, date)
);

-- Trending businesses (calculated daily)
CREATE TABLE trending_businesses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    city VARCHAR(100),
    category VARCHAR(100),
    trend_score DECIMAL(10, 4) NOT NULL,
    rank INTEGER,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- VIRAL GROWTH & REFERRALS
-- ============================================

-- Referral program
CREATE TABLE referrals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(20) UNIQUE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
    reward_amount DECIMAL(10, 2) DEFAULT 0,
    reward_type VARCHAR(20) DEFAULT 'credits',
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Viral content tracking
CREATE TABLE viral_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL, -- 'reel', 'offer', 'business'
    content_id UUID NOT NULL,
    share_count INTEGER DEFAULT 0,
    viral_coefficient DECIMAL(5, 4) DEFAULT 0,
    peak_views_hour TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INFLUENCER COLLABORATIONS
-- ============================================

-- Influencer collaborations
CREATE TABLE influencer_collaborations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    influencer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    collaboration_type VARCHAR(50) CHECK (collaboration_type IN ('reel', 'review', 'event', 'ongoing')),
    terms JSONB,
    compensation DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    deliverables TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- VOICE SEARCH & TRENDING
-- ============================================

-- Voice search logs
CREATE TABLE voice_search_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    query_language VARCHAR(10) DEFAULT 'en',
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    results_count INTEGER,
    clicked_result_id UUID,
    session_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nearby trending content
CREATE TABLE nearby_trending (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL,
    content_id UUID NOT NULL,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    radius_km INTEGER DEFAULT 5,
    trend_score DECIMAL(10, 4) NOT NULL,
    category VARCHAR(100),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AUTO MARKETING
-- ============================================

-- Marketing campaigns
CREATE TABLE marketing_campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    campaign_name VARCHAR(255) NOT NULL,
    campaign_type VARCHAR(50) CHECK (campaign_type IN ('social', 'email', 'sms', 'push', 'reel_boost')),
    target_audience JSONB,
    content TEXT,
    budget DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    metrics JSONB DEFAULT '{}',
    ai_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MONETIZATION
-- ============================================

-- Subscription plans
CREATE TABLE subscription_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10, 2),
    price_yearly DECIMAL(10, 2),
    features JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business subscriptions
CREATE TABLE business_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    start_date DATE NOT NULL,
    end_date DATE,
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credits system
CREATE TABLE credits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    credit_type VARCHAR(50) CHECK (credit_type IN ('purchase', 'earned', 'spent', 'refunded')),
    description TEXT,
    reference_id UUID, -- Reference to related transaction
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Core indexes
CREATE INDEX users_email_idx ON users(email);
CREATE INDEX users_location_idx ON users(ST_Point(location_lng, location_lat));
CREATE INDEX businesses_category_idx ON businesses(category);
CREATE INDEX businesses_city_idx ON businesses(city);
CREATE INDEX businesses_rating_idx ON businesses(rating DESC);
CREATE INDEX businesses_verified_idx ON businesses(is_verified) WHERE is_verified = TRUE;

-- Reels indexes
CREATE INDEX business_reels_business_idx ON business_reels(business_id);
CREATE INDEX business_reels_trending_idx ON business_reels(is_trending, trending_rank) WHERE is_trending = TRUE;
CREATE INDEX business_reels_created_idx ON business_reels(created_at DESC);
CREATE INDEX business_reels_location_idx ON business_reels(ST_Point(location_lng, location_lat));

-- Offers indexes
CREATE INDEX offers_business_idx ON offers(business_id);
CREATE INDEX offers_expiry_idx ON offers(expiry_time) WHERE expiry_time > NOW();
CREATE INDEX offers_featured_idx ON offers(is_featured) WHERE is_featured = TRUE;

-- Reviews indexes
CREATE INDEX reviews_business_idx ON reviews(business_id);
CREATE INDEX reviews_rating_idx ON reviews(rating);
CREATE INDEX reviews_created_idx ON reviews(created_at DESC);

-- Analytics indexes
CREATE INDEX business_analytics_date_idx ON business_analytics(date);
CREATE INDEX user_behaviors_user_idx ON user_behaviors(user_id);
CREATE INDEX user_behaviors_created_idx ON user_behaviors(created_at DESC);

-- ============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================

-- Update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_reels_updated_at BEFORE UPDATE ON business_reels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update follower counts
CREATE OR REPLACE FUNCTION update_business_follower_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE businesses SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE businesses SET follower_count = follower_count - 1 WHERE id = OLD.following_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_business_follower_count_trigger
    AFTER INSERT OR DELETE ON follows
    FOR EACH ROW EXECUTE FUNCTION update_business_follower_count();

-- Update reel interaction counts
CREATE OR REPLACE FUNCTION update_reel_interaction_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        CASE NEW.interaction_type
            WHEN 'like' THEN UPDATE business_reels SET likes_count = likes_count + 1 WHERE id = NEW.reel_id;
            WHEN 'view' THEN UPDATE business_reels SET views_count = views_count + 1 WHERE id = NEW.reel_id;
            WHEN 'share' THEN UPDATE business_reels SET shares_count = shares_count + 1 WHERE id = NEW.reel_id;
            WHEN 'save' THEN UPDATE business_reels SET saves_count = saves_count + 1 WHERE id = NEW.reel_id;
        END CASE;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        CASE OLD.interaction_type
            WHEN 'like' THEN UPDATE business_reels SET likes_count = likes_count - 1 WHERE id = OLD.reel_id;
            WHEN 'view' THEN UPDATE business_reels SET views_count = views_count - 1 WHERE id = OLD.reel_id;
            WHEN 'share' THEN UPDATE business_reels SET shares_count = shares_count - 1 WHERE id = OLD.reel_id;
            WHEN 'save' THEN UPDATE business_reels SET saves_count = saves_count - 1 WHERE id = OLD.reel_id;
        END CASE;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reel_interaction_count_trigger
    AFTER INSERT OR DELETE ON reel_interactions
    FOR EACH ROW EXECUTE FUNCTION update_reel_interaction_count();

-- ============================================
-- RLS POLICIES WILL BE ADDED NEXT
-- ============================================
