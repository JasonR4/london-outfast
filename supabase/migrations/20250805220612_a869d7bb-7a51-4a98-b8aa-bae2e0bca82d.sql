-- Add description text to existing general industry pages

-- Automotive
UPDATE content_pages 
SET content = jsonb_set(
  content,
  '{description}',
  '"🚗 Automotive\nFrom EV rollouts to dealership offers, the automotive sector thrives on OOH visibility. Whether you''re promoting a new model, finance package or booking test drives, our media buying puts your brand in front of drivers, passengers and high-intent buyers. We place ads across roadside billboards, petrol stations, high-traffic junctions and commuter routes — including D48s, bus rears and rail station formats. We can also target by postcode or proximity to dealerships. Whether you''re a manufacturer, franchise group, or auto service brand, we''ll get your message seen in the moments that matter."'::jsonb
)
WHERE slug = 'automotive' AND page_type = 'general';

-- Education
UPDATE content_pages 
SET content = jsonb_set(
  content,
  '{description}',
  '"🧪 Education & Training\nColleges, universities, bootcamps and training providers all need attention — fast. We help education brands connect with future students in a smart, scalable way using out-of-home advertising. Whether you''re promoting open days, course intakes, apprenticeships or short-form training, we plan and buy media that targets the right areas — from student-heavy zones to career-changer commutes. Use digital screens, bus rears, Tube car panels and more to position your institution in the right minds. If you want to recruit, enrol or upskill — we''ll help you get seen."'::jsonb
)
WHERE slug = 'education' AND page_type = 'general';

-- Recruitment
UPDATE content_pages 
SET content = jsonb_set(
  content,
  '{description}',
  '"🎓 Recruitment & Careers\nFrom NHS hiring pushes to local apprenticeships and white-collar job boards, OOH is a proven way to drive applications and build employer brand. We help recruitment agencies, employers and institutions plan highly targeted campaigns across specific boroughs, commuter zones and high-footfall areas. Use digital or static formats to showcase your employer proposition, drive website traffic or push QR-based applications. Whether you''re filling a cohort or building a pipeline, we''ll help you get the right eyes on the right message — fast."'::jsonb
)
WHERE slug = 'recruitment' AND page_type = 'general';