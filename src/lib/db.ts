// In-memory database for the school management system
// In production, replace with PostgreSQL or another persistent database

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

// Database storage
const db = {
  users: [] as User[],
  students: [] as Student[],
  teachers: [] as Teacher[],
  classes: [] as ClassInfo[],
  attendance: [] as Attendance[],
  grades: [] as Grade[],
  fees: [] as Fee[],
  announcements: [] as Announcement[],
  messages: [] as Message[],
};

// Seed data
function seedDatabase() {
  if (db.users.length > 0) return;

  const bcryptjs = require("bcryptjs");

  // Admin user
  db.users.push({
    id: "u1",
    email: "admin@bshewam.edu.et",
    password: bcryptjs.hashSync("admin123", 10),
    name: "Ato Kebede Tessema",
    role: "admin",
    phone: "+251911234567",
    createdAt: "2024-01-01",
  });

  // Teachers
  const teachers = [
    { name: "W/ro Tigist Haile", subject: "Mathematics", email: "tigist@bshewam.edu.et" },
    { name: "Ato Dawit Mekonnen", subject: "English", email: "dawit@bshewam.edu.et" },
    { name: "W/ro Hiwot Bekele", subject: "Science", email: "hiwot@bshewam.edu.et" },
    { name: "Ato Yonas Girma", subject: "History", email: "yonas@bshewam.edu.et" },
    { name: "W/ro Meron Tadesse", subject: "Amharic", email: "meron@bshewam.edu.et" },
  ];

  teachers.forEach((t, i) => {
    const uid = `u${10 + i}`;
    db.users.push({
      id: uid,
      email: t.email,
      password: bcryptjs.hashSync("teacher123", 10),
      name: t.name,
      role: "teacher",
      phone: `+25191${1000000 + i}`,
      createdAt: "2024-01-15",
    });
    db.teachers.push({
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

  // Parents
  const parents = [
    { name: "Ato Abebe Worku", email: "abebe@gmail.com" },
    { name: "W/ro Almaz Tesfaye", email: "almaz@gmail.com" },
    { name: "Ato Getachew Desta", email: "getachew@gmail.com" },
    { name: "W/ro Bezunesh Alemu", email: "bezunesh@gmail.com" },
    { name: "Ato Solomon Kassa", email: "solomon@gmail.com" },
  ];

  parents.forEach((p, i) => {
    db.users.push({
      id: `u${20 + i}`,
      email: p.email,
      password: bcryptjs.hashSync("parent123", 10),
      name: p.name,
      role: "parent",
      phone: `+25192${1000000 + i}`,
      createdAt: "2024-02-01",
    });
  });

  // Students
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
    db.users.push({
      id: uid,
      email: `${s.name.split(" ")[0].toLowerCase()}@student.bshewam.edu.et`,
      password: bcryptjs.hashSync("student123", 10),
      name: s.name,
      role: "student",
      createdAt: "2024-02-15",
    });
    db.students.push({
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

  // Classes
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
    db.classes.push({
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

  // Attendance records
  const today = new Date();
  for (let d = 0; d < 30; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const dateStr = date.toISOString().split("T")[0];

    db.students.forEach((student) => {
      const relevantClasses = db.classes.filter(
        (c) => c.grade === student.grade && c.section === student.section
      );
      relevantClasses.forEach((cls) => {
        const rand = Math.random();
        const status = rand > 0.9 ? "absent" : rand > 0.85 ? "late" : "present";
        db.attendance.push({
          id: `a${db.attendance.length + 1}`,
          studentId: student.id,
          classId: cls.id,
          date: dateStr,
          status: status as Attendance["status"],
        });
      });
    });
  }

  // Grades
  const examTypes = ["Quiz 1", "Midterm", "Quiz 2", "Final"];
  db.students.forEach((student) => {
    const relevantClasses = db.classes.filter(
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

        db.grades.push({
          id: `g${db.grades.length + 1}`,
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

  // Fees
  const feeTypes = [
    { type: "Tuition", amount: 5000 },
    { type: "Registration", amount: 500 },
    { type: "Library", amount: 200 },
    { type: "Lab", amount: 300 },
    { type: "Transport", amount: 1500 },
  ];

  db.students.forEach((student) => {
    feeTypes.forEach((fee, fi) => {
      const isPaid = Math.random() > 0.3;
      db.fees.push({
        id: `f${db.fees.length + 1}`,
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

  // Announcements
  db.announcements.push(
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

  // Messages
  db.messages.push(
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
}

seedDatabase();

export default db;
