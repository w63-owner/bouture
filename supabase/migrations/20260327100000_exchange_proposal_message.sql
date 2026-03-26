-- Exchange proposal messages — rich cards in chat
-- Adds exchange_proposal message type + metadata JSONB column

-- ============================================================================
-- 1. Add exchange_proposal to message_type enum
-- ============================================================================

ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'exchange_proposal';

-- ============================================================================
-- 2. Add metadata JSONB column to messages
-- ============================================================================

ALTER TABLE messages ADD COLUMN IF NOT EXISTS metadata JSONB;

-- ============================================================================
-- 3. Update CHECK constraint to allow exchange_proposal type
-- ============================================================================

ALTER TABLE messages DROP CONSTRAINT content_or_image;

ALTER TABLE messages ADD CONSTRAINT content_or_image CHECK (
  (type = 'text' AND content IS NOT NULL AND LENGTH(content) > 0)
  OR (type = 'image' AND image_url IS NOT NULL)
  OR (type = 'exchange_proposal' AND metadata IS NOT NULL)
);
