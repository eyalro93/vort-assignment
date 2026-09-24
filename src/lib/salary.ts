import type { TrackId } from "./tracks";

// Base monthly gross ILS ranges per (track, level), grounded in public salary
// data for Israeli media roles (Globes' wage survey, Bizportal, AllJobs salary
// pages, and SalaryExpert's Israel editor/newscaster figures -- see README).
// Junior reporters land at 8-12k, senior reporters cross 20k, editors-in-chief
// sit at 22-35k+; the other tracks are interpolated from those anchors since
// no public survey breaks producers or video editors out on their own.
export const BASE_RANGE: Record<TrackId, Record<string, [number, number]>> = {
  journalist: {
    junior: [8000, 12000],
    mid: [12000, 17000],
    senior: [17000, 23000],
    head: [23000, 32000],
  },
  editor: {
    junior: [10000, 14000],
    mid: [14000, 19000],
    senior: [19000, 26000],
    head: [26000, 40000],
  },
  producer: {
    junior: [9000, 12500],
    mid: [12500, 17000],
    senior: [17000, 23000],
    head: [23000, 30000],
  },
  video_editor: {
    junior: [8000, 11000],
    mid: [11000, 15000],
    senior: [15000, 19000],
    head: [19000, 24000],
  },
  pr: {
    junior: [9000, 13000],
    mid: [13000, 19000],
    senior: [19000, 28000],
    head: [28000, 45000],
  },
};

// Synthetic modeling assumptions, not measured salary effects: unlike the
// base ranges above, none of the workplace / experience / team multipliers
// comes from a public source. They shape the synthetic seed population and
// adjust a person's range and percentile for their profile (see
// profileMultiplier below).
//
// A national broadcaster/major outlet (or in-house corporate comms, for PR)
// is assumed to pay a premium; freelance carries the widest spread,
// reflected by giving it extra noise below.
export const WORKPLACE_MULTIPLIER: Record<string, number> = {
  major_outlet: 1.15,
  in_house: 1.15,
  digital_native: 0.95,
  agency: 0.9,
  freelance: 0.85,
};

export const EXPERIENCE_MULTIPLIER: Record<string, number> = {
  "0-2": 0.95,
  "3-5": 1.0,
  "6-10": 1.05,
  "11+": 1.1,
};

export const MANAGES_TEAM_MULTIPLIER = 1.08;

export type Cohort = {
  track: string;
  level: string;
  workplaceType: string;
  yearsExperience: string;
  managesTeam: boolean;
};

/** A source of randoms in [0, 1). Swap in a seeded PRNG for reproducible seed data. */
export type Rng = () => number;

// Sum of 3 uniforms centered on 1.0 approximates a bell curve without
// pulling in a stats library -- good enough for synthetic salaries.
function noise(rng: Rng, spread: number): number {
  const bell = (rng() + rng() + rng()) / 3; // ~0..1, peaked at 0.5
  return 1 + (bell - 0.5) * 2 * spread;
}

export type Profile = Pick<
  Cohort,
  "workplaceType" | "yearsExperience" | "managesTeam"
>;

/** Combined workplace x experience x team multiplier (synthetic assumptions). */
export function profileMultiplier(profile: Profile): number {
  const workplaceMult = WORKPLACE_MULTIPLIER[profile.workplaceType] ?? 1;
  const experienceMult = EXPERIENCE_MULTIPLIER[profile.yearsExperience] ?? 1;
  const teamMult = profile.managesTeam ? MANAGES_TEAM_MULTIPLIER : 1;
  return workplaceMult * experienceMult * teamMult;
}

export function generateSalary(cohort: Cohort, rng: Rng): number {
  const [min, max] = BASE_RANGE[cohort.track as TrackId]?.[cohort.level] ?? [
    10000, 15000,
  ];
  const base = min + rng() * (max - min);
  const spread = cohort.workplaceType === "freelance" ? 0.22 : 0.12;

  const salary = base * profileMultiplier(cohort) * noise(rng, spread);

  return Math.round(salary / 100) * 100;
}

// Same multipliers as generateSalary, but the deterministic midpoint with no
// random noise -- used to compare two hypothetical scenarios (e.g. "what if
// this person managed a team") rather than to draw a sample.
export function estimatedSalary(cohort: Cohort): number {
  const [min, max] = BASE_RANGE[cohort.track as TrackId]?.[cohort.level] ?? [
    10000, 15000,
  ];
  const base = (min + max) / 2;

  return base * profileMultiplier(cohort);
}

export type SalarySample = Profile & { salary: number };

// Range and percentile stay within a (track, level) cohort but are
// "profile-adjusted": every salary is divided by its own adjustment
// multiplier before comparing, so workplace, experience and team management
// count without splitting the cohort into cells too small to mean anything.
//
// Because the multipliers are synthetic assumptions, only half of each
// profile's deviation from 1.0 is applied -- at full strength they swung
// the percentile by 50+ points on a single answer.
const ADJUSTMENT_STRENGTH = 0.5;

function adjustmentMultiplier(profile: Profile): number {
  return 1 + (profileMultiplier(profile) - 1) * ADJUSTMENT_STRENGTH;
}

function adjustedSalaries(samples: SalarySample[]): number[] {
  return samples
    .map((s) => s.salary / adjustmentMultiplier(s))
    .sort((a, b) => a - b);
}

/** 15th/50th/85th percentile of the cohort, scaled to this person's profile. */
export function profileAdjustedRange(
  samples: SalarySample[],
  profile: Profile
): { p15: number; p50: number; p85: number; sampleSize: number } | null {
  if (samples.length === 0) return null;

  const adjusted = adjustedSalaries(samples);
  const mult = adjustmentMultiplier(profile);
  const at = (p: number) => {
    const value =
      adjusted[Math.min(adjusted.length - 1, Math.floor(p * adjusted.length))];
    return Math.round((value * mult) / 100) * 100;
  };

  return {
    p15: at(0.15),
    p50: at(0.5),
    p85: at(0.85),
    sampleSize: samples.length,
  };
}

/** Share (0-100) of the cohort at or below this salary, both sides adjusted. */
export function profileAdjustedPercentile(
  samples: SalarySample[],
  profile: Profile,
  salary: number
): number {
  if (samples.length === 0) return 50;

  const target = salary / adjustmentMultiplier(profile);
  const below = adjustedSalaries(samples).filter((s) => s <= target).length;
  return Math.round((below / samples.length) * 100);
}

// Presentation-only guard: a 0 or 100 would read as "earns more than 0%" or
// "top 100%", so anything shown to a person (or shared) is clamped to 1-99.
export function displayPercentile(percentile: number): number {
  return Math.min(99, Math.max(1, percentile));
}

export function formatILS(amount: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(amount);
}
