"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  ArrowRight,
  AtSign,
  Fingerprint,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const highlights = [
  "Единый контур оценки качества сервиса и обращений.",
  "Прозрачная аналитика по клиникам, нарушениям и динамике.",
  "Рабочее пространство для администраторов, руководителей и оценщиков.",
];

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
        callbackUrl,
      });

      if (!result?.ok) {
        setError("Не удалось войти. Проверьте email и пароль.");
        return;
      }

      router.push(result.url ?? callbackUrl);
      router.refresh();
    });
  }

  return (
    <div className="login-panel">
      <div className="login-intro">
        <div className="login-intro-badge">
          <ShieldCheck size={14} />
          <span>Внутренняя платформа контроля качества</span>
        </div>

        <h1>Жалоба как подарок</h1>

        <p className="login-intro-text">
          Платформа для структурированной оценки клиник, контроля качества
          сервиса и анализа обращений.
        </p>

        <div className="login-highlight-list">
          {highlights.map((item) => (
            <div key={item} className="login-highlight-item">
              <ArrowRight size={16} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <Card className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <Fingerprint size={28} />
          </div>

          <h2>Вход в рабочее пространство</h2>
          <p>
            Используйте корпоративную учетную запись для доступа к аудиту и
            аналитике.
          </p>
        </div>

        <form action={handleSubmit} className="stack-md">
          <label className="field">
            <span>Email</span>
            <div className="input-with-icon">
              <AtSign size={16} />
              <Input
                type="email"
                name="email"
                placeholder="you@clinic.ru"
                required
              />
            </div>
          </label>

          <label className="field">
            <span>Пароль</span>
            <div className="input-with-icon">
              <LockKeyhole size={16} />
              <Input
                type="password"
                name="password"
                placeholder="Введите пароль"
                required
              />
            </div>
          </label>

          {error ? <p className="error-text">{error}</p> : null}

          <Button type="submit" disabled={isPending}>
            {isPending ? "Выполняем вход..." : "Войти в систему"}
          </Button>
        </form>

        <div className="login-footer">
          <p>
            Если доступ не выдан или пароль не подходит, обратитесь к
            администратору платформы.
          </p>
        </div>
      </Card>

      <p className="login-copyright">© 2026 Платформа аудита клиник</p>
    </div>
  );
}