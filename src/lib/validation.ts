import { z } from "zod";
import {
  TRACKS,
  LEVELS_BY_TRACK,
  WORKPLACE_TYPES_BY_TRACK,
  EXPERIENCE_BUCKETS,
  AVAILABILITY_OPTIONS,
  type TrackId,
} from "./tracks";

const trackIds = TRACKS.map((t) => t.id) as [string, ...string[]];
const experienceIds = EXPERIENCE_BUCKETS.map((e) => e.id) as [
  string,
  ...string[],
];
const availabilityIds = AVAILABILITY_OPTIONS.map((a) => a.id) as [
  string,
  ...string[],
];

export const quizSchema = z
  .object({
    track: z.enum(trackIds),
    level: z.string().min(1),
    workplaceType: z.string().min(1),
    yearsExperience: z.enum(experienceIds),
    managesTeam: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const validLevels = LEVELS_BY_TRACK[data.track as TrackId].map(
      (l) => l.id
    );
    if (!validLevels.includes(data.level)) {
      ctx.addIssue({
        code: "custom",
        path: ["level"],
        message: "level does not match track",
      });
    }
    const validWorkplaces = WORKPLACE_TYPES_BY_TRACK[data.track as TrackId].map(
      (w) => w.id
    );
    if (!validWorkplaces.includes(data.workplaceType)) {
      ctx.addIssue({
        code: "custom",
        path: ["workplaceType"],
        message: "workplace type does not match track",
      });
    }
  });

export type QuizAnswers = z.infer<typeof quizSchema>;

// Vercel caps serverless request bodies at 4.5MB, so stay under that.
export const MAX_CV_BYTES = 4 * 1024 * 1024; // 4MB
export const ACCEPTED_CV_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const detailsSchema = z.object({
  reportedSalary: z.coerce.number().int().min(3000).max(200000),
  availability: z.enum(availabilityIds),
  excludeEmployers: z.string().max(500).optional().default(""),
  consentGiven: z.literal(true, "יש לאשר את תנאי השימוש כדי להמשיך"),
});
