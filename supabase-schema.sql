-- BacarIQ Platform — Supabase SQL Schema
-- Supabase SQL Editor-ə yapışdırın və RUN edin

-- 1. User cədvəli
create table if not exists "User" (
  id                     uuid primary key,
  name                   text,
  email                  text unique not null,
  role                   text not null default 'STUDENT',
  "subscriptionPlan"     text not null default 'FREE',
  "subscriptionStatus"   text not null default 'ACTIVE',
  "subscriptionExpiresAt" timestamptz,
  "teamAdminId"          text,
  "createdAt"            timestamptz not null default now()
);

-- Migration: add subscriptionExpiresAt if upgrading existing schema
alter table "User" add column if not exists "subscriptionExpiresAt" timestamptz;

-- 2. Lesson cədvəli
create table if not exists "Lesson" (
  id            text primary key,
  title         text not null,
  description   text,
  category      text not null,
  difficulty    text not null default 'beginner',
  format        text not null default 'both',
  duration      integer not null default 900,
  "isFree"      boolean not null default false,
  "isPublished" boolean not null default false,
  "aiGenerated" boolean not null default false,
  content       jsonb,
  tags          text[],
  "thumbnailUrl" text,
  "createdAt"   timestamptz not null default now(),
  "updatedAt"   timestamptz not null default now()
);

-- 3. LessonProgress cədvəli
create table if not exists "LessonProgress" (
  id              text primary key,
  "userId"        uuid not null references "User"(id) on delete cascade,
  "lessonId"      text not null references "Lesson"(id) on delete cascade,
  "watchedSeconds" integer not null default 0,
  "isCompleted"   boolean not null default false,
  "updatedAt"     timestamptz not null default now(),
  unique ("userId", "lessonId")
);

-- 4. Feedback cədvəli
create table if not exists "Feedback" (
  id          text primary key,
  "userId"    uuid not null references "User"(id) on delete cascade,
  "lessonId"  text not null references "Lesson"(id) on delete cascade,
  type        text not null default 'text',
  content     text not null,
  sentiment   text not null default 'neutral',
  "createdAt" timestamptz not null default now()
);

-- 5. AIRecommendation cədvəli
create table if not exists "AIRecommendation" (
  id            text primary key,
  "userId"      uuid not null references "User"(id) on delete cascade,
  "lessonId"    text references "Lesson"(id) on delete set null,
  "lessonTitle" text,
  reasoning     text,
  "createdAt"   timestamptz not null default now()
);

-- 6. AITrendReport cədvəli
create table if not exists "AITrendReport" (
  id          text primary key,
  "reportData" jsonb not null,
  "createdAt" timestamptz not null default now()
);

-- RLS-i bütün cədvəllər üçün DEAKTIV et
alter table "User"             disable row level security;
alter table "Lesson"           disable row level security;
alter table "LessonProgress"   disable row level security;
alter table "Feedback"         disable row level security;
alter table "AIRecommendation" disable row level security;
alter table "AITrendReport"    disable row level security;

-- İndekslər
create index if not exists idx_lesson_progress_user   on "LessonProgress"("userId");
create index if not exists idx_lesson_progress_lesson on "LessonProgress"("lessonId");
create index if not exists idx_feedback_lesson        on "Feedback"("lessonId");
create index if not exists idx_ai_rec_user            on "AIRecommendation"("userId");
create index if not exists idx_lesson_category        on "Lesson"(category);
create index if not exists idx_lesson_published       on "Lesson"("isPublished");

