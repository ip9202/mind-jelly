/**
 * 감정 상세 슬라이드업 패널 컴포넌트
 * REQ-VIS-004: 도넛 차트 섹터 클릭 시 표시되는 일별 상세 내역
 * @MX:ANCHOR: 감정 리포트 인터랙티브 요소 핵심 컴포넌트
 * @MX:REASON: 사용자가 특정 감정의 일별 패턴을 심측 분석하는 진입점
 * @MX:SPEC: SPEC-UI-001
 */

'use client';

import { useEffect } from 'react';
import { EMOTION_THEME, EMOTION_COLORS } from '@/lib/constants/emotion';
import { useEmotionChartData } from '@/hooks/useEmotionChartData';
import type { EmotionType } from '@/types/emotion';

interface EmotionDetailPanelProps {
  isOpen: boolean;
  emotionKey: EmotionType;
  onClose: () => void;
}

/**
 * 감정 상세 슬라이드업 패널 컴포넌트
 */
export function EmotionDetailPanel({ isOpen, emotionKey, onClose }: EmotionDetailPanelProps) {
  const { weeklyData } = useEmotionChartData();

  // ESC 키로 패널 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // 패널이 닫혀있으면 아무것도 렌더링하지 않음
  if (!isOpen) {
    return null;
  }

  // 선택된 감정의 일별 데이터 필터링
  const dailyData = weeklyData.map((day) => ({
    date: day.date,
    count: day[emotionKey] || 0,
  })).filter((day) => day.count > 0);

  const emotion = EMOTION_THEME[emotionKey];

  return (
    <div
      data-testid="emotion-detail-panel"
      role="dialog"
      aria-modal="true"
      aria-label={`${emotion.label} 감정 상세 내역`}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-3xl p-6 transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더: 감정 라벨 + 닫기 버튼 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: EMOTION_COLORS[emotionKey] }}
            >
              <span className="text-2xl">{emotion.label[0]}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{emotion.label} 감정</h2>
              <p className="text-sm text-gray-600">
                총 {dailyData.reduce((sum, day) => sum + day.count, 0)}회 정화
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="닫기"
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all duration-300"
          >
            <span className="material-symbols-outlined text-gray-600">close</span>
          </button>
        </div>

        {/* 일별 상세 내역 */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {dailyData.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              아직 기록된 데이터가 없어요
            </p>
          ) : (
            dailyData.map((day) => (
              <div
                key={day.date}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-300 hover:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: EMOTION_COLORS[emotionKey] }}
                  >
                    {day.count}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(day.date).toLocaleDateString('ko-KR', {
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 하단: 감정 조언 */}
        <div
          className="mt-6 p-4 rounded-xl bg-opacity-20"
          style={{ backgroundColor: EMOTION_COLORS[emotionKey] }}
        >
          <p className="text-sm font-medium text-gray-700 leading-relaxed">
            <span className="material-symbols-outlined text-sm align-middle mr-1" style={{ color: EMOTION_COLORS[emotionKey] }}>
              tips_and_updates
            </span>
            {emotion.advice[0]}
          </p>
        </div>
      </div>
    </div>
  );
}
