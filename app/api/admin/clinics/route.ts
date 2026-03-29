import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { clinicSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }

  const json = await request.json();
  const parsed = clinicSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные клиники" }, { status: 400 });
  }

  const clinic = await prisma.clinic.create({
    data: {
      name: parsed.data.name,
      address: parsed.data.address,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude
    }
  });
  return NextResponse.json(clinic);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }

  const clinics = await prisma.clinic.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(clinics);
}
