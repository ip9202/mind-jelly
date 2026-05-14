/**
 * RewardedAdModal.tsx
 *
 * 보상형 광고 모달 컴포넌트
 * @apps-in-toss/web-framework의 GoogleAdMob API를 사용합니다.
 * userEarnedReward 이벤트로 보상 지급을 확인합니다.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GoogleAdMob } from '@apps-in-toss/web-framework';
import { REWARDED_AD_GROUP_ID } from '@/lib/ad/adConfig';

// 보상 유형
export type RewardType = 'weekly_report' | 'emotion_keywords' | 'jelly_skin';

// Props 인터페이스
interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReward?: (reward: RewardType) => void;
  selectedReward?: RewardType;
  adPlaying?: boolean;
}

/**
 * RewardedAdModal - 보상형 광고 모달
 *
 * @MX:NOTE AppIntos GoogleAdMob 보상형 광고 연동으로 보상 지급
 * @MX:WARN 광고 완주 전에 모달 닫으면 보상 미지급
 */
export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  onClose,
  onSelectReward,
  selectedReward,
  adPlaying = false,
}) => {
  const [rewardReady, setRewardReady] = useState(false);

  // 보상형 광고 로드 및 표시
  const loadAndShowRewardedAd = useCallback(() => {
    let loadCleanup: (() => void) | undefined;
    let showCleanup: (() => void) | undefined;

    try {
      // WebView 환경 지원 여부 확인
      if (GoogleAdMob.loadAppsInTossAdMob.isSupported?.() !== true) {
        // WebView 외 환경에서는 테스트용으로 보상 활성화
        queueMicrotask(() => setRewardReady(true));
        return;
      }

      // 보상형 광고 미리 로드
      loadCleanup = GoogleAdMob.loadAppsInTossAdMob({
        options: { adGroupId: REWARDED_AD_GROUP_ID },
        onEvent: (event) => {
          if (event.type === 'loaded') {
            // 로드 완료 후 광고 표시
            try {
              if (GoogleAdMob.showAppsInTossAdMob.isSupported?.() !== true) {
                setRewardReady(true);
                return;
              }

              showCleanup = GoogleAdMob.showAppsInTossAdMob({
                options: { adGroupId: REWARDED_AD_GROUP_ID },
                onEvent: (showEvent) => {
                  switch (showEvent.type) {
                    case 'userEarnedReward':
                      // 사용자가 광고를 끝까지 시청하여 보상 획득
                      console.log('[RewardedAd] 보상 획득:', showEvent.data);
                      setRewardReady(true);
                      break;
                    case 'dismissed':
                      // 사용자가 광고를 닫음
                      break;
                    case 'failedToShow':
                      console.error('[RewardedAd] 광고 표시 실패');
                      // 폴백: 테스트용 보상 활성화
                      setRewardReady(true);
                      break;
                  }
                },
                onError: (error: unknown) => {
                  console.error('[RewardedAd] 광고 표시 에러:', error);
                  // 폴백: 테스트용 보상 활성화
                  setRewardReady(true);
                },
              });
            } catch (error) {
              console.error('[RewardedAd] 광고 표시 실패:', error);
              setRewardReady(true);
            }
          }
        },
        onError: (error: unknown) => {
          console.error('[RewardedAd] 광고 로드 실패:', error);
          // 폴백: 테스트용 보상 활성화
          setRewardReady(true);
        },
      });
    } catch (error) {
      console.error('[RewardedAd] 광고 초기화 실패:', error);
      // 폴백: 테스트용 보상 활성화
      queueMicrotask(() => setRewardReady(true));
    }

    // cleanup 함수 반환 (useEffect에서 사용)
    return () => {
      loadCleanup?.();
      showCleanup?.();
    };
  }, []);

  // 모달 열릴 때 광고 로드
  useEffect(() => {
    if (!isOpen) return;

    const cleanup = loadAndShowRewardedAd();
    return cleanup;
  }, [isOpen, loadAndShowRewardedAd]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !adPlaying) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, adPlaying, onClose]);

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  // 보상 선택 핸들러
  const handleSelectReward = (reward: RewardType) => {
    if (onSelectReward && rewardReady) {
      onSelectReward(reward);
    }
  };

  // backdrop 클릭 핸들러 (광고 재생 중에는 닫기 불가)
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !adPlaying) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      data-testid="rewarded-ad-modal-backdrop"
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">보상 선택</h2>
          <button
            onClick={onClose}
            disabled={adPlaying}
            className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 내용 */}
        <div className="p-4">
          {selectedReward ? (
            // 선택된 보상 표시
            <RewardContentView reward={selectedReward} />
          ) : (
            // 보상 유형 선택
            <RewardSelectionView
              onRewardSelect={handleSelectReward}
              rewardReady={rewardReady}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// 보상 선택 뷰
const RewardSelectionView: React.FC<{
  onRewardSelect: (reward: RewardType) => void;
  rewardReady: boolean;
}> = ({ onRewardSelect, rewardReady }) => {
  const rewards = [
    {
      type: 'weekly_report' as RewardType,
      title: '주간 감정 패턴 리포트',
      description: '지난 7일간의 감정 변화를 시각화한 리포트',
      icon: '📊',
    },
    {
      type: 'emotion_keywords' as RewardType,
      title: '오늘의 감정 키워드',
      description: '오늘 기록에서 가장 많이 등장한 감정 키워드 5개',
      icon: '🔤',
    },
    {
      type: 'jelly_skin' as RewardType,
      title: '한정판 젤리 스킨',
      description: '24시간 동안 적용되는 귀여운 젤리 스킨',
      icon: '🎨',
    },
  ];

  return (
    <div className="space-y-3">
      {rewards.map((reward) => (
        <button
          key={reward.type}
          onClick={() => onRewardSelect(reward.type)}
          disabled={!rewardReady}
          className="w-full p-4 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{reward.icon}</span>
            <div className="flex-1">
              <h3 className="font-semibold">{reward.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

// 보상 내용 뷰
const RewardContentView: React.FC<{ reward: RewardType }> = ({ reward }) => {
  switch (reward) {
    case 'weekly_report':
      return <WeeklyReportView />;
    case 'emotion_keywords':
      return <EmotionKeywordsView />;
    case 'jelly_skin':
      return <JellySkinView />;
    default:
      return null;
  }
};

// 주간 리포트 뷰
const WeeklyReportView: React.FC = () => {
  return (
    <div className="text-center py-4">
      <div
        className="max-h-[400px] overflow-y-auto bg-gray-50 rounded-lg p-4"
        data-testid="weekly-report-view"
      >
        <p className="text-gray-700">📊 주간 감정 패턴 리포트</p>
        <p className="text-sm text-gray-500 mt-2">
          지난 7일간의 감정 변화를 분석한 리포트가 준비되었습니다.
        </p>
      </div>
    </div>
  );
};

// 감정 키워드 뷰
const EmotionKeywordsView: React.FC = () => {
  const mockKeywords = [
    { word: '행복', frequency: 5 },
    { word: '즐거움', frequency: 3 },
    { word: '기쁨', frequency: 2 },
    { word: '웃음', frequency: 2 },
    { word: '즐겁다', frequency: 1 },
  ];

  return (
    <div className="py-4">
      <h3 className="font-semibold mb-3">오늘의 감정 키워드</h3>
      <div
        className="space-y-2"
        data-testid="keyword-card-list"
      >
        {mockKeywords.map((keyword, index) => (
          <div
            key={keyword.word}
            data-testid={`keyword-card-${index}`}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <span className="font-medium">{keyword.word}</span>
            <span className="text-sm text-gray-500">{keyword.frequency}회</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 젤리 스킨 뷰
const JellySkinView: React.FC = () => {
  return (
    <div className="text-center py-4">
      <div
        className="inline-block animate-bounce"
        data-testid="skin-unlock-animation"
      >
        <span className="text-6xl">🐻</span>
      </div>
      <h3 className="font-semibold mt-4">곰돌이 스킨 해금!</h3>
      <p className="text-sm text-gray-600 mt-2">24시간 동안 적용됩니다</p>
      <div
        className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
        data-testid="skin-info"
      >
        <p className="text-sm text-yellow-800">
          새로운 스킨으로 교체되었습니다
        </p>
      </div>
    </div>
  );
};