-- Demo pulsuz dərslər
insert into "Lesson" (id, title, description, category, difficulty, format, duration, "isFree", "isPublished", "aiGenerated", tags)
values
(
  'demo-lesson-001',
  'Aktiv Dinləmə: Effektiv Kommunikasiyanın Sirri',
  'Əksər insanlar dinləməyi bilmir — sadəcə növbəsini gözləyir. Bu dərsdə aktiv dinləmənin 5 texnikasını öyrənəcəksiniz.',
  'Kommunikasiya Bacarıqları',
  'beginner', 'both', 900, true, true, false,
  array['kommunikasiya', 'dinləmə', 'başlanğıc']
),
(
  'demo-lesson-002',
  'Vaxt İdarəetməsi: Eisenhower Matrisi',
  'Gündəlik tapşırıqlarınızı 4 kvadranta bölərək əsl prioritetlərinizi tapın.',
  'Şəxsi Effektivlik',
  'beginner', 'text', 600, true, true, false,
  array['vaxt', 'prioritet', 'başlanğıc']
),
(
  'demo-lesson-003',
  'Effektiv Geri Bildirim: SBI Çərçivəsi',
  'Situation-Behaviour-Impact metodunu istifadə edərək konstruktiv geri bildirim verin.',
  'Liderlik və Komanda',
  'beginner', 'both', 780, true, true, false,
  array['liderlik', 'geri-bildirim', 'başlanğıc']
)
on conflict (id) do nothing;

-- 7. Certificate cədvəli
create table if not exists "Certificate" (
  id            text primary key,
  "userId"      uuid not null references "User"(id) on delete cascade,
  "lessonId"    text not null references "Lesson"(id) on delete cascade,
  "userName"    text not null,
  "lessonTitle" text not null,
  "issuedAt"    timestamptz not null default now(),
  unique ("userId", "lessonId")
);

alter table "Certificate" disable row level security;
create index if not exists idx_certificate_user   on "Certificate"("userId");
create index if not exists idx_certificate_lesson on "Certificate"("lessonId");

-- 8. AssessmentResult cədvəli (bacarıq profil testi)
create table if not exists "AssessmentResult" (
  id            text primary key,
  "userId"      uuid not null references "User"(id) on delete cascade,
  scores        jsonb not null,
  "topStrength" text not null,
  "topWeakness" text not null,
  "aiPlan"      jsonb,
  "createdAt"   timestamptz not null default now()
);

alter table "AssessmentResult" disable row level security;
create index if not exists idx_assessment_user on "AssessmentResult"("userId");

-- 9. UserSkill cədvəli (istifadəçinin seçdiyi inkişaf bacarıqları)
create table if not exists "UserSkill" (
  id            text primary key,
  "userId"      uuid not null references "User"(id) on delete cascade,
  "skillKey"    text not null,
  "skillLabel"  text not null,
  "skillIcon"   text not null,
  "assessmentId" text references "AssessmentResult"(id) on delete set null,
  "addedAt"     timestamptz not null default now(),
  unique ("userId", "skillKey")
);

alter table "UserSkill" disable row level security;
create index if not exists idx_userskill_user on "UserSkill"("userId");

-- Migration: add column for existing schemas
alter table "User" add column if not exists "subscriptionExpiresAt" timestamptz;

-- 10. SkillProgram — AI-generated skill curriculum for a user
create table if not exists "SkillProgram" (
  id                   text primary key,
  "userId"             uuid not null references "User"(id) on delete cascade,
  "skillKey"           text not null,
  "skillLabel"         text not null,
  "skillIcon"          text,
  category             text,
  "programTitle"       text not null,
  "programDescription" text,
  "totalDurationWeeks" integer default 4,
  "examQuestions"      jsonb default '[]',
  status               text not null default 'generating',
  "createdAt"          timestamptz not null default now()
);

alter table "SkillProgram" disable row level security;
create index if not exists idx_skillprogram_user     on "SkillProgram"("userId");
create index if not exists idx_skillprogram_skillkey on "SkillProgram"("skillKey");
create unique index if not exists idx_skillprogram_user_skill on "SkillProgram"("userId", "skillKey");

