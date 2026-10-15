import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verify API key
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.CHOKUR_API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  const { method, query, body } = req;
  const schoolId = query.school_id;

  if (!schoolId) {
    return res.status(400).json({ error: 'school_id required' });
  }

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res, schoolId, query);
      case 'POST':
        return handlePost(req, res, schoolId, body);
      case 'PUT':
        return handlePut(req, res, schoolId, body);
      case 'DELETE':
        return handleDelete(req, res, schoolId, query);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('[API] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleGet(req: any, res: any, schoolId: string, query: any) {
  const { resource, id } = query;

  switch (resource) {
    case 'students':
      if (id) {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('id', id)
          .eq('school_id', schoolId)
          .single();
        if (error) return res.status(404).json({ error: error.message });
        return res.json(data);
      }
      {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('school_id', schoolId)
          .eq('status', 'Active')
          .order('adm_no');
        if (error) return res.status(400).json({ error: error.message });
        return res.json(data);
      }

    case 'subjects':
      {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .eq('school_id', schoolId)
          .order('code');
        if (error) return res.status(400).json({ error: error.message });
        return res.json(data);
      }

    case 'exams':
      {
        const { data, error } = await supabase
          .from('exam_periods')
          .select('*')
          .eq('school_id', schoolId)
          .order('year', { ascending: false });
        if (error) return res.status(400).json({ error: error.message });
        return res.json(data);
      }

    case 'marks':
      {
        const { student_id, exam_id, subject_code } = query;
        let q = supabase
          .from('marks')
          .select('*')
          .eq('school_id', schoolId);
        if (student_id) q = q.eq('student_id', student_id);
        if (exam_id) q = q.eq('exam_id', exam_id);
        if (subject_code) q = q.eq('subject_code', subject_code);
        const { data, error } = await q;
        if (error) return res.status(400).json({ error: error.message });
        return res.json(data);
      }

    case 'rankings':
      {
        const { stream, exam_id } = query;
        if (!stream || !exam_id) {
          return res.status(400).json({ error: 'stream and exam_id required' });
        }
        // Compute rankings on the fly
        const { data: students } = await supabase
          .from('students')
          .select('*')
          .eq('school_id', schoolId)
          .eq('stream', stream)
          .eq('status', 'Active');
        const { data: subjects } = await supabase
          .from('subjects')
          .select('*')
          .eq('school_id', schoolId);
        const { data: marks } = await supabase
          .from('marks')
          .select('*')
          .eq('school_id', schoolId)
          .eq('exam_id', exam_id);

        if (!students || !subjects || !marks) {
          return res.json([]);
        }

        // Simple ranking calculation
        const studentMarks: Record<string, Record<string, number>> = {};
        marks.forEach(m => {
          if (typeof m.value === 'number') {
            if (!studentMarks[m.student_id]) studentMarks[m.student_id] = {};
            studentMarks[m.student_id][m.subject_code] = m.value;
          }
        });

        const rankings = students.map(student => {
          const marksMap = studentMarks[student.id] || {};
          const scores = Object.values(marksMap);
          const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
          const passed = scores.filter(s => s >= 50).length;
          return {
            student,
            average: Math.round(avg * 10) / 10,
            passed,
            subjectsCount: scores.length,
          };
        }).sort((a, b) => b.average - a.average);

        rankings.forEach((r, i) => {
          r.rank = i + 1;
        });

        return res.json(rankings);
      }

    case 'fee-balance':
      {
        const { student_id } = query;
        if (!student_id) {
          return res.status(400).json({ error: 'student_id required' });
        }
        const { data: structures } = await supabase
          .from('fee_structures')
          .select('*')
          .eq('school_id', schoolId)
          .eq('is_active', true);
        const { data: payments } = await supabase
          .from('fee_payments')
          .select('*')
          .eq('school_id', schoolId)
          .eq('student_id', student_id)
          .eq('status', 'completed');

        const expected = structures?.reduce((sum, f) => sum + Number(f.amount), 0) || 0;
        const paid = payments?.reduce((sum, p) => sum + Number(p.amount_paid), 0) || 0;

        return res.json({ expected, paid, balance: expected - paid, structures, payments });
      }

    case 'announcements':
      {
        const { target_role, stream } = query;
        let q = supabase
          .from('announcements')
          .select('*')
          .eq('school_id', schoolId)
          .eq('is_published', true)
          .order('published_at', { ascending: false })
          .limit(50);
        if (target_role) {
          q = q.contains('target_roles', [target_role]);
        }
        const { data, error } = await q;
        if (error) return res.status(400).json({ error: error.message });
        return res.json(data);
      }

    case 'timetable':
      {
        const { stream } = query;
        if (!stream) {
          return res.status(400).json({ error: 'stream required' });
        }
        const { data, error } = await supabase
          .from('timetable_entries')
          .select('*')
          .eq('school_id', schoolId)
          .eq('stream', stream)
          .eq('is_active', true)
          .order('day_of_week')
          .order('period');
        if (error) return res.status(400).json({ error: error.message });
        return res.json(data);
      }

    case 'quizzes':
      {
        const { subject_code } = query;
        let q = supabase
          .from('quizzes')
          .select('*')
          .eq('school_id', schoolId)
          .eq('is_published', true)
          .order('start_at', { ascending: false });
        if (subject_code) q = q.eq('subject_code', subject_code);
        const { data, error } = await q;
        if (error) return res.status(400).json({ error: error.message });
        return res.json(data);
      }

    default:
      return res.status(404).json({ error: 'Resource not found' });
  }
}

