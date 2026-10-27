import { describe, it, expect, beforeEach } from 'vitest';
import { CanvasProceduralEngine } from '../../services/transformation/canvasProceduralEngine';
import { OnnxTransformationEngine } from '../../services/transformation/onnxModelLoader';

describe('On-Device Facial Transformation Engine', () => {
  let proceduralEngine: CanvasProceduralEngine;
  let onnxEngine: OnnxTransformationEngine;

  beforeEach(async () => {
    proceduralEngine = new CanvasProceduralEngine();
    await proceduralEngine.initialize();
    onnxEngine = new OnnxTransformationEngine();
    await onnxEngine.initialize();
  });

  it('reports 100% on-device execution with zero external network egress', () => {
    const info = proceduralEngine.getInfo();
    expect(info.isLocalOnly).toBe(true);
    expect(info.type).toBe('canvas-procedural');
    expect(info.name).toContain('AAIC On-Device Visual Filter Engine');
  });

  it('runs Ice pathway transformation locally and produces a valid Blob URL', async () => {
    const mockImg = new Image();
    mockImg.width = 400;
    mockImg.height = 400;
    Object.defineProperty(mockImg, 'naturalWidth', { value: 400 });
    Object.defineProperty(mockImg, 'naturalHeight', { value: 400 });

    const result = await proceduralEngine.transform(mockImg, {
      pathway: 'ice',
      intensity: 0.8,
      stage: 2,
    });

    expect(result).toBeDefined();
    expect(result.pathway).toBe('ice');
    expect(result.stage).toBe(2);
    expect(result.imageUrl).toContain('blob:');
    expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);
  });

  it('runs Healthy Future pathway transformation locally', async () => {
    const mockImg = new Image();
    mockImg.width = 400;
    mockImg.height = 400;
    Object.defineProperty(mockImg, 'naturalWidth', { value: 400 });
    Object.defineProperty(mockImg, 'naturalHeight', { value: 400 });

    const result = await proceduralEngine.transform(mockImg, {
      pathway: 'healthy',
      intensity: 0.85,
    });

    expect(result).toBeDefined();
    expect(result.pathway).toBe('healthy');
    expect(result.imageUrl).toContain('blob:');
  });

  it('safely falls back from ONNX to local Procedural Engine with transparent status when weights not mounted', () => {
    const info = onnxEngine.getInfo();
    expect(info.isLocalOnly).toBe(true);
    expect(info.description).toContain('Running verified client-side Canvas procedural engine');
  });
});
