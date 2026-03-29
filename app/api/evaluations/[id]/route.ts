import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const { id } = await context.params;

  const evaluation = await prisma.evaluation.findFirst({
    where: {
      id,
      ...(session.user.role === "ADMIN" || session.user.role === "MANAGER" ? {} : { userId: session.user.id })
    },
    include: {
      clinic: true,
      user: { select: { email: true, name: true } },
      answers: { include: { criterion: true } },
      photos: true
    }
  });

  if (!evaluation) {
    return NextResponse.json({ error: "Проверка не найдена" }, { status: 404 });
  }

  return NextResponse.json(evaluation);
}
