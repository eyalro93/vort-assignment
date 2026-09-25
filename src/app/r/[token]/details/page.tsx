import { notFound } from "next/navigation";
import { getRespondentByToken } from "@/lib/respondents";
import { DetailsFlow } from "./DetailsFlow";

export default async function DetailsPage({
  params,
}: PageProps<"/r/[token]/details">) {
  const { token } = await params;
  const respondent = await getRespondentByToken(token);
  if (!respondent) notFound();

  return <DetailsFlow token={token} />;
}
