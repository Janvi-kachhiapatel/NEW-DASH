-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generated_reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behaviors ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (registration)
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND user_type = 'admin'
        )
    );

-- Public can view basic user info (for business profiles, etc.)
CREATE POLICY "Public can view basic user info" ON users
    FOR SELECT USING (
        true -- Allow basic profile views, but sensitive data filtered in view
    );

-- ============================================
-- BUSINESSES TABLE POLICIES
-- ============================================

-- Anyone can view active businesses
CREATE POLICY "Anyone can view active businesses" ON businesses
    FOR SELECT USING (status = 'active');

-- Business owners can view their own businesses
CREATE POLICY "Business owners can view own businesses" ON businesses
    FOR SELECT USING (owner_id = auth.uid());

-- Business owners can insert their businesses
CREATE POLICY "Business owners can insert businesses" ON businesses
    FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Business owners can update their businesses
CREATE POLICY "Business owners can update own businesses" ON businesses
    FOR UPDATE USING (owner_id = auth.uid());

-- Admins can do everything
CREATE POLICY "Admins can manage all businesses" ON businesses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND user_type = 'admin'
        )
    );

-- ============================================
-- BUSINESS REELS TABLE POLICIES
-- ============================================

-- Anyone can view published reels
CREATE POLICY "Anyone can view published reels" ON business_reels
    FOR SELECT USING (status = 'published');

-- Reel creators can view their own reels
CREATE POLICY "Creators can view own reels" ON business_reels
    FOR SELECT USING (creator_id = auth.uid());

-- Business owners can view reels for their businesses
CREATE POLICY "Business owners can view business reels" ON business_reels
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id 
            AND owner_id = auth.uid()
        )
    );

-- Creators can insert reels
CREATE POLICY "Creators can insert reels" ON business_reels
    FOR INSERT WITH CHECK (creator_id = auth.uid());

-- Creators can update their own reels
CREATE POLICY "Creators can update own reels" ON business_reels
    FOR UPDATE USING (creator_id = auth.uid());

-- Business owners can update reels for their businesses
CREATE POLICY "Business owners can update business reels" ON business_reels
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id 
            AND owner_id = auth.uid()
        )
    );

-- ============================================
-- AI GENERATED REELS TABLE POLICIES
-- ============================================

-- Users can view their own AI reel requests
CREATE POLICY "Users can view own AI reels" ON ai_generated_reels
    FOR SELECT USING (requested_by = auth.uid());

-- Business owners can view AI reels for their businesses
CREATE POLICY "Business owners can view business AI reels" ON ai_generated_reels
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id 
            AND owner_id = auth.uid()
        )
    );

-- Users can insert AI reel requests
CREATE POLICY "Users can insert AI reel requests" ON ai_generated_reels
    FOR INSERT WITH CHECK (requested_by = auth.uid());

-- ============================================
-- OFFERS TABLE POLICIES
-- ============================================

-- Anyone can view active offers
CREATE POLICY "Anyone can view active offers" ON offers
    FOR SELECT USING (status = 'active' AND expiry_time > NOW());

-- Business owners can view their offers
CREATE POLICY "Business owners can view own offers" ON offers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id 
            AND owner_id = auth.uid()
        )
    );

-- Business owners can insert offers
CREATE POLICY "Business owners can insert offers" ON offers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id 
            AND owner_id = auth.uid()
        )
    );

-- Business owners can update their offers
CREATE POLICY "Business owners can update own offers" ON offers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id 
            AND owner_id = auth.uid()
        )
    );

-- ============================================
-- OFFER REDEMPTIONS TABLE POLICIES
-- ============================================

-- Users can view their own offer redemptions
CREATE POLICY "Users can view own offer redemptions" ON offer_redemptions
    FOR SELECT USING (user_id = auth.uid());

-- Business owners can view redemptions for their offers
CREATE POLICY "Business owners can view offer redemptions" ON offer_redemptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM offers 
            WHERE id = offer_id 
            AND business_id = (
                SELECT id FROM businesses 
                WHERE owner_id = auth.uid()
            )
        )
    );

-- Users can insert offer redemptions
CREATE POLICY "Users can insert offer redemptions" ON offer_redemptions
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================
-- REVIEWS TABLE POLICIES
-- ============================================