-- 11. SkillLesson — individual lessons within a SkillProgram
create table if not exists "SkillLesson" (
  id              text primary key,
  "programId"     text not null references "SkillProgram"(id) on delete cascade,
  "order"         integer not null,
  title           text not null,
  description     text,
  difficulty      text not null default 'beginner',
  "durationSeconds" integer default 720,
  content         jsonb,
  "createdAt"     timestamptz not null default now()
);

alter table "SkillLesson" disable row level security;
create index if not exists idx_skilllesson_program on "SkillLesson"("programId");
create index if not exists idx_skilllesson_order   on "SkillLesson"("programId", "order");

-- 12. SkillLessonProgress — tracks which lessons a user has completed
create table if not exists "SkillLessonProgress" (
  id            text primary key,
  "userId"      uuid not null references "User"(id) on delete cascade,
  "lessonId"    text not null references "SkillLesson"(id) on delete cascade,
  "programId"   text not null references "SkillProgram"(id) on delete cascade,
  "isCompleted" boolean not null default true,
  "completedAt" timestamptz not null default now(),
  unique ("userId", "lessonId")
);

alter table "SkillLessonProgress" disable row level security;
create index if not exists idx_skillprogress_user    on "SkillLessonProgress"("userId");
create index if not exists idx_skillprogress_program on "SkillLessonProgress"("programId");

-- 13. SkillExamResult — stores final exam attempts
create table if not exists "SkillExamResult" (
  id          text primary key,
  "userId"    uuid not null references "User"(id) on delete cascade,
  "programId" text not null references "SkillProgram"(id) on delete cascade,
  answers     jsonb,
  score       integer not null,
  passed      boolean not null default false,
  "takenAt"   timestamptz not null default now(),
  unique ("userId", "programId")
);

alter table "SkillExamResult" disable row level security;
create index if not exists idx_skillexam_user    on "SkillExamResult"("userId");
create index if not exists idx_skillexam_program on "SkillExamResult"("programId");

-- 14. SkillCertificate — issued when user passes the final exam
create table if not exists "SkillCertificate" (
  id           text primary key,
  "userId"     uuid not null references "User"(id) on delete cascade,
  "programId"  text not null references "SkillProgram"(id) on delete cascade,
  "skillLabel" text not null,
  "userName"   text not null,
  score        integer not null,
  "issuedAt"   timestamptz not null default now(),
  unique ("userId", "programId")
);

alter table "SkillCertificate" disable row level security;
create index if not exists idx_skillcert_user    on "SkillCertificate"("userId");
create index if not exists idx_skillcert_program on "SkillCertificate"("programId");

-- 15. Admin approval columns on SkillLesson
alter table "SkillLesson" add column if not exists "adminApproved" boolean not null default false;
alter table "SkillLesson" add column if not exists "adminComment" text;
alter table "SkillLesson" add column if not exists "approvedAt" timestamptz;

-- 16. CurriculumSuggestion — from trend analysis
create table if not exists "CurriculumSuggestion" (
  id              text primary key,
  "skillName"     text not null,
  category        text,
  reasoning       text,
  "suggestedLesson" text,
  "demandLevel"   text,
  status          text not null default 'pending',
  "createdAt"     timestamptz not null default now(),
  unique ("skillName")
);
alter table "CurriculumSuggestion" disable row level security;

-- 17. UserStreak — tracks user daily learning streaks
create table if not exists "UserStreak" (
  id                text primary key,
  "userId"          uuid not null references "User"(id) on delete cascade,
  "completedDates"  date[] not null default '{}',
  "currentStreak"   integer not null default 0,
  "longestStreak"   integer not null default 0,
  "lastCompletedDate" date,
  "updatedAt"       timestamptz not null default now(),
  unique ("userId")
);

alter table "UserStreak" disable row level security;
create index if not exists idx_userstreak_user on "UserStreak"("userId");

-- Qeydiyyatdan sonra özünüzü admin edin:
-- update "User" set role = 'ADMIN' where email = 'your@email.com';
