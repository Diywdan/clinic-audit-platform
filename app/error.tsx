"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="login-screen">
      <div className="card stack-md" style={{ maxWidth: 460 }}>
        <h2>Что-то пошло не так</h2>
        <p>{error.message}</p>
        <Button type="button" onClick={reset}>
          Повторить
        </Button>
      </div>
    </div>
  );
}
