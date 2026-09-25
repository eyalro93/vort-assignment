import { query, queryOne } from "./db";
import { createDeleteCode, createToken } from "./id";
import type { QuizAnswers } from "./validation";
import {
  displayPercentile,
  profileAdjustedPercentile,
  profileAdjustedRange,
  type Profile,
  type SalarySample,
} from "./salary";

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

/** The quiz answers that position someone within their (track, level) cohort. */
export type RespondentProfile = Pick<
  Respondent,
  "track" | "level" | "workplace_type" | "years_experience" | "manages_team"
>;

function toProfile(
  r: Pick<Respondent, "workplace_type" | "years_experience" | "manages_team">
): Profile {
  return {
    workplaceType: r.workplace_type,
    yearsExperience: r.years_experience,
    managesTeam: r.manages_team,
  };
}

async function getCohortSamples(
  track: string,
  level: string
): Promise<SalarySample[]> {
  const rows = await query<
    Pick<Respondent, "workplace_type" | "years_experience" | "manages_team"> & {
      reported_salary: number;
    }
  >(
    `select reported_salary, workplace_type, years_experience, manages_team
     from respondents
     where track = $1 and level = $2 and reported_salary is not null`,
    [track, level]
  );
  return rows.map((r) => ({
    ...toProfile(r),
    salary: Number(r.reported_salary),
  }));
}

export async function getCohortRange(
  respondent: RespondentProfile
): Promise<{ p15: number; p50: number; p85: number; sampleSize: number } | null> {
  const samples = await getCohortSamples(respondent.track, respondent.level);
  return profileAdjustedRange(samples, toProfile(respondent));
}

export async function getCohortSize(track: string): Promise<number> {
  const row = await queryOne<{ count: string }>(
    `select count(*)::text as count from respondents where track = $1`,
    [track]
  );
  return row ? Number(row.count) : 0;
}

export async function computePercentile(
  respondent: RespondentProfile,
  salary: number
): Promise<number> {
  const samples = await getCohortSamples(respondent.track, respondent.level);
  return profileAdjustedPercentile(samples, toProfile(respondent), salary);
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
    respondent,
    respondent.reported_salary
  );
  return {
    track: respondent.track,
    level: respondent.level,
    topPercent: 100 - displayPercentile(percentile),
  };
}

export async function deleteByCode(code: string): Promise<boolean> {
  const rows = await query(
    `delete from respondents where delete_code = $1 returning id`,
    [code]
  );
  return rows.length > 0;
}
