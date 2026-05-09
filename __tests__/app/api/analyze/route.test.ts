/**
 * API Route Handler 테스트
 * M1-T4: POST /api/analyze
 */

// jsdom 환경에서 Request/Response 폴리필
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;
global.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;

if (typeof globalThis.Request === 'undefined') {
  // @ts-expect-error 폴리필 클래스가 Request 인터페이스를 부분적으로만 구현
  globalThis.Request = class Request {
    private _body: string;
    public method: string;
    public headers: Headers;
    public url: string;

    constructor(url: string, init?: RequestInit) {
      this.url = url;
      this.method = init?.method ?? 'GET';
      this.headers = new Headers(init?.headers as Record<string, string>);
      this._body = init?.body as string ?? '';
    }

    async json() {
      return JSON.parse(this._body);
    }
  };
}

if (typeof globalThis.Response === 'undefined') {
  // @ts-expect-error 폴리필 클래스가 Response 인터페이스를 부분적으로만 구현
  globalThis.Response = class Response {
    private _body: string;
    public status: number;
    public headers: Headers;

    constructor(body: string, init?: ResponseInit) {
      this._body = body;
      this.status = init?.status ?? 200;
      this.headers = new Headers(init?.headers as Record<string, string>);
    }

    async json() {
      return JSON.parse(this._body);
    }
  };
}

// Next.js 서버 환경 모킹 - jest.mock이 hoist되므로 factory 내에서만 참조
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data: unknown, init?: { status?: number }) => {
      const status = init?.status ?? 200;
      const body = JSON.stringify(data);
      return new globalThis.Response(body, {
        status,
        headers: { 'Content-Type': 'application/json' },
      });
    }),
  },
}));

// OpenAI API 모킹
const mockCreate = jest.fn();
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  })),
}));

import { POST } from '@/app/api/analyze/route';

// 헬퍼: Request 생성
function createRequest(body: unknown): Parameters<typeof POST>[0] {
  return new globalThis.Request('http://localhost/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mockCreate.mockReset();
  process.env.OPENAI_API_KEY = 'test-api-key';
});

describe('POST /api/analyze', () => {
  it('유효한 텍스트로 감정 분석 결과를 반환한다', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              emotion: 'joy',
              confidence: 0.95,
            }),
          },
        },
      ],
    });

    const response = await POST(createRequest({ text: '오늘 정말 행복한 하루였어!' }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.emotion).toBe('joy');
    expect(data.confidence).toBe(0.95);
    expect(data.emotionKo).toBe('기쁨');
  });

  it('슬픔 감정을 올바르게 분석한다', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              emotion: 'sadness',
              confidence: 0.85,
            }),
          },
        },
      ],
    });

    const response = await POST(createRequest({ text: '오늘 너무 슬퍼...' }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.emotion).toBe('sadness');
    expect(data.emotionKo).toBe('슬픔');
  });

  it('빈 텍스트를 거부한다 (400)', async () => {
    const response = await POST(createRequest({ text: '' }));
    expect(response.status).toBe(400);
  });

  it('공백만 있는 텍스트를 거부한다 (400)', async () => {
    const response = await POST(createRequest({ text: '   \n\t  ' }));
    expect(response.status).toBe(400);
  });

  it('500자 초과 텍스트를 거부한다 (400)', async () => {
    const longText = '가'.repeat(501);
    const response = await POST(createRequest({ text: longText }));
    expect(response.status).toBe(400);
  });

  it('500자 텍스트는 허용한다', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              emotion: 'joy',
              confidence: 0.7,
            }),
          },
        },
      ],
    });

    const maxText = '가'.repeat(500);
    const response = await POST(createRequest({ text: maxText }));
    expect(response.status).toBe(200);
  });

  it('text 필드가 없으면 400을 반환한다', async () => {
    const response = await POST(createRequest({}));
    expect(response.status).toBe(400);
  });

  it('OPENAI_API_KEY가 없으면 mock 분석 결과를 반환한다', async () => {
    delete process.env.OPENAI_API_KEY;

    const response = await POST(createRequest({ text: '테스트' }));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('emotion');
    expect(data).toHaveProperty('confidence');
    expect(data).toHaveProperty('emotionKo');
  });

  it('OpenAI API 에러 시 500을 반환한다', async () => {
    mockCreate.mockRejectedValueOnce(new Error('OpenAI API Error'));

    const response = await POST(createRequest({ text: '테스트' }));
    expect(response.status).toBe(500);
  });

  it('OpenAI 응답이 JSON이 아니면 500을 반환한다', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: 'invalid json response',
          },
        },
      ],
    });

    const response = await POST(createRequest({ text: '테스트' }));
    expect(response.status).toBe(500);
  });

  it('OpenAI 응답이 스키마에 맞지 않으면 500을 반환한다', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              emotion: 'surprise',
              confidence: 0.8,
            }),
          },
        },
      ],
    });

    const response = await POST(createRequest({ text: '테스트' }));
    expect(response.status).toBe(500);
  });

  it('OpenAI API에 올바른 시스템 프롬프트를 전달한다', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              emotion: 'anger',
              confidence: 0.9,
            }),
          },
        },
      ],
    });

    await POST(createRequest({ text: '정말 화나!' }));

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: expect.any(String),
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
          }),
          expect.objectContaining({
            role: 'user',
            content: '정말 화나!',
          }),
        ]),
      }),
    );
  });

  it('잘못된 JSON 본문이면 400을 반환한다', async () => {
    const request = new globalThis.Request('http://localhost/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });

    const response = await POST(request as unknown as Parameters<typeof POST>[0]);
    expect(response.status).toBe(400);
  });

  it('text가 문자열이 아니면 400을 반환한다', async () => {
    const response = await POST(createRequest({ text: 123 }));
    expect(response.status).toBe(400);
  });

  it('OpenAI 응답에 content가 없으면 500을 반환한다', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: null,
          },
        },
      ],
    });

    const response = await POST(createRequest({ text: '테스트' }));
    expect(response.status).toBe(500);
  });

  it('confidence가 NaN이면 기본값 0으로 처리한다', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              emotion: 'joy',
              confidence: 'not a number',
            }),
          },
        },
      ],
    });

    const response = await POST(createRequest({ text: '테스트' }));
    const data = await response.json();
    // Number('not a number') || 0 === 0 → 유효한 confidence
    expect(response.status).toBe(200);
    expect(data.confidence).toBe(0);
  });
});
