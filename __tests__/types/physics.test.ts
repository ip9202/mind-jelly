/**
 * 물리 타입 테스트
 * REQ-UBI-002, REQ-STA-006
 */

import type {
  JellyState,
  TransitionMap,
  PhysicsConfig,
  EmotionBead,
  JellyFaceMap,
} from '@/types/physics';

describe('Physics Types', () => {
  describe('JellyState', () => {
    it('유효한 젤리 상태 타입을 정의해야 한다', () => {
      const idleState: JellyState = 'idle';
      const anticipationState: JellyState = 'anticipation';
      const eatingState: JellyState = 'eating';
      const satisfiedState: JellyState = 'satisfied';

      expect(idleState).toBe('idle');
      expect(anticipationState).toBe('anticipation');
      expect(eatingState).toBe('eating');
      expect(satisfiedState).toBe('satisfied');
    });
  });

  describe('TransitionMap', () => {
    it('올바른 전이 맵을 정의해야 한다', () => {
      const transitionMap: TransitionMap = {
        idle: ['anticipation'],
        anticipation: ['eating'],
        eating: ['anticipation', 'satisfied'],
        satisfied: ['idle'],
      };

      expect(transitionMap.idle).toContain('anticipation');
      expect(transitionMap.anticipation).toContain('eating');
      expect(transitionMap.eating).toContain('anticipation');
      expect(transitionMap.eating).toContain('satisfied');
      expect(transitionMap.satisfied).toContain('idle');
    });
  });

  describe('PhysicsConfig', () => {
    it('물리 설정 타입을 정의해야 한다', () => {
      const config: PhysicsConfig = {
        elasticity: 0.7,
        damping: 0.3,
        friction: 0.1,
        gravityScale: 0.5,
        magneticFieldRadius: 50,
      };

      expect(config.elasticity).toBe(0.7);
      expect(config.damping).toBe(0.3);
      expect(config.friction).toBe(0.1);
      expect(config.gravityScale).toBe(0.5);
      expect(config.magneticFieldRadius).toBe(50);
    });
  });

  describe('EmotionBead', () => {
    it('감정 구슬 타입을 정의해야 한다', () => {
      const bead: EmotionBead = {
        id: 'test-bead-1',
        body: {} as any, // Matter.Body mock
        size: 18,
        color: '#FF6B6B',
        createdAt: Date.now(),
      };

      expect(bead.id).toBe('test-bead-1');
      expect(bead.size).toBe(18);
      expect(bead.color).toBe('#FF6B6B');
      expect(typeof bead.createdAt).toBe('number');
    });

    it('구슬 크기는 12, 18, 24 중 하나여야 한다', () => {
      const validSizes: Array<12 | 18 | 24> = [12, 18, 24];

      validSizes.forEach((size) => {
        const bead: Partial<EmotionBead> = { size };
        expect([12, 18, 24]).toContain(bead.size);
      });
    });
  });

  describe('JellyFaceMap', () => {
    it('상태별 젤리 페이스 표정 맵을 정의해야 한다', () => {
      const faceMap: JellyFaceMap = {
        idle: { eyes: '• •', mouth: 'o' },
        anticipation: { eyes: '• •', mouth: 'o' },
        eating: { eyes: 'u u', mouth: 'o' },
        satisfied: { eyes: '^ ^', mouth: '-' },
      };

      expect(faceMap.idle.eyes).toBe('• •');
      expect(faceMap.idle.mouth).toBe('o');
      expect(faceMap.anticipation.eyes).toBe('• •');
      expect(faceMap.anticipation.mouth).toBe('o');
      expect(faceMap.eating.eyes).toBe('u u');
      expect(faceMap.eating.mouth).toBe('o');
      expect(faceMap.satisfied.eyes).toBe('^ ^');
      expect(faceMap.satisfied.mouth).toBe('-');
    });
  });
});
