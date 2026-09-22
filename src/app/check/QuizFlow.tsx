"use client";

import { useMemo, useState, useTransition } from "react";
import { Container } from "@/components/Container";
import { ProgressBar } from "@/components/ProgressBar";
import { ChoiceOption, ChoiceList } from "@/components/ChoiceOption";
import {
  TRACKS,
  LEVELS_BY_TRACK,
  WORKPLACE_TYPES_BY_TRACK,
  EXPERIENCE_BUCKETS,
  type TrackId,
} from "@/lib/tracks";
import { submitQuiz } from "@/app/actions";

type Answers = {
  track: string | null;
  level: string | null;
  workplaceType: string | null;
  yearsExperience: string | null;
  managesTeam: boolean | null;
};

const EMPTY_ANSWERS: Answers = {
  track: null,
  level: null,
  workplaceType: null,
  yearsExperience: null,
  managesTeam: null,
};

export function QuizFlow({ referredByToken }: { referredByToken: string | null }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const levels = useMemo(
    () => (answers.track ? LEVELS_BY_TRACK[answers.track as TrackId] : []),
    [answers.track]
  );
  const workplaces = useMemo(
    () =>
      answers.track ? WORKPLACE_TYPES_BY_TRACK[answers.track as TrackId] : [],
    [answers.track]
  );

  const steps = [
    {
      question: "באיזה תחום אתה עובד?",
      options: TRACKS.map((t) => ({ id: t.id, label: t.label })),
      value: answers.track,
      onSelect: (id: string) =>
        setAnswers({ ...EMPTY_ANSWERS, track: id }), // changing track resets dependent answers
    },
    {
      question: "באיזו רמה אתה נמצא?",
      options: levels,
      value: answers.level,
      onSelect: (id: string) => setAnswers((a) => ({ ...a, level: id })),
    },
    {
      question: "איפה אתה עובד?",
      options: workplaces,
      value: answers.workplaceType,
      onSelect: (id: string) =>
        setAnswers((a) => ({ ...a, workplaceType: id })),
    },
    {
      question: "כמה שנות ניסיון יש לך?",
      options: EXPERIENCE_BUCKETS,
      value: answers.yearsExperience,
      onSelect: (id: string) =>
        setAnswers((a) => ({ ...a, yearsExperience: id })),
    },
    {
      question: "האם אתה מנהל/ת צוות?",
      options: [
        { id: "yes", label: "כן" },
        { id: "no", label: "לא" },
      ],
      value: answers.managesTeam === null ? null : answers.managesTeam ? "yes" : "no",
      onSelect: (id: string) => {
        const managesTeam = id === "yes";
        const finalAnswers = { ...answers, managesTeam };
        setAnswers(finalAnswers);
        submitFinal(finalAnswers);
      },
    },
  ];

  function submitFinal(finalAnswers: Answers) {
    if (
      !finalAnswers.track ||
      !finalAnswers.level ||
      !finalAnswers.workplaceType ||
      !finalAnswers.yearsExperience ||
      finalAnswers.managesTeam === null
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await submitQuiz(
          {
            track: finalAnswers.track!,
            level: finalAnswers.level!,
            workplaceType: finalAnswers.workplaceType!,
            yearsExperience: finalAnswers.yearsExperience!,
            managesTeam: finalAnswers.managesTeam!,
          },
          referredByToken
        );
      } catch (err) {
        // redirect() throws NEXT_REDIRECT internally -- rethrow it so
        // Next.js can still perform the navigation, only swallow real errors.
        if (
          err &&
          typeof err === "object" &&
          "digest" in err &&
          typeof (err as { digest?: unknown }).digest === "string" &&
          (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
        ) {
          throw err;
        }
        setError("משהו השתבש, נסו שוב");
      }
    });
  }

  function handleSelect(id: string, onSelect: (id: string) => void) {
    onSelect(id);
    if (step < steps.length - 1) {
      setTimeout(() => setStep((s) => s + 1), 150);
    }
  }

  const current = steps[step];

  return (
    <Container>
      <div className="flex flex-1 flex-col gap-8 py-8">
        <div className="flex items-center gap-4">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="body-text text-ink-muted"
              aria-label="חזרה"
            >
              חזרה
            </button>
          )}
          <div className="flex-1">
            <ProgressBar step={step + 1} total={steps.length} />
          </div>
        </div>

        <h1 className="h1-display text-ink" style={{ fontSize: 26 }}>
          {current.question}
        </h1>

        <ChoiceList>
          {current.options.map((opt) => (
            <ChoiceOption
              key={opt.id}
              label={opt.label}
              selected={current.value === opt.id}
              onClick={() => handleSelect(opt.id, current.onSelect)}
            />
          ))}
        </ChoiceList>

        {error && <p className="body-text text-coral">{error}</p>}
        {isPending && (
          <p className="body-text text-ink-muted">רק רגע, מחשבים טווח...</p>
        )}
      </div>
    </Container>
  );
}
