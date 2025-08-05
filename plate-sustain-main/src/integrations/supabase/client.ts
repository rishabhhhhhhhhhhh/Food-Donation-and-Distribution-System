
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pimgteiqfmjswbskmgmi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpbWd0ZWlxZm1qc3dic2ttZ21pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3Mjk3MDgsImV4cCI6MjA2MDMwNTcwOH0.OX3I3EFXb5WarM9d4vzcT7ZCOqSxnvxn_V4Gz_fQNTk";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
