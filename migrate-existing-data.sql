-- ============================================
-- BIZ GALLERY - DATA MIGRATION
-- ============================================
-- This script migrates existing businesses data to the new schema
-- Run this if you have existing data you want to keep

-- Step 1: Add new columns to existing businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100),
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS website VARCHAR(255),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS location_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'India',
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS gallery TEXT[],
ADD COLUMN IF NOT EXISTS operating_hours JSONB,
ADD COLUMN IF NOT EXISTS price_range VARCHAR(10) CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS booking_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS promotion_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS response_time_minutes INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 2: Migrate existing data
-- Map old columns to new ones
UPDATE businesses 
SET 
    owner_id = NULL, -- Will be set later when users table is created
    subcategory = CASE 
        WHEN category = 'Electronics' THEN 'Gaming'
        WHEN category = 'Grocery' THEN 'Organic'
        WHEN category = 'Fashion' THEN 'Tailoring'
        ELSE NULL
    END,
    tags = CASE 
        WHEN category = 'Electronics' THEN ARRAY['gaming', 'pcs', 'vr']
        WHEN category = 'Grocery' THEN ARRAY['organic', 'vegetables', 'fresh']
        WHEN category = 'Fashion' THEN ARRAY['bespoke', 'modern', 'traditional']
        ELSE ARRAY[category]
    END,
    phone = whatsapp,
    whatsapp_number = whatsapp,
    email = CASE 
        WHEN name = 'Neon Gaming Zone' THEN 'info@neongaming.com'
        WHEN name = 'Organic Roots' THEN 'hello@organicroots.in'
        WHEN name = 'Style Stitches' THEN 'contact@stylestitches.com'
        ELSE NULL
    END,
    website = CASE 
        WHEN name = 'Neon Gaming Zone' THEN 'https://neongaming.com'
        WHEN name = 'Organic Roots' THEN 'https://organicroots.in'
        WHEN name = 'Style Stitches' THEN 'https://stylestitches.com'
        ELSE NULL
    END,
    address = location,
    location_lat = CASE 
        WHEN location = 'Indiranagar, Bangalore' THEN 12.9716
        WHEN location = 'Andheri West, Mumbai' THEN 19.0748
        WHEN location = 'Connaught Place, Delhi' THEN 28.6328
        ELSE NULL
    END,
    location_lng = CASE 
        WHEN location = 'Indiranagar, Bangalore' THEN 77.5946
        WHEN location = 'Andheri West, Mumbai' THEN 72.8267
        WHEN location = 'Connaught Place, Delhi' THEN 77.2197
        ELSE NULL
    END,
    city = CASE 
        WHEN location = 'Indiranagar, Bangalore' THEN 'Bangalore'
        WHEN location = 'Andheri West, Mumbai' THEN 'Mumbai'
        WHEN location = 'Connaught Place, Delhi' THEN 'Delhi'
        ELSE NULL
    END,
    state = CASE 
        WHEN location = 'Indiranagar, Bangalore' THEN 'Karnataka'
        WHEN location = 'Andheri West, Mumbai' THEN 'Maharashtra'
        WHEN location = 'Connaught Place, Delhi' THEN 'Delhi'
        ELSE NULL
    END,
    country = 'India',
    logo_url = image_url,
    cover_image_url = image_url,
    gallery = ARRAY[image_url],
    operating_hours = '{"monday": "09:00-21:00", "tuesday": "09:00-21:00", "wednesday": "09:00-21:00", "thursday": "09:00-21:00", "friday": "09:00-21:00", "saturday": "10:00-22:00", "sunday": "10:00-22:00"}',
    price_range = CASE 
        WHEN category = 'Electronics' THEN '$$$'
        WHEN category = 'Grocery' THEN '$'
        WHEN category = 'Fashion' THEN '$$$'
        ELSE '$$'
    END,
    rating = 4.5,
    review_count = 0,
    follower_count = 0,
    view_count = 0,
    booking_count = 0,
    is_verified = verified,
    is_featured = CASE 
        WHEN name = 'Neon Gaming Zone' THEN true
        ELSE false
    END,
    is_promoted = false,
    seo_title = name,
    seo_description = description;

-- Step 3: Create new tables (from main schema)
-- These will be created after the migration

-- Create users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
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
    preferences JSONB DEFAULT '{}',
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

