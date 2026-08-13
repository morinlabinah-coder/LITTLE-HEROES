import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const client = createClient(window.APP_CONFIG.SUPABASE_URL, window.APP_CONFIG.SUPABASE_ANON_KEY);
const { data: { user } } = await client.auth.getUser();
if (!user) location.href = 'login.html'; else document.getElementById('welcome').textContent = `Signed in as ${user.email}.`;
document.getElementById('logout').onclick = async () => { await client.auth.signOut(); location.href = 'index.html'; };
