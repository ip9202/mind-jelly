/**
 * 주간/월간 감정 트렌드 라인 차트 컴포넌트
 * REQ-VIS-001: 최근 7일/30일간의 감정 변화 추이를 시각화
 * REQ-VIS-004-3: 주간/월간 뷰 전환 기능
 * @MX:SPEC: SPEC-UI-001
 */

'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EMOTION_COLORS } from '@/lib/constants/emotion';
import { useEmotionChartData } from '@/hooks/useEmotionChartData';
import type { EmotionType } from '@/types/emotion';

// @MX:NOTE: 감정 타입 배열 (라인 렌더링용)
const EMOTION_TYPES: EmotionType[] = [
  'joy', 'sadness', 'anger', 'fear', 'disgust',
  'surprise', 'love', 'gratitude', 'hope',
];

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
    <div className="glass-card rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md p-4">
      {/* 뷰 전환 토글 버튼 */}
      <div className="flex justify-between items-center mb-4">
        <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
          show_chart
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
              viewMode === 'weekly'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'bg-white/20 text-white/70 hover:bg-white/30'
            }`}
            aria-label="주간 뷰"
            aria-pressed={viewMode === 'weekly'}
          >
            7일
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
              viewMode === 'monthly'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'bg-white/20 text-white/70 hover:bg-white/30'
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
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxisLabel}
              stroke="rgba(255,255,255,0.7)"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.7)"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{ color: '#000', fontWeight: 'bold' }}
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
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
