'use client';

import { jellyStore } from '@/stores/jellyStore';

const EMOTIONS = [
  { id: 'joy', label: '기쁨', icon: 'sentiment_very_satisfied', bg: 'bg-yellow-100', bgHover: 'group-hover:bg-yellow-200', border: 'group-hover:border-yellow-300', iconColor: 'text-yellow-600' },
  { id: 'sadness', label: '슬픔', icon: 'sentiment_very_dissatisfied', bg: 'bg-blue-50', bgHover: 'group-hover:bg-blue-100', border: 'group-hover:border-blue-200', iconColor: 'text-blue-400' },
  { id: 'anger', label: '분노', icon: 'sentiment_extremely_dissatisfied', bg: 'bg-red-50', bgHover: 'group-hover:bg-red-100', border: 'group-hover:border-red-200', iconColor: 'text-red-400' },
  { id: 'fear', label: '공포', icon: 'sentiment_stressed', bg: 'bg-purple-50', bgHover: 'group-hover:bg-purple-100', border: 'group-hover:border-purple-200', iconColor: 'text-purple-400' },
  { id: 'disgust', label: '혐오', icon: 'sentiment_neutral', bg: 'bg-green-50', bgHover: 'group-hover:bg-green-100', border: 'group-hover:border-green-200', iconColor: 'text-green-500' },
] as const;

export function EmotionInput() {
  const handleClick = (emotionId: string) => {
    const { incrementBeadCount, setLastEmotion } = jellyStore.getState();
    // 감정별로 5~15개 구슬 생성 (REQ-EVT-005)
    // eslint-disable-next-line react-hooks/purity -- 이벤트 핸들러 내에서만 호출됨
    const count = 5 + Math.floor(Math.random() * 11);
    setLastEmotion(emotionId);
    incrementBeadCount(count);
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-t-[28px] rounded-b-lg shadow-xl p-6">
      <div className="w-12 h-1.5 bg-surface-container-high rounded-full mx-auto mb-6" />
      <div className="flex justify-between items-end gap-2">
        {EMOTIONS.map((emotion) => (
          <button
            key={emotion.id}
            onClick={() => handleClick(emotion.id)}
            className="flex flex-col items-center gap-1 group active:scale-95 transition-all"
          >
            <div className={`w-12 h-12 rounded-full ${emotion.bg} flex items-center justify-center ${emotion.bgHover} transition-colors border-2 border-transparent ${emotion.border}`}>
              <span className={`material-symbols-outlined ${emotion.iconColor}`} style={{ fontVariationSettings: '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24' }}>
                {emotion.icon}
              </span>
            </div>
            <span className="font-gamja text-lg text-text-primary">{emotion.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
