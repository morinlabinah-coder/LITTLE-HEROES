import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const client = createClient(window.APP_CONFIG.SUPABASE_URL, window.APP_CONFIG.SUPABASE_ANON_KEY);
const { data: { session } } = await client.auth.getSession();
if (!session) location.href = 'login.html';
const response = await fetch(`${window.APP_CONFIG.API_URL}/api/applications`, { headers: { Authorization: `Bearer ${session?.access_token}` } });
if (!response.ok) { document.getElementById('status').textContent = 'You do not have permission to view this page.'; } else {
  const items = await response.json(); document.getElementById('status').textContent = `${items.length} admission enquiries`;
  document.getElementById('applications').innerHTML = items.map(item => `<article class="card"><h3>${item.parent_name}</h3><p>${item.email} · Learner age: ${item.learner_age}</p><p>Status: ${item.status} · Submitted ${new Date(item.created_at).toLocaleDateString()}</p></article>`).join('') || '<p>No enquiries yet.</p>';
}
document.getElementById('logout').onclick = async () => { await client.auth.signOut(); location.href = 'index.html'; };