async function handlePost(req: any, res: any, schoolId: string, body: any) {
  const { resource } = req.query;

  switch (resource) {
    case 'students':
      {
        const { data, error } = await supabase
          .from('students')
          .insert({ ...body, school_id: schoolId })
          .select()
          .single();
        if (error) return res.status(400).json({ error: error.message });
        return res.status(201).json(data);
      }

    case 'marks':
      {
        const { student_id, subject_code, exam_id, value, entered_by } = body;
        if (!student_id || !subject_code || !exam_id || !entered_by) {
          return res.status(400).json({ error: 'student_id, subject_code, exam_id, entered_by required' });
        }
        const { data, error } = await supabase
          .from('marks')
          .upsert({
            school_id: schoolId,
            student_id,
            subject_code: subject_code.toUpperCase(),
            exam_id,
            value,
            entered_by,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'student_id,subject_code,exam_id' })
          .select()
          .single();
        if (error) return res.status(400).json({ error: error.message });
        return res.status(201).json(data);
      }

    case 'fee-payments':
      {
        const { student_id, fee_structure_id, amount_paid, payment_method, mpesa_code, received_by } = body;
        if (!student_id || !fee_structure_id || !amount_paid || !payment_method || !received_by) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        const { data, error } = await supabase
          .from('fee_payments')
          .insert({
            school_id: schoolId,
            student_id,
            fee_structure_id,
            amount_paid,
            payment_method,
            mpesa_code,
            received_by,
            status: 'completed',
            paid_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (error) return res.status(400).json({ error: error.message });
        return res.status(201).json(data);
      }

    case 'announcements':
      {
        const { title, content, target_roles, target_streams, priority, author_id } = body;
        if (!title || !content || !author_id) {
          return res.status(400).json({ error: 'title, content, author_id required' });
        }
        const { data, error } = await supabase
          .from('announcements')
          .insert({
            school_id: schoolId,
            author_id,
            title,
            content,
            target_roles: target_roles || ['student', 'parent'],
            target_streams: target_streams || [],
            priority: priority || 'normal',
            published_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (error) return res.status(400).json({ error: error.message });
        return res.status(201).json(data);
      }

    case 'quiz-attempts':
      {
        const { quiz_id, student_id, answers, score, percentage, time_spent_seconds } = body;
        if (!quiz_id || !student_id || !answers) {
          return res.status(400).json({ error: 'quiz_id, student_id, answers required' });
        }
        const { data, error } = await supabase
          .from('quiz_attempts')
          .insert({
            school_id: schoolId,
            quiz_id,
            student_id,
            answers,
            score,
            percentage,
            time_spent_seconds,
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (error) return res.status(400).json({ error: error.message });
        return res.status(201).json(data);
      }

    default:
      return res.status(404).json({ error: 'Resource not found' });
  }
}

async function handlePut(req: any, res: any, schoolId: string, body: any) {
  const { resource, id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'id required for PUT' });
  }

  switch (resource) {
    case 'students':
      {
        const { data, error } = await supabase
          .from('students')
          .update({ ...body, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('school_id', schoolId)
          .select()
          .single();
        if (error) return res.status(400).json({ error: error.message });
        return res.json(data);
      }

    case 'fee-structures':
      {
        const { data, error } = await supabase
          .from('fee_structures')
          .update({ ...body, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('school_id', schoolId)
          .select()
          .single();
        if (error) return res.status(400).json({ error: error.message });
        return res.json(data);
      }

    case 'timetable':
      {
        const { data, error } = await supabase
          .from('timetable_entries')
          .update({ ...body, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('school_id', schoolId)
          .select()
          .single();
        if (error) return res.status(400).json({ error: error.message });
        return res.json(data);
      }

    default:
      return res.status(404).json({ error: 'Resource not found' });
  }
}

async function handleDelete(req: any, res: any, schoolId: string, query: any) {
  const { resource, id } = query;

  if (!id) {
    return res.status(400).json({ error: 'id required for DELETE' });
  }

  switch (resource) {
    case 'students':
      {
        const { error } = await supabase
          .from('students')
          .delete()
          .eq('id', id)
          .eq('school_id', schoolId);
        if (error) return res.status(400).json({ error: error.message });
        return res.status(204).end();
      }

    case 'marks':
      {
        const { error } = await supabase
          .from('marks')
          .delete()
          .eq('id', id)
          .eq('school_id', schoolId);
        if (error) return res.status(400).json({ error: error.message });
        return res.status(204).end();
      }

    case 'fee-structures':
      {
        const { error } = await supabase
          .from('fee_structures')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('school_id', schoolId);
        if (error) return res.status(400).json({ error: error.message });
        return res.status(204).end();
      }

    default:
      return res.status(404).json({ error: 'Resource not found' });
  }
}