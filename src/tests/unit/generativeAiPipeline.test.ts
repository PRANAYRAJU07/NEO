import { describe, it, expect, beforeEach } from 'vitest';
import { calculateEffectiveStrength, STAGE_PROFILES, COMMON_NEGATIVE_PROMPT } from '../../services/transformation/promptProfiles';
import { analyzeFace } from '../../services/transformation/faceAnalyzer';
import { MockAiProvider } from '../../services/transformation/providers/mockAiProvider';
import { ServerGpuProvider } from '../../services/transformation/providers/serverGpuProvider';
import { transformationManager } from '../../services/transformation/transformationManager';

describe('Generative AI Image-to-Image Pipeline', () => {
  let mockProvider: MockAiProvider;

  beforeEach(async () => {
    mockProvider = new MockAiProvider();
    await mockProvider.initialize();
  });

  describe('Stage-to-Configuration Mapping', () => {
    it('configures Stage 1 with subtle fatigue & dehydration prompts', () => {
      const stage1 = STAGE_PROFILES.ice[1];
      expect(stage1).toBeDefined();
      expect(stage1?.baseStrength).toBe(0.28);
      expect(stage1?.guidanceScale).toBe(5.5);
      expect(stage1?.prompt).toContain('chronic fatigue and dehydration');
      expect(stage1?.prompt).toContain('subtle dark circles');
    });

    it('configures Stage 2 with progressive vascular strain & hollows prompts', () => {
      const stage2 = STAGE_PROFILES.ice[2];
      expect(stage2).toBeDefined();
      expect(stage2?.baseStrength).toBe(0.40);
      expect(stage2?.guidanceScale).toBe(6.0);
      expect(stage2?.prompt).toContain('noticeable gauntness around cheeks');
      expect(stage2?.prompt).toContain('prominent dark shadows');
    });

    it('configures Stage 3 with advanced systemic toll prompts without horror/injuries', () => {
      const stage3 = STAGE_PROFILES.ice[3];
      expect(stage3).toBeDefined();
      expect(stage3?.baseStrength).toBe(0.52);
      expect(stage3?.guidanceScale).toBe(6.5);
      expect(stage3?.prompt).toContain('chronic substance toll');
      expect(stage3?.prompt).toContain('strictly preserving individual identity');
      expect(stage3?.prompt).toContain('non-stigmatising');

      // Negative prompt excludes horror and gore
      expect(COMMON_NEGATIVE_PROMPT).toContain('horror');
      expect(COMMON_NEGATIVE_PROMPT).toContain('gore');
      expect(COMMON_NEGATIVE_PROMPT).toContain('open wounds');
    });

    it('configures Healthy Future pathway with natural vitality prompts', () => {
      const healthy = STAGE_PROFILES.healthy[1];
      expect(healthy).toBeDefined();
      expect(healthy?.baseStrength).toBe(0.22);
      expect(healthy?.prompt).toContain('optimal youth health and vitality');
      expect(healthy?.prompt).toContain('warm radiant skin glow');
    });
  });

  describe('Intensity-to-Model-Parameter Mapping', () => {
    it('maps intensity to genuine denoising strength monotonically', () => {
      const strengthLow = calculateEffectiveStrength('ice', 2, 0.2);
      const strengthMid = calculateEffectiveStrength('ice', 2, 0.5);
      const strengthHigh = calculateEffectiveStrength('ice', 2, 0.9);

      expect(strengthMid).toBe(0.40); // Base strength for Stage 2
      expect(strengthLow).toBeLessThan(strengthMid);
      expect(strengthHigh).toBeGreaterThan(strengthMid);
    });

    it('clamps denoising strength to identity-preserving boundaries (0.18 to 0.60)', () => {
      const minClamp = calculateEffectiveStrength('ice', 1, 0.0);
      const maxClamp = calculateEffectiveStrength('ice', 3, 1.0);

      expect(minClamp).toBeGreaterThanOrEqual(0.18);
      expect(maxClamp).toBeLessThanOrEqual(0.60);
    });
  });

  describe('Face Analyzer Validation', () => {
    it('validates standard portrait dimensions and returns positive recommendation', async () => {
      const mockImg = new Image();
      mockImg.width = 600;
      mockImg.height = 700;
      Object.defineProperty(mockImg, 'naturalWidth', { value: 600 });
      Object.defineProperty(mockImg, 'naturalHeight', { value: 700 });

      const analysis = await analyzeFace(mockImg);
      expect(analysis.faceDetected).toBe(true);
      expect(analysis.aspectRatio).toBe(0.86);
      expect(analysis.recommendations.some((r) => r.includes('Clear portrait alignment'))).toBe(true);
    });

    it('flags low resolution images', async () => {
      const smallImg = new Image();
      smallImg.width = 150;
      smallImg.height = 150;
      Object.defineProperty(smallImg, 'naturalWidth', { value: 150 });
      Object.defineProperty(smallImg, 'naturalHeight', { value: 150 });

      const analysis = await analyzeFace(smallImg);
      expect(analysis.recommendations.some((r) => r.includes('Resolution is low'))).toBe(true);
    });
  });

  describe('Provider Contract & Generation Validation', () => {
    it('executes generative transformation and preserves contract fields', async () => {
      const mockImg = new Image();
      mockImg.width = 400;
      mockImg.height = 400;
      Object.defineProperty(mockImg, 'naturalWidth', { value: 400 });
      Object.defineProperty(mockImg, 'naturalHeight', { value: 400 });

      const result = await mockProvider.transform(mockImg, {
        pathway: 'ice',
        stage: 2,
        intensity: 0.75,
        seed: 424242,
      });

      expect(result.imageUrl).toContain('blob:');
      expect(result.pathway).toBe('ice');
      expect(result.stage).toBe(2);
      expect(result.seed).toBe(424242);
      expect(result.effectiveStrength).toBeDefined();
      expect(result.promptUsed).toContain('prolonged stimulant use');
      expect(result.negativePromptUsed).toContain('horror');
      expect(result.isLiveGpuInference).toBe(false);
      expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('supports cancellation via AbortSignal', async () => {
      const mockImg = new Image();
      const abortController = new AbortController();
      abortController.abort(); // Cancel immediately

      await expect(
        mockProvider.transform(mockImg, {
          pathway: 'ice',
          stage: 1,
          intensity: 0.8,
          abortSignal: abortController.signal,
        })
      ).rejects.toThrow(/cancelled/i);
    });
  });

  describe('Server GPU Provider & Unavailable Hardware Handling', () => {
    it('detects when backend server is offline and reports status honestly', async () => {
      // Mock fetch failure
      const serverProvider = new ServerGpuProvider('http://nonexistent-host:9999');
      const isOnline = await serverProvider.checkHealth();

      expect(isOnline).toBe(false);
      const info = serverProvider.getInfo();
      expect(info.serverStatus).toBe('offline');
      expect(info.modelLoaded).toBe(false);
    });

    it('transformationManager switches providers safely', () => {
      transformationManager.setProvider('mock-ai');
      expect(transformationManager.getActiveProvider().id).toBe('mock-ai');

      transformationManager.setProvider('server-gpu');
      expect(transformationManager.getActiveProvider().id).toBe('server-gpu');
    });
  });
});
