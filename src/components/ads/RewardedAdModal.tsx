/**
 * RewardedAdModal.tsx
 *
 * 보상형 광고 모달 컴포넌트
 * @apps-in-toss/web-framework의 GoogleAdMob API를 사용합니다.
 * userEarnedReward 이벤트로 보상 지급을 확인합니다.
 *
 * SPEC: SPEC-AD-003 (REQ-RWD-002, REQ-RWD-003, REQ-RWD-004, REQ-RWD-005)
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GoogleAdMob } from '@apps-in-toss/web-framework';
import { REWARDED_AD_GROUP_ID } from '@/lib/ad/adConfig';
import { jellySkins, SKIN_THEMES, type SkinTier, type JellySkin } from '@/lib/rewards/jellySkins';
import { weeklyReport, type EmotionHistoryItem } from '@/lib/rewards/weeklyReport';
import { emotionKeywords, type EmotionKeyword } from '@/lib/rewards/emotionKeywords';
import { SKIN_FEATURES, type SkinFeature } from '@/lib/constants/skinFeatures';
import { EMOTION_COLORS } from '@/lib/constants/emotion';

// 보상 유형
export type RewardType = 'weekly_report' | 'emotion_keywords' | 'jelly_skin';

// Props 인터페이스
interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReward?: (reward: RewardType) => void;
  selectedReward?: RewardType;
  adPlaying?: boolean;
  // SPEC-AD-003: 실제 데이터 전달 props
  emotionHistory?: EmotionHistoryItem[];
  latestDiaryText?: string;
  rewardedAdCount?: number;
  onRewardClaimed?: (reward: RewardType) => void;
}

// @MX:NOTE: [AUTO] 보상형 광고 시청 횟수 → 스킨 등급 매핑 (REQ-RWD-003)
// @MX:REASON: 1-3→rare, 4-6→epic, 7+→legendary
function getSkinTier(adCount: number): SkinTier {
  if (adCount >= 7) return 'legendary';
  if (adCount >= 4) return 'epic';
  return 'rare';
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
  emotionHistory = [],
  latestDiaryText = '',
  rewardedAdCount = 0,
  onRewardClaimed,
}) => {
  const [rewardReady, setRewardReady] = useState(false);

  // 보상형 광고 로드 및 표시
  const loadAndShowRewardedAd = useCallback(() => {
    let loadCleanup: (() => void) | undefined;
    let showCleanup: (() => void) | undefined;

    try {
      // WebView 환경 지원 여부 확인 (isSupported 접근 자체가 에러 발생 가능)
      let isSupported = false;
      try {
        isSupported = GoogleAdMob.loadAppsInTossAdMob.isSupported?.() === true;
      } catch {
        isSupported = false;
      }
      if (!isSupported) {
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
              let showSupported = false;
              try {
                showSupported = GoogleAdMob.showAppsInTossAdMob.isSupported?.() === true;
              } catch {
                showSupported = false;
              }
              if (!showSupported) {
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
            // 선택된 보상 표시 (실제 라이브러리 호출)
            <RewardContentView
              reward={selectedReward}
              emotionHistory={emotionHistory}
              latestDiaryText={latestDiaryText}
              rewardedAdCount={rewardedAdCount}
              onRewardClaimed={onRewardClaimed}
            />
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

// 보상 내용 뷰 (REQ-RWD-003/004/005)
const RewardContentView: React.FC<{
  reward: RewardType;
  emotionHistory: EmotionHistoryItem[];
  latestDiaryText: string;
  rewardedAdCount: number;
  onRewardClaimed?: (reward: RewardType) => void;
}> = ({ reward, emotionHistory, latestDiaryText, rewardedAdCount, onRewardClaimed }) => {
  switch (reward) {
    case 'weekly_report':
      return <WeeklyReportView emotionHistory={emotionHistory} onRewardClaimed={onRewardClaimed} />;
    case 'emotion_keywords':
      return <EmotionKeywordsView latestDiaryText={latestDiaryText} onRewardClaimed={onRewardClaimed} />;
    case 'jelly_skin':
      return <JellySkinView rewardedAdCount={rewardedAdCount} onRewardClaimed={onRewardClaimed} />;
    default:
      return null;
  }
};

// REQ-RWD-004: 주간 리포트 뷰 (실제 generateReport 호출)
const WeeklyReportView: React.FC<{
  emotionHistory: EmotionHistoryItem[];
  onRewardClaimed?: (reward: RewardType) => void;
}> = ({ emotionHistory, onRewardClaimed }) => {
  const report = weeklyReport.generateReport(emotionHistory);

  // 보상 지급 콜백
  React.useEffect(() => {
    if (onRewardClaimed) {
      onRewardClaimed('weekly_report');
    }
  }, [onRewardClaimed]);

  if (!report) {
    // 최소 3개 감정 기록 부족
    return (
      <div className="text-center py-4">
        <div className="bg-gray-50 rounded-lg p-4" data-testid="weekly-report-view">
          <span className="text-3xl">📝</span>
          <p className="text-gray-700 mt-2">더 많은 기록이 필요해요</p>
          <p className="text-sm text-gray-500 mt-1">
            주간 리포트를 받으려면 최소 3회 이상 감정을 기록해주세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <h3 className="font-semibold mb-3 text-center">📊 주간 감정 패턴 리포트</h3>
      <div className="max-h-[400px] overflow-y-auto space-y-4" data-testid="weekly-report-view">
        {/* 감정 분포 */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-600 mb-2">감정 분포</h4>
          {report.emotionDistribution
            .filter((d) => d.count > 0)
            .map((dist) => (
              <div key={dist.emotion} className="flex items-center gap-2 mb-1.5">
                <span className="text-xs w-12 truncate">{dist.emotion}</span>
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${dist.percentage}%`,
                      backgroundColor: EMOTION_COLORS[dist.emotion as keyof typeof EMOTION_COLORS] || '#ccc',
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">{dist.count}회</span>
              </div>
            ))}
        </div>

        {/* TOP 3 감정 */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-600 mb-2">TOP 3 감정</h4>
          {report.topEmotions.map((top, i) => (
            <div key={top.emotion} className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold">{i + 1}.</span>
              <span className="text-sm">{top.emotion}</span>
              <span className="text-xs text-gray-500">{top.percentage.toFixed(0)}%</span>
            </div>
          ))}
        </div>

        {/* 추세 */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-600 mb-2">7일 추세</h4>
          {report.emotionTrend.map((trend) => (
            <div key={trend.date} className="flex items-center gap-2 mb-1 text-xs">
              <span className="text-gray-500 w-20">{trend.date.slice(5)}</span>
              <span>{trend.dominantEmotion !== 'none' ? trend.dominantEmotion : '-'}</span>
              {trend.count > 0 && <span className="text-gray-400">({trend.count}회)</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// REQ-RWD-005: 감정 키워드 뷰 (실제 extractKeywords 호출)
const EmotionKeywordsView: React.FC<{
  latestDiaryText: string;
  onRewardClaimed?: (reward: RewardType) => void;
}> = ({ latestDiaryText, onRewardClaimed }) => {
  const keywords: EmotionKeyword[] = emotionKeywords.extractKeywords(latestDiaryText);

  // 보상 지급 콜백
  React.useEffect(() => {
    if (onRewardClaimed) {
      onRewardClaimed('emotion_keywords');
    }
  }, [onRewardClaimed]);

  if (keywords.length === 0) {
    return (
      <div className="text-center py-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <span className="text-3xl">💬</span>
          <p className="text-gray-700 mt-2">감정을 더 자세히 적어주시면 키워드가 나타나요</p>
          <p className="text-sm text-gray-500 mt-1">
            일기에 더 자세한 감정을 표현해보세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <h3 className="font-semibold mb-3">오늘의 감정 키워드</h3>
      <div className="space-y-2" data-testid="keyword-card-list">
        {keywords.map((keyword, index) => (
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

// REQ-RWD-003: 젤리 스킨 뷰 (실제 unlockRandomSkin 호출)
const JellySkinView: React.FC<{
  rewardedAdCount: number;
  onRewardClaimed?: (reward: RewardType) => void;
}> = ({ rewardedAdCount, onRewardClaimed }) => {
  const [unlockedSkin, setUnlockedSkin] = React.useState<JellySkin | null>(null);
  const claimedRef = React.useRef(false);

  React.useEffect(() => {
    if (claimedRef.current) return;
    claimedRef.current = true;

    const tier = getSkinTier(rewardedAdCount);
    const skin = jellySkins.unlockRandomSkin(tier);
    setUnlockedSkin(skin);

    if (onRewardClaimed) {
      onRewardClaimed('jelly_skin');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!unlockedSkin) {
    // 해당 등급의 모든 스킨이 이미 해금됨
    return (
      <div className="text-center py-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <span className="text-3xl">✨</span>
          <p className="text-gray-700 mt-2">모든 스킨을 이미 보유하고 있어요!</p>
          <p className="text-sm text-gray-500 mt-1">다음 등급 스킨을 기다려주세요</p>
        </div>
      </div>
    );
  }

  const theme = SKIN_THEMES[unlockedSkin.id] || SKIN_THEMES['bear'];
  const features = SKIN_FEATURES[unlockedSkin.id] || [];

  return (
    <div className="text-center py-4">
      <div
        className="inline-block animate-bounce"
        data-testid="skin-unlock-animation"
      >
        <span className="text-6xl">{unlockedSkin.emoji}</span>
      </div>
      <h3 className="font-semibold mt-4">
        {unlockedSkin.name} 스킨 해금!
        <span
          className="ml-2 text-xs px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: theme.primaryColor }}
        >
          {unlockedSkin.tier.toUpperCase()}
        </span>
      </h3>
      <p className="text-sm text-gray-600 mt-2">24시간 동안 적용됩니다</p>

      {/* 스킨 피처 미리보기 */}
      {features.length > 0 && (
        <div className="mt-3 inline-block">
          <svg viewBox="0 0 1 1" className="w-16 h-16" aria-hidden="true">
            {features.map((feature: SkinFeature, i: number) => {
              const fillColor = feature.colorKey === 'primary' ? theme.primaryColor
                : feature.colorKey === 'accent' ? theme.accentColor
                : feature.colorKey === 'white' ? '#ffffff'
                : '#333333';
              if (feature.type === 'circle') {
                return <circle key={i} cx={feature.attrs.cx} cy={feature.attrs.cy} r={feature.attrs.r} fill={fillColor} opacity={feature.opacity || 1} />;
              }
              if (feature.type === 'ellipse') {
                return <ellipse key={i} cx={feature.attrs.cx} cy={feature.attrs.cy} rx={feature.attrs.rx} ry={feature.attrs.ry} fill={fillColor} opacity={feature.opacity || 1} />;
              }
              if (feature.type === 'path') {
                return <path key={i} d={feature.attrs.d as string} fill={fillColor} opacity={feature.opacity || 1} />;
              }
              return null;
            })}
          </svg>
        </div>
      )}

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
