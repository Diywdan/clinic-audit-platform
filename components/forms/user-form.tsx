"use client";

import { FormEvent, useState, useTransition } from "react";

export function UserForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          name: formData.get("name"),
          password: formData.get("password"),
          role: formData.get("role")
        })
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Failed to create user.");
        return;
      }

      event.currentTarget.reset();
      setMessage("User created.");
      window.location.reload();
    });
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="user-email">Email</label>
        <input id="user-email" name="email" type="email" required />
      </div>
      <div className="field">
        <label htmlFor="user-name">Name</label>
        <input id="user-name" name="name" />
      </div>
      <div className="field">
        <label htmlFor="user-password">Password</label>
        <input id="user-password" name="password" type="password" required minLength={8} />
      </div>
      <div className="field">
        <label htmlFor="user-role">Role</label>
        <select id="user-role" name="role" defaultValue="EVALUATOR">
          <option value="EVALUATOR">Evaluator</option>
          <option value="MANAGER">Manager</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      {message ? <div className="notice">{message}</div> : null}
      {error ? <div className="notice error-box">{error}</div> : null}
      <button className="btn btn-primary" disabled={isPending} type="submit">
        {isPending ? "Saving..." : "Add user"}
      </button>
    </form>
  );
}
