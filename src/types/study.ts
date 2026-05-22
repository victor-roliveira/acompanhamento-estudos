export type UserSession = {
  id: string;
  email: string;
};

export type Subject = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type WeeklyPlan = {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  created_at: string;
};

export type WeeklyPlanItem = {
  id: string;
  weekly_plan_id: string;
  subject_id: string;
  trail_number: number;
  topics: string[];
  studied: boolean;
  created_at: string;
  subject?: Subject;
  weekly_plan?: WeeklyPlan;
};

export type DailyStudyLog = {
  id: string;
  user_id: string;
  subject_id: string;
  trail_number: number;
  topics: string[];
  study_date: string;
  total_questions: number;
  correct_questions: number;
  wrong_questions: number;
  accuracy_percentage: number;
  notes: string | null;
  created_at: string;
  subject?: Subject;
};

export type PendingWeek = {
  plan: WeeklyPlan;
  items: WeeklyPlanItem[];
};

export type DashboardFilter = "general" | "monthly" | "weekly" | "daily";

export type RankingItem = {
  label: string;
  total: number;
  correct: number;
  wrong: number;
  accuracy: number;
};

export type EvolutionPoint = {
  label: string;
  total: number;
  correct: number;
  accuracy: number;
};

export type SubjectTrailEvolution = {
  subject: string;
  trailLabel: string;
  trailNumber: number;
  total: number;
  correct: number;
  accuracy: number;
};

export type DashboardSummary = {
  totalQuestions: number;
  correctQuestions: number;
  wrongQuestions: number;
  accuracy: number;
  bySubject: RankingItem[];
  byTrail: RankingItem[];
  bestSubjects: RankingItem[];
  worstSubjects: RankingItem[];
  evolution: EvolutionPoint[];
  subjectTrailEvolution: SubjectTrailEvolution[];
};

export type StudyLogInput = {
  subject_id: string;
  trail_number: number;
  topics: string[];
  study_date: string;
  total_questions: number;
  correct_questions: number;
  wrong_questions: number;
  notes?: string;
};

export type WeeklyPlanItemInput = {
  subjectName: string;
  trail_number: number;
  topics: string[];
};
