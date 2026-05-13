/**
 * 감정 분포 도넛 차트 컴포넌트
 * REQ-VIS-002: 전체 감정 중 각 감정의 비율을 도넛 차트로 시각화
 * Recharts PieChart 기반 구현
 */

'use client';

import { useMemo } from 'react';
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { EmotionFace } from '@/components/jelly/EmotionFace';
import { useEmotionChartData } from '@/hooks/useEmotionChartData';
import { getPieChartAnimationProps } from './ChartAnimations';
import { EMOTION_THEME, UI_COLORS } from '@/lib/constants/emotion';
import type { EmotionDistribution } from '@/types/emotion-chart';
import type { EmotionType } from '@/types/emotion';

// @MX:NOTE: 도넛 차트 데이터 타입 (기타 통합 포함)
interface DonutSector {
  name: string; // 감정키 또는 '기타'
  value: number; // 백분율
  color: string;
  count: number;
  emotionKey?: string; // 기타가 아닌 경우에만 존재
}

/**
 * 5% 미만 감정을 "기타"로 통합
 * @MX:SPEC: SPEC-UI-001
 */
function consolidateSmallEmotions(distribution: EmotionDistribution[]): DonutSector[] {
  // 5% 미만 감정 필터링
  const smallEmotions = distribution.filter((d) => d.percentage < 5);
  const largeEmotions = distribution.filter((d) => d.percentage >= 5);

  const sectors: DonutSector[] = largeEmotions.map((d) => ({
    name: d.emotionKey,
    value: d.percentage,
    color: d.color,
    count: d.count,
    emotionKey: d.emotionKey,
  }));

  // 기타 섹터 추가 (5% 미만 감정들의 합)
  if (smallEmotions.length > 0) {
    const otherPercentage = smallEmotions.reduce((sum, d) => sum + d.percentage, 0);
    const otherCount = smallEmotions.reduce((sum, d) => sum + d.count, 0);

    sectors.push({
      name: '기타',
      value: otherPercentage,
      color: UI_COLORS.otherSector,
      count: otherCount,
    });
  }

  return sectors;
}

/**
 * 가장 빈번한 감정 찾기
 * @MX:NOTE: 중앙 표시용 최대 빈도 감정 계산
 * @MX:SPEC: SPEC-UI-001
 */
function findMostFrequentEmotion(distribution: EmotionDistribution[]): EmotionDistribution | null {
  if (distribution.length === 0) return null;

  return distribution.reduce((prev, current) =>
    current.count > prev.count ? current : prev,
  );
}

/**
 * 감정 분포 도넛 차트 컴포넌트
 * @MX:ANCHOR: 감정 리포트 시각화 핵심 컴포넌트
 * @MX:REASON: 홈 화면 감정 리포트 영역에서 필수 시각화 요소로 사용
 * @MX:SPEC: SPEC-UI-001
 */
interface EmotionDonutChartProps {
  selectedEmotion: EmotionType | null;
  onEmotionSelect: (emotion: EmotionType | null) => void;
}

export function EmotionDonutChart({ selectedEmotion, onEmotionSelect }: EmotionDonutChartProps) {
  const { distribution } = useEmotionChartData();

  // 도넛 차트 데이터 계산 (5% 미만 통합)
  const chartData = useMemo(() => {
    return consolidateSmallEmotions(distribution);
  }, [distribution]);

  // 가장 빈번한 감정
  const mostFrequent = useMemo(() => {
    return findMostFrequentEmotion(distribution);
  }, [distribution]);

  // REQ-VIS-005: reveal 애니메이션 설정
  const pieAnimation = getPieChartAnimationProps();

  // 섹터 클릭 핸들러
  const handleSectorClick = (data: DonutSector) => {
    if (data.emotionKey) {
      onEmotionSelect(data.emotionKey === selectedEmotion ? null : data.emotionKey as EmotionType);
    }
  };

  return (
    <div
      className="glass-card animate-reveal bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 dark:bg-gray-900/30 dark:border-white/10 p-6"
      role="img"
      aria-label="감정 분포 도넛 차트"
    >
      {/* 기간 표시 */}
      <p className="text-center text-xs font-gamja text-gray-600 dark:text-gray-300 mb-2">
        최근 7일
      </p>

      <div className="relative h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              onClick={handleSectorClick}
              cursor="pointer"
              isAnimationActive={pieAnimation.isAnimationActive}
              animationBegin={pieAnimation.animationBegin}
              animationDuration={pieAnimation.animationDuration}
              animationEasing={pieAnimation.animationEasing}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`sector-${index}`}
                  name={entry.name}
                  fill={entry.color}
                  stroke={selectedEmotion === entry.emotionKey ? 'white' : 'none'}
                  strokeWidth={selectedEmotion === entry.emotionKey ? 2 : 0}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload as DonutSector;

                // emotionKey가 있으면 한글 라벨 사용, 없으면 name 사용 (기타의 경우)
                const displayName = data.emotionKey && data.emotionKey in EMOTION_THEME
                  ? EMOTION_THEME[data.emotionKey as EmotionType]?.label ?? data.name
                  : data.name;

                return (
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                    <p className="text-sm font-gamja font-medium text-gray-800 dark:text-gray-100">
                      {displayName}: {data.value}%
                    </p>
                    <p className="text-xs font-jakarta text-gray-600 dark:text-gray-300">
                      {data.count}회
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* 중앙 표시: 가장 빈번한 감정 또는 빈 상태 메시지 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {mostFrequent ? (
            <div className="text-center">
              <div className="flex justify-center mb-1">
                <EmotionFace emotion={mostFrequent.emotionKey} size={32} />
              </div>
              <p className="text-2xl font-bold font-gamja text-white drop-shadow-sm">
                {mostFrequent.percentage}%
              </p>
            </div>
          ) : (
            <p className="text-white/80 text-sm text-center px-4 font-gamja">
              아직 감정 데이터가 없어요
            </p>
          )}
        </div>
      </div>

      {/* 선택된 감정 상세 정보 */}
      {selectedEmotion && (
        <div className="mt-4 p-3 bg-white/20 dark:bg-gray-700/30 rounded-xl backdrop-blur-sm" role="status" aria-live="polite">
          <p className="text-sm font-gamja text-white">
            <span className="font-medium">
              {selectedEmotion}
            </span>
            {' '}
            감정을 선택했어요
          </p>
        </div>
      )}

      {/* REQ-VIS-007: 스크린 리더용 대체 테이블 */}
      {chartData.length > 0 && (
        <table className="sr-only" aria-label="감정 분포 데이터">
          <caption>전체 감정 중 각 감정의 비율</caption>
          <thead>
            <tr>
              <th scope="col">감정</th>
              <th scope="col">비율 (%)</th>
              <th scope="col">횟수</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((entry) => (
              <tr key={entry.name}>
                <td>{entry.name}</td>
                <td>{entry.value}</td>
                <td>{entry.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
