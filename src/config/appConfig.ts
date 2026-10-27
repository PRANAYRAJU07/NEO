import { AAICSupportContact } from '../types';

export const APP_CONFIG = {
  name: 'NEO – Face the Future',
  tagline: 'Australian Anti Ice Campaign (AAIC)',
  slogans: {
    primary: 'ICE — NOT EVEN ONCE',
    secondary: 'CHOOSE LIFE SO THAT YOU MAY LIVE',
  },
  disclaimer: {
    title: 'Educational Visual Simulation Only',
    short: 'All facial transformations are fictional educational illustrations, NOT predictive medical forecasts of any individual\'s future appearance.',
    full: 'This educational tool is developed for the Australian Anti Ice Campaign (AAIC). All visual representations are simulated artistic illustrations designed solely for substance abuse prevention education. Biological responses vary significantly among individuals. This application does not diagnose, predict, or guarantee individual physical outcomes, and should never be interpreted as clinical advice.',
    ethics: 'AAIC is committed to evidence-based education without sensationalism, degradation, or stigmatisation.',
  },
  privacy: {
    title: 'Your Privacy Is Protected',
    bullets: [
      '100% On-Device Processing: Photos are processed entirely inside your web browser.',
      'No Uploads: Your selfie is NEVER uploaded to any cloud server, AI API, or remote database.',
      'No Storage: Images are kept in temporary browser memory only and never saved to permanent disk storage.',
      'Instant Reset: Clicking "Reset" or navigating away instantly purges all images and memory buffers.',
      'Optional Participation: You can fully experience NEO using our sample avatars without using your own photo.',
    ],
  },
  imageLimits: {
    maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    minDimension: 180, // pixels
    maxDimension: 4096, // pixels
    standardProcessingDimension: 768, // scaled for mobile memory safety
  },
  stages: [
    {
      stage: 1 as const,
      label: 'Early Impact (Stage 1)',
      period: '6 – 12 Months',
      title: 'Loss of Vitality & Dehydration',
      description: 'Loss of natural skin glow, subtle dark circles from persistent sleep deprivation, and reduced skin hydration as the stimulant taxes the nervous and vascular systems.',
      bullets: [
        'Subtle dark circles from irregular sleep cycles',
        'Initial reduction in dermal moisture and natural glow',
        'Mild vascular constriction and pale undertones',
        'Early signs of systemic physical and neurological strain',
        'Loss of youthful facial freshness and clarity',
      ],
    },
    {
      stage: 2 as const,
      label: 'Progressive Strain (Stage 2)',
      period: '2 – 3 Years',
      title: 'Vascular Strain & Facial Hollows',
      description: 'More pronounced gauntness around cheeks and temples, persistent dull complexion, increased skin blemishes due to chronic poor circulation and immune suppression.',
      bullets: [
        'Noticeable gauntness around cheeks and temple hollows',
        'Prominent dark periorbital circles and tired appearance',
        'Dull, sallow skin tone and reduced dermal elasticity',
        'Occasional skin blemishes from suppressed immune function',
        'Cumulative physical exhaustion and weight reduction',
      ],
    },
    {
      stage: 3 as const,
      label: 'Chronic Impact (Stage 3)',
      period: '4+ Years',
      title: 'Advanced Systemic Toll',
      description: 'Prolonged ice use is associated with significant physical and mental health deterioration. This stage illustrates potential visible effects based on clinical and real-world research.',
      bullets: [
        'Noticeable facial weight loss and hollowing',
        'Increased skin blemishes, sores and uneven skin texture',
        'Premature aging and deeper under-eye circles',
        'Duller complexion and reduced skin elasticity',
        'Greater overall fatigue and physical decline',
      ],
    },
  ],
  healthyAspects: [
    {
      title: 'Natural Radiance & Collagen',
      description: 'Healthy sleep and hydration maintain vibrant, elastic skin tone, clear eyes, and youthful facial volume.',
    },
    {
      title: 'Mental Clarity & Expression',
      description: 'Freedom from addiction preserves natural emotional expressiveness, warmth, and cognitive resilience.',
    },
    {
      title: 'Community, Purpose & Future',
      description: 'Protecting your mind and body keeps doors open to sports, arts, study, careers, and meaningful relationships.',
    },
  ],
};

export const AAIC_CONTACTS: AAICSupportContact[] = [
  {
    id: 'aaic-official',
    name: 'Australian Anti Ice Campaign (AAIC)',
    phone: '1300 424 238',
    website: 'https://aaic.org.au',
    description: 'National grassroots campaign educating Australian youth, families, and communities about the realities of crystal methamphetamine (ice).',
    operatingHours: 'Monday – Friday, 9:00 AM – 5:00 PM AEST',
    category: 'campaign',
    isVerified: true,
    verificationNotes: 'Official AAIC primary contact number & website verified against AAIC public registry.',
    tollFree: true,
  },
  {
    id: 'national-drug-hotline',
    name: 'National Alcohol and Other Drug Hotline',
    phone: '1800 250 015',
    website: 'https://www.health.gov.au',
    description: 'Free, confidential support and advice for anyone in Australia affected by alcohol or other drugs.',
    operatingHours: '24 Hours / 7 Days a week',
    category: 'addiction',
    isVerified: true,
    verificationNotes: 'Australian Government Department of Health national hotline.',
    tollFree: true,
  },
  {
    id: 'kids-helpline',
    name: 'Kids Helpline',
    phone: '1800 55 1800',
    website: 'https://kidshelpline.com.au',
    description: 'Australia’s only free, private and confidential 24/7 phone and online counselling service for young people aged 5 to 25.',
    operatingHours: '24 Hours / 7 Days a week',
    category: 'youth',
    isVerified: true,
    verificationNotes: 'Official national youth counselling registry verified.',
    tollFree: true,
  },
  {
    id: 'lifeline',
    name: 'Lifeline Australia',
    phone: '13 11 14',
    website: 'https://www.lifeline.org.au',
    description: 'National 24/7 crisis support and suicide prevention services.',
    operatingHours: '24 Hours / 7 Days a week',
    category: 'crisis',
    isVerified: true,
    verificationNotes: 'National crisis hotline verified.',
    tollFree: false,
  },
  {
    id: 'headspace',
    name: 'headspace (National Youth Mental Health Foundation)',
    phone: '1800 650 890',
    website: 'https://headspace.org.au',
    description: 'Tailored mental health and wellbeing support for young Australians aged 12 to 25.',
    operatingHours: '9:00 AM – 1:00 AM AEST, 7 Days',
    category: 'youth',
    isVerified: true,
    verificationNotes: 'headspace national registry verified.',
    tollFree: true,
  },
];
