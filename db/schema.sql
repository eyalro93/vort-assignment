-- Vort candidate-side product: schema for the "How much are you worth" flow.
-- Single table on purpose: real respondents and synthetic seed respondents
-- share one shape, so percentile math treats them identically.

create extension if not exists pgcrypto;

create table if not exists respondents (
  id                  uuid primary key default gen_random_uuid(),
  token               text unique not null,

  -- Step 1: the 5-question quiz (always present)
  track               text not null,
  level               text not null,
  workplace_type      text not null,
  years_experience    text not null,
  manages_team        boolean not null default false,

  -- Viral loop: who sent this person here
  referred_by_token   text references respondents (token) on delete set null,

  -- Step 2: filled in only if they choose to unlock the precise result.
  -- Null until then -- a respondent who never uploads a CV still counts
  -- toward the free-range cohort stats, but never toward the candidate pool.
  reported_salary     integer,
  availability        text,
  cv_filename         text,
  cv_mimetype         text,
  cv_data             bytea,
  exclude_employers   text[] not null default '{}',
  consent_given_at    timestamptz,
  delete_code         text unique,

  is_synthetic        boolean not null default false,
  created_at          timestamptz not null default now()
);

-- Percentile queries filter by (track, level) and need reported_salary;
-- this keeps that lookup cheap even at a few thousand rows.
create index if not exists respondents_cohort_idx
  on respondents (track, level)
  where reported_salary is not null;

create index if not exists respondents_referred_by_idx
  on respondents (referred_by_token);