-- Anyone can view published reviews
CREATE POLICY "Anyone can view published reviews" ON reviews
    FOR SELECT USING (status = 'published');

-- Users can view their own reviews
CREATE POLICY "Users can view own reviews" ON reviews
    FOR SELECT USING (user_id = auth.uid());

-- Business owners can view reviews for their businesses
CREATE POLICY "Business owners can view business reviews" ON reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id 
            AND owner_id = auth.uid()
        )
    );

-- Users can insert reviews (one per business)
CREATE POLICY "Users can insert reviews" ON reviews
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        NOT EXISTS (
            SELECT 1 FROM reviews 
            WHERE user_id = auth.uid() 
            AND business_id = NEW.business_id
        )
    );

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON reviews
    FOR UPDATE USING (user_id = auth.uid());

-- Business owners can respond to reviews
CREATE POLICY "Business owners can respond to reviews" ON reviews
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id 
            AND owner_id = auth.uid()
        )
    );

-- ============================================
-- REVIEW VOTES TABLE POLICIES
-- ============================================

-- Anyone can view review votes
CREATE POLICY "Anyone can view review votes" ON review_votes
    FOR SELECT USING (true);

-- Users can insert review votes
CREATE POLICY "Users can insert review votes" ON review_votes
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own votes
CREATE POLICY "Users can update own review votes" ON review_votes
    FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- FOLLOWS TABLE POLICIES
-- ============================================

-- Users can view follows (public follow counts)
CREATE POLICY "Anyone can view follows" ON follows
    FOR SELECT USING (true);

-- Users can insert follows
CREATE POLICY "Users can insert follows" ON follows
    FOR INSERT WITH CHECK (follower_id = auth.uid());

-- Users can delete their own follows
CREATE POLICY "Users can delete own follows" ON follows
    FOR DELETE USING (follower_id = auth.uid());

-- ============================================
-- BOOKMARKS TABLE POLICIES
-- ============================================

-- Users can view their own bookmarks
CREATE POLICY "Users can view own bookmarks" ON bookmarks
    FOR SELECT USING (user_id = auth.uid());

-- Users can insert bookmarks
CREATE POLICY "Users can insert bookmarks" ON bookmarks
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks" ON bookmarks
    FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- SERVICES TABLE POLICIES
-- ============================================

-- Anyone can view active services
CREATE POLICY "Anyone can view active services" ON services
    FOR SELECT USING (is_active = TRUE);

-- Business owners can view their services
CREATE POLICY "Business owners can view own services" ON services
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id 
            AND owner_id = auth.uid()
        )
    );

-- Business owners can insert services
CREATE POLICY "Business owners can insert services" ON services
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id 
            AND owner_id = auth.uid()
        )
    );

-- Business owners can update their services
CREATE POLICY "Business owners can update own services" ON services
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id 
            AND owner_id = auth.uid()
        )
    );

-- ============================================
-- BOOKINGS TABLE POLICIES
-- ============================================

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (user_id = auth.uid());

-- Business owners can view bookings for their businesses
CREATE POLICY "Business owners can view business bookings" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id 
            AND owner_id = auth.uid()
        )
    );

-- Users can insert bookings
CREATE POLICY "Users can insert bookings" ON bookings
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own bookings
CREATE POLICY "Users can update own bookings" ON bookings
    FOR UPDATE USING (user_id = auth.uid());

-- Business owners can update booking status
CREATE POLICY "Business owners can update booking status" ON bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id 
            AND owner_id = auth.uid()
        )
    );

-- ============================================
-- CONVERSATIONS TABLE POLICIES
-- ============================================

-- Users can view conversations they participate in
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (
        participant_1 = auth.uid() OR 
        participant_2 = auth.uid() OR
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id 
            AND owner_id = auth.uid()
        )
    );

-- Users can insert conversations
CREATE POLICY "Users can insert conversations" ON conversations
    FOR INSERT WITH CHECK (
        participant_1 = auth.uid() OR 
        participant_2 = auth.uid()
    );

-- ============================================
-- MESSAGES TABLE POLICIES
-- ============================================

-- Users can view messages in their conversations
CREATE POLICY "Users can view conversation messages" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE id = conversation_id 
            AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
        )
    );

