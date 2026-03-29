import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { clinicSchema } from "@/lib/validation/schemas";

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user.role === "ADMIN";
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }

  const { id } = await context.params;
  const json = await request.json();
  const parsed = clinicSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные клиники" }, { status: 400 });
  }

  const clinic = await prisma.clinic.update({
    where: { id },
    data: {
      name: parsed.data.name,
      address: parsed.data.address,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude
    }
  });

  return NextResponse.json(clinic);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }

  const { id } = await context.params;
  await prisma.clinic.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
