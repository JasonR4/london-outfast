-- Add legal pages back with proper structure for iframe scroller
INSERT INTO public.content_pages (slug, title, meta_description, content, status, page_type, created_by, updated_by) VALUES
(
  'privacy-policy',
  'Privacy Policy - Media Buying London',
  'Privacy policy for Media Buying London OOH advertising services. How we collect, use, and protect your personal information.',
  '{
    "sections": [
      {
        "heading": "Introduction",
        "content": "This Privacy Policy describes how Media Buying London (\"we\", \"our\", or \"us\") collects, uses, and protects your personal information when you use our out-of-home advertising services."
      },
      {
        "heading": "Information We Collect",
        "content": "We collect information you provide directly to us, such as when you create an account, request a quote, or contact us for support. This may include your name, email address, phone number, company information, and advertising requirements."
      },
      {
        "heading": "How We Use Your Information",
        "content": "We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and communicate with you about products, services, and promotional offers."
      },
      {
        "heading": "Information Sharing",
        "content": "We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy or as required by law."
      },
      {
        "heading": "Data Security",
        "content": "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction."
      },
      {
        "heading": "Contact Us",
        "content": "If you have any questions about this Privacy Policy, please contact us at privacy@mediabuyinglondon.co.uk or call us at 020 7946 0465."
      }
    ]
  }',
  'published',
  'ooh_format',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'terms-of-service',
  'Terms of Service - Media Buying London',
  'Terms of service for Media Buying London OOH advertising agency. Service agreements and conditions for our advertising solutions.',
  '{
    "sections": [
      {
        "heading": "Acceptance of Terms",
        "content": "By accessing and using Media Buying London services, you accept and agree to be bound by the terms and provision of this agreement."
      },
      {
        "heading": "Services Description",
        "content": "Media Buying London provides out-of-home advertising services including campaign planning, media buying, creative services, and campaign management across London and the UK."
      },
      {
        "heading": "Client Responsibilities",
        "content": "Clients are responsible for providing accurate campaign briefs, timely approval of creative materials, and payment of agreed fees. All content must comply with UK advertising standards and regulations."
      },
      {
        "heading": "Payment Terms",
        "content": "Payment terms are Net 30 days from invoice date unless otherwise agreed. Late payments may incur interest charges. Campaign costs are due in advance of campaign start dates."
      },
      {
        "heading": "Cancellation Policy",
        "content": "Campaign cancellations must be provided in writing. Cancellation fees may apply depending on the timing and media commitments already made."
      },
      {
        "heading": "Limitation of Liability",
        "content": "Media Buying London liability is limited to the value of services provided. We are not liable for indirect, consequential, or punitive damages."
      },
      {
        "heading": "Governing Law",
        "content": "These terms are governed by the laws of England and Wales. Any disputes will be subject to the jurisdiction of English courts."
      }
    ]
  }',
  'published',
  'ooh_format',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'cookie-policy',
  'Cookie Policy - Media Buying London',
  'Cookie policy explaining how Media Buying London uses cookies and similar technologies on our website.',
  '{
    "sections": [
      {
        "heading": "What Are Cookies",
        "content": "Cookies are small text files that are placed on your computer or mobile device when you visit our website. They help us provide you with a better experience by remembering your preferences and analyzing how our site is used."
      },
      {
        "heading": "How We Use Cookies",
        "content": "We use cookies for essential site functionality, performance analytics, and to improve user experience. This includes remembering your preferences, analyzing site traffic, and ensuring our services work properly."
      },
      {
        "heading": "Types of Cookies We Use",
        "content": "Essential cookies: Required for basic site functionality. Analytics cookies: Help us understand how visitors use our site. Functional cookies: Remember your preferences and settings."
      },
      {
        "heading": "Managing Cookies",
        "content": "You can control and manage cookies through your browser settings. However, disabling certain cookies may affect the functionality of our website."
      },
      {
        "heading": "Updates to This Policy",
        "content": "We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date."
      }
    ]
  }',
  'published',
  'ooh_format',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'disclaimer',
  'Disclaimer - Media Buying London',
  'Legal disclaimer for Media Buying London advertising services and website content.',
  '{
    "sections": [
      {
        "heading": "General Information",
        "content": "The information on this website is provided for general informational purposes only. While we strive to keep the information accurate and up-to-date, we make no representations or warranties of any kind about the completeness, accuracy, or reliability of the information."
      },
      {
        "heading": "Professional Advice",
        "content": "The content on this website should not be considered as professional advertising advice for specific campaigns. We recommend consulting with our team for personalized recommendations based on your specific requirements."
      },
      {
        "heading": "External Links",
        "content": "Our website may contain links to external sites. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services."
      },
      {
        "heading": "Pricing Information",
        "content": "Pricing information provided on this website is indicative and subject to change. Final pricing will be confirmed in written quotations based on specific campaign requirements."
      },
      {
        "heading": "Limitation of Liability",
        "content": "Under no circumstance shall Media Buying London be liable for any direct, indirect, special, incidental, or consequential damages arising from the use of this website or our services."
      }
    ]
  }',
  'published',
  'ooh_format',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
);