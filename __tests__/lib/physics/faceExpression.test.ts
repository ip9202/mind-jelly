import { getFaceForState } from '@/lib/physics/faceExpression';
import type { JellyState } from '@/types/physics';

describe('Face Expression Mapping', () => {
  describe('getFaceForState', () => {
    it('idle 상태의 올바른 표정을 반환해야 한다', () => {
      const face = getFaceForState('idle');

      expect(face).toEqual({
        eyes: '• •',
        mouth: 'o',
      });
    });

    it('anticipation 상태의 올바른 표정을 반환해야 한다', () => {
      const face = getFaceForState('anticipation');

      expect(face).toEqual({
        eyes: '• •',
        mouth: 'o',
      });
    });

    it('eating 상태의 올바른 표정을 반환해야 한다', () => {
      const face = getFaceForState('eating');

      expect(face).toEqual({
        eyes: 'u u',
        mouth: 'o',
      });
    });

    it('satisfied 상태의 올바른 표정을 반환해야 한다', () => {
      const face = getFaceForState('satisfied');

      expect(face).toEqual({
        eyes: '^ ^',
        mouth: '-',
      });
    });

    it('알 수 없는 상태에 대해 기본 표정을 반환해야 한다', () => {
      const face = getFaceForState('unknown' as JellyState);

      // 기본 표정 (idle)을 반환해야 함
      expect(face).toEqual({
        eyes: '• •',
        mouth: 'o',
      });
    });

    it('모든 표정이 유효한 구조를 가져야 한다', () => {
      const states: JellyState[] = ['idle', 'anticipation', 'eating', 'satisfied'];

      states.forEach((state) => {
        const face = getFaceForState(state);

        expect(face).toHaveProperty('eyes');
        expect(face).toHaveProperty('mouth');
        expect(typeof face.eyes).toBe('string');
        expect(typeof face.mouth).toBe('string');
      });
    });
  });
});
