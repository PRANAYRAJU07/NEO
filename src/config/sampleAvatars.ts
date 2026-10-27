import { SampleAvatar } from '../types';

// High-fidelity, self-contained SVG portrait avatars for testing and student opt-out mode
const createAvatarSvg = (skin: string, hair: string, eye: string, shirt: string, hairStyle: 'short' | 'curly' | 'long', name: string) => {
  const encoded = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <defs>
        <radialGradient id="bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </radialGradient>
        <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${skin}"/>
          <stop offset="100%" stop-color="${skin}" stop-opacity="0.9"/>
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#bg)"/>
      <!-- Shoulders & Shirt -->
      <path d="M100 370 C 120 280, 280 280, 300 370 L 320 400 L 80 400 Z" fill="${shirt}"/>
      <!-- Neck -->
      <rect x="175" y="240" width="50" height="60" rx="8" fill="${skin}"/>
      <!-- Face Oval -->
      <ellipse cx="200" cy="180" rx="75" ry="95" fill="url(#skinGrad)"/>
      <!-- Ears -->
      <circle cx="123" cy="180" r="14" fill="${skin}"/>
      <circle cx="277" cy="180" r="14" fill="${skin}"/>
      <!-- Eyes -->
      <ellipse cx="170" cy="170" rx="12" ry="7" fill="#ffffff"/>
      <circle cx="170" cy="170" r="5" fill="${eye}"/>
      <circle cx="172" cy="168" r="1.5" fill="#ffffff"/>
      <ellipse cx="230" cy="170" rx="12" ry="7" fill="#ffffff"/>
      <circle cx="230" cy="170" r="5" fill="${eye}"/>
      <circle cx="232" cy="168" r="1.5" fill="#ffffff"/>
      <!-- Eyebrows -->
      <path d="M155 152 Q 170 148 185 153" stroke="${hair}" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M215 153 Q 230 148 245 152" stroke="${hair}" stroke-width="4" stroke-linecap="round" fill="none"/>
      <!-- Nose -->
      <path d="M198 175 L 195 200 L 206 200" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <!-- Mouth -->
      <path d="M185 230 Q 200 240 215 230" stroke="#b91c1c" stroke-width="3" stroke-linecap="round" fill="none"/>
      <!-- Cheeks healthy glow -->
      <ellipse cx="155" cy="195" rx="12" ry="6" fill="#f43f5e" opacity="0.25"/>
      <ellipse cx="245" cy="195" rx="12" ry="6" fill="#f43f5e" opacity="0.25"/>
      <!-- Hair -->
      ${
        hairStyle === 'short'
          ? `<path d="M125 160 C 120 90, 280 90, 275 160 C 265 110, 135 110, 125 160 Z" fill="${hair}"/>`
          : hairStyle === 'curly'
          ? `<path d="M115 170 C 110 70, 290 70, 285 170 C 270 120, 130 120, 115 170 Z" fill="${hair}"/>
             <circle cx="130" cy="110" r="25" fill="${hair}"/>
             <circle cx="200" cy="95" r="28" fill="${hair}"/>
             <circle cx="270" cy="110" r="25" fill="${hair}"/>`
          : `<path d="M120 180 C 110 80, 290 80, 280 180 C 270 120, 130 120, 120 180 Z" fill="${hair}"/>
             <path d="M120 180 Q 115 260 140 290 Q 130 230 135 190 Z" fill="${hair}"/>
             <path d="M280 180 Q 285 260 260 290 Q 270 230 265 190 Z" fill="${hair}"/>`
      }
      <text x="200" y="385" font-family="sans-serif" font-size="14" font-weight="600" fill="#94a3b8" text-anchor="middle">${name} (Demo)</text>
    </svg>
  `.trim());
  return `data:image/svg+xml;utf8,${encoded}`;
};

export const SAMPLE_AVATARS: SampleAvatar[] = [
  {
    id: 'sample-alex',
    name: 'Alex',
    genderDescription: 'Youth representative',
    ageGroup: '16–18 years',
    previewUrl: createAvatarSvg('#fcd34d', '#451a03', '#1e293b', '#0284c7', 'short', 'Alex'),
    description: 'High school student illustrative portrait with neutral baseline lighting.',
  },
  {
    id: 'sample-sam',
    name: 'Sam',
    genderDescription: 'Youth representative',
    ageGroup: '17–19 years',
    previewUrl: createAvatarSvg('#e0a96d', '#171717', '#451a03', '#0d9488', 'curly', 'Sam'),
    description: 'Youth baseline portrait with warm tone and curly hairstyle.',
  },
  {
    id: 'sample-taylor',
    name: 'Taylor',
    genderDescription: 'Youth representative',
    ageGroup: '16–18 years',
    previewUrl: createAvatarSvg('#ffedd5', '#b45309', '#0369a1', '#7c3aed', 'long', 'Taylor'),
    description: 'Youth baseline portrait with long hairstyle and clear baseline.',
  },
];
