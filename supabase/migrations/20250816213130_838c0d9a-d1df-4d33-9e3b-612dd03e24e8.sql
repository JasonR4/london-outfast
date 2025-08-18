UPDATE blog_posts 
SET content = jsonb_build_object('html', body_html)
WHERE slug = 'dooh-advertising-london' AND (content IS NULL OR content = '{}'::jsonb)