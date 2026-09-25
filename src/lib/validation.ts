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
const PDF_MAGIC = Buffer.from("%PDF-");
const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const OLE_MAGIC = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);

/**
 * Identifies a CV upload from its bytes, not the browser-reported type (which
 * the client controls, and which some phones leave blank for Word files).
 * Returns the mimetype to store, or null if it isn't a real PDF or Word file.
 * This confirms the format only -- not that the document is actually a CV.
 */
export function detectCvMimetype(data: Buffer): string | null {
  // The PDF spec lets the header sit anywhere in the first 1KB.
  if (data.subarray(0, 1024).includes(PDF_MAGIC)) return "application/pdf";
  // .docx is a ZIP; its entry names (word/document.xml) are stored uncompressed.
  if (data.subarray(0, 4).equals(ZIP_MAGIC) && data.includes("word/")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  // Legacy .doc is an OLE compound file.
  if (data.subarray(0, 8).equals(OLE_MAGIC)) return "application/msword";
  return null;
}

export const detailsSchema = z.object({
  reportedSalary: z.coerce.number().int().min(3000).max(200000),
  availability: z.enum(availabilityIds),
  excludeEmployers: z.string().max(500).optional().default(""),
  consentGiven: z.literal(true, "יש לאשר את תנאי השימוש כדי להמשיך"),
});
