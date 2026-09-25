// The vertical: media & communications professionals in Israel.
// Every option here is deliberately a tap target, not free text --
// the brief calls for something a person finishes in under a minute on a phone.

export const TRACKS = [
  { id: "journalist", label: "עיתונאות וכתיבה" },
  { id: "editor", label: "עריכת תוכן" },
  { id: "producer", label: "הפקה" },
  { id: "video_editor", label: "עריכת וידאו" },
  { id: "pr", label: "דוברות ויחסי ציבור" },
] as const;

export type TrackId = (typeof TRACKS)[number]["id"];

// Each track has its own named ladder, but they line up to four shared tiers
// (junior / mid / senior / head) so the salary model can treat them the same.
export const LEVELS_BY_TRACK: Record<
  TrackId,
  { id: string; label: string }[]
> = {
  journalist: [
    { id: "junior", label: "כתב/ת" },
    { id: "mid", label: "כתב/ת בכיר/ה" },
    { id: "senior", label: "כתב/ת ראשי/ת בתחום" },
    { id: "head", label: "ראש/ת דסק" },
  ],
  editor: [
    { id: "junior", label: "עורך/ת תוכן" },
    { id: "mid", label: "עורך/ת בכיר/ה" },
    { id: "senior", label: "עורך/ת משנה" },
    { id: "head", label: "עורך/ת ראשי/ת" },
  ],
  producer: [
    { id: "junior", label: "מפיק/ה" },
    { id: "mid", label: "מפיק/ה בכיר/ה" },
    { id: "senior", label: "מפיק/ה ראשי/ת" },
    { id: "head", label: "ראש/ת ענף הפקה" },
  ],
  video_editor: [
    { id: "junior", label: "עורך/ת וידאו" },
    { id: "mid", label: "עורך/ת וידאו בכיר/ה" },
    { id: "senior", label: "עורך/ת וידאו ראשי/ת" },
    { id: "head", label: "ראש/ת מחלקת עריכה" },
  ],
  pr: [
    { id: "junior", label: "רכז/ת תקשורת" },
    { id: "mid", label: "דובר/ת" },
    { id: "senior", label: "דובר/ת ראשי/ת" },
    { id: "head", label: "ראש/ת תחום תקשורת" },
  ],
};

export const WORKPLACE_TYPES_BY_TRACK: Record<
  TrackId,
  { id: string; label: string }[]
> = {
  journalist: [
    { id: "major_outlet", label: "גוף תקשורת ארצי (טלוויזיה, רדיו, עיתון)" },
    { id: "digital_native", label: "אתר חדשות / מדיה דיגיטלית" },
    { id: "freelance", label: "פרילנס" },
  ],
  editor: [
    { id: "major_outlet", label: "גוף תקשורת ארצי (טלוויזיה, רדיו, עיתון)" },
    { id: "digital_native", label: "אתר חדשות / מדיה דיגיטלית" },
    { id: "freelance", label: "פרילנס" },
  ],
  producer: [
    { id: "major_outlet", label: "גוף תקשורת ארצי / חברת הפקה גדולה" },
    { id: "digital_native", label: "הפקה דיגיטלית / עצמאית קטנה" },
    { id: "freelance", label: "פרילנס" },
  ],
  video_editor: [
    { id: "major_outlet", label: "גוף תקשורת ארצי / חברת הפקה גדולה" },
    { id: "digital_native", label: "סטודיו דיגיטלי / חברה קטנה" },
    { id: "freelance", label: "פרילנס" },
  ],
  pr: [
    { id: "in_house", label: "בתוך חברה או ארגון" },
    { id: "agency", label: "משרד יחסי ציבור" },
    { id: "freelance", label: "עצמאי/ת" },
  ],
};

export const EXPERIENCE_BUCKETS = [
  { id: "0-2", label: "עד שנתיים" },
  { id: "3-5", label: "3–5 שנים" },
  { id: "6-10", label: "6–10 שנים" },
  { id: "11+", label: "11+ שנים" },
] as const;

export type ExperienceBucket = (typeof EXPERIENCE_BUCKETS)[number]["id"];

export const AVAILABILITY_OPTIONS = [
  { id: "not_looking", label: "לא מחפש/ת, רק סקרנ/ית" },
  { id: "open", label: "פתוח/ה להצעה טובה" },
  { id: "actively_looking", label: "מחפש/ת באופן פעיל" },
  { id: "immediate", label: "זמין/ה מיידית" },
] as const;

export function trackLabel(trackId: string): string {
  return TRACKS.find((t) => t.id === trackId)?.label ?? trackId;
}

export function levelLabel(trackId: string, levelId: string): string {
  const levels = LEVELS_BY_TRACK[trackId as TrackId];
  return levels?.find((l) => l.id === levelId)?.label ?? levelId;
}

export function workplaceLabel(trackId: string, workplaceId: string): string {
  const options = WORKPLACE_TYPES_BY_TRACK[trackId as TrackId];
  return options?.find((w) => w.id === workplaceId)?.label ?? workplaceId;
}
