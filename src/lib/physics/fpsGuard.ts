/**
 * T-021: FPS 가드 (REQ-UNW-001, REQ-UNW-005)
 * 성능 모니터링 및 적응형 품질 저하 기능
 */

// @MX:NOTE: 기본 정점 수 (softBody 기본값과 동일)
const DEFAULT_VERTEX_COUNT = 30;

// @MX:NOTE: 최소 정점 수 (품질 저하 하한)
const MIN_VERTEX_COUNT = 12;

export interface FPSGuardOptions {
  targetFPS?: number;
  lowFPSThreshold?: number;
  sampleSize?: number;
}

export interface FPSMetrics {
  currentFPS: number;
  minFPS: number;
  maxFPS: number;
  averageFPS: number;
  isLowFPS: boolean;
}

export interface QualitySuggestion {
  shouldReduceQuality: boolean;
  suggestedVertexCount: number;
  reason: string;
}

/**
 * FPS 성능 모니터링 및 적응형 품질 저하
 *
 * @remarks
 * - 프레임 시간을 추적하여 FPS 계산
 * - 낮은 FPS 감지 시 정점 수 감소 제안
 * - REQ-UNW-001: 원활한 상호작용 보장 (30fps 이상)
 * - REQ-UNW-005: 성능 최적화
 */
export class FPSGuard {
  private targetFPS: number;
  private lowFPSThreshold: number;
  private sampleSize: number;
  private frameTimes: number[] = [];
  private frameStartTime: number = 0;
  private minFPS: number = Infinity;
  private maxFPS: number = 0;

  constructor(options: FPSGuardOptions = {}) {
    this.targetFPS = options.targetFPS ?? 60;
    this.lowFPSThreshold = options.lowFPSThreshold ?? 30;
    this.sampleSize = options.sampleSize ?? 60;
  }

  /**
   * 프레임 시작 시간 기록
   */
  startFrame(): void {
    this.frameStartTime = performance.now();
  }

  /**
   * 프레임 종료 시 FPS 계산
   */
  endFrame(): void {
    const frameEndTime = performance.now();
    const frameTime = frameEndTime - this.frameStartTime;

    // 프레임 시간 기록
    this.frameTimes.push(frameTime);

    // 샘플 크기 유지
    if (this.frameTimes.length > this.sampleSize) {
      this.frameTimes.shift();
    }

    // FPS 메트릭 업데이트
    this.updateMetrics();
  }

  /**
   * 현재 FPS 반환
   */
  getCurrentFPS(): number {
    if (this.frameTimes.length === 0) {
      return this.targetFPS;
    }

    const averageFrameTime =
      this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length;

    return averageFrameTime > 0 ? 1000 / averageFrameTime : this.targetFPS;
  }

  /**
   * 낮은 FPS 여부 확인
   */
  isLowFPS(): boolean {
    return this.getCurrentFPS() < this.lowFPSThreshold;
  }

  /**
   * 성능 메트릭 반환
   */
  getMetrics(): FPSMetrics {
    const currentFPS = this.getCurrentFPS();

    return {
      currentFPS,
      minFPS: this.minFPS === Infinity ? 0 : this.minFPS,
      maxFPS: this.maxFPS,
      averageFPS: currentFPS,
      isLowFPS: this.isLowFPS(),
    };
  }

  /**
   * 품질 저하 제안 생성
   */
  getQualitySuggestion(): QualitySuggestion {
    const currentFPS = this.getCurrentFPS();

    if (currentFPS >= this.lowFPSThreshold) {
      return {
        shouldReduceQuality: false,
        suggestedVertexCount: DEFAULT_VERTEX_COUNT,
        reason: 'FPS가 정상임',
      };
    }

    // FPS 비율에 따른 정점 수 계선
    const fpsRatio = currentFPS / this.targetFPS;
    const suggestedCount = Math.max(
      MIN_VERTEX_COUNT,
      Math.floor(DEFAULT_VERTEX_COUNT * fpsRatio)
    );

    return {
      shouldReduceQuality: true,
      suggestedVertexCount: suggestedCount,
      reason: `FPS가 낮음 (${currentFPS.toFixed(1)}fps / ${this.targetFPS}fps)`,
    };
  }

  /**
   * 모든 상태 리셋
   */
  reset(): void {
    this.frameTimes = [];
    this.frameStartTime = 0;
    this.minFPS = Infinity;
    this.maxFPS = 0;
  }

  /**
   * 내부 메트릭 업데이트
   */
  private updateMetrics(): void {
    const currentFPS = this.getCurrentFPS();

    this.minFPS = Math.min(this.minFPS, currentFPS);
    this.maxFPS = Math.max(this.maxFPS, currentFPS);
  }
}
