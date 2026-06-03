import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rsikmprreyjatoedmdfw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzaWttcHJyZXlqYXRvZWRtZGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NjE0OTUsImV4cCI6MjA5NjAzNzQ5NX0.Lg_hh0Mbgo58rO4lIQd_pco37KNiYQKvQFnyuTHOXtQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
