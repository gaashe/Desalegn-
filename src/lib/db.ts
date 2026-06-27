// Persistent database layer (PostgreSQL via node-postgres).
// Works locally with a standard Postgres and in production with any
// Postgres-compatible provider (e.g. Vercel Postgres / Neon) via DATABASE_URL.

import { Pool } from "pg";
import type { PoolClient, QueryResultRow } from "pg";

export type Role = "admin" | "teacher" | "student" | "parent";

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  userId: string;
  grade: string;
  section: string;
  rollNumber: string;
  parentId?: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  enrollmentDate: string;
  status: "active" | "inactive" | "graduated" | "transferred";
}

export interface Teacher {
  id: string;
  userId: string;
  subject: string;
  qualification: string;
  experience: number;
  salary: number;
  joinDate: string;
  status: "active" | "on_leave" | "resigned";
}

export interface ClassInfo {
  id: string;
  name: string;
  grade: string;
  section: string;
  teacherId: string;
  subject: string;
  schedule: string;
  room: string;
  capacity: number;
}

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  remarks?: string;
}

export interface Grade {
  id: string;
  studentId: string;
  classId: string;
  examType: string;
  score: number;
  maxScore: number;
  grade: string;
  semester: string;
  date: string;
  remarks?: string;
}

export interface Fee {
  id: string;
  studentId: string;
  type: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: "paid" | "pending" | "overdue" | "partial";
  paymentMethod?: string;
  transactionId?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  targetRoles: Role[];
  targetGrades?: string[];
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  expiresAt?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface DbSnapshot {
  users: User[];
  students: Student[];
  teachers: Teacher[];
  classes: ClassInfo[];
  attendance: Attendance[];
  grades: Grade[];
  fees: Fee[];
  announcements: Announcement[];
  messages: Message[];
}

// ---------------------------------------------------------------------------
// Connection
// ---------------------------------------------------------------------------

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  "postgresql://bshewam:bshewam_dev_pw@127.0.0.1:5432/bshewam";

const isLocal =
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1");

type GlobalWithPool = typeof globalThis & { __bshewamPool?: Pool };
const globalForPool = globalThis as GlobalWithPool;

const pool =
  globalForPool.__bshewamPool ??
  new Pool({
    connectionString,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
    max: 5,
  });

globalForPool.__bshewamPool = pool;

async function query<T extends QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const res = await pool.query<T>(text, params);
  return res.rows;
}

// ---------------------------------------------------------------------------
// Schema + seed
// ---------------------------------------------------------------------------

let readyPromise: Promise<void> | null = null;

export function ensureReady(): Promise<void> {
  if (!readyPromise) readyPromise = init();
  return readyPromise;
}

async function init(): Promise<void> {
  await createTables();
  // Use a single dedicated connection so the advisory lock and the seed run on
  // the same session (a pooled `query` could land on different connections).
  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock($1)", [987654]);
    const res = await client.query<{ n: number }>(
      "SELECT COUNT(*)::int AS n FROM users"
    );
    if (res.rows[0].n === 0) await seed(client);
    await client.query("SELECT pg_advisory_unlock($1)", [987654]);
  } finally {
    client.release();
  }
}

