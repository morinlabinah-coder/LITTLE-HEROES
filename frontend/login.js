import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const message = document.getElementById('auth-message');
const client = createClient(window.APP_CONFIG.SUPABASE_URL, window.APP_CONFIG.SUPABASE_ANON_KEY);
document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault(); message.textContent = 'Signing in…';
  const { error } = await client.auth.signInWithPassword({ email: document.getElementById('email').value, password: document.getElementById('password').value });
  if (error) return message.textContent = error.message;
  const { data: { user } } = await client.auth.getUser();
  const { data: profile } = await client.from('profiles').select('role').eq('id', user.id).single();
  location.href = profile?.role === 'admin' ? 'admin.html' : 'account.html';
});
document.getElementById('signup-link').onclick = async (event) => {
  event.preventDefault();
  const { error } = await client.auth.signUp({ email: document.getElementById('email').value, password: document.getElementById('password').value });
  message.textContent = error ? error.message : 'Account created. Check your email to confirm it, then log in.';
};
