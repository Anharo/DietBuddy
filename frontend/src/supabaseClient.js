import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ikrbbzozchxzaghbsnia.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrcmJiem96Y2h4emFnaGJzbmlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMjM4MzYsImV4cCI6MjA5MDc5OTgzNn0.6wT-uK6MqSacmuOqUTfsOjdUHXedJ4sw7mw3Ugr8VAA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);