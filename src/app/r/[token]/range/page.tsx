import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { PrimaryLinkButton } from "@/components/Button";
import { RangeMeter } from "@/components/Meter";
import { getRespondentByToken, getCohortRange } from "@/lib/respondents";
import { trackLabel, levelLabel } from "@/lib/tracks";
import { formatILS } from "@/lib/salary";

export default async function RangeResultPage({
  params,
}: PageProps<"/r/[token]/range">) {
  const { token } = await params;
  const respondent = await getRespondentByToken(token);
  if (!respondent) notFound();

  const range = await getCohortRange(respondent.track, respondent.level);

  return (
    <Container>
      <div className="flex flex-1 flex-col gap-10 py-8">
        <Logo size={20} />

        <div className="flex flex-col gap-2">
          <p className="section-heading text-ink-muted">הטווח שלכם</p>
          <h1 className="h1-display text-ink" style={{ fontSize: 22 }}>
            {levelLabel(respondent.track, respondent.level)} ·{" "}
            {trackLabel(respondent.track)}
          </h1>
        </div>

        {range ? (
          <div className="flex flex-col gap-6">
            <p className="h1-display text-ink tabular-nums">
              {formatILS(range.p15)} – {formatILS(range.p85)}
            </p>
            <RangeMeter
              minLabel={formatILS(range.p15)}
              maxLabel={formatILS(range.p85)}
            />
            <p className="body-text text-ink-muted">
              מבוסס על {range.sampleSize.toLocaleString("he-IL")} אנשי
              תקשורת בתפקיד דומה לשלכם. החציון בקבוצה הזו הוא{" "}
              {formatILS(range.p50)}.
            </p>
          </div>
        ) : (
          <p className="body-text text-ink-muted">
            עדיין אין מספיק נתונים בקטגוריה הזו, אבל אתם עשויים להיות
            הראשונים שמשפיעים עליה.
          </p>
        )}

        <div className="mt-auto flex flex-col gap-3">
          <PrimaryLinkButton href={`/r/${token}/details`}>
            רוצים לדעת בדיוק איפה אתם עומדים?
          </PrimaryLinkButton>
          <p className="body-text text-center text-ink-muted">
            תעלו קורות חיים, תקבלו את האחוזון המדויק שלכם בקבוצה, ותראו מה
            יכול להעלות את השווי שלכם
          </p>
        </div>
      </div>
    </Container>
  );
}
