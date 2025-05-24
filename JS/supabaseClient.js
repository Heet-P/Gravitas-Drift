import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = '__SUPABASE_URL__';
const supabaseKey = '__SUPABASE_KEY__';

window.supabase = createClient(supabaseUrl, supabaseKey);
