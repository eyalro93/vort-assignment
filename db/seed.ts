// Generates the synthetic backdrop this whole product leans on: sample
// respondents spread across every (track, level) cohort, each with a
// plausible salary. Real users are compared against this pool to compute
// their percentile -- see src/lib/salary.ts for the numbers this is built on.
//
// Run with: npm run db:seed

try {
  process.loadEnvFile();
} catch {
  // no .env file -- assume DATABASE_URL is already in the environment
}

import { Pool } from "pg";
import {
  TRACKS,
  LEVELS_BY_TRACK,
  WORKPLACE_TYPES_BY_TRACK,
  EXPERIENCE_BUCKETS,
  type TrackId,
} from "../src/lib/tracks";
import { generateSalary, type Rng } from "../src/lib/salary";
import { createToken } from "../src/lib/id";

const SAMPLES_PER_COHORT = 70;

// Deterministic PRNG so re-running the seed produces the same dataset --
// makes the demo reproducible and diffs in this file meaningful.
function mulberry32(seed: number): Rng {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: Rng, options: readonly T[]): T {
  return options[Math.floor(rng() * options.length)];
}

function weightedPick<T>(rng: Rng, options: readonly T[], weights: number[]): T {
  let r = rng() * weights.reduce((sum, w) => sum + w, 0);
  for (let i = 0; i < options.length; i++) {
    r -= weights[i];
    if (r < 0) return options[i];
  }
  return options[options.length - 1];
}

// Years of experience by level, in EXPERIENCE_BUCKETS order (0-2, 3-5, 6-10,
// 11+). Each level centers on one bucket with some overlap into its
// neighbours. A synthetic assumption, like the multipliers in salary.ts.
const EXPERIENCE_WEIGHTS_BY_LEVEL: Record<string, number[]> = {
  junior: [0.7, 0.25, 0.05, 0],
  mid: [0.15, 0.6, 0.2, 0.05],
  senior: [0, 0.2, 0.6, 0.2],
  head: [0, 0.05, 0.3, 0.65],
};

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const rng = mulberry32(20260101); // seeded on a fixed "date" for reproducibility

  const rows: unknown[][] = [];

  for (const track of TRACKS) {
    const levels = LEVELS_BY_TRACK[track.id as TrackId];
    const workplaces = WORKPLACE_TYPES_BY_TRACK[track.id as TrackId];

    for (const level of levels) {
      for (let i = 0; i < SAMPLES_PER_COHORT; i++) {
        const workplaceType = pick(rng, workplaces).id;
        const yearsExperience = weightedPick(
          rng,
          EXPERIENCE_BUCKETS,
          EXPERIENCE_WEIGHTS_BY_LEVEL[level.id]
        ).id;
        // Team management gets more likely at more senior levels.
        const teamOdds =
          { junior: 0.03, mid: 0.15, senior: 0.4, head: 0.85 }[level.id] ?? 0.1;
        const managesTeam = rng() < teamOdds;

        const salary = generateSalary(
          {
            track: track.id,
            level: level.id,
            workplaceType,
            yearsExperience,
            managesTeam,
          },
          rng
        );

        rows.push([
          createToken(),
          track.id,
          level.id,
          workplaceType,
          yearsExperience,
          managesTeam,
          salary,
          true, // is_synthetic
        ]);
      }
    }
  }

  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query("delete from respondents where is_synthetic = true");

    const CHUNK = 200;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const chunk = rows.slice(i, i + CHUNK);
      const cols = 8;
      const values = chunk
        .map(
          (_, rowIdx) =>
            `(${Array.from(
              { length: cols },
              (__, colIdx) => `$${rowIdx * cols + colIdx + 1}`
            ).join(", ")})`
        )
        .join(", ");

      await client.query(
        `insert into respondents
           (token, track, level, workplace_type, years_experience, manages_team, reported_salary, is_synthetic)
         values ${values}`,
        chunk.flat()
      );
    }

    await client.query("commit");
    console.log(`Seeded ${rows.length} synthetic respondents.`);
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
