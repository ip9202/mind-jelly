/**
 * 주간/월간 감정 트렌드 라인 차트 컴포넌트
 * REQ-VIS-001: 최근 7일/30일간의 감정 변화 추이를 시각화
 * REQ-VIS-004-3: 주간/월간 뷰 전환 기능
 * @MX:SPEC: SPEC-UI-001
 */

'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, type TooltipProps } from 'recharts';
import { EMOTION_COLORS, EMOTION_THEME } from '@/lib/constants/emotion';
import { useEmotionChartData } from '@/hooks/useEmotionChartData';
import { getLineChartAnimationProps } from './ChartAnimations';
import type { EmotionType } from '@/types/emotion';

// @MX:NOTE: 감정 타입 배열 (라인 렌더링용)
const EMOTION_TYPES: EmotionType[] = [
  'joy', 'sadness', 'anger', 'fear', 'disgust',
  'surprise', 'love', 'gratitude', 'hope',
];

// @MX:NOTE: [AUTO] REQ-VIS-004-1 커스텀 툴팁 - 날짜별 9개 감정 빈도를 테이블로 표시
function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || !payload.length || !label) {
    return null;
  }

  const formattedDate = (() => {
    const date = new Date(label);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  })();

  return (
    <div
      className="glass-card rounded-2xl border border-white/20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-3 shadow-lg transition-all duration-300"
      role="tooltip"
    >
      <p className="text-gray-800 dark:text-gray-200 text-xs font-jakarta font-semibold mb-2 text-center">
        {formattedDate}
      </p>
      <table className="w-full text-xs" aria-label={`${formattedDate} 감정 빈도`}>
        <tbody>
          {payload.map((entry) => {
            const emotionKey = entry.dataKey as EmotionType;
            const color = EMOTION_COLORS[emotionKey];
            const label = EMOTION_THEME[emotionKey]?.label ?? emotionKey;
            const value = entry.value ?? 0;

            return (
              <tr key={emotionKey} className="transition-all duration-300">
                <td className="pr-2 py-0.5">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full mr-1.5 align-middle"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />
                  <span className="text-gray-700 dark:text-gray-300 font-jakarta">{label}</span>
                </td>
                <td className="text-right text-gray-900 dark:text-gray-100 font-medium font-jakarta py-0.5">
                  {value}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// @MX:NOTE: 뷰 모드 타입
type ViewMode = 'weekly' | 'monthly';

/**
 * 주간/월간 감정 트렌드 차트 컴포넌트
 * @MX:ANCHOR: 홈 화면 감정 리포트 영역에서 사용
 * @MX:REASON: REQ-VIS-001, REQ-VIS-004-3 요구사항의 핵심 시각화 컴포넌트
 */
export function WeeklyTrendChart() {
  const { weeklyData, monthlyData } = useEmotionChartData();
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [touchStart, setTouchStart] = useState<number | null>(null);

 // REQ-VIS-005: draw-in 애니메이션 설정
  const lineAnimation = getLineChartAnimationProps();

  // 현재 뷰 모드에 따른 데이터 선택
  const chartData = viewMode === 'weekly' ? weeklyData : monthlyData;

  // X축 라벨 포맷 (MM-DD)
  const formatXAxisLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  };

  // 스와이프 제스처 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    // 스와이프 임계값 (100px 이상)
    if (Math.abs(diff) > 100) {
      // 오른쪽에서 왼쪽으로 스와이프 (다음 뷰)
      if (diff > 0 && viewMode === 'weekly') {
        setViewMode('monthly');
      }
      // 왼쪽에서 오른쪽으로 스와이프 (이전 뷰)
      else if (diff < 0 && viewMode === 'monthly') {
        setViewMode('weekly');
      }
    }

    setTouchStart(null);
  };

  return (
    <div className="glass-card animate-draw-in rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md dark:bg-gray-900/30 dark:border-white/10 p-4">
      {/* 뷰 전환 토글 버튼 */}
      <div className="flex justify-end items-center mb-4">
        <div className="flex gap-2" role="group" aria-label="차트 기간 선택">
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-3 py-2 rounded-full text-xs font-jakarta font-medium transition-all duration-300 min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-transparent ${
              viewMode === 'weekly'
                ? 'bg-white dark:bg-gray-100 text-gray-800 shadow-sm'
                : 'bg-white/30 dark:bg-white/20 text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-white/30'
            }`}
            aria-label="주간 뷰"
            aria-pressed={viewMode === 'weekly'}
          >
            7일
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-3 py-2 rounded-full text-xs font-jakarta font-medium transition-all duration-300 min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-transparent ${
              viewMode === 'monthly'
                ? 'bg-white dark:bg-gray-100 text-gray-800 shadow-sm'
                : 'bg-white/30 dark:bg-white/20 text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-white/30'
            }`}
            aria-label="월간 뷰"
            aria-pressed={viewMode === 'monthly'}
          >
            30일
          </button>
        </div>
      </div>

      {/* 차트 영역 - 스와이프 제스처 지원 */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="transition-all duration-300"
        style={{ cursor: 'grab' }}
      >
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            role="img"
            aria-label={`${viewMode === 'weekly' ? '주간' : '월간'} 감정 트렌드 차트`}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxisLabel}
              stroke="rgba(100,100,100,0.6)"
              style={{ fontSize: '12px', fill: 'rgba(100,100,100,0.8)' }}
            />
            <YAxis
              stroke="rgba(100,100,100,0.6)"
              style={{ fontSize: '12px', fill: 'rgba(100,100,100,0.8)' }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'rgba(255,255,255,0.3)', strokeWidth: 1 }}
            />
            {EMOTION_TYPES.map((emotion) => (
              <Line
                key={emotion}
                type="monotone"
                dataKey={emotion}
                stroke={EMOTION_COLORS[emotion]}
                strokeWidth={2}
                dot={{ fill: EMOTION_COLORS[emotion], r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls={true}
                isAnimationActive={lineAnimation.isAnimationActive}
                animationDuration={lineAnimation.animationDuration}
                animationEasing={lineAnimation.animationEasing}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* REQ-VIS-007: 스크린 리더용 대체 테이블 */}
      {chartData.length > 0 && (
        <table className="sr-only" aria-label={`${viewMode === 'weekly' ? '주간' : '월간'} 감정 트렌드 데이터`}>
          <caption>{viewMode === 'weekly' ? '최근 7일' : '최근 30일'} 감정 빈도 데이터</caption>
          <thead>
            <tr>
              <th scope="col">날짜</th>
              {EMOTION_TYPES.map((emotion) => (
                <th key={emotion} scope="col">{EMOTION_THEME[emotion]?.label ?? emotion}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chartData.map((day) => (
              <tr key={day.date}>
                <th scope="row">{formatXAxisLabel(day.date)}</th>
                {EMOTION_TYPES.map((emotion) => (
                  <td key={emotion}>{day[emotion] ?? 0}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
