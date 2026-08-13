import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const app = express();
const database = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
const allowed = process.env.FRONTEND_URL?.split(',').map(url => url.trim()).filter(Boolean);
app.use(cors({ origin: allowed?.length ? allowed : true }));
app.use(express.json());
app.get('/health', async (_req, res) => { try { await database.query('select 1'); res.json({ ok: true }); } catch { res.status(503).json({ ok: false }); } });

async function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Authentication required.' });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid session.' });
  const result = await database.query('select role from public.profiles where id = $1', [user.id]);
  if (result.rows[0]?.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
  req.user = user; next();
}

app.post('/api/applications', async (req, res) => {
  const { parent_name, email, learner_age, phone = '', grade_interest = '' } = req.body;
  if (!parent_name || !email || !Number.isInteger(learner_age) || learner_age < 2 || learner_age > 18) return res.status(400).json({ error: 'Please provide valid application details.' });
  try { await database.query('insert into admission_applications (parent_name,email,learner_age,phone,grade_interest) values ($1,$2,$3,$4,$5)', [parent_name,email,learner_age,phone,grade_interest]); res.status(201).json({ message: 'Application received.' }); } catch { res.status(500).json({ error: 'Could not save application.' }); }
});

const resources = {
  grades: { table: 'grades', fields: ['name','description'] }, streams: { table: 'streams', fields: ['name','grade_id'] },
  staff: { table: 'staff', fields: ['first_name','last_name','email','phone','role','grade_id','stream_id'] },
  students: { table: 'students', fields: ['admission_no','first_name','last_name','grade_id','stream_id','guardian_name','guardian_phone'] },
  applications: { table: 'admission_applications', fields: ['parent_name','email','learner_age','phone','grade_interest','status'] },
  fees: { table: 'fee_payments', fields: ['student_id','amount','term','academic_year','method','reference','paid_on'] }
};
app.get('/api/admin/summary', requireAdmin, async (_req,res) => { try { const counts=await Promise.all(Object.entries(resources).map(async([key,{table}])=>[key,(await database.query(`select count(*)::int as count from ${table}`)).rows[0].count])); res.json(Object.fromEntries(counts)); } catch { res.status(500).json({error:'Could not load dashboard.'}); } });
app.get('/api/admin/:resource', requireAdmin, async (req,res) => { const resource=resources[req.params.resource]; if(!resource) return res.sendStatus(404); try { const result=await database.query(`select * from ${resource.table} order by created_at desc nulls last, id desc`); res.json(result.rows); } catch { res.status(500).json({error:'Could not load records.'}); } });
app.post('/api/admin/:resource', requireAdmin, async (req,res) => { const resource=resources[req.params.resource]; if(!resource) return res.sendStatus(404); const fields=resource.fields.filter(field=>req.body[field] !== undefined); if(!fields.length) return res.status(400).json({error:'No valid data supplied.'}); try { const result=await database.query(`insert into ${resource.table} (${fields.join(',')}) values (${fields.map((_,i)=>'$'+(i+1)).join(',')}) returning *`, fields.map(field=>req.body[field])); res.status(201).json(result.rows[0]); } catch { res.status(400).json({error:'Could not save record. Check required fields.'}); } });
app.patch('/api/admin/:resource/:id', requireAdmin, async (req,res) => { const resource=resources[req.params.resource]; if(!resource) return res.sendStatus(404); const fields=resource.fields.filter(field=>req.body[field] !== undefined); if(!fields.length) return res.status(400).json({error:'No valid data supplied.'}); try { const result=await database.query(`update ${resource.table} set ${fields.map((field,i)=>`${field}=$${i+1}`).join(',')} where id=$${fields.length+1} returning *`, [...fields.map(field=>req.body[field]),req.params.id]); if(!result.rowCount)return res.sendStatus(404);res.json(result.rows[0]); } catch {res.status(400).json({error:'Could not update record.'});} });
app.listen(process.env.PORT || 3000, () => console.log(`API running on ${process.env.PORT || 3000}`));
