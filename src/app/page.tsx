import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { PrimaryLinkButton } from "@/components/Button";
import { query } from "@/lib/db";

async function getTotalCheckedCount(): Promise<number | null> {
  try {
    const rows = await query<{ count: string }>(
      `select count(*)::text as count from respondents`
    );
    return rows[0] ? Number(rows[0].count) : null;
  } catch {
    return null; // DB not reachable -- degrade gracefully, don't crash the page
  }
}

export default async function LandingPage({
  searchParams,
}: PageProps<"/">) {
  const params = await searchParams;
  const ref = typeof params.ref === "string" ? params.ref : null;
  const checkHref = ref ? `/check?ref=${encodeURIComponent(ref)}` : "/check";

  const total = await getTotalCheckedCount();

  return (
    <Container>
      <div className="flex flex-1 flex-col justify-between py-8">
        <Logo />

        <div className="flex flex-col gap-6">
          <h1 className="h1-display text-ink">כמה אתם שווים?</h1>
          <p className="h2-sub text-ink-body">
            בנצ׳מרק שכר לאנשי תקשורת ומדיה בישראל. חמש שאלות קצרות, וטווח
            שכר מיידי למול אנשים כמוכם בתעשייה.
          </p>
          {total !== null && total > 0 && (
            <p className="body-text text-ink-muted">
              {total.toLocaleString("he-IL")} אנשי תקשורת כבר בדקו איפה הם
              עומדים.
            </p>
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