-- Create other new tables
CREATE TABLE IF NOT EXISTS business_reels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    duration_seconds INTEGER,
    orientation VARCHAR(10) DEFAULT 'vertical' CHECK (orientation IN ('vertical', 'horizontal')),
    music_track_id UUID REFERENCES music_tracks(id) ON DELETE SET NULL,
    hashtags TEXT[],
    tagged_businesses UUID[] REFERENCES businesses(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS offers (
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
    click_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'paused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create other supporting tables
CREATE TABLE IF NOT EXISTS music_tracks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    audio_url TEXT NOT NULL,
    duration_seconds INTEGER,
    is_trending BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
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
    sentiment_score DECIMAL(3, 2),
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'flagged')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, business_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS businesses_location_idx ON businesses USING GIST (ST_Point(location_lng, location_lat));
CREATE INDEX IF NOT EXISTS businesses_category_idx ON businesses(category);
CREATE INDEX IF NOT EXISTS businesses_rating_idx ON businesses(rating DESC);
CREATE INDEX IF NOT EXISTS businesses_verified_idx ON businesses(is_verified) WHERE is_verified = TRUE;

-- Step 4: Create sample data for new features
INSERT INTO music_tracks (title, artist, audio_url, duration_seconds, is_trending) VALUES
('Trending Beat', 'Biz Gallery AI', 'https://example.com/audio1.mp3', 120, true),
('Chill Vibes', 'Biz Gallery AI', 'https://example.com/audio2.mp3', 90, false),
('Upbeat Energy', 'Biz Gallery AI', 'https://example.com/audio3.mp3', 150, false);

-- Create sample reels for existing businesses
INSERT INTO business_reels (business_id, video_url, thumbnail_url, caption, duration_seconds, hashtags, views_count, likes_count, status) 
SELECT 
    id,
    'https://sample-videos.com/reel1.mp4',
    'https://sample-images.com/thumb1.jpg',
    CASE 
        WHEN name = 'Neon Gaming Zone' THEN 'Check out our latest gaming setup! 🎮'
        WHEN name = 'Organic Roots' THEN 'Fresh organic produce delivered daily! 🥬'
        WHEN name = 'Style Stitches' THEN 'Bespoke tailoring at its finest! 👔'
        ELSE 'Amazing products and services! ✨'
    END,
    30,
    CASE 
        WHEN name = 'Neon Gaming Zone' THEN ARRAY['gaming', 'electronics', 'setup']
        WHEN name = 'Organic Roots' THEN ARRAY['organic', 'grocery', 'healthy']
        WHEN name = 'Style Stitches' THEN ARRAY['fashion', 'tailoring', 'bespoke']
        ELSE ARRAY[category]
    END,
    150, 25, 8, 0, 'published'
FROM businesses 
WHERE name IN ('Neon Gaming Zone', 'Organic Roots', 'Style Stitches');

-- Create sample offers
INSERT INTO offers (business_id, title, description, discount_percent, original_price, offer_price, offer_type, quantity_available, expiry_time, is_featured, status) 
SELECT 
    id,
    CASE 
        WHEN name = 'Neon Gaming Zone' THEN 'Weekend Gaming Tournament'
        WHEN name = 'Organic Roots' THEN 'Fresh Produce Sale'
        WHEN name = 'Style Stitches' THEN 'Custom Tailoring Package'
        ELSE 'Special Offer'
    END,
    CASE 
        WHEN name = 'Neon Gaming Zone' THEN 'Get 20% off on all gaming accessories this weekend only!'
        WHEN name = 'Organic Roots' THEN '30% off all organic vegetables'
        WHEN name = 'Style Stitches' THEN 'Free consultation with any tailoring order'
        ELSE 'Limited time offer'
    END,
    25, 999, 999, 'percentage', 50, NOW() + INTERVAL '7 days', true, 'active'
FROM businesses;

-- Step 5: Create views for performance
CREATE OR REPLACE VIEW public_businesses AS
SELECT 
    id, name, slug, description, category, subcategory, tags, address, location_lat, location_lng, city, state, country, postal_code, logo_url, cover_image_url, gallery, operating_hours, price_range, rating, review_count, follower_count, is_verified, is_featured, trust_score, response_time_minutes, last_active, status, seo_title, seo_description, social_links, created_at, updated_at
FROM businesses
WHERE status = 'active';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 Migration completed successfully!';
    RAISE NOTICE '📊 Your existing businesses have been upgraded to the new Biz Gallery schema';
    RAISE NOTICE '🚀 You can now run: npm run dev';
END $$;
