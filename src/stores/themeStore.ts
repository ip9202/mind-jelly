import { create } from 'zustand';

// @MX:NOTE: 테마 타입 정의 (light / dark / system)
export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

// @MX:NOTE: localStorage 키
const STORAGE_KEY = 'mind-jelly-theme';

// @MX:NOTE: 시스템 다크 모드 미디어 쿼리
const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

interface ThemeStoreState {
  // 사용자가 선택한 테마
  theme: Theme;
  // 실제 적용된 테마 (system인 경우 OS 설정에 따라 결정)
  resolvedTheme: ResolvedTheme;

  // 액션: 테마 설정
  setTheme: (theme: Theme) => void;
  // 액션: light <-> dark 토글
  toggleTheme: () => void;
  // 액션: 초기화 (localStorage 읽기 + matchMedia 리스너 등록)
  initTheme: () => void;
}

/**
 * 시스템 테마 확인
 * window.matchMedia를 통해 OS 다크 모드 설정 감지
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia(DARK_MEDIA_QUERY).matches ? 'dark' : 'light';
}

/**
 * HTML 요소에 dark 클래스 적용/제거
 */
function applyDarkClass(resolvedTheme: ResolvedTheme): void {
  if (typeof document === 'undefined') return;

  if (resolvedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * 테마에서 resolved 테마 계산
 */
function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system') return getSystemTheme();
  return theme;
}

/**
 * 다크 모드 테마 상태 관리 Zustand Store
 *
 * localStorage에 사용자 선택을 저장하고,
 * system 모드에서 OS 설정 변경을 감지하여
 * HTML 요소의 dark 클래스를 관리한다.
 */
// @MX:ANCHOR: 테마 상태의 단일 소스 오브 트루스
// @MX:REASON: 모든 컴포넌트가 이 store를 통해 테마 상태에 접근
export const themeStore = create<ThemeStoreState>()((set, get) => ({
  theme: 'system',
  resolvedTheme: 'light',

  setTheme: (theme: Theme) => {
    const resolvedTheme = resolveTheme(theme);

    // localStorage에 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, theme);
    }

    // HTML 요소에 dark 클래스 적용
    applyDarkClass(resolvedTheme);

    set({ theme, resolvedTheme });
  },

  toggleTheme: () => {
    const { resolvedTheme } = get();
    // 현재 resolved 기준으로 토글
    const newTheme: Theme = resolvedTheme === 'dark' ? 'light' : 'dark';
    get().setTheme(newTheme);
  },

  initTheme: () => {
    if (typeof window === 'undefined') return;

    // localStorage에서 저장된 테마 읽기
    const savedTheme = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const theme: Theme = savedTheme ?? 'system';
    const resolvedTheme = resolveTheme(theme);

    applyDarkClass(resolvedTheme);

    set({ theme, resolvedTheme });

    // 시스템 테마 변경 감지 리스너 등록
    const mediaQuery = window.matchMedia(DARK_MEDIA_QUERY);
    const handleChange = (e: MediaQueryListEvent) => {
      const { theme: currentTheme } = get();
      if (currentTheme === 'system') {
        const newResolved: ResolvedTheme = e.matches ? 'dark' : 'light';
        applyDarkClass(newResolved);
        set({ resolvedTheme: newResolved });
      }
    };

    mediaQuery.addEventListener('change', handleChange);
  },
}));
