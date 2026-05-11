/**
 * SPEC-DIARY-001: 일기 상세 보기 테스트
 * 타임라인 카드 line-clamp-2, 바텀시트 모달, 상세 내용, 모달 닫기
 */
import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// NavMenu 모킹
jest.mock('@/components/layout/NavMenu', () => {
  const MockNav = () => <nav data-testid="nav-menu">Nav</nav>;
  return { __esModule: true, default: MockNav };
});

// EmotionFace 모킹
jest.mock('@/components/jelly/EmotionFace', () => ({
  EmotionFace: ({ emotion }: { emotion: string }) => (
    <span data-testid={`emotion-face-${emotion}`}>{emotion}</span>
  ),
}));

// diaryStore 모킹 - mock 내부에서 모든 것을 정의 (호이스팅 이슈 회피)
jest.mock('@/stores/diaryStore', () => {
  const mockEntries = [
    {
      id: 'test-entry-1',
      text: '오늘 하루가 정말 좋았다. 아침에 일어나서 산책을 했고, 점심에는 맛있는 음식을 먹었다. 오후에는 친구들과 만나서 즐거운 시간을 보냈다. 저녁에는 가족과 함께 영화를 보면서 행복한 하루를 마무리했다.',
      emotion: 'joy',
      confidence: 0.92,
      emotionKo: '평온',
      createdAt: '2026-05-11T09:30:00.000Z',
      isShared: false,
    },
    {
      id: 'test-entry-2',
      text: '조금 우울한 하루였다.',
      emotion: 'sadness',
      confidence: 0.45,
      emotionKo: '우울',
      createdAt: '2026-05-11T14:20:00.000Z',
      isShared: true,
    },
  ];

  const state = {
    entries: mockEntries,
    addEntry: jest.fn(),
    getEntriesByDate: (_date: Date) => mockEntries,
    getEntriesByMonth: () => mockEntries,
    getWeekStats: () => ({
      joy: 1, sadness: 1, anger: 0, fear: 0, disgust: 0, surprise: 0, love: 0, gratitude: 0, hope: 0,
    }),
    deleteEntry: jest.fn(),
    toggleShare: jest.fn(),
    supabaseUserId: 'test-user-id',
  };

  const storeHook = Object.assign(
    jest.fn((selector: (s: typeof state) => unknown) => {
      if (selector) return selector(state);
      return state;
    }),
    {
      getState: () => state,
      setState: jest.fn(),
      subscribe: jest.fn(),
    },
  );

  return { diaryStore: storeHook };
});

import DiaryPage from '@/app/diary/page';

