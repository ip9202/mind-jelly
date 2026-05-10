import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// @MX:ANCHOR: Supabase 클라이언트 싱글톤
// @MX:REASON: db.ts 전체에서 참조
export const supabase = createClient(supabaseUrl, supabaseKey);
