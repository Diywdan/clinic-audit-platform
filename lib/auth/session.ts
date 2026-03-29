import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth/options";

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  return session;
}

export async function requireDashboardAccess() {
  const session = await requireSession();
  if (!["ADMIN", "MANAGER"].includes(session.user.role)) redirect("/evaluations");
  return session;
}

export async function requireEvaluatorAccess() {
  const session = await requireSession();
  if (!["ADMIN", "EVALUATOR"].includes(session.user.role)) redirect("/dashboard");
  return session;
}
