"use client";

import { FormEvent, useState, useTransition } from "react";

export function ClinicForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const response = await fetch("/api/admin/clinics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          address: formData.get("address"),
          latitude: formData.get("latitude") || null,
          longitude: formData.get("longitude") || null
        })
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Failed to create clinic.");
        return;
      }

      event.currentTarget.reset();
      setMessage("Clinic created.");
      window.location.reload();
    });
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="clinic-name">Clinic name</label>
        <input id="clinic-name" name="name" required />
      </div>
      <div className="field">
        <label htmlFor="clinic-address">Address</label>
        <input id="clinic-address" name="address" required />
      </div>
      <div className="grid grid-2">
        <div className="field">
          <label htmlFor="clinic-latitude">Latitude</label>
          <input id="clinic-latitude" name="latitude" type="number" step="0.000001" />
        </div>
        <div className="field">
          <label htmlFor="clinic-longitude">Longitude</label>
          <input id="clinic-longitude" name="longitude" type="number" step="0.000001" />
        </div>
      </div>
      {message ? <div className="notice">{message}</div> : null}
      {error ? <div className="notice error-box">{error}</div> : null}
      <button className="btn btn-primary" disabled={isPending} type="submit">
        {isPending ? "Saving..." : "Add clinic"}
      </button>
    </form>
  );
}
