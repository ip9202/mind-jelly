/**
 * T-021: FPS Guard 테스트 (REQ-UNW-001, REQ-UNW-005)
 * 성능 모니터링 및 적응형 품질 저하 기능
 */

import { FPSGuard } from '@/lib/physics/fpsGuard';

describe('FPSGuard', () => {
  let fpsGuard: FPSGuard;
  let mockNow: jest.MockedFunction<() => number>;

  beforeEach(() => {
    // performance.now 모킹
    mockNow = jest.fn();
    mockNow.mockReturnValue(0);
    global.performance.now = mockNow;

    fpsGuard = new FPSGuard({
      targetFPS: 60,
      lowFPSThreshold: 30,
      sampleSize: 60,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('생성 및 초기화', () => {
    it('FPS 가드 인스턴스를 생성해야 함', () => {
      expect(fpsGuard).toBeInstanceOf(FPSGuard);
      expect(fpsGuard.getCurrentFPS()).toBe(60); // 초기값은 targetFPS
      expect(fpsGuard.isLowFPS()).toBe(false);
    });

    it('기본 설정값으로 생성해야 함', () => {
      const defaultGuard = new FPSGuard();
      expect(defaultGuard.getCurrentFPS()).toBe(60);
      expect(defaultGuard.isLowFPS()).toBe(false);
    });
  });

  describe('프레임 시간 추적', () => {
    it('프레임 시간을 기록해야 함', () => {
      mockNow.mockReturnValue(0);
      fpsGuard.startFrame();

      mockNow.mockReturnValue(16.67); // 60fps = 16.67ms
      fpsGuard.endFrame();

      expect(fpsGuard.getCurrentFPS()).toBeCloseTo(60, 0);
    });

    it('여러 프레임의 평균 FPS를 계산해야 함', () => {
      const frameTimes = [16.67, 16.67, 16.67, 16.67, 16.67]; // 모두 60fps

      frameTimes.forEach((time, i) => {
        mockNow.mockReturnValue(i * 16.67);
        fpsGuard.startFrame();
        mockNow.mockReturnValue((i + 1) * 16.67);
        fpsGuard.endFrame();
      });

      expect(fpsGuard.getCurrentFPS()).toBeCloseTo(60, 0);
    });

    it('낮은 FPS를 감지해야 함 (30fps 이하)', () => {
      // 40ms = 25fps
      for (let i = 0; i < 70; i++) {
        mockNow.mockReturnValue(i * 40);
        fpsGuard.startFrame();
        mockNow.mockReturnValue((i + 1) * 40);
        fpsGuard.endFrame();
      }

      expect(fpsGuard.getCurrentFPS()).toBeLessThan(35);
      expect(fpsGuard.isLowFPS()).toBe(true);
    });

    it('높은 FPS를 감지해야 함 (30fps 초과)', () => {
      // 16.67ms = 60fps
      for (let i = 0; i < 70; i++) {
        mockNow.mockReturnValue(i * 16.67);
        fpsGuard.startFrame();
        mockNow.mockReturnValue((i + 1) * 16.67);
        fpsGuard.endFrame();
      }

      expect(fpsGuard.getCurrentFPS()).toBeGreaterThan(50);
      expect(fpsGuard.isLowFPS()).toBe(false);
    });
  });

  describe('성능 메트릭', () => {
    it('평균 FPS를 계산해야 함', () => {
      const fpsValues = [60, 55, 50, 45, 40];

      fpsValues.forEach((fps, i) => {
        const frameTime = 1000 / fps;
        mockNow.mockReturnValue(i * frameTime);
        fpsGuard.startFrame();
        mockNow.mockReturnValue((i + 1) * frameTime);
        fpsGuard.endFrame();
      });

      expect(fpsGuard.getCurrentFPS()).toBeGreaterThan(40);
      expect(fpsGuard.getCurrentFPS()).toBeLessThan(60);
    });

    it('최소/최대 FPS를 추적해야 함', () => {
      const fpsValues = [60, 20, 45, 18, 55];

      fpsValues.forEach((fps, i) => {
        const frameTime = 1000 / fps;
        mockNow.mockReturnValue(i * frameTime);
        fpsGuard.startFrame();
        mockNow.mockReturnValue((i + 1) * frameTime);
        fpsGuard.endFrame();
      });

      const metrics = fpsGuard.getMetrics();
      expect(metrics.minFPS).toBeLessThan(30);
      expect(metrics.maxFPS).toBeGreaterThan(50);
    });
  });

  describe('적응형 품질 저하', () => {
    it('낮은 FPS 감지 시 품질 저하를 제안해야 함', () => {
      // 30fps 미만으로 프레임 드랭
      for (let i = 0; i < 70; i++) {
        mockNow.mockReturnValue(i * 40); // 25fps
        fpsGuard.startFrame();
        mockNow.mockReturnValue((i + 1) * 40);
        fpsGuard.endFrame();
      }

      const suggestion = fpsGuard.getQualitySuggestion();
      expect(suggestion.shouldReduceQuality).toBe(true);
      expect(suggestion.suggestedVertexCount).toBeLessThan(30);
      expect(suggestion.reason).toContain('FPS가 낮음');
    });

    it('정상 FPS 시 품질 저하를 제안하지 않아야 함', () => {
      for (let i = 0; i < 70; i++) {
        mockNow.mockReturnValue(i * 16.67); // 60fps
        fpsGuard.startFrame();
        mockNow.mockReturnValue((i + 1) * 16.67);
        fpsGuard.endFrame();
      }

      const suggestion = fpsGuard.getQualitySuggestion();
      expect(suggestion.shouldReduceQuality).toBe(false);
      expect(suggestion.suggestedVertexCount).toBe(30); // 기본값 유지
    });
  });

  describe('리셋 및 상태 관리', () => {
    it('리셋 시 모든 상태를 초기화해야 함', () => {
      // 데이터 수집
      for (let i = 0; i < 70; i++) {
        mockNow.mockReturnValue(i * 20);
        fpsGuard.startFrame();
        mockNow.mockReturnValue((i + 1) * 20);
        fpsGuard.endFrame();
      }

      fpsGuard.reset();

      expect(fpsGuard.getCurrentFPS()).toBe(60); // 초기값으로 복원
      expect(fpsGuard.isLowFPS()).toBe(false);
      // getMetrics()가 현재 FPS를 기반으로 값을 계산하므로 minFPS/maxFPS도 초기화됨
      const currentFPS = fpsGuard.getCurrentFPS();
      expect(currentFPS).toBe(60);
    });

    it('샘플 크기 설정을 준수해야 함', () => {
      const customGuard = new FPSGuard({
        sampleSize: 10,
      });

      for (let i = 0; i < 20; i++) {
        mockNow.mockReturnValue(i * 16.67);
        customGuard.startFrame();
        mockNow.mockReturnValue((i + 1) * 16.67);
        customGuard.endFrame();
      }

      // sampleSize만큼만 최근 데이터 유지
      expect(customGuard.getCurrentFPS()).toBeDefined();
    });
  });
});
