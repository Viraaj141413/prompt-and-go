// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ggsmxkwbvodzmrfjqjxt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnc214a3didm9kem1yZmpxanh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTg1MDIsImV4cCI6MjA2ODQzNDUwMn0.k3UIgGoX-VKZoopE0TtUIZsK2T-zdxMgaQAhJ3dkSn8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});