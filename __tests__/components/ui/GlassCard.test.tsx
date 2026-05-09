/**
 * GlassCard 컴포넌트 테스트
 * 글래스모피즘 카드 래퍼 컴포넌트
 */
import { render, screen } from '@testing-library/react';
import GlassCard from '@/components/ui/GlassCard';

describe('GlassCard', () => {
  it('자식 요소를 렌더링한다', () => {
    render(
      <GlassCard>
        <p>테스트 콘텐츠</p>
      </GlassCard>,
    );

    expect(screen.getByText('테스트 콘텐츠')).toBeInTheDocument();
  });

  it('기본 variant가 card일 때 glass-card 클래스를 적용한다', () => {
    const { container } = render(
      <GlassCard>콘텐츠</GlassCard>,
    );

    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain('glass-card');
  });

  it('variant가 panel일 때 glass-panel 클래스를 적용한다', () => {
    const { container } = render(
      <GlassCard variant="panel">콘텐츠</GlassCard>,
    );

    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain('glass-panel');
  });

  it('variant가 soft일 때 soft-glass 클래스를 적용한다', () => {
    const { container } = render(
      <GlassCard variant="soft">콘텐츠</GlassCard>,
    );

    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain('soft-glass');
  });

  it('커스텀 className을 추가할 수 있다', () => {
    const { container } = render(
      <GlassCard className="my-custom-class">콘텐츠</GlassCard>,
    );

    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain('my-custom-class');
  });

  it('rounded-lg, shadow-sm, border 클래스를 포함한다', () => {
    const { container } = render(
      <GlassCard>콘텐츠</GlassCard>,
    );

    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain('rounded-lg');
    expect(div.className).toContain('shadow-sm');
    expect(div.className).toContain('border');
  });

  it('border-white/40 클래스를 포함한다', () => {
    const { container } = render(
      <GlassCard>콘텐츠</GlassCard>,
    );

    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain('border-white/40');
  });

  it('className이 없을 때 빈 문자열이 추가되어도 정상 동작한다', () => {
    const { container } = render(
      <GlassCard>콘텐츠</GlassCard>,
    );

    const div = container.firstElementChild as HTMLElement;
    // className이 깔끔하게 구성되어야 함 (불필요한 공백 없음)
    expect(div.className).toMatch(/^glass-card rounded-lg/);
  });
});
