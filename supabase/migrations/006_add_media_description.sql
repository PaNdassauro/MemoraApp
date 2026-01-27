-- Migration: Add description to media_assets
-- Description: Adds a description column for AI-generated text

ALTER TABLE media_assets 
ADD COLUMN IF NOT EXISTS description TEXT;
