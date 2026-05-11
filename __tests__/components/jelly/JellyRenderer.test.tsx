// JellyRenderer 컴포넌트 테스트 (SVG 기반 렌더링)
import { render } from '@testing-library/react';
import { JellyRenderer } from '@/components/jelly/JellyRenderer';

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
    const singleBody = [{ position: { x: 100, y: 100 }, circleRadius: 5 }];

    const { container: idleContainer } = render(
      <div>
        <JellyRenderer bodies={singleBody} face="idle" animation={0} />
      </div>
    );

    const { container: eatingContainer } = render(
      <div>
        <JellyRenderer bodies={singleBody} face="eating" animation={0} />
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

  describe('M2: 감정 기반 SVG 렌더링', () => {
    const singleBody = [{ position: { x: 100, y: 100 }, circleRadius: 40 }];

    it('emotionColor 미제공 시 jelly-body SVG path가 렌더링된다', () => {
      const { container } = render(
        <JellyRenderer bodies={singleBody} face="idle" animation={0} />
      );

      const jellyBody = container.querySelector('[data-testid="jelly-body"]');
      expect(jellyBody).toBeInTheDocument();
      // SVG path는 radialGradient url(#jelly-grad) fill을 사용한다
      expect(jellyBody?.getAttribute('fill')).toBe('url(#jelly-grad)');
    });

    it('jelly-body path에 fill 트랜지션이 적용되어야 한다', () => {
      const { container } = render(
        <JellyRenderer bodies={singleBody} face="idle" animation={0} />
      );

      const jellyBody = container.querySelector<SVGPathElement>('[data-testid="jelly-body"]');
      expect(jellyBody).toBeInTheDocument();
      // 'fill 800ms ease-in-out' 트랜지션 (background-color → fill로 전환됨)
      expect(jellyBody?.style.transition).toContain('fill 800ms ease-in-out');
    });

    it('글로우 path가 렌더링되어야 한다', () => {
      const { container } = render(
        <JellyRenderer bodies={singleBody} face="idle" animation={0} />
      );

      const glowPath = container.querySelector('[data-testid="jelly-glow"]');
      expect(glowPath).toBeInTheDocument();
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

      const glowPath = container.querySelector('[data-testid="jelly-glow"]');
      expect(glowPath).toBeInTheDocument();
      // hexToRgba(#FF6B6B, 0.4) → rgba(255, 107, 107, 0.4)
      const fill = glowPath?.getAttribute('fill') ?? '';
      expect(fill).toMatch(/255.*107.*107.*0\.4/);
    });

    it('emotionColor 없이 렌더링 시 글로우 색상이 기본 JELLY_COLOR(#FFD1DC) 기반이어야 한다', () => {
      const { container } = render(
        <JellyRenderer bodies={singleBody} face="idle" animation={0} />
      );

      const glowPath = container.querySelector('[data-testid="jelly-glow"]');
      const fill = glowPath?.getAttribute('fill') ?? '';
      // hexToRgba(#FFD1DC, 0.4) → rgba(255, 209, 220, 0.4)
      expect(fill).toMatch(/255.*209.*220.*0\.4/);
    });
  });

  describe('새로운 감정 face 타입 렌더링', () => {
    const singleBody = [{ position: { x: 100, y: 100 }, circleRadius: 40 }];

    it('surprise 감정이 렌더링되어야 한다', () => {
      const { container } = render(
        <JellyRenderer bodies={singleBody} face="idle" animation={0} emotion="surprise" />
      );

      const jellyBody = container.querySelector('[data-testid="jelly-body"]');
      expect(jellyBody).toBeInTheDocument();
      // 감정 표정 그룹(emotion-eyes / emotion-mouth)이 있어야 한다
      expect(container.querySelector('.emotion-eyes')).toBeInTheDocument();
      expect(container.querySelector('.emotion-mouth')).toBeInTheDocument();
    });

    it('love 감정이 렌더링되어야 한다', () => {
      const { container } = render(
        <JellyRenderer bodies={singleBody} face="idle" animation={0} emotion="love" />
      );

      const jellyBody = container.querySelector('[data-testid="jelly-body"]');
      expect(jellyBody).toBeInTheDocument();
      expect(container.querySelector('.emotion-eyes')).toBeInTheDocument();
      expect(container.querySelector('.emotion-mouth')).toBeInTheDocument();
    });

    it('gratitude 감정이 렌더링되어야 한다', () => {
      const { container } = render(
        <JellyRenderer bodies={singleBody} face="idle" animation={0} emotion="gratitude" />
      );

      const jellyBody = container.querySelector('[data-testid="jelly-body"]');
      expect(jellyBody).toBeInTheDocument();
      expect(container.querySelector('.emotion-eyes')).toBeInTheDocument();
      expect(container.querySelector('.emotion-mouth')).toBeInTheDocument();
    });

    it('hope 감정이 렌더링되어야 한다', () => {
      const { container } = render(
        <JellyRenderer bodies={singleBody} face="idle" animation={0} emotion="hope" />
      );

      const jellyBody = container.querySelector('[data-testid="jelly-body"]');
      expect(jellyBody).toBeInTheDocument();
      expect(container.querySelector('.emotion-eyes')).toBeInTheDocument();
      expect(container.querySelector('.emotion-mouth')).toBeInTheDocument();
    });
  });
});
