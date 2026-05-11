'use client';

/**
 * 앱인토스 닫기 버튼 컴포넌트
 * 우측 상단 고정 위치, 미니앱 종료 기능
 *
 * @see https://developers-apps-in-toss.toss.im/ (§7 출시 체크리스트)
 */

// 앱인토스 브릿지 타입 정의
interface AITBridge {
  close?: () => void;
}

interface WindowWithAIT extends Window {
  AIT?: AITBridge;
}

export function AITCloseButton() {
  const handleClose = () => {
    // 앱인토스 브릿지를 통한 종료 시도
    if (window.location.href.includes('intoss://')) {
      // 앱인토스 환경에서는 브릿지 close 호출
      try {
        const aitWindow = window as WindowWithAIT;
        if (aitWindow.AIT?.close) {
          aitWindow.AIT.close();
        } else {
          window.history.back();
        }
      } catch {
        window.history.back();
      }
    } else {
      // 웹 환경에서는 뒤로 가기
      window.history.back();
    }
  };

  return (
    <button
      onClick={handleClose}
      aria-label="닫기"
      className="ait-close-button"
      type="button"
    >
      <span className="material-symbols-outlined text-on-surface-variant text-xl">
        close
      </span>
    </button>
  );
}
