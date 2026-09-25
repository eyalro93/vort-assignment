"use client";

import { useActionState } from "react";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { PrimaryButton } from "@/components/Button";
import { deleteByCodeAction, type DeleteState } from "@/app/actions";

const initialState: DeleteState = { status: "idle" };

export function DeleteForm() {
  const [state, formAction, isPending] = useActionState(
    deleteByCodeAction,
    initialState
  );

  return (
    <Container>
      <div className="flex flex-1 flex-col gap-8 py-8">
        <Logo size={20} />

        <div className="flex flex-col gap-2">
          <h1 className="h1-display text-ink" style={{ fontSize: 26 }}>
            מחיקת הנתונים שלכם
          </h1>
          <p className="body-text text-ink-muted">
            הזינו את קוד המחיקה שקיבלתם בסוף התהליך. המחיקה מיידית,
            ובלתי הפיכה: קורות החיים, השכר והפרטים שלכם יימחקו לצמיתות
            מהמאגר.
          </p>
        </div>

        {state.status === "success" ? (
          <p className="field-value text-ink">
            הנתונים נמחקו. אין לנו יותר שום דבר עליכם.
          </p>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <input
              name="code"
              type="text"
              placeholder="XXXX-XXXX"
              required
              className="field-value rounded-lg border border-divider px-4 py-3 text-center text-ink outline-none focus:border-coral"
            />
            {state.status === "not_found" && (
              <p className="body-text text-coral">
                לא נמצא קוד כזה. בדקו שהעתקתם אותו נכון.
              </p>
            )}
            <PrimaryButton type="submit" disabled={isPending}>
              {isPending ? "מוחק..." : "מחק את הנתונים שלי"}
            </PrimaryButton>
          </form>
        )}
      </div>
    </Container>
  );
}
