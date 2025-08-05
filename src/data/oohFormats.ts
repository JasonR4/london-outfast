export interface OOHFormat {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  physicalSize?: string;
  placement: string;
  type: 'static' | 'digital';
  dwellTime: string;
  audienceProfile: string;
  effectiveness: string;
  networks: string[];
  priceRange: string;
  whoUsesIt: string[];
  londonCoverage: string;
  metaTitle: string;
  metaDescription: string;
  heroImage?: string;
}

export const oohFormats: OOHFormat[] = [
  // Classic & Digital Roadside
  {
    id: "48-sheet",
    slug: "48-sheet-billboard",
    name: "48 Sheet Billboard Advertising",
    shortName: "48 Sheet",
    category: "Classic & Digital Roadside",
    description: "48 sheet billboards are London's most visible large-format roadside advertising solution. Available in both classic paper and digital (D48) formats, these premium sites deliver maximum impact across major commuter routes and high-traffic corridors.",
    physicalSize: "6m x 3m (20ft x 10ft)",
    placement: "Roadside locations, major arterial routes, commuter corridors",
    type: "static",
    dwellTime: "3-5 seconds at traffic lights, longer at slower speeds",
    audienceProfile: "Commuters, motorists, pedestrians in high-traffic areas",
    effectiveness: "Ideal for brand awareness, product launches, and mass-market campaigns targeting London's 8.9 million residents",
    networks: ["Clear Channel", "JCDecaux", "Global", "Primesight"],
    priceRange: "£800-£3,500 per week depending on location and format",
    whoUsesIt: ["Automotive brands", "Fashion retailers", "Entertainment venues", "Financial services", "Food & beverage brands", "Property developers"],
    londonCoverage: "Available across all 32 London boroughs with premium sites in zones 1-3 and strategic commuter routes",
    metaTitle: "48 Sheet Billboard Advertising in London | Media Buying London",
    metaDescription: "Book 48 sheet billboard advertising in London at unbeatable rates. Classic and digital D48 formats available across all zones. Fast quotes, best prices guaranteed."
  },
  {
    id: "digital-48",
    slug: "digital-48-sheet",
    name: "Digital 48 Sheet Advertising",
    shortName: "Digital 48 (D48)",
    category: "Classic & Digital Roadside",
    description: "Digital 48 sheets (D48s) are premium large-format digital billboards positioned on London's busiest roadside locations. With dynamic creative rotation, daypart targeting, and real-time campaign updates, D48s deliver unmatched flexibility and impact.",
    physicalSize: "6m x 3m (20ft x 10ft) LED display",
    placement: "Premium roadside locations, major junctions, shopping centres",
    type: "digital",
    dwellTime: "10-second creative loops with high repeat exposure",
    audienceProfile: "Affluent commuters, shoppers, business travelers",
    effectiveness: "Perfect for time-sensitive campaigns, product launches, and brands requiring creative flexibility with measurable impact",
    networks: ["Clear Channel", "JCDecaux", "Global", "Ocean Outdoor"],
    priceRange: "£1,500-£8,000 per week depending on location and campaign duration",
    whoUsesIt: ["Luxury brands", "Tech companies", "Streaming services", "Fashion retailers", "Automotive launches", "Event promotions"],
    londonCoverage: "Strategic premium sites across central London, major shopping districts, and key commuter arteries",
    metaTitle: "Digital 48 Sheet (D48) Advertising in London | Media Buying London",
    metaDescription: "Book digital 48 sheet billboard advertising in London. D48 screens with dynamic content, daypart targeting. Premium roadside locations, fast quotes."
  },
  {
    id: "6-sheet-tube",
    slug: "6-sheet-tube-panel",
    name: "6 Sheet Tube Panel Advertising",
    shortName: "6 Sheet Tube Panel",
    category: "London Underground (TfL)",
    description: "6 sheet tube panels (LT Panels) are strategically positioned at London Underground station entrances, exits, and platform areas. These high-impact formats capture commuters at key decision points in their journey.",
    physicalSize: "1200mm x 1800mm",
    placement: "Underground station entrances, exits, platform concourses",
    type: "static",
    dwellTime: "5-15 seconds during station navigation",
    audienceProfile: "London commuters, tourists, business travelers",
    effectiveness: "Excellent for local business promotion, service advertising, and capturing the attention of London's 5 million daily tube users",
    networks: ["TfL Media", "Exterion Media"],
    priceRange: "£150-£800 per panel per week depending on station footfall",
    whoUsesIt: ["Local services", "Universities", "Healthcare providers", "Retail chains", "Professional services", "Entertainment venues"],
    londonCoverage: "Available across 270+ Underground stations spanning all London zones",
    metaTitle: "6 Sheet Tube Panel Advertising in London | Media Buying London",
    metaDescription: "Advertise on London Underground with 6 sheet tube panels. Station entrance & platform advertising across 270+ stations. Best rates guaranteed."
  },
  {
    id: "digital-escalator",
    slug: "digital-escalator-panels",
    name: "Digital Escalator Panel Advertising",
    shortName: "Digital Escalator Panels (DEPs)",
    category: "London Underground (TfL)",
    description: "Digital Escalator Panels (DEPs) create immersive animated sequences visible to passengers during escalator journeys. These premium digital formats offer unparalleled creative opportunities in London's busiest underground stations.",
    physicalSize: "Multiple panel sequences creating continuous motion",
    placement: "Underground escalator tunnels at major stations",
    type: "digital",
    dwellTime: "30-60 seconds during escalator journey",
    audienceProfile: "High-frequency commuters, business professionals, tourists",
    effectiveness: "Exceptional for storytelling campaigns, brand building, and creating memorable experiences with captive audiences",
    networks: ["TfL Media"],
    priceRange: "£3,000-£15,000 per week depending on station and sequence length",
    whoUsesIt: ["Premium brands", "Entertainment companies", "Tech launches", "Financial services", "Luxury retailers", "Streaming platforms"],
    londonCoverage: "Available at major interchange stations including King's Cross, Oxford Circus, London Bridge, Canary Wharf",
    metaTitle: "Digital Escalator Panel Advertising in London | Media Buying London",
    metaDescription: "Book digital escalator panel advertising on London Underground. Premium DEP formats with animated sequences at major stations. Expert planning included."
  },
  {
    id: "bus-superside",
    slug: "bus-superside",
    name: "Bus Superside Advertising",
    shortName: "Bus Superside",
    category: "Bus Advertising",
    description: "Bus supersides are large-format advertisements displayed on the side of London's iconic red buses. These mobile billboards travel across the entire London network, delivering your message to millions of people daily.",
    physicalSize: "12.2m x 2.4m",
    placement: "Side panels of London buses",
    type: "static",
    dwellTime: "Extended exposure as buses travel through high street and residential areas",
    audienceProfile: "Cross-section of London population including commuters, shoppers, residents",
    effectiveness: "Ideal for brand awareness campaigns targeting diverse London audiences with high-frequency exposure across multiple boroughs",
    networks: ["Transport for London", "Exterion Media"],
    priceRange: "£800-£2,500 per bus per month depending on route and campaign duration",
    whoUsesIt: ["Consumer brands", "Retail chains", "Entertainment venues", "Food delivery services", "Fashion brands", "Public services"],
    londonCoverage: "City-wide coverage across all London bus routes reaching every borough and major destination",
    metaTitle: "Bus Superside Advertising in London | Media Buying London",
    metaDescription: "Advertise on London's red buses with superside panels. City-wide mobile billboard coverage across all routes. Fast quotes, competitive rates."
  },
  {
    id: "phone-kiosk",
    slug: "phone-kiosk-panels",
    name: "Phone Kiosk Panel Advertising",
    shortName: "Phone Kiosk Panels",
    category: "Street Furniture",
    description: "Phone kiosk panels and InLink digital screens provide high-street level advertising at pedestrian eye-level. These local advertising solutions are perfect for targeting specific London areas and communities.",
    physicalSize: "Various sizes from A2 to large format panels",
    placement: "High streets, shopping areas, transport hubs",
    type: "static",
    dwellTime: "2-5 seconds for pedestrians, longer at bus stops",
    audienceProfile: "Local residents, shoppers, commuters waiting for transport",
    effectiveness: "Excellent for local business promotion, hyperlocal targeting, and reaching specific London communities with relevant messaging",
    networks: ["Clear Channel", "JCDecaux", "Primesight"],
    priceRange: "£50-£300 per panel per week depending on location footfall",
    whoUsesIt: ["Local restaurants", "Estate agents", "Health services", "Community events", "Local retailers", "Professional services"],
    londonCoverage: "High street locations across all London boroughs with concentrated coverage in shopping districts",
    metaTitle: "Phone Kiosk Panel Advertising in London | Media Buying London",
    metaDescription: "Advertise on London phone kiosks and InLink panels. High street advertising at pedestrian level. Local targeting across all boroughs."
  },
  {
    id: "mega-6",
    slug: "mega-6-roadside",
    name: "Mega 6 Roadside Advertising",
    shortName: "Mega 6 (M6)",
    category: "Classic & Digital Roadside",
    description: "Mega 6 (M6) are premium large-format digital screens positioned at key roadside locations across London. These high-impact displays offer superior visibility and are ideal for brands seeking maximum presence.",
    physicalSize: "8m x 3m digital display",
    placement: "Premium roadside locations, major junctions, arterial routes",
    type: "digital",
    dwellTime: "8-10 second creative slots with high repeat viewership",
    audienceProfile: "Affluent commuters, business travelers, high-frequency road users",
    effectiveness: "Perfect for luxury brands, premium services, and campaigns requiring maximum visual impact with affluent audiences",
    networks: ["Global", "Ocean Outdoor"],
    priceRange: "£2,000-£10,000 per week depending on location and campaign duration",
    whoUsesIt: ["Luxury automotive", "Premium retail", "Financial services", "High-end hospitality", "Technology brands", "Professional services"],
    londonCoverage: "Select premium locations in central London and key business districts",
    metaTitle: "Mega 6 (M6) Roadside Advertising in London | Media Buying London",
    metaDescription: "Book Mega 6 digital roadside advertising in London. Premium large-format screens at key locations. Maximum impact for luxury brands."
  },
  {
    id: "96-sheet",
    slug: "96-sheet-billboard",
    name: "96 Sheet Billboard Advertising",
    shortName: "96 Sheet",
    category: "Classic & Digital Roadside",
    description: "96 sheet billboards are London's largest format roadside advertising solution. These massive displays command attention and deliver unparalleled impact for major brand campaigns and product launches.",
    physicalSize: "12m x 3m (40ft x 10ft)",
    placement: "Major roadside locations, arterial routes, gateway positions",
    type: "static",
    dwellTime: "5-8 seconds with high visibility from long distances",
    audienceProfile: "Mass market audiences, commuters, inter-city travelers",
    effectiveness: "Ideal for major brand campaigns, product launches, and achieving maximum awareness across London's diverse population",
    networks: ["Clear Channel", "Global", "Primesight"],
    priceRange: "£1,200-£5,000 per week depending on location prominence",
    whoUsesIt: ["Major brands", "Automotive launches", "Entertainment blockbusters", "Retail campaigns", "Technology companies", "Government campaigns"],
    londonCoverage: "Strategic locations on major routes entering and crossing London",
    metaTitle: "96 Sheet Billboard Advertising in London | Media Buying London",
    metaDescription: "Book 96 sheet billboard advertising in London. Largest format roadside displays for maximum impact. Premium locations, competitive rates."
  }
];

export const getFormatBySlug = (slug: string): OOHFormat | undefined => {
  return oohFormats.find(format => format.slug === slug);
};

export const getFormatsByCategory = (category: string): OOHFormat[] => {
  return oohFormats.filter(format => format.category === category);
};

export const getAllCategories = (): string[] => {
  return [...new Set(oohFormats.map(format => format.category))];
};