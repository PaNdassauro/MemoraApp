-- Memora Database Schema
-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Photos table: Core entity for stored images
CREATE TABLE photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    storage_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    
    -- AI-generated metadata (category, tags, description, colors, objects)
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Vector embedding for semantic similarity search (1536 dimensions - OpenAI standard)
    embedding vector(1536),
    
    -- Constraints
    CONSTRAINT photos_storage_url_unique UNIQUE (storage_url)
);

-- Enable Row Level Security
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own photos
CREATE POLICY "Users can view own photos"
    ON photos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos"
    ON photos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos"
    ON photos FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
    ON photos FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX photos_user_id_idx ON photos(user_id);
CREATE INDEX photos_created_at_idx ON photos(created_at DESC);
CREATE INDEX photos_metadata_category_idx ON photos USING GIN ((metadata->'category'));
CREATE INDEX photos_metadata_tags_idx ON photos USING GIN ((metadata->'tags'));

-- Vector index for similarity search (IVFFlat - good for datasets < 1M rows)
-- Note: This index should be created AFTER inserting some data
-- CREATE INDEX photos_embedding_idx ON photos 
--     USING ivfflat (embedding vector_cosine_ops)
--     WITH (lists = 100);

-- Function to search photos by semantic similarity
CREATE OR REPLACE FUNCTION search_photos_by_embedding(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.8,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id uuid,
    file_name text,
    storage_url text,
    metadata jsonb,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.file_name,
        p.storage_url,
        p.metadata,
        1 - (p.embedding <=> query_embedding) AS similarity
    FROM photos p
    WHERE 
        p.user_id = auth.uid()
        AND p.embedding IS NOT NULL
        AND 1 - (p.embedding <=> query_embedding) > match_threshold
    ORDER BY p.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
