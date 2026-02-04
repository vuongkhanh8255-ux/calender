-- Timeline Tasks: Add status and position columns
-- Run this in your Supabase SQL Editor

-- Add status column for marking tasks as done/todo
ALTER TABLE timeline_tasks 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'todo';

-- Add position column for drag-and-drop ordering
ALTER TABLE timeline_tasks 
ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Optional: Set initial positions for existing tasks
UPDATE timeline_tasks 
SET position = 0 
WHERE position IS NULL;

-- Verify columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'timeline_tasks' 
  AND column_name IN ('status', 'position');
