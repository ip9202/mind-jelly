/**
 * 감정 리포트 스켈레톤 로딩 컴포넌트
 * REQ-VIS-010: 차트 로딩 중 스켈레톤 UI 표시
 * @MX:SPEC: SPEC-UI-001
 */

'use client';

export function EmotionReportSkeleton() {
  return (
    <div
      className="glass-card rounded-3xl px-5 py-4 bg-white/10 backdrop-blur-md border border-white/20 dark:bg-gray-900/30 dark:border-white/10"
      aria-busy="true"
      aria-label="감정 리포트 로딩 중"
    >
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* 감정 표현 + 요약 스켈레톤 */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>

      {/* 인사이트 섹션 스켈레톤 */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        </div>
      </div>

      {/* 차트 영역 스켈레톤 (2열 그리드) */}
      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" aria-hidden="true" />
          <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" aria-hidden="true" />
        </div>
      </div>

      {/* 인사이트 텍스트 스켈레톤 */}
      <div className="p-3 rounded-xl bg-white/5 dark:bg-white/5">
        <div className="flex items-start gap-2">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="w-5/6 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="w-4/6 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
