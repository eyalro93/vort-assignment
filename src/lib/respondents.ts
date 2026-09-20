import { query, queryOne } from "./db";
import { createDeleteCode, createToken } from "./id";
import type { QuizAnswers } from "./validation";

export type Respondent = {
  id: string;
  token: string;
  track: string;
  level: string;
  workplace_type: string;
  years_experience: string;
  manages_team: boolean;
  referred_by_token: string | null;
  reported_salary: number | null;
  availability: string | null;
  cv_filename: string | null;
  consent_given_at: string | null;
  delete_code: string | null;
  is_synthetic: boolean;
  created_at: string;
};

export async function createRespondent(
  answers: QuizAnswers,
  referredByToken: string | null
): Promise<string> {
  const token = createToken();

  // A referral only counts if the referrer actually exists -- silently drop
  // a stale or made-up ?ref= rather than fail the whole submission over it.
  let validReferrer: string | null = null;
  if (referredByToken) {
    const referrer = await queryOne(
      `select token from respondents where token = $1`,
      [referredByToken]
    );
    validReferrer = referrer ? referredByToken : null;
  }

  await query(
    `insert into respondents
       (token, track, level, workplace_type, years_experience, manages_team, referred_by_token)
     values ($1, $2, $3, $4, $5, $6, $7)`,
    [
      token,
      answers.track,
      answers.level,
      answers.workplaceType,
      answers.yearsExperience,
      answers.managesTeam,
      validReferrer,
    ]
  );

  return token;
}

export async function getRespondentByToken(
  token: string
): Promise<Respondent | null> {
  return queryOne<Respondent>(`select * from respondents where token = $1`, [
    token,
  ]);
}

export async function getCohortRange(
  track: string,
  level: string
): Promise<{ p15: number; p50: number; p85: number; sampleSize: number } | null> {
  const rows = await query<{ reported_salary: number }>(
    `select reported_salary from respondents
     where track = $1 and level = $2 and reported_salary is not null
     order by reported_salary asc`,
    [track, level]
  );
  if (rows.length === 0) return null;

  const salaries = rows.map((r) => Number(r.reported_salary));
  const at = (p: number) =>
    salaries[Math.min(salaries.length - 1, Math.floor(p * salaries.length))];

  return {
    p15: at(0.15),
    p50: at(0.5),
    p85: at(0.85),
    sampleSize: salaries.length,
  };
}

export async function getCohortSize(track: string): Promise<number> {
  const row = await queryOne<{ count: string }>(
    `select count(*)::text as count from respondents where track = $1`,
    [track]
  );
  return row ? Number(row.count) : 0;
}

export async function computePercentile(
  track: string,
  level: string,
  salary: number
): Promise<number> {
  const row = await queryOne<{ below: string; total: string }>(
    `select
       count(*) filter (where reported_salary <= $3)::text as below,
       count(*)::text as total
     from respondents
     where track = $1 and level = $2 and reported_salary is not null`,
    [track, level, salary]
  );
  if (!row || Number(row.total) === 0) return 50;
  return Math.round((Number(row.below) / Number(row.total)) * 100);
}

export type SaveDetailsInput = {
  token: string;
  reportedSalary: number;
  availability: string;
  excludeEmployers: string[];
  cv: { filename: string; mimetype: string; data: Buffer } | null;
};

export async function saveDetails(
  input: SaveDetailsInput
): Promise<{ deleteCode: string }> {
  const deleteCode = createDeleteCode();

  await query(
    `update respondents set
       reported_salary = $2,
       availability = $3,
       exclude_employers = $4,
       cv_filename = $5,
       cv_mimetype = $6,
       cv_data = $7,
       consent_given_at = now(),
       delete_code = $8
     where token = $1`,
    [
      input.token,
      input.reportedSalary,
      input.availability,
      input.excludeEmployers,
      input.cv?.filename ?? null,
      input.cv?.mimetype ?? null,
      input.cv?.data ?? null,
      deleteCode,
    ]
  );

  return { deleteCode };
}

/** For the referral link preview: only shows a card once the person has an actual percentile. */
export async function getReferralCard(
  token: string
): Promise<{ track: string; level: string; topPercent: number } | null> {
  const respondent = await getRespondentByToken(token);
  if (!respondent || respondent.reported_salary === null) return null;

  const percentile = await computePercentile(
    respondent.track,
    respondent.level,
    respondent.reported_salary
  );
  return {
    track: respondent.track,
    level: respondent.level,
    topPercent: Math.max(1, 100 - percentile),
  };
}

export async function deleteByCode(code: string): Promise<boolean> {
  const rows = await query(
    `delete from respondents where delete_code = $1 returning id`,
    [code]
  );
  return rows.length > 0;
}