async function createTables(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id text PRIMARY KEY,
      email text UNIQUE NOT NULL,
      password text NOT NULL,
      name text NOT NULL,
      role text NOT NULL,
      phone text,
      avatar text,
      created_at text NOT NULL
    );
    CREATE TABLE IF NOT EXISTS students (
      id text PRIMARY KEY,
      user_id text NOT NULL,
      grade text NOT NULL,
      section text NOT NULL,
      roll_number text NOT NULL,
      parent_id text,
      date_of_birth text,
      gender text,
      address text,
      enrollment_date text,
      status text NOT NULL
    );
    CREATE TABLE IF NOT EXISTS teachers (
      id text PRIMARY KEY,
      user_id text NOT NULL,
      subject text,
      qualification text,
      experience integer DEFAULT 0,
      salary integer DEFAULT 0,
      join_date text,
      status text NOT NULL
    );
    CREATE TABLE IF NOT EXISTS classes (
      id text PRIMARY KEY,
      name text NOT NULL,
      grade text,
      section text,
      teacher_id text,
      subject text,
      schedule text,
      room text,
      capacity integer DEFAULT 40
    );
    CREATE TABLE IF NOT EXISTS attendance (
      id text PRIMARY KEY,
      student_id text NOT NULL,
      class_id text NOT NULL,
      date text NOT NULL,
      status text NOT NULL,
      remarks text
    );
    CREATE TABLE IF NOT EXISTS grades (
      id text PRIMARY KEY,
      student_id text NOT NULL,
      class_id text NOT NULL,
      exam_type text,
      score integer DEFAULT 0,
      max_score integer DEFAULT 0,
      grade text,
      semester text,
      date text,
      remarks text
    );
    CREATE TABLE IF NOT EXISTS fees (
      id text PRIMARY KEY,
      student_id text NOT NULL,
      type text,
      amount integer DEFAULT 0,
      due_date text,
      paid_date text,
      status text NOT NULL,
      payment_method text,
      transaction_id text
    );
    CREATE TABLE IF NOT EXISTS announcements (
      id text PRIMARY KEY,
      title text NOT NULL,
      content text NOT NULL,
      author_id text,
      target_roles jsonb NOT NULL DEFAULT '[]'::jsonb,
      target_grades jsonb,
      priority text NOT NULL,
      created_at text NOT NULL,
      expires_at text
    );
    CREATE TABLE IF NOT EXISTS messages (
      id text PRIMARY KEY,
      sender_id text NOT NULL,
      receiver_id text NOT NULL,
      subject text,
      content text,
      read boolean NOT NULL DEFAULT false,
      created_at text NOT NULL
    );
  `);
}

// ---------------------------------------------------------------------------
// Snapshot reads (returns the full data set in the legacy in-memory shape)
// ---------------------------------------------------------------------------

export async function getDb(): Promise<DbSnapshot> {
  await ensureReady();
  const [
    users,
    students,
    teachers,
    classes,
    attendance,
    grades,
    fees,
    announcements,
    messages,
  ] = await Promise.all([
    query<User>(
      `SELECT id, email, password, name, role, phone, avatar, created_at AS "createdAt" FROM users`
    ),
    query<Student>(
      `SELECT id, user_id AS "userId", grade, section, roll_number AS "rollNumber",
              parent_id AS "parentId", date_of_birth AS "dateOfBirth", gender, address,
              enrollment_date AS "enrollmentDate", status FROM students`
    ),
    query<Teacher>(
      `SELECT id, user_id AS "userId", subject, qualification, experience, salary,
              join_date AS "joinDate", status FROM teachers`
    ),
    query<ClassInfo>(
      `SELECT id, name, grade, section, teacher_id AS "teacherId", subject, schedule,
              room, capacity FROM classes`
    ),
    query<Attendance>(
      `SELECT id, student_id AS "studentId", class_id AS "classId", date, status, remarks
              FROM attendance`
    ),
    query<Grade>(
      `SELECT id, student_id AS "studentId", class_id AS "classId", exam_type AS "examType",
              score, max_score AS "maxScore", grade, semester, date, remarks FROM grades`
    ),
    query<Fee>(
      `SELECT id, student_id AS "studentId", type, amount, due_date AS "dueDate",
              paid_date AS "paidDate", status, payment_method AS "paymentMethod",
              transaction_id AS "transactionId" FROM fees`
    ),
    query<Announcement>(
      `SELECT id, title, content, author_id AS "authorId", target_roles AS "targetRoles",
              target_grades AS "targetGrades", priority, created_at AS "createdAt",
              expires_at AS "expiresAt" FROM announcements`
    ),
    query<Message>(
      `SELECT id, sender_id AS "senderId", receiver_id AS "receiverId", subject, content,
              read, created_at AS "createdAt" FROM messages`
    ),
  ]);

  return {
    users,
    students,
    teachers,
    classes,
    attendance,
    grades,
    fees,
    announcements,
    messages,
  };
}

export async function getUserByEmail(email: string): Promise<User | null> {
  await ensureReady();
  const rows = await query<User>(
    `SELECT id, email, password, name, role, phone, avatar, created_at AS "createdAt"
       FROM users WHERE email = $1`,
    [email]
  );
  return rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// Generic write helpers
// ---------------------------------------------------------------------------

function toSnake(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}

const JSONB_COLUMNS = new Set(["target_roles", "target_grades"]);

function encode(column: string, value: unknown): unknown {
  if (JSONB_COLUMNS.has(column)) return JSON.stringify(value ?? null);
  return value ?? null;
}

async function insertRow(
  table: string,
  obj: Record<string, unknown>
): Promise<void> {
  const keys = Object.keys(obj);
  const cols = keys.map(toSnake);
  const placeholders = cols.map(
    (c, i) => (JSONB_COLUMNS.has(c) ? `$${i + 1}::jsonb` : `$${i + 1}`)
  );
  const values = cols.map((c, i) => encode(c, obj[keys[i]]));
  await ensureReady();
  await query(
    `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders.join(", ")})`,
    values
  );
}

async function updateRow(
  table: string,
  id: string,
  obj: Record<string, unknown>
): Promise<void> {
  const keys = Object.keys(obj).filter((k) => k !== "id");
  if (keys.length === 0) return;
  const sets = keys.map((k, i) => {
    const col = toSnake(k);
    return JSONB_COLUMNS.has(col)
      ? `${col} = $${i + 1}::jsonb`
      : `${col} = $${i + 1}`;
  });
  const values = keys.map((k) => encode(toSnake(k), obj[k]));
  values.push(id);
  await ensureReady();
  await query(
    `UPDATE ${table} SET ${sets.join(", ")} WHERE id = $${keys.length + 1}`,
    values
  );
}

async function deleteRow(table: string, id: string): Promise<void> {
  await ensureReady();
  await query(`DELETE FROM ${table} WHERE id = $1`, [id]);
}

// Entity-specific helpers ----------------------------------------------------

export const insertUser = (u: User) => insertRow("users", { ...u });
export const updateUser = (id: string, fields: Partial<User>) =>
  updateRow("users", id, { ...fields });

export const insertStudent = (s: Student) => insertRow("students", { ...s });
export const updateStudent = (id: string, fields: Partial<Student>) =>
  updateRow("students", id, { ...fields });
export const deleteStudent = (id: string) => deleteRow("students", id);

export const insertTeacher = (t: Teacher) => insertRow("teachers", { ...t });
export const updateTeacher = (id: string, fields: Partial<Teacher>) =>
  updateRow("teachers", id, { ...fields });
export const deleteTeacher = (id: string) => deleteRow("teachers", id);

export const insertClass = (c: ClassInfo) => insertRow("classes", { ...c });
export const updateClass = (id: string, fields: Partial<ClassInfo>) =>
  updateRow("classes", id, { ...fields });
export const deleteClass = (id: string) => deleteRow("classes", id);

export const insertGrade = (g: Grade) => insertRow("grades", { ...g });
export const updateGrade = (id: string, fields: Partial<Grade>) =>
  updateRow("grades", id, { ...fields });
export const deleteGrade = (id: string) => deleteRow("grades", id);

export const insertFee = (f: Fee) => insertRow("fees", { ...f });
export const updateFee = (id: string, fields: Partial<Fee>) =>
  updateRow("fees", id, { ...fields });
export const deleteFee = (id: string) => deleteRow("fees", id);

export const insertAnnouncement = (a: Announcement) =>
  insertRow("announcements", { ...a });
export const deleteAnnouncement = (id: string) =>
  deleteRow("announcements", id);

export const insertMessage = (m: Message) => insertRow("messages", { ...m });
export const markMessageRead = (id: string) =>
  updateRow("messages", id, { read: true });

export async function deleteUser(id: string): Promise<void> {
  await deleteRow("users", id);
}

export async function upsertAttendance(entry: Attendance): Promise<void> {
  await ensureReady();
  await query(
    `INSERT INTO attendance (id, student_id, class_id, date, status, remarks)
       VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (id) DO UPDATE
       SET status = EXCLUDED.status, remarks = EXCLUDED.remarks`,
    [
      entry.id,
      entry.studentId,
      entry.classId,
      entry.date,
      entry.status,
      entry.remarks ?? null,
    ]
  );
}

export async function findAttendanceId(
  studentId: string,
  classId: string,
  date: string
): Promise<string | null> {
  await ensureReady();
  const rows = await query<{ id: string }>(
    `SELECT id FROM attendance WHERE student_id = $1 AND class_id = $2 AND date = $3 LIMIT 1`,
    [studentId, classId, date]
  );
  return rows[0]?.id ?? null;
}

// ---------------------------------------------------------------------------
// Seed (demo data) — idempotent via fixed primary keys
// ---------------------------------------------------------------------------

async function seed(client: PoolClient): Promise<void> {
  const bcryptjs = await import("bcryptjs");
  const data = buildSeedData(bcryptjs.default ?? bcryptjs);

  await client.query("BEGIN");
  try {
    await bulkInsert(client, "users", data.users);
    await bulkInsert(client, "teachers", data.teachers);
    await bulkInsert(client, "students", data.students);
    await bulkInsert(client, "classes", data.classes);
    await bulkInsert(client, "attendance", data.attendance);
    await bulkInsert(client, "grades", data.grades);
    await bulkInsert(client, "fees", data.fees);
    await bulkInsert(client, "announcements", data.announcements);
    await bulkInsert(client, "messages", data.messages);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  }
}

// Inserts many rows in a single multi-row INSERT statement.
async function bulkInsert<T extends object>(
  client: PoolClient,
  table: string,
  rows: T[]
): Promise<void> {
  if (rows.length === 0) return;
  const keys = Object.keys(rows[0]);
  const cols = keys.map(toSnake);
  const values: unknown[] = [];
  const tuples = rows.map((row, r) => {
    const obj = row as Record<string, unknown>;
    const placeholders = cols.map((c, i) => {
      const idx = r * cols.length + i + 1;
      return JSONB_COLUMNS.has(c) ? `$${idx}::jsonb` : `$${idx}`;
    });
    keys.forEach((k, i) => values.push(encode(cols[i], obj[k])));
    return `(${placeholders.join(", ")})`;
  });
  await client.query(
    `INSERT INTO ${table} (${cols.join(", ")}) VALUES ${tuples.join(", ")}`,
    values
  );
}

interface Hasher {
  hashSync(s: string, rounds: number): string;
}

function buildSeedData(bcryptjs: Hasher): DbSnapshot {
  const users: User[] = [];
  const students: Student[] = [];
  const teachers: Teacher[] = [];
  const classes: ClassInfo[] = [];
  const attendance: Attendance[] = [];
  const grades: Grade[] = [];
  const fees: Fee[] = [];
  const announcements: Announcement[] = [];
  const messages: Message[] = [];

  users.push({
    id: "u1",
    email: "admin@bshewam.edu.et",
    password: bcryptjs.hashSync("admin123", 10),
    name: "Ato Kebede Tessema",
    role: "admin",
    phone: "+251911234567",
    createdAt: "2024-01-01",
  });

  const teacherData = [
    { name: "W/ro Tigist Haile", subject: "Mathematics", email: "tigist@bshewam.edu.et" },
    { name: "Ato Dawit Mekonnen", subject: "English", email: "dawit@bshewam.edu.et" },
    { name: "W/ro Hiwot Bekele", subject: "Science", email: "hiwot@bshewam.edu.et" },
    { name: "Ato Yonas Girma", subject: "History", email: "yonas@bshewam.edu.et" },
    { name: "W/ro Meron Tadesse", subject: "Amharic", email: "meron@bshewam.edu.et" },
  ];

  teacherData.forEach((t, i) => {
    const uid = `u${10 + i}`;
    users.push({
      id: uid,
      email: t.email,
      password: bcryptjs.hashSync("teacher123", 10),
      name: t.name,
      role: "teacher",
      phone: `+25191${1000000 + i}`,
      createdAt: "2024-01-15",
    });
    teachers.push({
      id: `t${i + 1}`,
      userId: uid,
      subject: t.subject,
      qualification: "B.Ed",
      experience: 5 + i,
      salary: 8000 + i * 500,
      joinDate: "2024-01-15",
      status: "active",
    });
  });

  const parents = [
    { name: "Ato Abebe Worku", email: "abebe@gmail.com" },
    { name: "W/ro Almaz Tesfaye", email: "almaz@gmail.com" },
    { name: "Ato Getachew Desta", email: "getachew@gmail.com" },
    { name: "W/ro Bezunesh Alemu", email: "bezunesh@gmail.com" },
    { name: "Ato Solomon Kassa", email: "solomon@gmail.com" },
  ];

  parents.forEach((p, i) => {
    users.push({
      id: `u${20 + i}`,
      email: p.email,
      password: bcryptjs.hashSync("parent123", 10),
      name: p.name,
      role: "parent",
      phone: `+25192${1000000 + i}`,
      createdAt: "2024-02-01",
    });
  });

  const studentNames = [
    { name: "Abiy Abebe", gender: "Male", grade: "9", section: "A", parent: "u20" },
    { name: "Sara Almaz", gender: "Female", grade: "9", section: "A", parent: "u21" },
    { name: "Daniel Getachew", gender: "Male", grade: "9", section: "B", parent: "u22" },
    { name: "Hanna Bezunesh", gender: "Female", grade: "10", section: "A", parent: "u23" },
    { name: "Nahom Solomon", gender: "Male", grade: "10", section: "A", parent: "u24" },
    { name: "Kidist Abebe", gender: "Female", grade: "10", section: "B", parent: "u20" },
    { name: "Yared Almaz", gender: "Male", grade: "11", section: "A", parent: "u21" },
    { name: "Tigist Getachew", gender: "Female", grade: "11", section: "A", parent: "u22" },
    { name: "Bereket Solomon", gender: "Male", grade: "11", section: "B", parent: "u24" },
    { name: "Marta Bezunesh", gender: "Female", grade: "12", section: "A", parent: "u23" },
  ];

  studentNames.forEach((s, i) => {
    const uid = `u${30 + i}`;
    users.push({
      id: uid,
      email: `${s.name.split(" ")[0].toLowerCase()}@student.bshewam.edu.et`,
      password: bcryptjs.hashSync("student123", 10),
      name: s.name,
      role: "student",
      createdAt: "2024-02-15",
    });
    students.push({
      id: `s${i + 1}`,
      userId: uid,
      grade: s.grade,
      section: s.section,
      rollNumber: `BSH-${s.grade}${s.section}-${String(i + 1).padStart(3, "0")}`,
      parentId: s.parent,
      dateOfBirth: `200${8 - Math.floor(i / 3)}-0${(i % 12) + 1}-15`,
      gender: s.gender,
      address: "Addis Ababa, Ethiopia",
      enrollmentDate: "2024-02-15",
      status: "active",
    });
  });

  const classData = [
    { grade: "9", section: "A", subject: "Mathematics", teacher: "t1", room: "R101" },
    { grade: "9", section: "A", subject: "English", teacher: "t2", room: "R102" },
    { grade: "9", section: "B", subject: "Science", teacher: "t3", room: "R103" },
    { grade: "10", section: "A", subject: "Mathematics", teacher: "t1", room: "R201" },
    { grade: "10", section: "A", subject: "History", teacher: "t4", room: "R202" },
    { grade: "10", section: "B", subject: "Amharic", teacher: "t5", room: "R203" },
    { grade: "11", section: "A", subject: "English", teacher: "t2", room: "R301" },
    { grade: "11", section: "B", subject: "Science", teacher: "t3", room: "R302" },
    { grade: "12", section: "A", subject: "Mathematics", teacher: "t1", room: "R401" },
    { grade: "12", section: "A", subject: "Amharic", teacher: "t5", room: "R402" },
  ];

  classData.forEach((c, i) => {
    classes.push({
      id: `c${i + 1}`,
      name: `Grade ${c.grade}${c.section} - ${c.subject}`,
      grade: c.grade,
      section: c.section,
      teacherId: c.teacher,
      subject: c.subject,
      schedule: `${["Mon/Wed/Fri", "Tue/Thu", "Mon/Wed", "Tue/Thu/Sat"][i % 4]} ${8 + (i % 4)}:00-${9 + (i % 4)}:00`,
      room: c.room,
      capacity: 40,
    });
  });

  const today = new Date();
  for (let d = 0; d < 30; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const dateStr = date.toISOString().split("T")[0];

    students.forEach((student) => {
      const relevantClasses = classes.filter(
        (c) => c.grade === student.grade && c.section === student.section
      );
      relevantClasses.forEach((cls) => {
        const rand = Math.random();
        const status = rand > 0.9 ? "absent" : rand > 0.85 ? "late" : "present";
        attendance.push({
          id: `a${attendance.length + 1}`,
          studentId: student.id,
          classId: cls.id,
          date: dateStr,
          status: status as Attendance["status"],
        });
      });
    });
  }

  const examTypes = ["Quiz 1", "Midterm", "Quiz 2", "Final"];
  students.forEach((student) => {
    const relevantClasses = classes.filter(
      (c) => c.grade === student.grade && c.section === student.section
    );
    relevantClasses.forEach((cls) => {
      examTypes.forEach((exam, ei) => {
        const maxScore = exam.includes("Quiz") ? 20 : 50;
        const score = Math.floor(Math.random() * (maxScore * 0.4)) + maxScore * 0.5;
        const pct = score / maxScore;
        let letterGrade = "F";
        if (pct >= 0.9) letterGrade = "A";
        else if (pct >= 0.8) letterGrade = "B";
        else if (pct >= 0.7) letterGrade = "C";
        else if (pct >= 0.6) letterGrade = "D";

        grades.push({
          id: `g${grades.length + 1}`,
          studentId: student.id,
          classId: cls.id,
          examType: exam,
          score: Math.round(score),
          maxScore,
          grade: letterGrade,
          semester: "Semester 1",
          date: `2024-0${3 + ei * 2}-15`,
          remarks: pct >= 0.9 ? "Excellent" : pct >= 0.7 ? "Good" : "Needs improvement",
        });
      });
    });
  });

  const feeTypes = [
    { type: "Tuition", amount: 5000 },
    { type: "Registration", amount: 500 },
    { type: "Library", amount: 200 },
    { type: "Lab", amount: 300 },
    { type: "Transport", amount: 1500 },
  ];

  students.forEach((student) => {
    feeTypes.forEach((fee, fi) => {
      const isPaid = Math.random() > 0.3;
      fees.push({
        id: `f${fees.length + 1}`,
        studentId: student.id,
        type: fee.type,
        amount: fee.amount,
        dueDate: `2024-0${fi + 1}-01`,
        paidDate: isPaid ? `2024-0${fi + 1}-${Math.floor(Math.random() * 20) + 1}` : undefined,
        status: isPaid ? "paid" : Math.random() > 0.5 ? "pending" : "overdue",
        paymentMethod: isPaid ? ["Cash", "Bank Transfer", "Mobile Money"][Math.floor(Math.random() * 3)] : undefined,
      });
    });
  });

  announcements.push(
    {
      id: "ann1",
      title: "Welcome to Bshewam School 2024/2025",
      content: "We are pleased to welcome all students, teachers, and parents to the new academic year. Let us work together for excellence in education.",
      authorId: "u1",
      targetRoles: ["admin", "teacher", "student", "parent"],
      priority: "high",
      createdAt: "2024-09-01",
    },
    {
      id: "ann2",
      title: "Parent-Teacher Conference",
      content: "The quarterly parent-teacher conference is scheduled for October 15, 2024. All parents are encouraged to attend and discuss their children's progress.",
      authorId: "u1",
      targetRoles: ["teacher", "parent"],
      priority: "medium",
      createdAt: "2024-09-20",
    },
    {
      id: "ann3",
      title: "Midterm Exam Schedule",
      content: "Midterm examinations will begin on November 1, 2024. Please check the detailed schedule posted on the notice board. Students should prepare accordingly.",
      authorId: "u1",
      targetRoles: ["teacher", "student", "parent"],
      priority: "high",
      createdAt: "2024-10-15",
    },
    {
      id: "ann4",
      title: "Sports Day Announcement",
      content: "Annual Sports Day will be held on December 5, 2024. All students are encouraged to participate. Registration forms are available at the PE department.",
      authorId: "u1",
      targetRoles: ["student", "teacher"],
      priority: "low",
      createdAt: "2024-11-01",
    },
    {
      id: "ann5",
      title: "Fee Payment Reminder",
      content: "This is a reminder that all outstanding fees must be paid by the end of November. Late payment penalties will apply after the deadline.",
      authorId: "u1",
      targetRoles: ["parent"],
      priority: "urgent",
      createdAt: "2024-11-10",
    }
  );

  messages.push(
    {
      id: "m1",
      senderId: "u10",
      receiverId: "u20",
      subject: "Abiy's Mathematics Progress",
      content: "Dear parent, I wanted to inform you that Abiy has shown great improvement in Mathematics this month. His quiz scores have been consistently high.",
      read: false,
      createdAt: "2024-10-20",
    },
    {
      id: "m2",
      senderId: "u20",
      receiverId: "u10",
      subject: "Re: Abiy's Mathematics Progress",
      content: "Thank you for the update. We are very proud of his progress. Please let us know if there is anything we can do to support his learning at home.",
      read: true,
      createdAt: "2024-10-21",
    },
    {
      id: "m3",
      senderId: "u1",
      receiverId: "u10",
      subject: "Staff Meeting Notice",
      content: "Please be informed that there will be a staff meeting this Friday at 3:00 PM in the conference room. Attendance is mandatory.",
      read: false,
      createdAt: "2024-10-22",
    }
  );

  return {
    users,
    students,
    teachers,
    classes,
    attendance,
    grades,
    fees,
    announcements,
    messages,
  };
}
