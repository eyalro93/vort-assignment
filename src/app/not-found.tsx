import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { PrimaryLinkButton } from "@/components/Button";

export default function NotFound() {
  return (
    <Container>
      <div className="flex flex-1 flex-col justify-between py-8">
        <Logo size={20} />
        <div className="flex flex-col gap-3">
          <h1 className="h1-display text-ink" style={{ fontSize: 26 }}>
            הדף לא נמצא
          </h1>
          <p className="body-text text-ink-muted">
            הקישור הזה לא תקין או שפג תוקפו.
          </p>
        </div>
        <PrimaryLinkButton href="/">חזרה לדף הבית</PrimaryLinkButton>
      </div>
    </Container>
  );
}
