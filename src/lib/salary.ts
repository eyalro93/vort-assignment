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

// Multiplied onto the base range. A national broadcaster/major outlet (or
// in-house corporate comms, for PR) pays a premium; freelance carries the
// widest spread, reflected by giving it extra noise below.
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

export function generateSalary(cohort: Cohort, rng: Rng): number {
  const [min, max] = BASE_RANGE[cohort.track as TrackId]?.[cohort.level] ?? [
    10000, 15000,
  ];
  const base = min + rng() * (max - min);

  const workplaceMult = WORKPLACE_MULTIPLIER[cohort.workplaceType] ?? 1;
  const experienceMult = EXPERIENCE_MULTIPLIER[cohort.yearsExperience] ?? 1;
  const teamMult = cohort.managesTeam ? MANAGES_TEAM_MULTIPLIER : 1;
  const spread = cohort.workplaceType === "freelance" ? 0.22 : 0.12;

  const salary =
    base * workplaceMult * experienceMult * teamMult * noise(rng, spread);

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

  const workplaceMult = WORKPLACE_MULTIPLIER[cohort.workplaceType] ?? 1;
  const experienceMult = EXPERIENCE_MULTIPLIER[cohort.yearsExperience] ?? 1;
  const teamMult = cohort.managesTeam ? MANAGES_TEAM_MULTIPLIER : 1;

  return base * workplaceMult * experienceMult * teamMult;
}

export function formatILS(amount: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(amount);
}
