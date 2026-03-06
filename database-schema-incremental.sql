-- ============================================
-- BIZ GALLERY - INCREMENTAL SCHEMA
-- ============================================
-- Use this if you want to add new tables without resetting existing data

-- Check if core tables exist, create if not
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

-- Add new columns to existing users table if they don't exist
DO $$
BEGIN
    -- Add creator economy columns to users
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'influencer_tier'
    ) THEN
        ALTER TABLE users ADD COLUMN influencer_tier VARCHAR(20) DEFAULT 'none' CHECK (influencer_tier IN ('none', 'micro', 'macro', 'celebrity'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'trust_score'
    ) THEN
        ALTER TABLE users ADD COLUMN trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'notification_settings'
    ) THEN
        ALTER TABLE users ADD COLUMN notification_settings JSONB DEFAULT '{"push": true, "email": true, "sms": false}';
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIST (ST_Point(location_lng, location_lat));

-- Add PostGIS extension if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'postgis'
    ) THEN
        CREATE EXTENSION IF NOT EXISTS "postgis";
    END IF;
END $$;
