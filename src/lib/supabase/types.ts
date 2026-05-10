export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          toss_user_id: string | null;
          nickname: string | null;
          invite_code: string;
          avatar_emotion: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          toss_user_id?: string | null;
          nickname?: string | null;
          invite_code?: string;
          avatar_emotion?: string | null;
        };
        Update: {
          toss_user_id?: string | null;
          nickname?: string | null;
          avatar_emotion?: string | null;
          updated_at?: string;
        };
      };
      diary_entries: {
        Row: {
          id: string;
          user_id: string;
          text: string;
          emotion: string;
          confidence: number;
          emotion_ko: string;
          is_shared: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          text: string;
          emotion: string;
          confidence: number;
          emotion_ko: string;
          is_shared?: boolean;
          created_at?: string;
        };
        Update: {
          is_shared?: boolean;
        };
      };
      friendships: {
        Row: {
          id: string;
          requester_id: string;
          receiver_id: string;
          status: 'pending' | 'accepted';
          created_at: string;
        };
        Insert: {
          requester_id: string;
          receiver_id: string;
          status?: 'pending' | 'accepted';
        };
        Update: {
          status?: 'pending' | 'accepted';
        };
      };
    };
  };
}
