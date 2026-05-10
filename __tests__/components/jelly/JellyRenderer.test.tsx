// JellyRenderer 컴포넌트 테스트
import { render } from '@testing-library/react';
import { JellyRenderer } from '@/components/jelly/JellyRenderer';
import { EMOTION_COLORS } from '@/lib/constants/emotion';

describe('JellyRenderer', () => {
  const mockBodies = [
    { position: { x: 100, y: 100 }, circleRadius: 5 },
    { position: { x: 110, y: 105 }, circleRadius: 5 },
  ];

  it('젤리 바디를 렌더링해야 함', () => {
    const { container } = render(
      <div>
        <JellyRenderer bodies={mockBodies} face="idle" animation={0} />
      </div>
    );

    expect(container.querySelector('[data-testid="jelly-renderer"]')).toBeInTheDocument();
  });

  it('상태에 따른 올바른 표정을 표시해야 함', () => {
    const mockBodies = [{ position: { x: 100, y: 100 }, circleRadius: 5 }];

    const { container: idleContainer } = render(
      <div>
        <JellyRenderer bodies={mockBodies} face="idle" animation={0} />
      </div>
    );

    const { container: eatingContainer } = render(
      <div>
        <JellyRenderer bodies={mockBodies} face="eating" animation={0} />
      </div>
    );

    expect(idleContainer.querySelector('[data-testid="jelly-renderer"]')).toBeInTheDocument();
    expect(eatingContainer.querySelector('[data-testid="jelly-renderer"]')).toBeInTheDocument();
  });

  describe('T-020: 비주얼 폴리시 애니메이션', () => {
    it('호흡 애니메이션 파라미터를 적용해야 함', () => {
      const { container } = render(
        <div>
          <JellyRenderer bodies={mockBodies} face="idle" animation={1.5} />
        </div>
      );

      expect(container.querySelector('[data-testid="jelly-renderer"]')).toBeInTheDocument();
    });

    it('먹기 애니메이션 스케일을 적용해야 함', () => {
      const { container } = render(
        <div>
          <JellyRenderer bodies={mockBodies} face="eating" animation={0.5} />
        </div>
      );

      expect(container.querySelector('[data-testid="jelly-renderer"]')).toBeInTheDocument();
    });

    it('만족 상태 애니메이션을 지원해야 함', () => {
      const { container } = render(
        <div>
          <JellyRenderer bodies={mockBodies} face="satisfied" animation={1.0} />
        </div>
      );

      expect(container.querySelector('[data-testid="jelly-renderer"]')).toBeInTheDocument();
    });

    it('기대 상태 애니메이션을 지원해야 함', () => {
      const { container } = render(
        <div>
          <JellyRenderer bodies={mockBodies} face="anticipation" animation={0.8} />
        </div>
      );

      expect(container.querySelector('[data-testid="jelly-renderer"]')).toBeInTheDocument();
    });
  });

  describe('M2: 감정 기반 색상 전환', () => {
    const singleBody = [{ position: { x: 100, y: 100 }, circleRadius: 40 }];

    it('emotionColor 미제공 시 기본색 #FFD1DC를 사용해야 한다', () => {
      const { container } = render(
        <JellyRenderer bodies={singleBody} face="idle" animation={0} />
      );

      const jellyBody = container.querySelector<HTMLElement>('[data-testid="jelly-body"]');
      expect(jellyBody).toBeInTheDocument();
      expect(jellyBody?.style.backgroundColor).toBe('rgb(255, 209, 220)');
    });

    it('joy 감정 색상이 적용되어야 한다', () => {
      const { container } = render(
        <JellyRenderer
          bodies={singleBody}
          face="idle"
          animation={0}
          emotionColor={EMOTION_COLORS.joy}
        />
      );

      const jellyBody = container.querySelector<HTMLElement>('[data-testid="jelly-body"]');
      expect(jellyBody?.style.backgroundColor).toBe('rgb(255, 183, 197)');
    });

    it('sadness 감정 색상이 적용되어야 한다', () => {
      const { container } = render(
        <JellyRenderer
          bodies={singleBody}
          face="idle"
          animation={0}
          emotionColor={EMOTION_COLORS.sadness}
        />
      );

      const jellyBody = container.querySelector<HTMLElement>('[data-testid="jelly-body"]');
      expect(jellyBody?.style.backgroundColor).toBe('rgb(126, 184, 216)');
    });

    it('anger 감정 색상이 적용되어야 한다', () => {
      const { container } = render(
        <JellyRenderer
          bodies={singleBody}
          face="idle"
          animation={0}
          emotionColor={EMOTION_COLORS.anger}
        />
      );

      const jellyBody = container.querySelector<HTMLElement>('[data-testid="jelly-body"]');
      expect(jellyBody?.style.backgroundColor).toBe('rgb(242, 139, 130)');
    });

    it('fear 감정 색상이 적용되어야 한다', () => {
      const { container } = render(
        <JellyRenderer
          bodies={singleBody}
          face="idle"
          animation={0}
          emotionColor={EMOTION_COLORS.fear}
        />
      );

      const jellyBody = container.querySelector<HTMLElement>('[data-testid="jelly-body"]');
      expect(jellyBody?.style.backgroundColor).toBe('rgb(179, 157, 219)');
    });

    it('disgust 감정 색상이 적용되어야 한다', () => {
      const { container } = render(
        <JellyRenderer
          bodies={singleBody}
          face="idle"
          animation={0}
          emotionColor={EMOTION_COLORS.disgust}
        />
      );

      const jellyBody = container.querySelector<HTMLElement>('[data-testid="jelly-body"]');
      expect(jellyBody?.style.backgroundColor).toBe('rgb(129, 199, 132)');
    });

    it('background-color에 800ms ease-in-out 트랜지션이 적용되어야 한다', () => {
      const { container } = render(
        <JellyRenderer bodies={singleBody} face="idle" animation={0} />
      );

      const jellyBody = container.querySelector<HTMLElement>('[data-testid="jelly-body"]');
      expect(jellyBody?.style.transition).toContain('background-color 800ms ease-in-out');
    });

    it('글로우 효과 색상이 emotionColor와 동기화되어야 한다', () => {
      const { container } = render(
        <JellyRenderer
          bodies={singleBody}
          face="idle"
          animation={0}
          emotionColor="#FF6B6B"
        />
      );

      const glowDiv = container.querySelector<HTMLElement>('[data-testid="jelly-glow"]');
      expect(glowDiv).toBeInTheDocument();
      // rgba(255, 107, 107, 0.4) → JSDOM은 rgb(a) 형식으로 렌더링
      expect(glowDiv?.style.backgroundColor).toBe('rgba(255, 107, 107, 0.4)');
    });

    it('글로우 효과에도 트랜지션이 적용되어야 한다', () => {
      const { container } = render(
        <JellyRenderer bodies={singleBody} face="idle" animation={0} />
      );

      const glowDiv = container.querySelector<HTMLElement>('[data-testid="jelly-glow"]');
      expect(glowDiv?.style.transition).toContain('background-color 800ms ease-in-out');
    });

    it('emotionColor 없이 렌더링 시 글로우 색상이 기본 JELLY_COLOR 기반이어야 한다', () => {
      const { container } = render(
        <JellyRenderer bodies={singleBody} face="idle" animation={0} />
      );

      const glowDiv = container.querySelector<HTMLElement>('[data-testid="jelly-glow"]');
      // 기본: rgba(255, 209, 220, 0.4)
      expect(glowDiv?.style.backgroundColor).toBe('rgba(255, 209, 220, 0.4)');
    });
  });

  describe('새로운 감정 face 타입 렌더링', () => {
    const singleBody = [{ position: { x: 100, y: 100 }, circleRadius: 40 }];

    it('surprise 감정(wide 눈 + o 입)이 렌더링되어야 한다', () => {
      const { container } = render(
        <JellyRenderer bodies={singleBody} face="idle" animation={0} emotion="surprise" />
      );

      // 젤리 바디가 렌더링되고 SVG 요소가 존재하는지 확인
      const jellyBody = container.querySelector<HTMLElement>('[data-testid="jelly-body"]');
      expect(jellyBody).toBeInTheDocument();

      // wide 눈 + o 입 SVG 요소 확인
      const svgElements = jellyBody?.querySelectorAll('svg');
      expect(svgElements?.length).toBeGreaterThanOrEqual(2);
    });

    it('love 감정(heart 눈 + smile 입)이 렌더링되어야 한다', () => {
      const { container } = render(
        <JellyRenderer bodies={singleBody} face="idle" animation={0} emotion="love" />
      );

      const jellyBody = container.querySelector<HTMLElement>('[data-testid="jelly-body"]');
      expect(jellyBody).toBeInTheDocument();

      // heart 눈 + smile 입 SVG 요소 확인
      const svgElements = jellyBody?.querySelectorAll('svg');
      expect(svgElements?.length).toBeGreaterThanOrEqual(2);
    });

    it('gratitude 감정(crescent 눈 + grin 입)이 렌더링되어야 한다', () => {
      const { container } = render(
        <JellyRenderer bodies={singleBody} face="idle" animation={0} emotion="gratitude" />
      );

      const jellyBody = container.querySelector<HTMLElement>('[data-testid="jelly-body"]');
      expect(jellyBody).toBeInTheDocument();

      // crescent 눈 + grin 입 SVG 요소 확인
      const svgElements = jellyBody?.querySelectorAll('svg');
      expect(svgElements?.length).toBeGreaterThanOrEqual(2);
    });

    it('hope 감정(sparkle 눈 + beam 입)이 렌더링되어야 한다', () => {
      const { container } = render(
        <JellyRenderer bodies={singleBody} face="idle" animation={0} emotion="hope" />
      );

      const jellyBody = container.querySelector<HTMLElement>('[data-testid="jelly-body"]');
      expect(jellyBody).toBeInTheDocument();

      // sparkle 눈 + beam 입 SVG 요소 확인
      const svgElements = jellyBody?.querySelectorAll('svg');
      expect(svgElements?.length).toBeGreaterThanOrEqual(2);
    });
  });
});
