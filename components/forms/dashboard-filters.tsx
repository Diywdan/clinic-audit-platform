"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function DashboardFilters({ clinics }: { clinics: { id: string; name: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    const params = new URLSearchParams(searchParams.toString());
    const clinicId = String(formData.get("clinicId") ?? "");
    const from = String(formData.get("from") ?? "");
    const to = String(formData.get("to") ?? "");

    clinicId ? params.set("clinicId", clinicId) : params.delete("clinicId");
    from ? params.set("from", from) : params.delete("from");
    to ? params.set("to", to) : params.delete("to");

    startTransition(() => {
      router.push(`/dashboard?${params.toString()}`);
    });
  }

  return (
    <form action={handleSubmit} className="evaluation-toolbar">
      <label className="field">
        <span>Клиника</span>
        <Select name="clinicId" defaultValue={searchParams.get("clinicId") ?? ""}>
          <option value="">Все клиники</option>
          {clinics.map((clinic) => (
            <option key={clinic.id} value={clinic.id}>
              {clinic.name}
            </option>
          ))}
        </Select>
      </label>
      <label className="field">
        <span>С</span>
        <Input type="date" name="from" defaultValue={searchParams.get("from") ?? ""} />
      </label>
      <label className="field">
        <span>По</span>
        <Input type="date" name="to" defaultValue={searchParams.get("to") ?? ""} />
      </label>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Применение..." : "Применить"}
      </Button>
    </form>
  );
}
