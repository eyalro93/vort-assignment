"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { ChoiceOption, ChoiceList } from "@/components/ChoiceOption";
import { PrimaryButton } from "@/components/Button";
import { AVAILABILITY_OPTIONS } from "@/lib/tracks";
import { submitDetails } from "@/app/actions";

type Step = "details" | "consent";

export function DetailsFlow({ token }: { token: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [salary, setSalary] = useState("");
  const [availability, setAvailability] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [excludeEmployers, setExcludeEmployers] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const detailsValid = salary.trim() !== "" && availability !== null && file !== null;

  function handleContinueToConsent() {
    if (!detailsValid) {
      setError("יש למלא שכר, זמינות ולצרף קורות חיים");
      return;
    }
    setError(null);
    setStep("consent");
  }

  function handleSubmit() {
    if (!consentChecked) {
      setError("יש לאשר את תנאי השימוש כדי להמשיך");
      return;
    }
    setError(null);

    const formData = new FormData();
    formData.set("reportedSalary", salary);
    formData.set("availability", availability ?? "");
    formData.set("excludeEmployers", excludeEmployers);
    formData.set("consentGiven", "on");
    if (file) formData.set("cv", file);

    startTransition(async () => {
      const result = await submitDetails(token, formData);
      if (result.error) {
        setError(result.error);
      } else {
        router.push(`/r/${token}/result`);
      }
    });
  }

  if (step === "consent") {
    return (
      <Container>
        <div className="flex flex-1 flex-col gap-8 py-8">
          <Logo size={20} />

          <div className="flex flex-col gap-2">
            <p className="section-heading text-ink-muted">לפני שממשיכים</p>
            <h1 className="h1-display text-ink" style={{ fontSize: 22 }}>
              מה קורה לקורות החיים שלך
            </h1>
          </div>

          <div className="flex flex-col gap-5">
            <ConsentPoint
              title="מי רואה את זה"
              body="מגייסות שמחפשות אנשי תקשורת ומדיה דרך Vort, ורק אם הפרופיל שלך תואם למה שהן מחפשות. קורות החיים לא מתפרסמים באתר ולא נגישים לחיפוש כללי."
            />
            <ConsentPoint
              title="מקום העבודה הנוכחי שלך"
              body="קורות החיים שלך לעולם לא מוצגים למקום העבודה שבו ציינת שאתה נמצא היום, ואם ציינת מקומות נוספים להסתרה - גם הם חסומים."
            />
            <ConsentPoint
              title="מה זה אומר שמגייסת פונה אליך"
              body="מגייסת שמצאה אותך רשאית ליצור איתך קשר ישירות. אין בכך התחייבות מצדך, ואתה יכול להתעלם או לסרב בכל שלב."
            />
            <ConsentPoint
              title="איך מוחקים הכל"
              body="בסיום התהליך תקבל קוד מחיקה אישי. הזנה שלו במסך המחיקה מוחקת לצמיתות את קורות החיים, השכר והפרטים שלך מהמאגר - מיידית, בלי לפנות אלינו."
            />
          </div>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-1 size-4 accent-coral"
            />
            <span className="body-text text-ink-body">
              קראתי ואני מאשר/ת שקורות החיים והפרטים שלי יועברו למאגר של Vort
              ויוצגו למגייסות רלוונטיות, בכפוף למגבלות שסימנתי למעלה.
            </span>
          </label>

          {error && <p className="body-text text-coral">{error}</p>}

          <div className="mt-auto flex flex-col gap-3">
            <PrimaryButton onClick={handleSubmit} disabled={isPending}>
              {isPending ? "שולח..." : "מאשר/ת ורוצה לראות תוצאה"}
            </PrimaryButton>
            <button
              type="button"
              onClick={() => setStep("details")}
              className="body-text text-center text-ink-muted"
            >
              חזרה
            </button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="flex flex-1 flex-col gap-8 py-8">
        <Logo size={20} />

        <div className="flex flex-col gap-2">
          <p className="section-heading text-ink-muted">שלב אחרון</p>
          <h1 className="h1-display text-ink" style={{ fontSize: 22 }}>
            כמה זמן זה ייקח? שלוש דקות.
          </h1>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="salary" className="field-label text-ink-muted">
            שכר נוכחי או ציפיית שכר (ברוטו לחודש)
          </label>
          <input
            id="salary"
            type="number"
            inputMode="numeric"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="לדוגמה: 14000"
            className="field-value rounded-lg border border-divider px-4 py-3 text-ink outline-none focus:border-coral"
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="field-label text-ink-muted">זמינות</p>
          <ChoiceList>
            {AVAILABILITY_OPTIONS.map((opt) => (
              <ChoiceOption
                key={opt.id}
                label={opt.label}
                selected={availability === opt.id}
                onClick={() => setAvailability(opt.id)}
              />
            ))}
          </ChoiceList>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="cv" className="field-label text-ink-muted">
            קורות חיים (PDF או Word)
          </label>
          <input
            id="cv"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="field-value rounded-lg border border-divider px-4 py-3 text-ink outline-none file:me-3 file:rounded-md file:border-0 file:bg-divider-light file:px-3 file:py-1.5 file:text-ink-body"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="exclude" className="field-label text-ink-muted">
            יש מקום עבודה שלא יראה את הפרופיל שלך? (רשות)
          </label>
          <input
            id="exclude"
            type="text"
            value={excludeEmployers}
            onChange={(e) => setExcludeEmployers(e.target.value)}
            placeholder="שמות חברות, מופרדים בפסיקים"
            className="field-value rounded-lg border border-divider px-4 py-3 text-ink outline-none focus:border-coral"
          />
        </div>

        {error && <p className="body-text text-coral">{error}</p>}

        <div className="mt-auto">
          <PrimaryButton onClick={handleContinueToConsent}>
            המשך
          </PrimaryButton>
        </div>
      </div>
    </Container>
  );
}

function ConsentPoint({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col gap-2 border-t border-divider pt-4">
      <p className="field-value text-ink">{title}</p>
      <p className="body-text text-ink-muted">{body}</p>
    </div>
  );
}
