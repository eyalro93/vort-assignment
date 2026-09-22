import { estimatedSalary, formatILS, WORKPLACE_MULTIPLIER, type Cohort } from "./salary";
import { LEVELS_BY_TRACK, WORKPLACE_TYPES_BY_TRACK, type TrackId } from "./tracks";

// Short, title-friendly names -- the quiz's own workplace labels are
// descriptive (with parentheticals) for clarity during the quiz, which
// reads awkwardly as a suggestion-row heading.
const SHORT_WORKPLACE_LABEL: Record<string, string> = {
  major_outlet: "גוף תקשורת ארצי",
  digital_native: "מדיה דיגיטלית",
  freelance: "פרילנס",
  in_house: "עבודה בתוך חברה",
  agency: "משרד סוכנות",
};

export type GrowthSuggestion = {
  title: string;
  body: string;
  deltaAmount: number;
  deltaLabel: string;
};

/**
 * What would move this person's estimated salary up, computed by flipping
 * one variable at a time against the same base-rate/multiplier model that
 * generates the seed data (src/lib/salary.ts) -- no new data collection,
 * no live model call, just the existing formula run twice per suggestion.
 */
export function getGrowthSuggestions(respondent: {
  track: string;
  level: string;
  workplace_type: string;
  years_experience: string;
  manages_team: boolean;
}): GrowthSuggestion[] {
  const base: Cohort = {
    track: respondent.track,
    level: respondent.level,
    workplaceType: respondent.workplace_type,
    yearsExperience: respondent.years_experience,
    managesTeam: respondent.manages_team,
  };
  const current = estimatedSalary(base);
  const suggestions: GrowthSuggestion[] = [];

  const addIfPositive = (
    title: string,
    body: string,
    alt: Cohort
  ): void => {
    const delta = estimatedSalary(alt) - current;
    if (delta > 500) {
      suggestions.push({
        title,
        body,
        deltaAmount: delta,
        deltaLabel: `+${formatILS(delta)}`,
      });
    }
  };

  if (!base.managesTeam) {
    addIfPositive(
      "ניהול צוות",
      "אנשי תקשורת שמנהלים צוות בתפקיד שלך",
      { ...base, managesTeam: true }
    );
  }

  const workplaceOptions = WORKPLACE_TYPES_BY_TRACK[base.track as TrackId];
  const bestWorkplace = workplaceOptions.reduce((best, opt) =>
    (WORKPLACE_MULTIPLIER[opt.id] ?? 1) > (WORKPLACE_MULTIPLIER[best.id] ?? 1)
      ? opt
      : best
  );
  if (bestWorkplace.id !== base.workplaceType) {
    addIfPositive(
      `מעבר ל${SHORT_WORKPLACE_LABEL[bestWorkplace.id] ?? bestWorkplace.label}`,
      "השכר הממוצע במקומות עבודה מהסוג הזה",
      { ...base, workplaceType: bestWorkplace.id }
    );
  }

  const levels = LEVELS_BY_TRACK[base.track as TrackId];
  const levelIndex = levels.findIndex((l) => l.id === base.level);
  if (levelIndex >= 0 && levelIndex < levels.length - 1) {
    const nextLevel = levels[levelIndex + 1];
    addIfPositive(
      `קידום ל${nextLevel.label}`,
      "השכר הממוצע בתפקיד הבא בסולם הקריירה שלך",
      { ...base, level: nextLevel.id }
    );
  }

  return suggestions.sort((a, b) => b.deltaAmount - a.deltaAmount);
}
