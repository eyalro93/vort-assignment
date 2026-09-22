import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { PrimaryLinkButton } from "@/components/Button";
import { getReferralCard } from "@/lib/respondents";
import { trackLabel, levelLabel } from "@/lib/tracks";

export async function generateMetadata({
  params,
}: PageProps<"/from/[token]">): Promise<Metadata> {
  const { token } = await params;
  const card = await getReferralCard(token);

  const title = card
    ? `מישהו בטופ ${card.topPercent}% מ${trackLabel(card.track)} שלח לכם את זה`
    : "Vort — כמה אתם שווים";
  const description =
    "בנצ׳מרק שכר לאנשי תקשורת ומדיה בישראל. חמש שאלות, וטווח שכר מיידי.";

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function ReferralLandingPage({
  params,
}: PageProps<"/from/[token]">) {
  const { token } = await params;
  const card = await getReferralCard(token);
  const checkHref = `/check?ref=${encodeURIComponent(token)}`;

  return (
    <Container>
      <div className="flex flex-1 flex-col justify-between py-8">
        <Logo />

        <div className="flex flex-col gap-6">
          {card ? (
            <>
              <p className="section-heading text-ink-muted">
                {levelLabel(card.track, card.level)} · {trackLabel(card.track)}
              </p>
              <h1 className="h1-display text-ink">
                מישהו שאתם מכירים בטופ {card.topPercent}% בתחום
              </h1>
              <p className="h2-sub text-ink-body">
                תבדקו איפה אתם עומדים מולם. חמש שאלות קצרות, וטווח שכר מיידי.
              </p>
            </>
          ) : (
            <>
              <h1 className="h1-display text-ink">כמה אתם שווים?</h1>
              <p className="h2-sub text-ink-body">
                בנצ׳מרק שכר לאנשי תקשורת ומדיה בישראל. חמש שאלות קצרות, וטווח
                שכר מיידי.
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <PrimaryLinkButton href={checkHref}>
            בדקו את השווי שלכם
          </PrimaryLinkButton>
          <p className="body-text text-center text-ink-muted">
            שלוש דקות. בלי הרשמה. בלי קורות חיים בשלב הזה.
          </p>
        </div>
      </div>
    </Container>
  );
}
