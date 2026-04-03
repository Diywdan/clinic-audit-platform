"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  ClipboardCheck,
  Hospital,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { signOut } from "next-auth/react";

type AppShellProps = {
  title: string;
  subtitle?: string;
  role: "ADMIN" | "MANAGER" | "EVALUATOR";
  children: React.ReactNode;
};

export function AppShell({ title, subtitle, role, children }: AppShellProps) {
  const pathname = usePathname();
  const links =
    role === "ADMIN"
      ? [
          { href: "/dashboard", label: "Дашборд", icon: BarChart3 },
          { href: "/clinics", label: "Поликлиники", icon: Hospital },
          { href: "/evaluations", label: "Проверки", icon: ClipboardCheck },
          { href: "/admin", label: "Администрирование", icon: ShieldCheck }
        ]
      : role === "MANAGER"
        ? [
            { href: "/dashboard", label: "Дашборд", icon: BarChart3 },
            { href: "/clinics", label: "Поликлиники", icon: Hospital }
          ]
      : [{ href: "/evaluations", label: "Заполнить проверку", icon: ClipboardCheck }];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Building2 size={22} />
          </div>
          <div>
            <p className="eyebrow">Жалоба как подарок</p>
            <h1>Платформа обращений</h1>
          </div>
        </div>
        <nav className="nav">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(`${link.href}/`));
            return (
              <Link
                key={link.href}
                className={`nav-link ${isActive ? "nav-link-active" : ""}`}
                href={link.href}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        {role === "ADMIN" ? (
          <button className="button button-primary sidebar-action" type="button">
            <ClipboardCheck size={16} />
            <span>Новая проверка</span>
          </button>
        ) : null}
      </aside>
      <main className="content">
        <header className="topbar">
          <div className="topbar-brand">Жалоба как подарок</div>
          <div className="topbar-tools">
            <button
              className="button button-ghost topbar-logout"
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut size={16} />
              <span>Выход</span>
            </button>
          </div>
        </header>
        <header className="page-header">
          <div>
            <h2>{title}</h2>
            {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
          </div>
        </header>
        <div className="page-content">{children}</div>
      </main>
      {role !== "EVALUATOR" ? (
        <nav className="mobile-nav">
          {links.slice(0, 3).map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(`${link.href}/`));
            return (
              <Link key={link.href} className={`mobile-link ${isActive ? "mobile-link-active" : ""}`} href={link.href}>
                <Icon size={18} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
