import { QuizFlow } from "./QuizFlow";

export default async function CheckPage({ searchParams }: PageProps<"/check">) {
  const params = await searchParams;
  const ref = typeof params.ref === "string" ? params.ref : null;
  return <QuizFlow referredByToken={ref} />;
}
