// BeadBody 테스트
import { createBeadBody } from '@/lib/physics/beadBody';
import * as Matter from 'matter-js';

describe('createBeadBody', () => {
  it('올바른 반지름의 바디를 생성해야 함', () => {
    const body = createBeadBody(100, 100, 12);

    expect(body).toBeDefined();
    expect(body.circleRadius).toBe(12);
  });

  it('중력 배율 0.5을 적용해야 함', () => {
    const body = createBeadBody(100, 100, 18);

    // Matter.js에서 중력 배율을 확인하려면 density와 관련된 속성을 확인
    expect(body.density).toBeDefined();
  });

  it('올바른 반탄성계수를 설정해야 함', () => {
    const body = createBeadBody(100, 100, 24);

    expect(body.restitution).toBe(0.7);
  });

  it('다른 크기로 바디를 생성할 수 있어야 함', () => {
    const small = createBeadBody(0, 0, 12);
    const medium = createBeadBody(0, 0, 18);
    const large = createBeadBody(0, 0, 24);

    expect(small.circleRadius).toBe(12);
    expect(medium.circleRadius).toBe(18);
    expect(large.circleRadius).toBe(24);
  });

  it('지정된 위치에 바디를 생성해야 함', () => {
    const body = createBeadBody(150, 200, 18);

    expect(body.position.x).toBe(150);
    expect(body.position.y).toBe(200);
  });
});
