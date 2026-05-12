/**
 * weeklyReport.ts
 *
 * TDD GREEN phase: 주간 감정 패턴 리포트 생성
 * 7일간 감정 데이터를 분석하여 시각화 리포트 제공
 */

// 감정 이력 항목
export interface EmotionHistoryItem {
  emotion: string;
  confidence: number;
  timestamp: string;
}

// 감정 분포 항목
export interface EmotionDistribution {
  emotion: string;
  percentage: number;
  count: number;
}

// TOP 감정
export interface TopEmotion {
  emotion: string;
  count: number;
  percentage: number;
}

// 감정 추세 (일별)
export interface EmotionTrend {
  date: string;
  dominantEmotion: string;
  count: number;
}

// 요일별 패턴
export type WeekdayPattern = Record<string, { dominantEmotion: string; count: number }>;

// 시간대별 패턴
export interface HourlyPattern {
  hour: number;
  dominantEmotion: string;
  count: number;
}

// 주간 리포트 데이터
export interface WeeklyReportData {
  period: string;
  startDate: string;
  endDate: string;
  emotionDistribution: EmotionDistribution[];
  topEmotions: TopEmotion[];
  emotionTrend: EmotionTrend[];
  weekdayPattern: WeekdayPattern;
  hourlyPattern: HourlyPattern[];
}

// 9개 감정 목록
const EMOTIONS = [
  'joy', 'sadness', 'anger', 'fear', 'disgust',
  'surprise', 'love', 'gratitude', 'hope'
];

// 감정별 키워드 (형용소 분석 기반)
const EMOTION_KEYWORDS: Record<string, Array<{ keyword: string; weight: number }>> = {
  joy: [
    { keyword: '행복', weight: 1.0 },
    { keyword: '즐거움', weight: 0.9 },
    { keyword: '기쁨', weight: 0.8 },
  ],
  sadness: [
    { keyword: '슬픔', weight: 1.0 },
    { keyword: '우울', weight: 0.9 },
    { keyword: '그리움', weight: 0.8 },
  ],
  anger: [
    { keyword: '화남', weight: 1.0 },
    { keyword: '분노', weight: 0.9 },
    { keyword: '짜증', weight: 0.8 },
  ],
  fear: [
    { keyword: '두려움', weight: 1.0 },
    { keyword: '불안', weight: 0.9 },
    { keyword: '걱정', weight: 0.8 },
  ],
  disgust: [
    { keyword: '혐오', weight: 1.0 },
    { keyword: '싫음', weight: 0.9 },
    { keyword: '역겨움', weight: 0.8 },
  ],
  surprise: [
    { keyword: '놀람', weight: 1.0 },
    { keyword: ' surprises', weight: 0.9 },
  ],
  love: [
    { keyword: '사랑', weight: 1.0 },
    { keyword: '좋아', weight: 0.9 },
    { keyword: '애정', weight: 0.8 },
  ],
  gratitude: [
    { keyword: '감사', weight: 1.0 },
    { keyword: '고마움', weight: 0.9 },
  ],
  hope: [
    { keyword: '희망', weight: 1.0 },
    { keyword: '기대', weight: 0.9 },
  ],
};

/**
 * weeklyReport - 주간 감정 패턴 리포트 생성
 *
 * @MX:NOTE emotionHistoryStore에서 7일 데이터 추출
 * @MX:WARN confidence < 0.5인 데이터는 필터링
 */
export const weeklyReport = {
  /**
   * 주간 리포트 생성
   * @param emotionHistory - 감정 이력 데이터
   * @returns 리포트 데이터 (데이터 부족 시 null)
   */
  generateReport: (emotionHistory: EmotionHistoryItem[]): WeeklyReportData | null => {
    // 최소 3회 이상 데이터 필요
    const validData = emotionHistory.filter((item) => item.confidence >= 0.5);
    if (validData.length < 3) {
      return null;
    }

    // 7일 기간 계산
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentData = validData.filter((item) => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= sevenDaysAgo && itemDate <= now;
    });

    // 감정 분포 계산
    const emotionCounts: Record<string, number> = {};
    recentData.forEach((item) => {
      emotionCounts[item.emotion] = (emotionCounts[item.emotion] || 0) + 1;
    });

    const total = recentData.length;
    const emotionDistribution: EmotionDistribution[] = EMOTIONS.map((emotion) => ({
      emotion,
      percentage: (emotionCounts[emotion] || 0) / total * 100,
      count: emotionCounts[emotion] || 0,
    }));

    // TOP 3 감정 추출
    const topEmotions = emotionDistribution
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map((item) => ({
        emotion: item.emotion,
        count: item.count,
        percentage: item.percentage,
      }));

    // 감정 추세 (일별)
    const emotionTrend: EmotionTrend[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      const dayData = recentData.filter((item) => {
        const itemDate = new Date(item.timestamp);
        return itemDate.toISOString().split('T')[0] === dateStr;
      });

      if (dayData.length > 0) {
        const dayCounts: Record<string, number> = {};
        dayData.forEach((item) => {
          dayCounts[item.emotion] = (dayCounts[item.emotion] || 0) + 1;
        });

        const dominantEmotion = Object.entries(dayCounts).sort(
          (a, b) => b[1] - a[1]
        )[0][0];

        emotionTrend.push({
          date: dateStr,
          dominantEmotion,
          count: dayData.length,
        });
      } else {
        emotionTrend.push({
          date: dateStr,
          dominantEmotion: 'none',
          count: 0,
        });
      }
    }

    // 요일별 패턴
    const weekdayPattern: WeekdayPattern = {};
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

    recentData.forEach((item) => {
      const date = new Date(item.timestamp);
      const weekday = weekdays[date.getDay()];

      if (!weekdayPattern[weekday]) {
        weekdayPattern[weekday] = { dominantEmotion: item.emotion, count: 0 };
      }
      weekdayPattern[weekday].count++;
    });

    // 시간대별 패턴 (0-23시)
    const hourlyPattern: HourlyPattern[] = Array.from({ length: 24 }, (_, hour) => {
      const hourData = recentData.filter((item) => {
        const date = new Date(item.timestamp);
        return date.getHours() === hour;
      });

      if (hourData.length > 0) {
        const hourCounts: Record<string, number> = {};
        hourData.forEach((item) => {
          hourCounts[item.emotion] = (hourCounts[item.emotion] || 0) + 1;
        });

        const dominantEmotion = Object.entries(hourCounts).sort(
          (a, b) => b[1] - a[1]
        )[0][0];

        return {
          hour,
          dominantEmotion,
          count: hourData.length,
        };
      }

      return {
        hour,
        dominantEmotion: 'none',
        count: 0,
      };
    });

    return {
      period: '7일',
      startDate: sevenDaysAgo.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
      emotionDistribution,
      topEmotions,
      emotionTrend,
      weekdayPattern,
      hourlyPattern,
    };
  },

  /**
   * 감정별 키워드 반환
   * @param emotion - 감정 타입
   * @returns 키워드 목록
   */
  getEmotionKeywords: (emotion: string): Array<{ keyword: string; weight: number }> => {
    return EMOTION_KEYWORDS[emotion] || [];
  },
};
