export interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  description?: string;
  githubUrl?: string;
  liveUrl?: string;
  dataUrl: string;
  date: string;
  sizeKb: string;
  isPermanent?: boolean;
}

// Specific IDs and Titles of any legacy placeholder sample projects to ignore
export const PLACEHOLDER_PROJECT_IDS = new Set<number>([
  1710000001,
  1710000002,
  1710000003,
  1710000004,
  1710000005,
  1710000006,
]);

export const PLACEHOLDER_PROJECT_TITLES = new Set<string>([
  'Kyoto Artisan Cafe & Roastery',
  'Siam Bistro Modern Dining Experience',
  'Marina Horizon Residences & Architecture',
  'Apex Prime Real Estate',
]);

// 12 Real Production Deliverables with verified live deployments and GitHub repositories
export const HARDCODED_PROJECTS: PortfolioItem[] = [
  {
    id: 101,
    title: 'Aurelle Estates Luxury',
    category: 'Real Estate',
    description: '- Context: A service business lacked an automated booking system, resulting in lost leads outside business hours. - Action: Designed and deployed a responsive web application featuring clean HTML/CSS UI components, client-side dynamic media optimization, and seamless booking integration. Result: Improved mobile response times by 40%, streamlined user navigation, and enabled 24/7 lead intake without backend overhead.',
    githubUrl: 'https://github.com/thunder-202/AurelleEstatesLuxuryRealestateInSydney/tree/main',
    liveUrl: 'https://aurelleestatesluxuryrealestateinsydney.onrender.com//',
    dataUrl: 'https://i.ibb.co.com/GKZ6Rqz/aurelle-estates-luxury-1.webp',
    date: '2026-03-15',
    sizeKb: '52.4',
    isPermanent: true,
  },
  {
    id: 102,
    title: 'Metro Auto Care',
    category: 'E-commerce',
    description: 'Context: Small retailers often struggle with slow page loads and complex backend setups when showcasing new product catalogs online. Action: Built a lightweight, fully responsive e-commerce front-end interface using clean HTML5, CSS3 layout techniques, and optimized asset handling. Result: Delivered a 100% static, fast-loading storefront template ready for direct hosting, minimizing server costs while ensuring smooth mobile performance.',
    githubUrl: 'https://github.com/thunder-202/MetroAutoCare/tree/main',
    liveUrl: 'https://metroautocare.onrender.com/',
    dataUrl: 'https://i.ibb.co.com/whdvK1GR/metro-auto-care.webp',
    date: '2026-03-12',
    sizeKb: '48.7',
    isPermanent: true,
  },
  {
    id: 103,
    title: 'Apex Auto Detailing',
    category: 'Custom Web',
    description: 'Context: A local service provider relied on manual phone calls for bookings, missing out on potential customers after operating hours. Action: Developed an intuitive front-end dashboard featuring clear call-to-action sections, structured navigation, and client-side form validation. Result: Reduced manual scheduling friction and provided a polished 24/7 digital touchpoint to boost client conversions.',
    githubUrl: 'https://github.com/thunder-202/ApexAutoDetailing/tree/main',
    liveUrl: 'https://apexautodetailing.onrender.com',
    dataUrl: 'https://i.ibb.co.com/B2BWDNDV/apex-auto-detailing.webp',
    date: '2026-03-10',
    sizeKb: '40.5',
    isPermanent: true,
  },
  {
    id: 104,
    title: 'Zenith Luxury Car Rentals',
    category: 'Custom Web',
    description: 'Context: A local service provider relied on manual phone calls for bookings, missing out on potential customers after operating hours. Action: Developed an intuitive front-end dashboard featuring clear call-to-action sections, structured navigation, and client-side form validation. Result: Reduced manual scheduling friction and provided a polished 24/7 digital touchpoint to boost client conversions.',
    githubUrl: 'https://github.com/thunder-202/ZenithLuxuryCarRentals/tree/main',
    liveUrl: 'https://zenithluxurycarrentals.onrender.com',
    dataUrl: 'https://i.ibb.co.com/3JzCSY0/zenith-luxury-car-rentals.webp',
    date: '2026-03-08',
    sizeKb: '56.4',
    isPermanent: true,
  },
  {
    id: 105,
    title: 'Apex Mechanics',
    category: 'E-commerce',
    description: 'Context: A local service provider relied on manual phone calls for bookings, missing out on potential customers after operating hours. Action: Developed an intuitive front-end dashboard featuring clear call-to-action sections, structured navigation, and client-side form validation. Result: Reduced manual scheduling friction and provided a polished 24/7 digital touchpoint to boost client conversions.',
    githubUrl: 'https://github.com/thunder-202/ApexMechanics-Performance/tree/main',
    liveUrl: 'https://apexmechanics-performance.onrender.com',
    dataUrl: 'https://i.ibb.co.com/pjmFxFP6/apex-mechanics.webp',
    date: '2026-03-05',
    sizeKb: '44.1',
    isPermanent: true,
  },
  {
    id: 106,
    title: 'Melbourne Property Co.',
    category: 'Real Estate',
    description: '- Context: A service business lacked an automated booking system, resulting in lost leads outside business hours. - Action: Designed and deployed a responsive web application featuring clean HTML/CSS UI components, client-side dynamic media optimization, and seamless booking integration. - Result: Improved mobile response times by 40%, streamlined user navigation, and enabled 24/7 lead intake without backend overhead.',
    githubUrl: 'https://github.com/thunder-202/NestoraPropertyCo.-MelbournePropertyDiscovery/tree/main',
    liveUrl: 'https://nestorapropertyco.onrender.com',
    dataUrl: 'https://i.ibb.co.com/MxHDswTG/melbourne-property-co.webp',
    date: '2026-02-28',
    sizeKb: '52.1',
    isPermanent: true,
  },
  {
    id: 107,
    title: 'Ember & Oak',
    category: 'Restaurants',
    description: 'Context: A local service provider relied on manual phone calls for bookings, missing out on potential customers after operating hours. Action: Developed an intuitive front-end dashboard featuring clear call-to-action sections, structured navigation, and client-side form validation. Result: Reduced manual scheduling friction and provided a polished 24/7 digital touchpoint to boost client conversions.',
    githubUrl: 'https://github.com/thunder-202/Ember-Oak-ContemporaryFineDiningMelbourne/tree/main',
    liveUrl: 'https://ember-oak-contemporaryfinediningmelbourne.onrender.com',
    dataUrl: 'https://i.ibb.co.com/ZRb5rrrh/ember-oak.webp',
    date: '2026-02-24',
    sizeKb: '43.8',
    isPermanent: true,
  },
  {
    id: 108,
    title: 'Sable & Steam',
    category: 'Cafes',
    description: 'Context: A local service provider relied on manual phone calls for bookings, missing out on potential customers after operating hours. Action: Developed an intuitive front-end dashboard featuring clear call-to-action sections, structured navigation, and client-side form validation. Result: Reduced manual scheduling friction and provided a polished 24/7 digital touchpoint to boost client conversions',
    githubUrl: 'https://github.com/thunder-202/SABLE-STEAM-SpecialtyCoffee-ArtisanCaf-/tree/main',
    liveUrl: 'https://sable-steam-specialtycoffee-artisancaf.onrender.com',
    dataUrl: 'https://i.ibb.co.com/XkYWjHjF/sable-steam.webp',
    date: '2026-02-20',
    sizeKb: '64.2',
    isPermanent: true,
  },
  {
    id: 109,
    title: 'Stack & Sizzle',
    category: 'Restaurants',
    description: 'Context: Small retailers often struggle with slow page loads and complex backend setups when showcasing new product catalogs online. Action: Built a lightweight, fully responsive e-commerce front-end interface using clean HTML5, CSS3 layout techniques, and optimized asset handling. Result: Delivered a 100% static, fast-loading storefront template ready for direct hosting, minimizing server costs while ensuring smooth mobile performance.',
    githubUrl: 'https://github.com/thunder-202/STACK-SIZZLE-CasualDining-GourmetBurgers/tree/main',
    liveUrl: 'https://stack-sizzle-casualdining-gourmetburgers.onrender.com',
    dataUrl: 'https://i.ibb.co.com/Yw6gqJ9/stack-sizzle.webp',
    date: '2026-02-15',
    sizeKb: '39.0',
    isPermanent: true,
  },
  {
    id: 110,
    title: 'Sunny Side Social',
    category: 'Cafee',
    description: 'Context: A local service provider relied on manual phone calls for bookings, missing out on potential customers after operating hours. Action: Developed an intuitive front-end dashboard featuring clear call-to-action sections, structured navigation, and client-side form validation. Result: Reduced manual scheduling friction and provided a polished 24/7 digital touchpoint to boost client conversions.',
    githubUrl: 'https://github.com/thunder-202/SunnySideSocial/tree/main',
    liveUrl: 'https://sunnysidesocial.onrender.com/',
    dataUrl: 'https://i.ibb.co.com/mr0xLTmH/sunny-side-social.webp',
    date: '2026-02-10',
    sizeKb: '58.9',
    isPermanent: true,
  },
  {
    id: 111,
    title: 'Velora',
    category: 'E-commerce',
    description: 'Context: Small retailers often struggle with slow page loads and complex backend setups when showcasing new product catalogs online. Action: Built a lightweight, fully responsive e-commerce front-end interface using clean HTML5, CSS3 layout techniques, and optimized asset handling. Result: Delivered a 100% static, fast-loading storefront template ready for direct hosting, minimizing server costs while ensuring smooth mobile performance.',
    githubUrl: 'https://github.com/thunder-202/VanguardAutoDealership',
    liveUrl: 'https://velora-contemporaryfashion-essentials.onrender.com/',
    dataUrl: 'https://i.ibb.co.com/G3VW7FT7/velora.webp',
    date: '2026-02-05',
    sizeKb: '36.7',
    isPermanent: true,
  },
  {
    id: 112,
    title: 'Venguard Auto Dealership',
    category: 'Custom Web',
    description: 'Context: A local service provider relied on manual phone calls for bookings, missing out on potential customers after operating hours. Action: Developed an intuitive front-end dashboard featuring clear call-to-action sections, structured navigation, and client-side form validation. Result: Reduced manual scheduling friction and provided a polished 24/7 digital touchpoint to boost client conversions.',
    githubUrl: 'https://github.com/thunder-202/VanguardAutoDealership/tree/main',
    liveUrl: 'https://vanguardautodealership.onrender.com',
    dataUrl: 'https://i.ibb.co.com/zTz00Nn6/venguard-auto-dealership.webp',
    date: '2026-01-28',
    sizeKb: '33.9',
    isPermanent: true,
  },
  {
    id: 113,
    title: 'TECHNEST',
    category: 'E-commerce',
    description: 'Context: Small retailers often struggle with slow page loads and complex backend setups when showcasing new product catalogs online. Action: Built a lightweight, fully responsive e-commerce front-end interface using clean HTML5, CSS3 layout techniques, and optimized asset handling. Result: Delivered a 100% static, fast-loading storefront template ready for direct hosting, minimizing server costs while ensuring smooth mobile performance.',
    githubUrl: 'http://github.com/thunder-202/TECHNEST---Modern-Electronics-Store/tree/main',
    liveUrl: 'https://technest-modern-electronics-store.onrender.com',
    dataUrl: 'https://i.ibb.co.com/svw3LtFy/Screenshot-from-2026-11-02-01-04-06.png',
    date: '2026-02-28',
    sizeKb: '29.9',
    isPermanent: true,
  },
  {
    id: 114,
   title: 'Curry Express Biggera Waters',
   category: 'Restaurant',
   description: 'A local service provider relied on manual phone calls for bookings, missing out on potential customers after operating hours. Action: Developed an intuitive front-end dashboard featuring clear call-to-action sections, structured navigation, and client-side form validation. Result: Reduced manual scheduling friction and provided a polished 24/7 digital touchpoint to boost client conversions.',
   liveUrl: 'https://72c2f1ec.curry-express-biggera-waters.pages.dev/',
   dataUrl: 'https://i.ibb.co.com/kV4jDswJ/optimized-image-1.webp',
   date: '2026-03-05',
   sizeKb: '48.5',
   isPermanent: true,
   }
];

// Initial default items guaranteed to render statically on any external visitor/reviewer load
export const INITIAL_PORTFOLIO_ITEMS: PortfolioItem[] = HARDCODED_PROJECTS;