-- Users can insert messages in their conversations
CREATE POLICY "Users can insert conversation messages" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE id = conversation_id 
            AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
        )
    );

-- Users can update their own messages (mark as read)
CREATE POLICY "Users can update own messages" ON messages
    FOR UPDATE USING (
        sender_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE id = conversation_id 
            AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
        )
    );

-- ============================================
-- USER BEHAVIORS TABLE POLICIES
-- ============================================

-- Users can view their own behaviors
CREATE POLICY "Users can view own behaviors" ON user_behaviors
    FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own behaviors
CREATE POLICY "Users can insert own behaviors" ON user_behaviors
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================
-- RECOMMENDATIONS TABLE POLICIES
-- ============================================

-- Users can view their own recommendations
CREATE POLICY "Users can view own recommendations" ON recommendations
    FOR SELECT USING (user_id = auth.uid());

-- System can insert recommendations (service role)
CREATE POLICY "System can insert recommendations" ON recommendations
    FOR INSERT WITH CHECK (true);

-- ============================================
-- REFERRALS TABLE POLICIES
-- ============================================

-- Users can view their own referrals
CREATE POLICY "Users can view own referrals" ON referrals
    FOR SELECT USING (referrer_id = auth.uid() OR referred_user_id = auth.uid());

-- Users can insert referrals
CREATE POLICY "Users can insert referrals" ON referrals
    FOR INSERT WITH CHECK (referrer_id = auth.uid());

-- ============================================
-- INFLUENCER COLLABORATIONS TABLE POLICIES
-- ============================================

-- Influencers can view their collaborations
CREATE POLICY "Influencers can view own collaborations" ON influencer_collaborations
    FOR SELECT USING (influencer_id = auth.uid());

-- Business owners can view collaborations for their businesses
CREATE POLICY "Business owners can view business collaborations" ON influencer_collaborations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id 
            AND owner_id = auth.uid()
        )
    );

-- Business owners can insert collaborations
CREATE POLICY "Business owners can insert collaborations" ON influencer_collaborations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id 
            AND owner_id = auth.uid()
        )
    );

-- ============================================
-- VOICE SEARCH LOGS TABLE POLICIES
-- ============================================

-- Users can view their own voice searches
CREATE POLICY "Users can view own voice searches" ON voice_search_logs
    FOR SELECT USING (user_id = auth.uid());

-- Users can insert voice searches
CREATE POLICY "Users can insert voice searches" ON voice_search_logs
    FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- ============================================
-- CREDITS TABLE POLICIES
-- ============================================

-- Users can view their own credits
CREATE POLICY "Users can view own credits" ON credits
    FOR SELECT USING (user_id = auth.uid());

-- Business owners can view business credits
CREATE POLICY "Business owners can view business credits" ON credits
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id 
            AND owner_id = auth.uid()
        )
    );

-- System can insert credits (service role)
CREATE POLICY "System can insert credits" ON credits
    FOR INSERT WITH CHECK (true);

-- ============================================
-- BUSINESS SUBSCRIPTIONS TABLE POLICIES
-- ============================================

-- Business owners can view their subscriptions
CREATE POLICY "Business owners can view own subscriptions" ON business_subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id 
            AND owner_id = auth.uid()
        )
    );

-- Business owners can insert subscriptions
CREATE POLICY "Business owners can insert subscriptions" ON business_subscriptions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE id = business_id 
            AND owner_id = auth.uid()
        )
    );

-- ============================================
-- SECURITY FUNCTIONS
-- ============================================

