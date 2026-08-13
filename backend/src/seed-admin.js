import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const email = 'morinlabinah@gmail.com';
const password = 'Password';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data: existing, error: listError } = await supabase.auth.admin.listUsers();
if (listError) throw listError;
let user = existing.users.find(item => item.email === email);
if (!user) {
  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  user = data.user;
} else {
  const { error } = await supabase.auth.admin.updateUserById(user.id, { password, email_confirm: true });
  if (error) throw error;
}
const { error } = await supabase.from('profiles').upsert({ id: user.id, role: 'admin' });
if (error) throw error;
console.log(`Admin account is ready: ${email}`);
