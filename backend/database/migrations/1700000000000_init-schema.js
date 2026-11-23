// Initial schema: users, groups, group_members, assignments, assignment_targets, submissions.
// Run with `npm run migrate`; undo with `npm run migrate:down`.

const TABLES = ['users', 'groups', 'group_members', 'assignments', 'assignment_targets', 'submissions'];

export const up = (pgm) => {
  pgm.createType('user_role', ['student', 'admin']);
  pgm.createType('member_role', ['leader', 'member']);
  pgm.createType('target_type', ['all', 'groups']);

  const id = { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') };
  const createdAt = { type: 'timestamptz', notNull: true, default: pgm.func('now()') };
  const reference = (table) => ({ type: 'uuid', notNull: true, references: table, onDelete: 'CASCADE' });

  pgm.createTable('users', {
    id,
    name: { type: 'text', notNull: true },
    email: { type: 'text', notNull: true, unique: true },
    student_id: { type: 'text', unique: true }, // null for admins
    password_hash: { type: 'text', notNull: true },
    role: { type: 'user_role', notNull: true, default: 'student' },
    created_at: createdAt,
  });

  pgm.createTable('groups', {
    id,
    name: { type: 'text', notNull: true, unique: true },
    created_by: reference('users'),
    created_at: createdAt,
  });

  // `user_id` is unique, so a student can belong to at most one group.
  pgm.createTable('group_members', {
    group_id: reference('groups'),
    user_id: { ...reference('users'), unique: true },
    role: { type: 'member_role', notNull: true, default: 'member' },
    joined_at: createdAt,
  });
  pgm.addConstraint('group_members', 'group_members_pkey', { primaryKey: ['group_id', 'user_id'] });

  pgm.createTable('assignments', {
    id,
    title: { type: 'text', notNull: true },
    description: { type: 'text', notNull: true, default: '' },
    due_date: { type: 'timestamptz', notNull: true },
    onedrive_link: { type: 'text', notNull: true },
    target_type: { type: 'target_type', notNull: true, default: 'all' },
    created_by: reference('users'),
    created_at: createdAt,
    updated_at: createdAt,
  });

  pgm.createTable('assignment_targets', {
    assignment_id: reference('assignments'),
    group_id: reference('groups'),
  });
  pgm.addConstraint('assignment_targets', 'assignment_targets_pkey', {
    primaryKey: ['assignment_id', 'group_id'],
  });

  // One confirmation per group per assignment.
  pgm.createTable('submissions', {
    id,
    assignment_id: reference('assignments'),
    group_id: reference('groups'),
    confirmed_by: reference('users'),
    confirmed_at: createdAt,
  });
  pgm.addConstraint('submissions', 'submissions_assignment_group_unique', {
    unique: ['assignment_id', 'group_id'],
  });

  pgm.createIndex('group_members', 'group_id');
  pgm.createIndex('assignment_targets', 'group_id');
  pgm.createIndex('submissions', 'assignment_id');

  // The API uses the service role key (bypasses RLS). Enabling RLS with no policies
  // blocks direct access to these tables through Supabase's public anon key.
  TABLES.forEach((table) => pgm.sql(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`));
};

export const down = (pgm) => {
  [...TABLES].reverse().forEach((table) => pgm.dropTable(table));
  ['target_type', 'member_role', 'user_role'].forEach((type) => pgm.dropType(type));
};
