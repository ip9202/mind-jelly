# SPEC-AD-002: 구현 계획

## 종속성

- **선행 SPEC**: SPEC-AD-001 (AdMob SDK, 빈도 제어기)
- **프레임워크**: `@apps-in-toss/web-framework` Rewarded Ad API
- **상태 관리**: Zustand (rewardStore), localStorage (영속화)
- **기존 스토어**: `jellyStore` (emotionHistory 접근)
- **차트**: 간단한 SVG 기반 원 그래프 (외부 라이브러리 최소화)
- **기존 코드**: `JellyRenderer.tsx` (스킨 오버레이 지원)

## 태스크 분해 (종속성 순서)

### Task 1: 보상 상태 스토어 (rewardStore.ts)

**우선순위**: High (후속 태스크의 기반)

- Zustand 스토어 생성 + persist 미들웨어
- 상태: `unlockedSkins`, `activeSkin`, `skinExpiryTime`, `weeklyReportData`, `todayKeywords`
- 액션: `unlockSkin()`, `deactivateSkin()`, `saveWeeklyReport()`, `saveKeywords()`
- localStorage 키: `reward-state`
- 앱 시작 시 만료된 스킨 자동 비활성화 로직

### Task 2: 주간 감정 패턴 리포트 (weeklyReport.ts)

**우선순위**: Medium (Task 1 선행)

- `jellyStore.emotionHistory`에서 최근 7일 데이터 필터링
- 감정별 카운트 계산 -> 비율 (%) 변환
- TOP 3 감정 추출
- 일자별 감정 추세 데이터 생성
- 요일/시간대별 패턴 분석
- 데이터 부족(3회 미만) 시 폴백 안내 생성

**@MX 타겟**:
- `generateWeeklyReport()` -- 보상 시스템 핵심 함수, `@MX:ANCHOR` 후보

### Task 3: 감정 키워드 추출 (emotionKeywords.ts)

**우선순위**: Medium (Task 1 선행)

- 오늘 입력된 감정 텍스트에서 명사/형용사 추출
- 간단한 한국어 키워드 추출 (공백 분리 + 빈도 카운트)
- 상위 5개 키워드 선정
- 감정-키워드 연관어 매핑 (정적 매핑 테이블)
- 키워드가 부족한 경우 폴백 (감정명 자체를 키워드로 사용)

### Task 4: 한정판 스킨 관리 (jellySkins.ts)

**우선순위**: Medium (Task 1 선행)

- 스킨 정의: 곰돌이, 고양이, 판다 (초기 3종)
- 각 스킨: 이름, 아이콘/색상 테마, SVG 오버레이 정의
- 무작위 스킨 선택 (미해금 스킨 우선, 모두 해금 시 랜덤)
- 24시간 타이머 관리 (Date 기반 계산, setInterval 아님)
- 스킨 활성화/비활성화 로직

### Task 5: 보상형 광고 모달 (RewardedAdModal.tsx)

**우선순위**: High (Task 1, 2, 3, 4 선행)

- 보상 유형 선택 화면 (A/B/C 카드)
- AdMob Rewarded Ad 로드/재생 래퍼
- 광고 완주 감지 -> 보상 지급 트리거
- 광고 실패/중도 포기 처리
- 보상 결과 표시 (리포트/키워드/스킨 해금)

### Task 6: 보상 결과 뷰 컴포넌트

**우선순위**: Medium (Task 5 선행)

- `WeeklyReportView.tsx`: 원 그래프 + TOP 3 + 추세 + 패턴
- `KeywordCardList.tsx`: 키워드 카드 5개 리스트
- `SkinUnlockAnimation.tsx`: 스킨 해금 축하 애니메이션 (Framer Motion)

### Task 7: 홈 페이지 + 젤리 렌더러 통합

**우선순위**: High (Task 5, 6 선행)

- `page.tsx`: report 화면에 보상 CTA 버튼 추가
- `RewardedAdModal` 렌더링 + 상태 연결
- `JellyRenderer.tsx`: activeSkin prop 추가, 스킨 오버레이 렌더링
- 스킨 활성화 시 젤리 색상/표정 오버라이드

## 기술 접근

### 보상형 광고 흐름

```
report 화면 -> CTA 버튼 클릭 -> 모달 열림
  -> 보상 유형 선택 (A/B/C)
  -> AdMob Rewarded Ad 로드
  -> 30초 광고 재생 (중도 포기 불가)
  -> 광고 완주 이벤트
  -> 선택된 보상 생성 로직 실행
  -> 보상 결과 UI 표시
  -> 모달 닫기
```

### 주간 리포트 데이터 구조

```typescript
interface WeeklyReport {
  period: { start: string; end: string }; // YYYY-MM-DD
  emotionDistribution: Record<string, number>; // 감정명 -> 비율(%)
  topEmotions: Array<{ name: string; count: number; percentage: number }>;
  dailyTrend: Array<{ date: string; dominantEmotion: string }>;
  dayOfWeekPattern: Record<string, string>; // 요일 -> 지배 감정
  timeOfDayPattern: Record<string, string>; // 시간대 -> 지배 감정
  totalEntries: number;
  isPartialData: boolean; // 7회 미만
}
```

### 스킨 데이터 구조

```typescript
interface JellySkin {
  id: string;
  name: string;         // '곰돌이', '고양이', '판다'
  themeColor: string;   // 스킨 메인 색상
  description: string;
  overlayType: 'bear' | 'cat' | 'panda';
}

interface ActiveSkinState {
  skinId: string;
  unlockedAt: number;   // timestamp
  expiresAt: number;    // timestamp (unlockedAt + 24h)
}
```

### 키워드 추출 접근

한국어 형태소 분석기 의존성을 피하기 위해 간단한 규칙 기반 접근 사용:
1. 감정 입력 텍스트를 공백/구두점 기준 분리
2. 2글자 이상 토큰 필터링
3. 불용어 제거 (감정명, 조사 목록)
4. 빈도 기준 상위 5개 선정
5. 부족 시 감정명에서 파생 키워드로 보충

## 위험 분석

| 위험 | 확률 | 영향 | 대응 |
|------|------|------|------|
| Rewarded Ad API가 앱인토스에서 미지원 | 중간 | 높음 | SPEC-AD-001 검증 후 착수, 폴백: CTA 버튼 숨김 |
| 한국어 키워드 추출 품질 저하 | 높음 | 낮음 | 정적 키워드 매핑 테이블로 보강, 점진적 개선 |
| 스킨 타이머 정확도 (백그라운드 시간 경과) | 중간 | 중간 | Date.now() 기반 절대 시간 비교, setInterval 미사용 |
| 주간 리포트 데이터 부족 | 높음 | 낮음 | 폴백 안내 문구 + "더 기록해보세요" CTA |
| 보상 모달이 report 자동 복귀(4초)와 충돌 | 중간 | 높음 | 모달 열림 시 report->idle 타이머 일시정지 |

## MX 태그 계획

| 함수/모듈 | 태그 | 이유 |
|-----------|------|------|
| `generateWeeklyReport()` | `@MX:ANCHOR` | 주간 리포트 생성 핵심, 여러 경로에서 호출 가능 |
| `unlockSkin()` | `@MX:NOTE` | 스킨 해금 로직, 타이머 관리 설명 필요 |
| `extractKeywords()` | `@MX:NOTE` | 키워드 추출 방식 설명 (간이 한국어 처리) |
| `RewardedAdModal` | `@MX:WARN` | 광고 완주 보장 로직, 중도 포기 처리 주의 |
