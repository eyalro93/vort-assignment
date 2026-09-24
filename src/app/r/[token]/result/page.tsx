import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { PercentileMeter } from "@/components/Meter";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import {
  getRespondentByToken,
  computePercentile,
  getCohortRange,
} from "@/lib/respondents";
import { trackLabel, levelLabel } from "@/lib/tracks";
import { displayPercentile, formatILS } from "@/lib/salary";
import { getGrowthSuggestions } from "@/lib/growth-suggestions";

async function getOrigin() {
  const h = await headers();
  const host = h.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export default async function ResultPage({
  params,
}: PageProps<"/r/[token]/result">) {
  const { token } = await params;
  const respondent = await getRespondentByToken(token);
  if (!respondent) notFound();
  if (respondent.reported_salary === null) redirect(`/r/${token}/details`);

  const [rawPercentile, range, origin] = await Promise.all([
    computePercentile(respondent, respondent.reported_salary),
    getCohortRange(respondent),
    getOrigin(),
  ]);
  const percentile = displayPercentile(rawPercentile);
  const topPercent = 100 - percentile;
  const growthSuggestions = getGrowthSuggestions(respondent);

  let referrerComparison: { topPercent: number; diff: number } | null = null;
  if (respondent.referred_by_token) {
    const referrer = await getRespondentByToken(respondent.referred_by_token);
    if (referrer && referrer.reported_salary !== null) {
      const referrerPercentile = displayPercentile(
        await computePercentile(referrer, referrer.reported_salary)
      );
      referrerComparison = {
        topPercent: 100 - referrerPercentile,
        diff: percentile - referrerPercentile,
      };
    }
  }

  const shareLink = `${origin}/from/${token}`;
  // Leading RLM (U+200F): the message opens with "Vort", and WhatsApp picks
  // text direction from the first strong character -- without it the whole
  // Hebrew message renders left-to-right.
  const shareMessage = `‏Vort מיקם אותי בטופ ${topPercent}% מ${trackLabel(respondent.track)} ברמה שלי. איפה אתם?`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${shareMessage} ${shareLink}`)}`;

  return (
    <Container>
      <div className="flex flex-1 flex-col gap-10 py-8">
        <Logo size={20} />

        <div className="flex flex-col gap-2">
          <p className="section-heading text-ink-muted">
            {levelLabel(respondent.track, respondent.level)} ·{" "}
            {trackLabel(respondent.track)}
          </p>
          <p className="h1-display text-ink tabular-nums">
            בטופ {topPercent}%
          </p>
          <p className="body-text text-ink-muted">
            אתם מרוויחים יותר מ-{percentile}% מ
            {trackLabel(respondent.track)} בדרגתכם שכבר בדקו, בהתאמה לפרופיל
            המקצועי שלכם.
          </p>
        </div>

        <PercentileMeter percent={percentile} />

        {range && (
          <p className="body-text text-ink-muted">
            השכר שדיווחתם: <span className="field-value text-ink">{formatILS(respondent.reported_salary)}</span>.
            הטווח לפרופיל שלכם: {formatILS(range.p15)} – {formatILS(range.p85)}.
          </p>
        )}

        <div className="flex flex-col gap-4">
          <p className="section-heading text-ink-muted">
            מה יכול להעלות את השווי שלכם
          </p>
          {growthSuggestions.length > 0 ? (
            growthSuggestions.slice(0, 3).map((s) => (
              <div
                key={s.title}
                className="flex flex-col gap-1 border-t border-divider pt-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="field-value text-ink">{s.title}</p>
                  <p className="field-value shrink-0 text-ink tabular-nums">
                    {s.deltaLabel}
                  </p>
                </div>
                <p className="body-text text-ink-muted">{s.body}</p>
              </div>
            ))
          ) : (
            <p className="body-text border-t border-divider pt-4 text-ink-muted">
              אתם כבר בפרופיל המשתלם ביותר בקטגוריה שלכם.
            </p>
          )}
        </div>

        {referrerComparison && (
          <div className="flex flex-col gap-2 border-t border-divider pt-4">
            <p className="field-value text-ink">מול מי ששלח לכם את זה</p>
            <p className="body-text text-ink-muted">
              {referrerComparison.diff === 0
                ? "אתם בדיוק באותו מקום יחסית לתחום של כל אחד מכם."
                : referrerComparison.diff > 0
                  ? `אתם גבוהים ב-${referrerComparison.diff} נקודות אחוזון ממי ששלח לכם את זה.`
                  : `מי ששלח לכם את זה גבוה מכם ב-${Math.abs(referrerComparison.diff)} נקודות אחוזון.`}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <p className="section-heading text-ink-muted">שתפו את התוצאה</p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-13 w-full items-center justify-center rounded-lg bg-coral px-5 text-[15px] font-semibold text-white"
            style={{ height: 52 }}
          >
            שיתוף בוואטסאפ
          </a>
          <CopyLinkButton link={shareLink} />
        </div>

        <div className="flex flex-col gap-2 border-t border-divider pt-4">
          <p className="section-heading text-ink-muted">הפרטיות שלכם</p>
          {respondent.delete_code && (
            <p className="body-text text-ink-muted">
              קוד המחיקה שלכם:{" "}
              <span className="field-value text-ink tabular-nums">
                {respondent.delete_code}
              </span>
              . שמרו אותו -- זה הדרך היחידה למחוק את הנתונים שלכם.{" "}
              <a href="/delete" className="text-coral">
                מחיקה
              </a>
            </p>
          )}
        </div>
      </div>
    </Container>
  );
}
