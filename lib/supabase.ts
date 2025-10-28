// lib/supabase.ts

import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/clerk-expo";

// Replace with your LIVE project credentials
const supabaseUrl = "https://rztlfboroehnkornhjgq.supabase.co"; // The "Project URL" you copied
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6dGxmYm9yb2Vobmtvcm5oamdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjgyMTcsImV4cCI6MjA3NzE0NDIxN30.VkdEiI4pFdH0kbql361li7aAwcqdocqSKL2FQpYMdAk"; // The "anon public" key you copied

// This is the publicly accessible, unauthenticated client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

// This helper function remains the same and will now work with the live client
export const getSupabaseClient = async (
  getToken: (options: { template: string }) => Promise<string | null>,
) => {
  const token = await getToken({ template: "supabase" });
  if (!token) return null;

  const newClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
    },
  });

  return newClient;
};
