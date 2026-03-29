import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }

  const evaluations = await prisma.evaluation.findMany({
    include: { clinic: true, user: true, photos: true },
    orderBy: { createdAt: "desc" }
  });

  const header = [
    "evaluation_id",
    "created_at",
    "clinic",
    "evaluator",
    "score_percent",
    "critical_count",
    "photo_count"
  ];

  const rows = evaluations.map((evaluation) =>
    [
      evaluation.id,
      evaluation.createdAt.toISOString(),
      evaluation.clinic.name,
      evaluation.user.email,
      evaluation.totalPercentage,
      evaluation.criticalCount,
      evaluation.photos.length
    ].join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"clinic-evaluations.csv\""
    }
  });
}
