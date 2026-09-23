"use server";

import { redirect } from "next/navigation";
import {
  createRespondent,
  deleteByCode,
  saveDetails,
} from "@/lib/respondents";
import {
  quizSchema,
  detailsSchema,
  MAX_CV_BYTES,
  ACCEPTED_CV_TYPES,
} from "@/lib/validation";
import { normalizeDeleteCode } from "@/lib/id";

export async function submitQuiz(
  answers: {
    track: string;
    level: string;
    workplaceType: string;
    yearsExperience: string;
    managesTeam: boolean;
  },
  referredByToken: string | null
) {
  const parsed = quizSchema.safeParse(answers);
  if (!parsed.success) {
    throw new Error("תשובות לא תקינות, נסו שוב");
  }

  const token = await createRespondent(parsed.data, referredByToken);
  redirect(`/r/${token}/range`);
}

export type SubmitDetailsState = { error: string | null };

export async function submitDetails(
  token: string,
  formData: FormData
): Promise<SubmitDetailsState> {
  const parsed = detailsSchema.safeParse({
    reportedSalary: formData.get("reportedSalary"),
    availability: formData.get("availability"),
    excludeEmployers: formData.get("excludeEmployers") ?? "",
    consentGiven: formData.get("consentGiven") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "אנא בדקו את הטופס" };
  }

  const file = formData.get("cv");
  let cv: { filename: string; mimetype: string; data: Buffer } | null = null;

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_CV_BYTES) {
      return { error: "קובץ קורות החיים גדול מדי (מקסימום 4MB)" };
    }
    if (!ACCEPTED_CV_TYPES.has(file.type)) {
      return { error: "יש להעלות קובץ PDF או Word בלבד" };
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    cv = { filename: file.name, mimetype: file.type, data: buffer };
  } else {
    return { error: "יש לצרף קובץ קורות חיים" };
  }

  const excludeEmployers = parsed.data.excludeEmployers
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10);

  await saveDetails({
    token,
    reportedSalary: parsed.data.reportedSalary,
    availability: parsed.data.availability,
    excludeEmployers,
    cv,
  });

  redirect(`/r/${token}/result`);
}

export type DeleteState = { status: "idle" | "success" | "not_found" };

export async function deleteByCodeAction(
  _prevState: DeleteState,
  formData: FormData
): Promise<DeleteState> {
  const code = normalizeDeleteCode(String(formData.get("code") ?? ""));
  const found = await deleteByCode(code);
  return { status: found ? "success" : "not_found" };
}
