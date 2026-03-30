"use client";

import { useSearchParams } from "next/navigation";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

function buildExportUrl(
  searchParams: URLSearchParams,
  format: "csv" | "excel"
) {
  const params = new URLSearchParams(searchParams.toString());
  params.set("format", format);
  return `/api/dashboard/export?${params.toString()}`;
}

export function DashboardExportActions() {
  const searchParams = useSearchParams();

  return (
    <div className="manager-export-actions">
      <a href={buildExportUrl(searchParams, "excel")}>
        <Button type="button">
          <Download size={16} />
          Excel
        </Button>
      </a>

      <a href={buildExportUrl(searchParams, "csv")}>
        <Button type="button" variant="secondary">
          <Download size={16} />
          CSV
        </Button>
      </a>
    </div>
  );
}