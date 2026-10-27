import { TransformationPathway, TransformationStage } from '../../types';
import { StagePromptProfile } from './types';

export const STAGE_PROFILES: Record<TransformationPathway, Record<number, StagePromptProfile>> = {
  ice: {
    1: {
      stage: 1,
      label: 'Stage 1 — Early Toll',
      period: '6–12 Months',
      prompt: (
        'documentary portrait of a person showing subtle signs of chronic fatigue and dehydration, ' +
        'subtle dark circles under eyes, slightly dry complexion, subdued skin luster, ' +
        'authentic high-resolution skin texture, highly detailed, realistic portrait photography, ' +
        'natural soft indoor lighting, 8k resolution, preserving original facial structure'
      ),
      baseStrength: 0.28,
      guidanceScale: 5.5,
      numInferenceSteps: 25,
      description: 'Loss of natural skin glow, subtle dark circles from persistent sleep deprivation, reduced skin hydration.',
    },
    2: {
      stage: 2,
      label: 'Stage 2 — Progressive Strain',
      period: '2–3 Years',
      prompt: (
        'realistic educational documentary portrait of a person showing moderate physical strain from prolonged stimulant use, ' +
        'noticeable gauntness around cheeks and temples, prominent dark shadows under eyes, ' +
        'dull sallow skin tone, rough dry skin texture, tired facial expression, ' +
        'maintaining recognizable subject identity, sharp focus, natural documentary lighting, 8k'
      ),
      baseStrength: 0.40,
      guidanceScale: 6.0,
      numInferenceSteps: 30,
      description: 'Vascular strain, prominent under-eye hollows, reduced facial fullness, persistent dull complexion.',
    },
    3: {
      stage: 3,
      label: 'Stage 3 — Advanced Toll',
      period: '4+ Years',
      prompt: (
        'thoughtful educational illustration of chronic substance toll, pronounced fatigue and facial volume loss, ' +
        'deepened hollows under cheekbones, exhausted eyes with dark circles, pale sallow complexion, ' +
        'depleted physical vitality, authentic skin texture, documentary realism, ' +
        'strictly preserving individual identity, respectful, non-stigmatising, natural human face'
      ),
      baseStrength: 0.52,
      guidanceScale: 6.5,
      numInferenceSteps: 35,
      description: 'Pronounced facial hollows, advanced systemic dehydration, tired appearance. Strictly non-sensationalised.',
    },
  },
  healthy: {
    1: {
      stage: 1,
      label: 'My Healthy Future',
      period: 'Ongoing Wellness',
      prompt: (
        'photorealistic portrait showcasing optimal youth health and vitality, warm radiant skin glow, ' +
        'bright clear expressive eyes, natural facial volume, hydrated clean complexion, ' +
        'authentic healthy skin pores, vibrant warm natural lighting, confident, lifelike, 8k'
      ),
      baseStrength: 0.22,
      guidanceScale: 5.0,
      numInferenceSteps: 20,
      description: 'Optimal youth health, clear eyes, vital skin tone, emotional warmth, and preserved lifelong potential.',
    },
  },
};

export const COMMON_NEGATIVE_PROMPT = (
  'horror, gore, open wounds, bleeding, cuts, sores, grotesque, zombie, monster, ' +
  'halloween makeup, cartoon, anime, 3d render, plastic skin, oversaturated, ' +
  'distorted facial anatomy, deformed eyes, extra eyes, mutated features, ' +
  'blur, hazy, low quality, bad lighting, unrecognizable person, caricature'
);

/**
 * Maps user intensity slider (0.0 to 1.0) to model denoising strength.
 * Guarantees identity preservation while enabling noticeable generative variation.
 */
export function calculateEffectiveStrength(
  pathway: TransformationPathway,
  stage: TransformationStage = 1,
  intensity: number = 0.85
): number {
  const pathwayProfiles = STAGE_PROFILES[pathway];
  const profile = (pathwayProfiles && pathwayProfiles[stage]) || STAGE_PROFILES.ice[1]!;

  const strengthOffset = (intensity - 0.5) * 0.16;
  const effective = profile.baseStrength + strengthOffset;

  // Safe clamp between 0.18 and 0.60
  return Math.max(0.18, Math.min(0.60, Number(effective.toFixed(3))));
}
