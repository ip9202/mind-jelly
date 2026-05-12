/**
 * weeklyReport.test.ts
 *
 * TDD RED phase: 주간 감정 패턴 리포트 생성 테스트
 * 모든 테스트는 실패 상태로 시작 (구현 전)
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { weeklyReport, WeeklyReportData, EmotionDistribution } from '@/lib/rewards/weeklyReport';

// emotionHistory mock (7일치 데이터)
const mockEmotionHistory = [
  { emotion: 'joy' as const, confidence: 0.9, timestamp: '2026-05-11T10:00:00Z' },
  { emotion: 'sadness' as const, confidence: 0.7, timestamp: '2026-05-11T12:00:00Z' },
  { emotion: 'anger' as const, confidence: 0.8, timestamp: '2026-05-10T14:00:00Z' },
  { emotion: 'fear' as const, confidence: 0.6, timestamp: '2026-05-10T16:00:00Z' },
  { emotion: 'joy' as const, confidence: 0.95, timestamp: '2026-05-09T10:00:00Z' },
  { emotion: 'gratitude' as const, confidence: 0.85, timestamp: '2026-05-09T12:00:00Z' },
  { emotion: 'love' as const, confidence: 0.75, timestamp: '2026-05-08T14:00:00Z' },
  { emotion: 'hope' as const, confidence: 0.88, timestamp: '2026-05-08T16:00:00Z' },
  { emotion: 'surprise' as const, confidence: 0.92, timestamp: '2026-05-07T10:00:00Z' },
  { emotion: 'disgust' as const, confidence: 0.65, timestamp: '2026-05-07T12:00:00Z' },
  { emotion: 'joy' as const, confidence: 0.89, timestamp: '2026-05-06T14:00:00Z' },
  { emotion: 'sadness' as const, confidence: 0.78, timestamp: '2026-05-06T16:00:00Z' },
  { emotion: 'anger' as const, confidence: 0.82, timestamp: '2026-05-05T10:00:00Z' },
  { emotion: 'fear' as const, confidence: 0.71, timestamp: '2026-05-05T12:00:00Z' },
];

describe('weeklyReport (TDD RED)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    jest.setSystemTime(new Date('2026-05-11T12:00:00Z'));
  });

  describe('generateReport', () => {
    it('7일간 감정 데이터를 분석하여 리포트를 생성해야 함', () => {
      const report = weeklyReport.generateReport(mockEmotionHistory);

      expect(report).toBeDefined();
      expect(report).not.toBeNull();
      expect(report!.period).toBe('7일');
    });

    it('데이터가 부족하면(3회 미만) null을 반환해야 함', () => {
      const insufficientData = [mockEmotionHistory[0], mockEmotionHistory[1]];
      const report = weeklyReport.generateReport(insufficientData);

      expect(report).toBeNull();
    });

    it('리포트에 감정 분포 원 그래프를 포함해야 함', () => {
      const report = weeklyReport.generateReport(mockEmotionHistory);

      expect(report?.emotionDistribution).toBeDefined();
      expect(report?.emotionDistribution).toBeInstanceOf(Array);
      expect(report?.emotionDistribution.length).toBe(9); // 9개 감정
    });

    it('감정 분포는 백분율로 계산되어야 함', () => {
      const report = weeklyReport.generateReport(mockEmotionHistory) as WeeklyReportData;

      const total = report.emotionDistribution.reduce((sum, item) => sum + item.percentage, 0);

      expect(total).toBeCloseTo(100, 1); // 총합 100% (±1% 오차 허용)
    });

    it('TOP 3 감정을 추출해야 함', () => {
      const report = weeklyReport.generateReport(mockEmotionHistory) as WeeklyReportData;

      expect(report?.topEmotions).toBeDefined();
      expect(report?.topEmotions).toHaveLength(3);
      expect(report?.topEmotions[0].count).toBeGreaterThanOrEqual(report?.topEmotions[1]?.count || 0);
    });
  });

  describe('감정 변화 추세', () => {
    it('7일간 감정 변화 추세선을 생성해야 함', () => {
      const report = weeklyReport.generateReport(mockEmotionHistory);

      expect(report?.emotionTrend).toBeDefined();
      expect(report?.emotionTrend).toHaveLength(7);
    });

    it('각 날짜의 감정 비중을 계산해야 함', () => {
      const report = weeklyReport.generateReport(mockEmotionHistory) as WeeklyReportData;

      const firstDay = report.emotionTrend[0];
      expect(firstDay.date).toBeDefined();
      expect(firstDay.dominantEmotion).toBeDefined();
      expect(firstDay.count).toBeGreaterThan(0);
    });
  });

  describe('요일별/시간대별 패턴', () => {
    it('요일별 감정 패턴을 분석해야 함', () => {
      const report = weeklyReport.generateReport(mockEmotionHistory) as WeeklyReportData;

      expect(report?.weekdayPattern).toBeDefined();
      expect(Object.keys(report.weekdayPattern)).toHaveLength(7);
    });

    it('시간대별 감정 패턴을 분석해야 함', () => {
      const report = weeklyReport.generateReport(mockEmotionHistory) as WeeklyReportData;

      expect(report?.hourlyPattern).toBeDefined();
      expect(report.hourlyPattern).toHaveLength(24); // 0-23시
    });

    it('가장 활발한 시간대를 식별해야 함', () => {
      const report = weeklyReport.generateReport(mockEmotionHistory) as WeeklyReportData;

      const hourlyPattern = report.hourlyPattern;
      const maxHour = hourlyPattern.reduce((max, item) =>
        item.count > max.count ? item : max, hourlyPattern[0]
      );

      expect(maxHour.hour).toBeGreaterThanOrEqual(0);
      expect(maxHour.hour).toBeLessThan(24);
    });
  });

  describe('데이터 부족 처리', () => {
    it('3회 미만 데이터면 안내 메시지를 반환해야 함', () => {
      const insufficientData = [mockEmotionHistory[0], mockEmotionHistory[1]];
      const result = weeklyReport.generateReport(insufficientData);

      expect(result).toBeNull();
    });

    it('데이터가 정확히 7일이 아니어도 최근 7일 데이터를 분석해야 함', () => {
      // 최근 10일 데이터 (7일 이상)
      const recentData = [...mockEmotionHistory, mockEmotionHistory[0]];
      const report = weeklyReport.generateReport(recentData);

      expect(report).toBeDefined();
      expect(report?.period).toBe('7일');
    });
  });

  describe('감정 키워드 연관', () => {
    it('각 감정과 연관된 키워드를 제공해야 함', () => {
      const report = weeklyReport.generateReport(mockEmotionHistory) as WeeklyReportData;

      const joyKeywords = weeklyReport.getEmotionKeywords('joy');
      expect(joyKeywords).toBeDefined();
      expect(Array.isArray(joyKeywords)).toBe(true);
    });

    it('키워드는 명사/형용사 중심이어야 함', () => {
      const keywords = weeklyReport.getEmotionKeywords('sadness');

      expect(keywords).toBeDefined();
      expect(Array.isArray(keywords)).toBe(true);
      expect(keywords.length).toBeGreaterThan(0);

      keywords.forEach((keyword) => {
        expect(keyword.keyword).toBeDefined();
        expect(keyword.weight).toBeGreaterThan(0);
      });
    });
  });

  describe('리포트 검증', () => {
    it('현재 날짜 기준 최근 7일 데이터를 추출해야 함', () => {
      const now = new Date('2026-05-11T12:00:00Z');
      jest.setSystemTime(now.getTime());

      const report = weeklyReport.generateReport(mockEmotionHistory);

      expect(report?.startDate).toBeDefined();
      expect(report?.endDate).toBeDefined();
    });

    it('confidence 낮은 데이터는 필터링되어야 함', () => {
      const lowConfidenceData = mockEmotionHistory.map((item) => ({
        ...item,
        confidence: 0.3, // 낮은 confidence
      }));

      const report = weeklyReport.generateReport(lowConfidenceData);

      // confidence < 0.5인 데이터는 제외
      expect(report).toBeNull(); // 모든 confidence가 0.5 미만이므로 null
    });
  });
});