describe('SPEC-DIARY-001: 일기 상세 보기', () => {
  // REQ-DIARY-001: 카드 텍스트 line-clamp-2
  describe('REQ-DIARY-001: 카드 텍스트 말줄임', () => {
    it('타임라인 카드 텍스트에 line-clamp-2 클래스가 적용된다', () => {
      render(<DiaryPage />);

      // 엔트리 텍스트 요소를 찾는다
      const entryText = screen.getByText(/오늘 하루가 정말 좋았다/);
      expect(entryText).toBeInTheDocument();

      // line-clamp-2 관련 클래스가 적용되었는지 확인
      const textElement = entryText.closest('p') || entryText;
      expect(textElement.className).toMatch(/line-clamp-2/);
    });
  });

  // REQ-DIARY-002: 카드 탭 시 바텀시트 모달 오픈
  describe('REQ-DIARY-002: 카드 탭 시 모달 오픈', () => {
    it('타임라인 카드를 탭하면 바텀시트 모달이 열린다', async () => {
      const user = userEvent.setup();
      render(<DiaryPage />);

      // 첫 번째 엔트리 카드를 찾아서 클릭
      const entryCard = screen.getByLabelText('평온 감정 기록');
      await user.click(entryCard);

      // 모달이 열렸는지 확인
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('모달이 열리기 전에는 전체 텍스트가 보이지 않는다', () => {
      render(<DiaryPage />);

      // 모달은 닫혀 있어야 함
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  // REQ-DIARY-003: 모달 상세 내용
  describe('REQ-DIARY-003: 모달 상세 내용', () => {
    it('모달에 전체 감정 텍스트가 표시된다', async () => {
      const user = userEvent.setup();
      render(<DiaryPage />);

      // 카드 클릭으로 모달 열기
      const entryCard = screen.getByLabelText('평온 감정 기록');
      await user.click(entryCard);

      // 전체 텍스트가 모달에 표시되는지 확인 (말줄임되지 않은 전체)
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText(/영화를 보면서 행복한 하루를 마무리했다/)).toBeInTheDocument();
    });

    it('모달에 감정 라벨이 표시된다', async () => {
      const user = userEvent.setup();
      render(<DiaryPage />);

      const entryCard = screen.getByLabelText('평온 감정 기록');
      await user.click(entryCard);

      // 모달 내부에 감정 라벨이 표시되어야 함
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText('평온')).toBeInTheDocument();
    });

    it('모달에 감정 아이콘이 표시된다', async () => {
      const user = userEvent.setup();
      render(<DiaryPage />);

      const entryCard = screen.getByLabelText('평온 감정 기록');
      await user.click(entryCard);

      // 모달 내부에 EmotionFace 컴포넌트가 렌더링되는지 확인
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByTestId('emotion-face-joy')).toBeInTheDocument();
    });

    it('모달에 작성 시간이 표시된다', async () => {
      const user = userEvent.setup();
      render(<DiaryPage />);

      const entryCard = screen.getByLabelText('평온 감정 기록');
      await user.click(entryCard);

      // 모달 내부에 시간 표시 (오전/오후 형식) - 카드+모달에 중복 가능하므로 getAllByText
      const dialog = screen.getByRole('dialog');
      const timeElements = within(dialog).getAllByText(/오전|오후/);
      expect(timeElements.length).toBeGreaterThanOrEqual(1);
    });

    it('모달에 감정 신뢰도가 표시된다', async () => {
      const user = userEvent.setup();
      render(<DiaryPage />);

      const entryCard = screen.getByLabelText('평온 감정 기록');
      await user.click(entryCard);

      // 신뢰도 표시 (0.92 → "많이" 등급) - "신뢰도: 많이" 텍스트로 매칭
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText(/신뢰도:.*많이/)).toBeInTheDocument();
    });

    it('모달에 감정 색상 도트가 표시된다', async () => {
      const user = userEvent.setup();
      render(<DiaryPage />);

      const entryCard = screen.getByLabelText('평온 감정 기록');
      await user.click(entryCard);

      // 모달 내부에 색상 도트가 있는지 확인
      const dialog = screen.getByRole('dialog');
      const colorDot = within(dialog).getByTestId('emotion-color-dot');
      expect(colorDot).toBeInTheDocument();
    });
  });

  // REQ-DIARY-004: 모달 닫기
  describe('REQ-DIARY-004: 모달 닫기', () => {
    it('X 버튼으로 모달을 닫을 수 있다', async () => {
      const user = userEvent.setup();
      render(<DiaryPage />);

      // 모달 열기
      const entryCard = screen.getByLabelText('평온 감정 기록');
      await user.click(entryCard);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // X 버튼 클릭
      const closeButton = screen.getByLabelText('닫기');
      await user.click(closeButton);

      // 모달 닫힘 확인
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('배경 오버레이 탭으로 모달을 닫을 수 있다', async () => {
      const user = userEvent.setup();
      render(<DiaryPage />);

      // 모달 열기
      const entryCard = screen.getByLabelText('평온 감정 기록');
      await user.click(entryCard);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // 배경 오버레이 클릭
      const overlay = screen.getByTestId('modal-overlay');
      await user.click(overlay);

      // 모달 닫힘 확인
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('핸들바 드래그로 모달을 닫을 수 있다', async () => {
      const user = userEvent.setup();
      render(<DiaryPage />);

      // 모달 열기
      const entryCard = screen.getByLabelText('평온 감정 기록');
      await user.click(entryCard);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // 핸들바에서 80px 이상 드래그 (아래 방향)
      const handle = screen.getByTestId('modal-handle');
      fireEvent.touchStart(handle, { touches: [{ clientY: 100 }] });
      fireEvent.touchEnd(handle, { changedTouches: [{ clientY: 200 }] });

      // 모달 닫힘 확인
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('짧은 드래그로는 모달이 닫히지 않는다', async () => {
      const user = userEvent.setup();
      render(<DiaryPage />);

      // 모달 열기
      const entryCard = screen.getByLabelText('평온 감정 기록');
      await user.click(entryCard);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // 핸들바에서 30px 드래그 (임계값 미만)
      const handle = screen.getByTestId('modal-handle');
      fireEvent.touchStart(handle, { touches: [{ clientY: 100 }] });
      fireEvent.touchEnd(handle, { changedTouches: [{ clientY: 130 }] });

      // 모달 유지 확인
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  // SPEC-DIARY-002: 스와이프 삭제
  describe('SPEC-DIARY-002: 스와이프 삭제', () => {
    it('왼쪽 스와이프 60px 이상 시 삭제 버튼이 노출된다', () => {
      render(<DiaryPage />);

      const entryCard = screen.getByLabelText('평온 감정 기록');
      // 초기: 삭제 버튼 숨김
      expect(screen.queryByTestId('swipe-delete-btn')).not.toBeInTheDocument();

      // 왼쪽 스와이프 80px (deltaX = -80)
      fireEvent.touchStart(entryCard, { touches: [{ clientX: 200, clientY: 100 }] });
      fireEvent.touchMove(entryCard, { touches: [{ clientX: 120, clientY: 100 }] });
      fireEvent.touchEnd(entryCard, { changedTouches: [{ clientX: 120, clientY: 100 }] });

      // 삭제 버튼 노출
      expect(screen.getByTestId('swipe-delete-btn')).toBeInTheDocument();
    });

    it('짧은 왼쪽 스와이프(40px 미만)는 원위치로 복귀한다', () => {
      render(<DiaryPage />);

      const entryCard = screen.getByLabelText('평온 감정 기록');

      // 30px 스와이프
      fireEvent.touchStart(entryCard, { touches: [{ clientX: 200, clientY: 100 }] });
      fireEvent.touchMove(entryCard, { touches: [{ clientX: 170, clientY: 100 }] });
      fireEvent.touchEnd(entryCard, { changedTouches: [{ clientX: 170, clientY: 100 }] });

      // 삭제 버튼이 보이지 않음(또는 활성 상태 아님). delete-btn은 항상 DOM에 있을 수 있으므로 클릭 가능성으로 확인
      // 단순히 버튼 노출 안 됨을 확인
      expect(screen.queryByTestId('swipe-delete-btn')).not.toBeInTheDocument();
    });

    it('세로 스크롤이 우선되면 스와이프가 활성화되지 않는다', () => {
      render(<DiaryPage />);

      const entryCard = screen.getByLabelText('평온 감정 기록');

      // 가로 -40, 세로 100 (세로 우세)
      fireEvent.touchStart(entryCard, { touches: [{ clientX: 200, clientY: 100 }] });
      fireEvent.touchMove(entryCard, { touches: [{ clientX: 160, clientY: 200 }] });
      fireEvent.touchEnd(entryCard, { changedTouches: [{ clientX: 160, clientY: 200 }] });

      expect(screen.queryByTestId('swipe-delete-btn')).not.toBeInTheDocument();
    });

    it('삭제 버튼 탭 시 확인 다이얼로그가 표시된다', () => {
      render(<DiaryPage />);

      const entryCard = screen.getByLabelText('평온 감정 기록');
      fireEvent.touchStart(entryCard, { touches: [{ clientX: 200, clientY: 100 }] });
      fireEvent.touchMove(entryCard, { touches: [{ clientX: 100, clientY: 100 }] });
      fireEvent.touchEnd(entryCard, { changedTouches: [{ clientX: 100, clientY: 100 }] });

      const deleteBtn = screen.getByTestId('swipe-delete-btn');
      fireEvent.click(deleteBtn);

      expect(screen.getByLabelText('삭제 확인')).toBeInTheDocument();
      expect(screen.getByText(/이 감정 기록을 삭제할까요/)).toBeInTheDocument();
    });

    it('확인 다이얼로그에서 삭제 시 deleteEntry가 호출된다', async () => {
      const user = userEvent.setup();
      const { diaryStore } = jest.requireMock('@/stores/diaryStore') as {
        diaryStore: { getState: () => { deleteEntry: jest.Mock } };
      };
      const deleteEntryMock = diaryStore.getState().deleteEntry;
      deleteEntryMock.mockClear();

      render(<DiaryPage />);

      const entryCard = screen.getByLabelText('평온 감정 기록');
      fireEvent.touchStart(entryCard, { touches: [{ clientX: 200, clientY: 100 }] });
      fireEvent.touchMove(entryCard, { touches: [{ clientX: 100, clientY: 100 }] });
      fireEvent.touchEnd(entryCard, { changedTouches: [{ clientX: 100, clientY: 100 }] });

      const deleteBtn = screen.getByTestId('swipe-delete-btn');
      fireEvent.click(deleteBtn);

      const dialog = screen.getByLabelText('삭제 확인');
      const confirmBtn = within(dialog).getByRole('button', { name: '삭제' });
      await user.click(confirmBtn);

      expect(deleteEntryMock).toHaveBeenCalledWith('test-entry-1');
    });

    it('확인 다이얼로그에서 취소 시 deleteEntry가 호출되지 않는다', async () => {
      const user = userEvent.setup();
      const { diaryStore } = jest.requireMock('@/stores/diaryStore') as {
        diaryStore: { getState: () => { deleteEntry: jest.Mock } };
      };
      const deleteEntryMock = diaryStore.getState().deleteEntry;
      deleteEntryMock.mockClear();

      render(<DiaryPage />);

      const entryCard = screen.getByLabelText('평온 감정 기록');
      fireEvent.touchStart(entryCard, { touches: [{ clientX: 200, clientY: 100 }] });
      fireEvent.touchMove(entryCard, { touches: [{ clientX: 100, clientY: 100 }] });
      fireEvent.touchEnd(entryCard, { changedTouches: [{ clientX: 100, clientY: 100 }] });

      const deleteBtn = screen.getByTestId('swipe-delete-btn');
      fireEvent.click(deleteBtn);

      const dialog = screen.getByLabelText('삭제 확인');
      const cancelBtn = within(dialog).getByRole('button', { name: '취소' });
      await user.click(cancelBtn);

      expect(deleteEntryMock).not.toHaveBeenCalled();
      expect(screen.queryByLabelText('삭제 확인')).not.toBeInTheDocument();
    });
  });

  // REQ-DIARY-005: Body 스크롤 잠금
  describe('REQ-DIARY-005: 모달 오픈 시 스크롤 잠금', () => {
    it('모달이 열리면 body 스크롤이 잠긴다', async () => {
      const user = userEvent.setup();
      render(<DiaryPage />);

      // 초기 상태: 스크롤 잠금 없음
      expect(document.body.style.overflow).toBe('');

      // 모달 열기
      const entryCard = screen.getByLabelText('평온 감정 기록');
      await user.click(entryCard);

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('모달이 닫히면 body 스크롤이 복원된다', async () => {
      const user = userEvent.setup();
      render(<DiaryPage />);

      // 모달 열기
      const entryCard = screen.getByLabelText('평온 감정 기록');
      await user.click(entryCard);
      expect(document.body.style.overflow).toBe('hidden');

      // X 버튼으로 닫기
      const closeButton = screen.getByLabelText('닫기');
      await user.click(closeButton);

      expect(document.body.style.overflow).toBe('');
    });
  });
});
