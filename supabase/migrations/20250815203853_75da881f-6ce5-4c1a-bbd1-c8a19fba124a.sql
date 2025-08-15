-- Associate the blog post with relevant media formats
WITH blog_post_data AS (
  SELECT id as post_id FROM blog_posts WHERE slug = 'london-ooh-complete-guide-2025'
),
relevant_formats AS (
  SELECT id as media_format_id FROM media_formats 
  WHERE format_slug LIKE '%billboard%' 
     OR format_slug LIKE '%underground%' 
     OR format_slug LIKE '%bus%'
     OR format_slug LIKE '%6-sheet%'
     OR format_slug LIKE '%48-sheet%'
     OR format_slug LIKE '%taxi%'
     OR format_slug LIKE '%airport%'
     OR format_slug LIKE '%rail%'
  LIMIT 15
)
INSERT INTO blog_post_media_formats (post_id, media_format_id)
SELECT bp.post_id, rf.media_format_id 
FROM blog_post_data bp
CROSS JOIN relevant_formats rf
ON CONFLICT DO NOTHING;