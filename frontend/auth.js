import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.APP_CONFIG;
const accountLink = document.getElementById('account-link');
if (SUPABASE_URL && SUPABASE_ANON_KEY && accountLink) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    accountLink.href = profile?.role === 'admin' ? 'admin.html' : 'account.html';
    accountLink.textContent = profile?.role === 'admin' ? 'Admin' : 'My account';
  }
}
