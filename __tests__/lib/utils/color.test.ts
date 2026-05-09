/**
 * hex→rgba 변환 유틸리티 테스트
 * M2-T5: 감정 색상 글로우 효과를 위한 변환
 */
import { hexToRgba } from '@/lib/utils/color';

describe('hexToRgba', () => {
  it('6자리 hex를 rgba로 변환해야 한다', () => {
    expect(hexToRgba('#FFD93D', 0.4)).toBe('rgba(255, 217, 61, 0.4)');
  });

  it('기본 젤리 색상(#FFD1DC)을 변환해야 한다', () => {
    expect(hexToRgba('#FFD1DC', 0.3)).toBe('rgba(255, 209, 220, 0.3)');
  });

  it('모든 감정 색상을 올바르게 변환해야 한다', () => {
    // joy: '#FFD93D'
    expect(hexToRgba('#FFD93D', 0.4)).toBe('rgba(255, 217, 61, 0.4)');
    // sadness: '#6BCB77'
    expect(hexToRgba('#6BCB77', 0.4)).toBe('rgba(107, 203, 119, 0.4)');
    // anger: '#FF6B6B'
    expect(hexToRgba('#FF6B6B', 0.4)).toBe('rgba(255, 107, 107, 0.4)');
    // fear: '#4D96FF'
    expect(hexToRgba('#4D96FF', 0.4)).toBe('rgba(77, 150, 255, 0.4)');
    // disgust: '#A8E6CF'
    expect(hexToRgba('#A8E6CF', 0.4)).toBe('rgba(168, 230, 207, 0.4)');
  });

  it('alpha 기본값은 1이어야 한다', () => {
    expect(hexToRgba('#FF0000')).toBe('rgba(255, 0, 0, 1)');
  });

  it('소문자 hex도 처리해야 한다', () => {
    expect(hexToRgba('#ffd1dc', 0.5)).toBe('rgba(255, 209, 220, 0.5)');
  });

  it('0으로 시작하는 hex 값을 올바르게 처리해야 한다', () => {
    expect(hexToRgba('#00FF00', 0.4)).toBe('rgba(0, 255, 0, 0.4)');
  });
});
