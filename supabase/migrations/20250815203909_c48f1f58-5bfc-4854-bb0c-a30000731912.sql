-- Associate the London OOH blog post with relevant media formats
WITH blog_post_data AS (
  SELECT id as post_id FROM blog_posts WHERE slug = 'london-ooh-complete-guide-2025'
),
relevant_formats AS (
  SELECT id as media_format_id 
  FROM media_formats 
  WHERE format_slug IN (
    '48-sheet-billboard', 
    'digital-48-sheet',
    '6-sheet-underground',
    '16-sheet-underground',
    'bus-advertising',
    'taxi-advertising',
    'digital-6-sheet'
  ) 
  AND is_active = true
)
INSERT INTO blog_post_media_formats (post_id, media_format_id)
SELECT bp.post_id, rf.media_format_id 
FROM blog_post_data bp
CROSS JOIN relevant_formats rf
ON CONFLICT DO NOTHING;