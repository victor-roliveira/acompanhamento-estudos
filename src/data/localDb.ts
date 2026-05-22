import { calculateAccuracy, getCurrentWeekRange, toIsoDate } from "@/lib/utils";
import type { DailyStudyLog, PendingWeek, Subject, StudyLogInput, WeeklyPlan, WeeklyPlanItem } from "@/types/study";

type LocalDb = {
  subjects: Subject[];
  weeklyPlans: WeeklyPlan[];
  weeklyPlanItems: WeeklyPlanItem[];
  dailyStudyLogs: DailyStudyLog[];
};

const STORAGE_KEY = "study-control-local-db";
const DEMO_USER_ID = "demo-user";

function now() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function seed(): LocalDb {
  const { weekStart, weekEnd } = getCurrentWeekRange();
  const created_at = now();
  const subjects: Subject[] = [
    { id: "subject-constitucional", user_id: DEMO_USER_ID, name: "Direito Constitucional", created_at },
    { id: "subject-administrativo", user_id: DEMO_USER_ID, name: "Direito Administrativo", created_at },
    { id: "subject-portugues", user_id: DEMO_USER_ID, name: "Língua Portuguesa", created_at },
    { id: "subject-raciocinio", user_id: DEMO_USER_ID, name: "Raciocínio Lógico", created_at },
  ];
  const plan: WeeklyPlan = { id: "plan-current", user_id: DEMO_USER_ID, week_start: weekStart, week_end: weekEnd, created_at };
  const weeklyPlanItems: WeeklyPlanItem[] = [
    {
      id: "item-1",
      weekly_plan_id: plan.id,
      subject_id: subjects[0].id,
      trail_number: 4,
      topics: ["Controle de constitucionalidade", "Poder constituinte"],
      studied: true,
      created_at,
    },
    {
      id: "item-2",
      weekly_plan_id: plan.id,
      subject_id: subjects[1].id,
      trail_number: 2,
      topics: ["Atos administrativos", "Poderes da administração"],
      studied: false,
      created_at,
    },
    {
      id: "item-3",
      weekly_plan_id: plan.id,
      subject_id: subjects[2].id,
      trail_number: 0,
      topics: ["Concordância", "Regência"],
      studied: false,
      created_at,
    },
    {
      id: "item-4",
      weekly_plan_id: plan.id,
      subject_id: subjects[3].id,
      trail_number: 3,
      topics: ["Sequências", "Proposições"],
      studied: false,
      created_at,
    },
  ];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dailyStudyLogs: DailyStudyLog[] = [
    {
      id: "log-1",
      user_id: DEMO_USER_ID,
      subject_id: subjects[0].id,
      trail_number: 4,
      topics: ["Controle de constitucionalidade"],
      study_date: toIsoDate(yesterday),
      total_questions: 30,
      correct_questions: 23,
      wrong_questions: 7,
      accuracy_percentage: calculateAccuracy(23, 30),
      notes: "Revisar efeitos da decisão em ADI.",
      created_at,
    },
    {
      id: "log-2",
      user_id: DEMO_USER_ID,
      subject_id: subjects[2].id,
      trail_number: 0,
      topics: ["Concordância"],
      study_date: weekStart,
      total_questions: 20,
      correct_questions: 10,
      wrong_questions: 10,
      accuracy_percentage: 50,
      notes: null,
      created_at,
    },
  ];

  return { subjects, weeklyPlans: [plan], weeklyPlanItems, dailyStudyLogs };
}

function readDb(): LocalDb {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const initial = seed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(stored) as LocalDb;
}

function writeDb(db: LocalDb) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function hydratePlanItem(db: LocalDb, item: WeeklyPlanItem): WeeklyPlanItem {
  return {
    ...item,
    subject: db.subjects.find((subject) => subject.id === item.subject_id),
    weekly_plan: db.weeklyPlans.find((plan) => plan.id === item.weekly_plan_id),
  };
}

