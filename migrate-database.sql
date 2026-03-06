-- ============================================
-- BIZ GALLERY - DATABASE MIGRATION
-- ============================================
-- Run this script to drop existing tables and recreate with new schema

-- Drop existing tables (WARNING: This will delete all data!)
DROP TABLE IF EXISTS CASCADE users;
DROP TABLE IF EXISTS CASCADE businesses;
DROP TABLE IF EXISTS CASCADE business_reels;
DROP TABLE IF EXISTS CASCADE ai_generated_reels;
DROP TABLE IF EXISTS CASCADE offers;
DROP TABLE IF EXISTS CASCADE offer_redemptions;
DROP TABLE IF EXISTS CASCADE reviews;
DROP TABLE IF EXISTS CASCADE review_votes;
DROP TABLE IF EXISTS CASCADE follows;
DROP TABLE IF EXISTS CASCADE bookmarks;
DROP TABLE IF EXISTS CASCADE services;
DROP TABLE IF EXISTS CASCADE bookings;
DROP TABLE IF EXISTS CASCADE conversations;
DROP TABLE IF EXISTS CASCADE messages;
DROP TABLE IF EXISTS CASCADE user_behaviors;
DROP TABLE IF EXISTS CASCADE recommendations;
DROP TABLE IF EXISTS CASCADE referrals;
DROP TABLE IF EXISTS CASCADE influencer_collaborations;
DROP TABLE IF EXISTS CASCADE voice_search_logs;
DROP TABLE IF EXISTS CASCADE credits;
DROP TABLE IF EXISTS CASCADE business_subscriptions;
DROP TABLE IF EXISTS CASCADE music_tracks;
DROP TABLE IF EXISTS CASCADE reel_interactions;
DROP TABLE IF EXISTS CASCADE trust_scores;
DROP TABLE IF EXISTS CASCADE business_analytics;
DROP TABLE IF EXISTS CASCADE trending_businesses;
DROP TABLE IF EXISTS CASCADE viral_content;
DROP TABLE IF EXISTS CASCADE marketing_campaigns;
DROP TABLE IF EXISTS CASCADE subscription_plans;
DROP TABLE IF EXISTS CASCADE audit_logs;

-- Now run the main schema (copy contents from database-schema.sql)
-- [Paste the complete schema from database-schema.sql here]

-- After running this, run the rls-policies.sql file
