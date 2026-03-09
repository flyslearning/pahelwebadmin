import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iwxmyxpkqgcrhbrvlxvd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3eG15eHBrcWdjcmhicnZseHZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NjkxNjQsImV4cCI6MjA4ODQ0NTE2NH0.16XqpLc1csmzqdZbx9R78pw4qGLXcHn2Wg52TdOGPxU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);