export const localDb = {
  demoUser: { id: DEMO_USER_ID, email: "demo@local.dev" },

  listSubjects(userId: string) {
    return readDb().subjects.filter((subject) => subject.user_id === userId).sort((a, b) => a.name.localeCompare(b.name));
  },

  upsertSubject(userId: string, name: string) {
    const db = readDb();
    const normalized = name.trim();
    const existing = db.subjects.find((subject) => subject.user_id === userId && subject.name.toLowerCase() === normalized.toLowerCase());
    if (existing) return existing;
    const subject: Subject = { id: id("subject"), user_id: userId, name: normalized, created_at: now() };
    db.subjects.push(subject);
    writeDb(db);
    return subject;
  },

  getOrCreateWeeklyPlan(userId: string, weekStart: string, weekEnd: string) {
    const db = readDb();
    let plan = db.weeklyPlans.find((item) => item.user_id === userId && item.week_start === weekStart);
    if (!plan) {
      plan = { id: id("plan"), user_id: userId, week_start: weekStart, week_end: weekEnd, created_at: now() };
      db.weeklyPlans.push(plan);
      writeDb(db);
    }
    return plan;
  },

  listWeeklyPlanItems(userId: string, weekStart: string, weekEnd: string) {
    const plan = this.getOrCreateWeeklyPlan(userId, weekStart, weekEnd);
    const db = readDb();
    return db.weeklyPlanItems
      .filter((item) => item.weekly_plan_id === plan.id)
      .map((item) => hydratePlanItem(db, item))
      .sort((a, b) => a.trail_number - b.trail_number);
  },

  listAllWeeklyPlanItems(userId: string) {
    const db = readDb();
    const userPlanIds = new Set(db.weeklyPlans.filter((plan) => plan.user_id === userId).map((plan) => plan.id));
    return db.weeklyPlanItems
      .filter((item) => userPlanIds.has(item.weekly_plan_id))
      .map((item) => hydratePlanItem(db, item))
      .sort((a, b) => a.trail_number - b.trail_number || (a.subject?.name ?? "").localeCompare(b.subject?.name ?? ""));
  },

  addWeeklyPlanItem(userId: string, weekStart: string, weekEnd: string, subjectName: string, trailNumber: number, topics: string[]) {
    const db = readDb();
    const subject = this.upsertSubject(userId, subjectName);
    const plan = this.getOrCreateWeeklyPlan(userId, weekStart, weekEnd);
    const item: WeeklyPlanItem = {
      id: id("item"),
      weekly_plan_id: plan.id,
      subject_id: subject.id,
      trail_number: trailNumber,
      topics,
      studied: false,
      created_at: now(),
    };
    const freshDb = readDb();
    freshDb.weeklyPlanItems.push(item);
    writeDb(freshDb);
    return hydratePlanItem({ ...freshDb, subjects: [...freshDb.subjects, subject] }, item);
  },

  updatePlanItemStudied(itemId: string, studied: boolean) {
    const db = readDb();
    db.weeklyPlanItems = db.weeklyPlanItems.map((item) => (item.id === itemId ? { ...item, studied } : item));
    writeDb(db);
  },

  listPending(userId: string): PendingWeek[] {
    const db = readDb();
    return db.weeklyPlans
      .filter((plan) => plan.user_id === userId)
      .map((plan) => ({
        plan,
        items: db.weeklyPlanItems
          .filter((item) => item.weekly_plan_id === plan.id && !item.studied)
          .map((item) => hydratePlanItem(db, item))
          .sort((a, b) => a.trail_number - b.trail_number),
      }))
      .filter((week) => week.items.length > 0)
      .sort((a, b) => b.plan.week_start.localeCompare(a.plan.week_start));
  },

  listLogs(userId: string) {
    const db = readDb();
    return db.dailyStudyLogs
      .filter((log) => log.user_id === userId)
      .map((log) => ({ ...log, subject: db.subjects.find((subject) => subject.id === log.subject_id) }))
      .sort((a, b) => b.study_date.localeCompare(a.study_date));
  },

  createLog(userId: string, input: StudyLogInput) {
    const db = readDb();
    const log: DailyStudyLog = {
      id: id("log"),
      user_id: userId,
      ...input,
      accuracy_percentage: calculateAccuracy(input.correct_questions, input.total_questions),
      notes: input.notes?.trim() || null,
      created_at: now(),
    };
    db.dailyStudyLogs.push(log);
    db.weeklyPlanItems = db.weeklyPlanItems.map((item) => {
      const plan = db.weeklyPlans.find((candidate) => candidate.id === item.weekly_plan_id);
      const sameWeek = plan && input.study_date >= plan.week_start && input.study_date <= plan.week_end;
      const sameStudy = item.subject_id === input.subject_id && item.trail_number === input.trail_number;
      return sameWeek && sameStudy ? { ...item, studied: true } : item;
    });
    writeDb(db);
    return { ...log, subject: db.subjects.find((subject) => subject.id === log.subject_id) };
  },
};