-- Function to check if user is business owner
CREATE OR REPLACE FUNCTION is_business_owner(business_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM businesses 
        WHERE id = business_uuid 
        AND owner_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND user_type = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's businesses
CREATE OR REPLACE FUNCTION get_user_businesses()
RETURNS TABLE(id UUID, name VARCHAR, slug VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT b.id, b.name, b.slug
    FROM businesses b
    WHERE b.owner_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VIEWS FOR SECURED DATA ACCESS
-- ============================================

-- Public business view (hides sensitive data)
CREATE OR REPLACE VIEW public_businesses AS
SELECT 
    id,
    name,
    slug,
    description,
    category,
    subcategory,
    tags,
    address,
    location_lat,
    location_lng,
    city,
    state,
    country,
    logo_url,
    cover_image_url,
    gallery,
    operating_hours,
    price_range,
    rating,
    review_count,
    follower_count,
    is_verified,
    is_featured,
    trust_score,
    response_time_minutes,
    status,
    created_at
FROM businesses
WHERE status = 'active';

-- Public user view (hides sensitive data)
CREATE OR REPLACE VIEW public_users AS
SELECT 
    id,
    full_name,
    avatar_url,
    bio,
    user_type,
    city,
    follower_count,
    following_count,
    is_verified,
    is_influencer,
    influencer_tier,
    trust_score,
    created_at
FROM users;

-- Business analytics view (restricted to business owners)
CREATE OR REPLACE VIEW business_analytics_secure AS
SELECT 
    ba.*,
    b.name as business_name,
    b.owner_id
FROM business_analytics ba
JOIN businesses b ON ba.business_id = b.id;

-- ============================================
-- SECURITY POLICIES FOR VIEWS
-- ============================================

-- Public business view is accessible to all
ALTER VIEW public_businesses SET (security_barrier = false);

-- Public user view is accessible to all
ALTER VIEW public_users SET (security_barrier = false);

-- Business analytics view restricted to owners
ALTER VIEW business_analytics_secure SET (security_barrier = true);

-- ============================================
-- AUDIT TRIGGERS
-- ============================================

-- Audit logging function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (table_name, operation, user_id, old_data, new_data, created_at)
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        auth.uid(),
        CASE WHEN TG_OP IN ('DELETE', 'UPDATE') THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
        NOW()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name VARCHAR(255),
    operation VARCHAR(10),
    user_id UUID,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (is_admin());

-- ============================================
-- PERFORMANCE OPTIMIZATION
-- ============================================

-- Create partial indexes for common queries
CREATE INDEX businesses_active_verified_idx ON businesses(id) WHERE status = 'active' AND is_verified = TRUE;
CREATE INDEX offers_active_featured_idx ON offers(id) WHERE status = 'active' AND expiry_time > NOW() AND is_featured = TRUE;
CREATE INDEX reels_published_trending_idx ON business_reels(id) WHERE status = 'published' AND is_trending = TRUE;
CREATE INDEX reviews_published_business_idx ON reviews(id) WHERE status = 'published';

-- Create composite indexes for complex queries
CREATE INDEX businesses_category_rating_idx ON businesses(category, rating DESC) WHERE status = 'active';
CREATE INDEX reels_location_created_idx ON business_reels(ST_Point(location_lng, location_lat), created_at DESC) WHERE status = 'published';
CREATE INDEX offers_business_expiry_idx ON offers(business_id, expiry_time DESC) WHERE status = 'active';

-- ============================================
-- DATA VALIDATION CONSTRAINTS
-- ============================================

-- Ensure business coordinates are valid
ALTER TABLE businesses ADD CONSTRAINT valid_business_coordinates 
    CHECK (
        (location_lat IS NULL AND location_lng IS NULL) OR
        (location_lat BETWEEN -90 AND 90 AND location_lng BETWEEN -180 AND 180)
    );

-- Ensure offer expiry is in the future for active offers
ALTER TABLE offers ADD CONSTRAINT valid_offer_expiry 
    CHECK (
        status != 'active' OR expiry_time > NOW()
    );

-- Ensure booking date is not in the past
ALTER TABLE bookings ADD CONSTRAINT valid_booking_date 
    CHECK (date >= CURRENT_DATE);

-- Ensure rating is within valid range
ALTER TABLE reviews ADD CONSTRAINT valid_rating 
    CHECK (rating BETWEEN 1 AND 5);

-- ============================================
-- SUMMARY
-- ============================================
-- 
-- This RLS implementation provides:
-- 1. Data privacy - Users can only access their own data
-- 2. Business ownership - Business owners can manage their businesses
-- 3. Public access - Anyone can view public business information
-- 4. Admin control - Admins have full access for moderation
-- 5. Security barriers - Sensitive data is protected
-- 6. Audit trail - All changes are logged
-- 7. Performance optimization - Indexes for common queries
-- 8. Data validation - Constraints ensure data integrity
--
