"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AtSign, Fingerprint, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/evaluations";
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
        callbackUrl
      });

      if (!result?.ok) {
        setError("Неверные учетные данные");
        return;
      }

      router.push(result.url ?? callbackUrl);
      router.refresh();
    });
  }

  return (
    <div className="login-panel">
      <Card className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <Fingerprint size={28} />
          </div>
          <h1>Жалоба как подарок</h1>
          <p>Введите ваши данные для доступа к платформе</p>
        </div>
        <form action={handleSubmit} className="stack-md">
          <label className="field">
            <span>Email</span>
            <div className="input-with-icon">
              <AtSign size={16} />
              <Input type="email" name="email" placeholder="example@clinic.ru" required />
            </div>
          </label>
          <label className="field">
            <span>Пароль</span>
            <div className="input-with-icon">
              <LockKeyhole size={16} />
              <Input type="password" name="password" placeholder="••••••••" required />
            </div>
          </label>
          <div className="login-meta">
            <label className="checkbox-row">
              <input type="checkbox" />
              <span>Запомнить меня</span>
            </label>
            <a href="#" className="forgot-link">
              Забыли пароль?
            </a>
          </div>
          {error ? <p className="error-text">{error}</p> : null}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Вход..." : "Войти"}
          </Button>
        </form>
        <div className="login-footer">
          <p>Авторизация через защищенный шлюз Гостех</p>
          <button className="biometry-button" type="button">
            <Fingerprint size={14} />
            <span>Биометрия</span>
          </button>
        </div>
        <div className="helper-box">
          <p>`admin@audit.local` / `admin123`</p>
          <p>`manager@audit.local` / `manager123`</p>
          <p>`daniil.tsuranov@audit.local` / `evaluator123`</p>
        </div>
      </Card>
      <p className="login-copyright">© 2024 Гостех Аналитика. Все права защищены.</p>
    </div>
  );
}
