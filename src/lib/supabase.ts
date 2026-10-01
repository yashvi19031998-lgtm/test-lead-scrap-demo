import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key';

// This is a basic client for the browser. 
// Note: In production, server-side actions will need the service role key or auth context.
export const supabase = createClient(supabaseUrl, supabaseKey);
