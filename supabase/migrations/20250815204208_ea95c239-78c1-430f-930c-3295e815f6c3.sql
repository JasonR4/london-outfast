-- Fix the blog post cover image path to use public folder
UPDATE blog_posts 
SET cover_image_url = '/images/blog/48-sheet-billboard.jpg'
WHERE slug = 'london-ooh-complete-guide-2025';